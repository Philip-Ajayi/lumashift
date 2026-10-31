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
    this.endpoint = (process.env.YOUCAM_ENDPOINT || 'https://yce.makeupar.com').replace(/\/+$/, '');
  }

  public hasCredentials(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  /**
   * Uploads an image binary directly to YouCam S2S File API (Presigned S3 PUT)
   */
  public async uploadImageBinary(imageBuffer: Buffer, contentType: string = 'image/jpeg'): Promise<string> {
    const fileName = `portrait_${Date.now()}.${contentType.includes('png') ? 'png' : 'jpg'}`;

    // Step 1: Request S3 upload URL from Perfect Corp
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
      throw new Error(`YouCam File API initialization failed (${initRes.status}): ${err}`);
    }

    const initData = await initRes.json();
    const fileItem = initData.files?.[0] || initData.data?.files?.[0];
    if (!fileItem?.requests?.url || !fileItem?.file_id) {
      throw new Error('YouCam File API did not return an upload URL or file_id');
    }

    // Step 2: Stream binary bytes directly to Perfect Corp's presigned storage target
    const uploadRes = await fetch(fileItem.requests.url, {
      method: fileItem.requests.method || 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: new Uint8Array(imageBuffer) as unknown as BodyInit,
    });

    if (!uploadRes.ok) {
      throw new Error(`Binary upload to storage target failed (${uploadRes.status})`);
    }

    return fileItem.file_id;
  }

  /**
   * Dispatches task to Perfect Corp Makeup Virtual Try-On endpoint (/s2s/v2.0/task/makeup-vto)
   */
  public async createMakeupTask(
    imageIdentifier: { fileId?: string; imageUrl?: string },
    compensation: ChromaticCompensation
  ): Promise<string> {
    const lipFinish =
      compensation.lip.texture === 'gloss'
        ? 'gloss'
        : compensation.lip.texture === 'matte'
        ? 'matte'
        : 'satin';

    const effects: any[] = [
      {
        category: 'foundation',
        color: compensation.foundation.hex,
        colorIntensity: compensation.foundation.coverage,
        glowIntensity: compensation.foundation.glow,
        coverageIntensity: compensation.foundation.coverage,
      },
      {
        category: 'lip_color',
        finish: lipFinish,
        palettes: [
          {
            color: compensation.lip.hex,
            intensity: compensation.lip.intensity,
          },
        ],
      },
      {
        category: 'blush',
        finish: 'satin',
        palettes: [
          {
            color: compensation.blush.hex,
            intensity: compensation.blush.intensity,
          },
        ],
      },
    ];

    const payload: Record<string, any> = {
      version: '1.0',
      effects,
    };

    if (imageIdentifier.fileId) {
      payload.file_id = imageIdentifier.fileId;
      payload.src_file_id = imageIdentifier.fileId;
    } else if (imageIdentifier.imageUrl) {
      payload.src_file_url = imageIdentifier.imageUrl;
    }

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
      throw new Error(`YouCam Makeup Task Creation Error (${res.status}): ${errBody}`);
    }

    const data = await res.json();
    const taskId = data.task_id || data.data?.task_id;
    if (!taskId) {
      throw new Error(`YouCam returned no task_id: ${JSON.stringify(data)}`);
    }

    return taskId;
  }

  /**
   * Polls task status until finished or failed
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
        error: data.error_message || data.error || data.task_result?.error || 'YouCam GPU task failed',
      };
    }

    return { status: 'running' };
  }
}