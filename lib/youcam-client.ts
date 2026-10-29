import { ChromaticCompensation, VenueProfile } from './types';

export interface YouCamTaskResult {
  status: 'running' | 'success' | 'failed';
  resultUrl?: string;
  error?: string;
}

export class YouCamClient {
  private apiKey: string;
  private endpoint: string;

  constructor(customKey?: string) {
    this.apiKey = customKey || process.env.YOUCAM_API_KEY || '';
    this.endpoint = process.env.YOUCAM_ENDPOINT || 'https://yce.makeupar.com';
  }

  public hasCredentials(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 5);
  }

  /**
   * Dispatches task to Perfect Corp Makeup API (Returns task ID immediately)
   */
  public async createMakeupTask(
    imageUrl: string,
    compensation: ChromaticCompensation
  ): Promise<string> {
    const payload = {
      image_url: imageUrl,
      action: 'makeup_transfer',
      params: {
        foundation: {
          color: compensation.foundation.hex,
          intensity: compensation.foundation.coverage,
          glow: compensation.foundation.glow,
        },
        lip: {
          color: compensation.lip.hex,
          texture: compensation.lip.texture,
          intensity: compensation.lip.intensity,
        },
        contour: {
          color: compensation.contour.hex,
          intensity: compensation.contour.intensity,
        },
        blush: {
          color: compensation.blush.hex,
          intensity: compensation.blush.intensity,
        },
      },
    };

    const res = await fetch(`${this.endpoint}/s2s/v2.1/task/makeup-transfer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errBody = await res.text();
      throw new Error(`YouCam Makeup Error (${res.status}): ${errBody}`);
    }

    const data = await res.json();
    const taskId = data.task_id || data.data?.task_id;
    if (!taskId) {
      throw new Error('No task ID returned by YouCam');
    }
    return taskId;
  }

  /**
   * Checks the status of an ongoing task
   */
  public async checkTaskStatus(taskId: string): Promise<YouCamTaskResult> {
    const res = await fetch(`${this.endpoint}/s2s/v2.1/task/makeup-transfer/${taskId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!res.ok) {
      throw new Error(`Status check failed (${res.status})`);
    }

    const data = await res.json();
    const status = data.status || data.data?.status;
    const resultUrl = data.result_url || data.data?.result_url;

    if (status === 'success' && resultUrl) {
      return { status: 'success', resultUrl };
    }
    if (status === 'failed' || status === 'error') {
      return { status: 'failed', error: data.error || 'AI rendering failure on server' };
    }

    return { status: 'running' };
  }
}
