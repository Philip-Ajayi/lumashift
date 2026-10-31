import { NextRequest, NextResponse } from 'next/server';
import { ChromaticAgent } from '@/lib/chromatic-agent';
import { YouCamClient } from '@/lib/youcam-client';
import { VenueProfile } from '@/lib/types';
import { VENUE_PRESETS } from '@/lib/sample-data';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, taskId, imageUrl, imageBase64, venueId, customVenue, apiKey, strictProductionMode } = body;
    const client = new YouCamClient(apiKey);

    // -------------------------------------------------------------
    // ACTION 1: Check existing task status (Client polling)
    // -------------------------------------------------------------
    if (action === 'poll' && taskId) {
      const statusRes = await client.checkTaskStatus(taskId);
      return NextResponse.json(statusRes);
    }

    // -------------------------------------------------------------
    // ACTION 2: Venue and Mathematical Calculations
    // -------------------------------------------------------------
    let venue: VenueProfile = VENUE_PRESETS[0];
    if (venueId === 'custom' && customVenue) {
      venue = customVenue;
    } else if (venueId) {
      venue = VENUE_PRESETS.find(v => v.id === venueId) || VENUE_PRESETS[0];
    }

    const agent = new ChromaticAgent();
    const compensation = agent.synthesizeCompensation(venue);

    // -------------------------------------------------------------
    // ACTION 3: Live Production Dispatch via Perfect Corp
    // -------------------------------------------------------------
    if (client.hasCredentials()) {
      try {
        let fileId: string | undefined;

        // If client sent raw Base64 (from live webcam or local upload), upload via Perfect Corp File API
        if (imageBase64) {
          const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          fileId = await client.uploadImageBinary(buffer, 'image/jpeg');
        } else if (imageUrl && !imageUrl.startsWith('http://localhost') && !imageUrl.startsWith('https://localhost')) {
          // Public external URL
          // If remote image, can pass directly or convert
        }

        const taskId = await client.createMakeupTask(
          fileId ? { fileId } : { imageUrl },
          compensation
        );

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
        // In strict mode, do not conceal the failure behind a simulation
        if (strictProductionMode) {
          return NextResponse.json(
            {
              success: false,
              error: `Perfect Corp API Error: ${err.message}`,
              mode: 'real_youcam_api',
            },
            { status: 502 }
          );
        }

        console.warn('Live API dispatch failed, operating in physics sandbox:', err.message);
      }
    } else if (strictProductionMode) {
      return NextResponse.json(
        {
          success: false,
          error: 'Strict Production Mode enabled, but no valid YOUCAM_API_KEY was provided in Settings.',
          mode: 'real_youcam_api',
        },
        { status: 401 }
      );
    }

    // -------------------------------------------------------------
    // ACTION 4: Physics Mathematical Sandbox (Explicit Mode)
    // -------------------------------------------------------------
    return NextResponse.json({
      success: true,
      mode: 'physics_simulation_sandbox',
      calibratedImage: imageUrl || imageBase64,
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