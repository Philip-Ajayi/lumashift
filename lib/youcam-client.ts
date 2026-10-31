import { ChromaticCompensation } from './types';

export interface YouCamTaskResult {
  status: 'running' | 'success' | 'failed';
  resultUrl?: string;
  error?: string;
}

export class YouCamClient {
  private apiKey: string;
  private endpoint: string;

  constructor(customKey?: string) {
    this.apiKey = (customKey || process.env.YOUCAM_API_KEY || '').trim();
    // Default base URL for Perfect Corp S2S API
    this.endpoint = (process.env.YOUCAM_ENDPOINT || 'https://yce.makeupar.com').replace(/\/+$/, '');
  }

  public hasCredentials(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  /**
   * Uploads an image directly via Perfect Corp's File API using S3 presigned PUT.
   * This allows local uploads and webcam snaps to work without needing a public domain.
   */
  public async uploadImageBinary(imageBuffer: Buffer, contentType: string = 'image/jpeg'): Promise<string> {
    const fileName = `lumashift_${Date.now()}.${contentType.includes('png') ? 'png' : 'jpg'}`;

    // Step 1: Request presigned S3 upload URL from Perfect Corp
    const initRes = await fetch(`${this.endpoint}/s2s/v2.0/file`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        files: [
          {
            content_type: contentType,
            file_name: fileName,
            file_size: imageBuffer.length,
          },
        ],
      }),
    });

    if (!initRes.ok) {
      const err = await initRes.text();
      throw new Error(`File API registration failed (${initRes.status}): ${err}`);
    }

    const initData = await initRes.json();
    const fileItem = initData.files?.[0] || initData.data?.files?.[0];
    if (!fileItem?.requests?.url || !fileItem?.file_id) {
      throw new Error('Invalid response from Perfect Corp File API (missing upload URL or file_id)');
    }

    // Step 2: Directly upload image binary to Perfect Corp's presigned S3 target
    const uploadRes = await fetch(fileItem.requests.url, {
      method: fileItem.requests.method || 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: imageBuffer,
    });

    if (!uploadRes.ok) {
      throw new Error(`Binary upload to storage target failed (${uploadRes.status})`);
    }

    return fileItem.file_id;
  }

  /**
   * Dispatches task to Perfect Corp Makeup VTO API using registered file_id or public URL.
   */
  public async createMakeupTask(
    imageIdentifier: { fileId?: string; imageUrl?: string },
    compensation: ChromaticCompensation
  ): Promise<string> {
    const payload: Record<string, any> = {
      effects: [
        {
          feature: 'foundation',
          color: compensation.foundation.hex,
          intensity: compensation.foundation.coverage,
          glow: compensation.foundation.glow,
        },
        {
          feature: 'lip_color',
          color: compensation.lip.hex,
          texture: compensation.lip.texture,
          intensity: compensation.lip.intensity,
        },
        {
          feature: 'blush',
          color: compensation.blush.hex,
          intensity: compensation.blush.intensity,
        },
      ],
    };

    if (imageIdentifier.fileId) {
      payload.file_id = imageIdentifier.fileId;
    } else if (imageIdentifier.imageUrl) {
      payload.src_file_url = imageIdentifier.imageUrl;
    } else {
      throw new Error('Either fileId or imageUrl must be provided');
    }

    // Standard Perfect Corp S2S Makeup Try-On task endpoint
    const res = await fetch(`${this.endpoint}/s2s/v2.0/task/makeup-vto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`YouCam Makeup Task Dispatch Error (${res.status}): ${errBody}`);
    }

    const data = await res.json();
    const taskId = data.task_id || data.data?.task_id;
    if (!taskId) {
      throw new Error(`No task_id returned: ${JSON.stringify(data)}`);
    }

    return taskId;
  }

  /**
   * Polls task status until finished or failed.
   */
  public async checkTaskStatus(taskId: string): Promise<YouCamTaskResult> {
    const res = await fetch(`${this.endpoint}/s2s/v2.0/task/makeup-vto/${taskId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Status check failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    const status = (data.task_status || data.status || data.data?.task_status || '').toLowerCase();
    const resultUrl = data.task_result?.result_url || data.result_url || data.data?.result_url;

    if (status === 'success' && resultUrl) {
      return { status: 'success', resultUrl };
    }
    if (status === 'error' || status === 'failed') {
      return {
        status: 'failed',
        error: data.error_message || data.error || 'YouCam GPU rendering failure',
      };
    }

    return { status: 'running' };
  }
}