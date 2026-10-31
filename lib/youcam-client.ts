import { ChromaticCompensation } from './types';

export interface YouCamTaskResult {
  status: 'running' | 'success' | 'failed';
  resultUrl?: string;
  error?: string;
}

export type YouCamTaskType =
  | 'makeup-vto'
  | 'cloth'
  | 'cloth-v3'
  | 'look-vto'
  | 'lighting'
  | 'hair-color'
  | 'skin-analysis';

export class YouCamClient {
  private apiKey: string;
  private endpoint: string;

  constructor(customKey?: string, customEndpoint?: string) {
    this.apiKey = (customKey || process.env.YOUCAM_API_KEY || '').trim();

    // Auto-correct console URL to the actual S2S API Gateway
    let ep = (customEndpoint || process.env.YOUCAM_ENDPOINT || 'https://yce-api-01.makeupar.com').trim().replace(/\/+$/, '');
    if (ep === 'https://yce.makeupar.com' || ep === 'http://yce.makeupar.com') {
      ep = 'https://yce-api-01.makeupar.com';
    }
    this.endpoint = ep;
  }

  public hasCredentials(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  /**
   * Uploads an image binary directly to YouCam S2S File API (Presigned S3 PUT)
   */
  public async uploadImageBinary(imageBuffer: Buffer, contentType: string = 'image/jpeg'): Promise<string> {
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `portrait_${Date.now()}.${ext}`;

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
    if (!fileItem) {
      throw new Error(`Invalid response structure from YouCam File API: ${JSON.stringify(initData)}`);
    }

    // Fix Bug 1: Perfect Corp returns requests as an array: requests: [ { method: 'PUT', url: '...' } ]
    const reqInfo = Array.isArray(fileItem.requests) ? fileItem.requests[0] : fileItem.requests;
    const uploadUrl = reqInfo?.url;
    const fileId = fileItem.file_id;

    if (!uploadUrl || !fileId) {
      throw new Error(`YouCam File API did not return upload URL or file_id: ${JSON.stringify(fileItem)}`);
    }

    // Step 2: Stream binary bytes directly to Perfect Corp's presigned storage target
    const uploadRes = await fetch(uploadUrl, {
      method: reqInfo.method || 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: new Uint8Array(imageBuffer) as unknown as BodyInit,
    });

    if (!uploadRes.ok) {
      throw new Error(`Binary upload to S3 storage failed (${uploadRes.status})`);
    }

    return fileId;
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

    // Formatted according to YouCam Makeup-VTO Effect Schema
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
        palettes: [
          {
            color: compensation.lip.hex,
            texture: lipFinish,
            colorIntensity: compensation.lip.intensity,
          },
        ],
      },
      {
        category: 'blush',
        palettes: [
          {
            color: compensation.blush.hex,
            texture: 'satin',
            colorIntensity: compensation.blush.intensity,
          },
        ],
      },
    ];

    const payload: Record<string, any> = {
      version: '1.0',
      effects,
    };

    if (imageIdentifier.fileId) {
      payload.src_file_id = imageIdentifier.fileId;
      payload.file_id = imageIdentifier.fileId;
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
   * Dispatches task to Perfect Corp Clothes Try-On endpoint (/s2s/v2.0/task/cloth)
   */
  public async createClothesTask(
    imageIdentifier: { fileId?: string; imageUrl?: string },
    garment: {
      refFileId?: string;
      refImageUrl?: string;
      category?: 'upper_body' | 'lower_body' | 'full_body' | 'outer' | 'auto';
    }
  ): Promise<string> {
    const payload: Record<string, any> = {
      version: '1.0',
      garment_category: garment.category || 'upper_body',
    };

    if (imageIdentifier.fileId) {
      payload.src_file_id = imageIdentifier.fileId;
    } else if (imageIdentifier.imageUrl) {
      payload.src_file_url = imageIdentifier.imageUrl;
    }

    if (garment.refFileId) {
      payload.ref_file_id = garment.refFileId;
    } else if (garment.refImageUrl) {
      payload.ref_file_url = garment.refImageUrl;
    }

    const res = await fetch(`${this.endpoint}/s2s/v2.0/task/cloth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`YouCam Clothes Task Creation Error (${res.status}): ${errBody}`);
    }

    const data = await res.json();
    const taskId = data.task_id || data.data?.task_id;
    if (!taskId) {
      throw new Error(`YouCam returned no task_id: ${JSON.stringify(data)}`);
    }

    return taskId;
  }

  /**
   * Polls task status across any YouCam task endpoint until finished or failed
   */
  public async checkTaskStatus(
    taskId: string,
    taskType: YouCamTaskType = 'makeup-vto'
  ): Promise<YouCamTaskResult> {
    const res = await fetch(`${this.endpoint}/s2s/v2.0/task/${taskType}/${taskId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Status check failed (${res.status}): ${err}`);
    }

    const data = await res.json();
    const status = (
      data.task_status ||
      data.status ||
      data.data?.task_status ||
      data.data?.status ||
      ''
    ).toLowerCase();

    // Fix Bug 2: Check all locations where Perfect Corp delivers download URL
    const resultUrl =
      data.data?.results?.[0]?.download_url ||
      data.data?.results?.[0]?.url ||
      data.results?.[0]?.download_url ||
      data.results?.[0]?.url ||
      data.task_result?.result_url ||
      data.result_url ||
      data.data?.result_url;

    if (status === 'success' && resultUrl) {
      return { status: 'success', resultUrl };
    }
    if (status === 'error' || status === 'failed') {
      return {
        status: 'failed',
        error:
          data.data?.failure_reason ||
          data.error_message ||
          data.error ||
          data.task_result?.error ||
          'YouCam GPU task failed',
      };
    }

    return { status: 'running' };
  }
}