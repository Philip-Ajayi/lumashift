import { NextRequest, NextResponse } from 'next/server';
import { ChromaticAgent } from '@/lib/chromatic-agent';
import { YouCamClient } from '@/lib/youcam-client';
import { VenueProfile } from '@/lib/types';
import { VENUE_PRESETS } from '@/lib/sample-data';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, taskId, imageUrl, venueId, customVenue, apiKey } = body;
    const client = new YouCamClient(apiKey);

    // -------------------------------------------------------------
    // ACTION 1: Check existing task status (Client polling)
    // -------------------------------------------------------------
    if (action === 'poll' && taskId) {
      const statusRes = await client.checkTaskStatus(taskId);
      return NextResponse.json(statusRes);
    }

    // -------------------------------------------------------------
    // ACTION 2: Initiate Calibration & S2S Task
    // -------------------------------------------------------------
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    let venue: VenueProfile = VENUE_PRESETS[0];
    if (venueId === 'custom' && customVenue) {
      venue = customVenue;
    } else if (venueId) {
      venue = VENUE_PRESETS.find(v => v.id === venueId) || VENUE_PRESETS[0];
    }

    const agent = new ChromaticAgent();
    const compensation = agent.synthesizeCompensation(venue);

    // If API credentials are active and imageUrl is a public HTTP URL, start real AI task
    if (client.hasCredentials() && imageUrl.startsWith('http')) {
      try {
        const taskId = await client.createMakeupTask(imageUrl, compensation);
        return NextResponse.json({
          success: true,
          mode: 'real_youcam_api',
          taskId,
          venueProfile: venue,
          compensation,
          telemetry: {
            step: 'YouCam Cloud Task Dispatched',
            status: 'ok',
            detail: `Task ${taskId} registered on Perfect Corp GPU cluster.`,
          },
        });
      } catch (err: any) {
        console.warn('Remote YouCam dispatch error, using fallback:', err.message);
      }
    }

    // Default or Fallback: Deterministic Physics Sandbox
    return NextResponse.json({
      success: true,
      mode: 'physics_simulation_sandbox',
      calibratedImage: imageUrl,
      venueProfile: venue,
      compensation,
      telemetry: {
        step: 'Planckian Mathematical Simulation',
        status: 'info',
        detail: 'Calculated target Kelvin adaptation and CRI deficiency matrix.',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Processing failed' }, { status: 500 });
  }
}
