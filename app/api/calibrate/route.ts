import { NextRequest, NextResponse } from 'next/server';
import { ChromaticAgent } from '@/lib/chromatic-agent';
import { YouCamClient } from '@/lib/youcam-client';
import { VenueProfile } from '@/lib/types';
import { VENUE_PRESETS } from '@/lib/sample-data';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, taskId, imageUrl, imageBase64, venueId, customVenue, apiKey } = body;
    const client = new YouCamClient(apiKey);

    // -------------------------------------------------------------
    // ACTION 1: Check existing task status (Client polling)
    // -------------------------------------------------------------
    if (action === 'poll' && taskId) {
      if (!client.hasCredentials()) {
        return NextResponse.json({ error: 'Missing YouCam API credentials' }, { status: 401 });
      }
      const statusRes = await client.checkTaskStatus(taskId);
      return NextResponse.json(statusRes);
    }

    // -------------------------------------------------------------
    // ACTION 2: Enforce Real API Credentials (No Mock/Fallback)
    // -------------------------------------------------------------
    if (!client.hasCredentials()) {
      return NextResponse.json(
        {
          error:
            'YOUCAM_API_KEY required. Enter your key in Settings or add it to .env.local (Use free hackathon code "ytmakerthrive" for 500 units).',
          requiresKey: true,
        },
        { status: 401 }
      );
    }

    // -------------------------------------------------------------
    // ACTION 3: Calculate Inverse Chromatic Matrix
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
    // ACTION 4: Upload Image and Dispatch Task to YouCam S2S API
    // -------------------------------------------------------------
    let fileId: string | undefined;

    if (imageBase64) {
      // Local file or live webcam capture
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      fileId = await client.uploadImageBinary(buffer, 'image/jpeg');
    } else if (imageUrl) {
      // Download remote image on server and upload as binary to prevent CORS/hotlink issues
      try {
        const imgFetch = await fetch(imageUrl);
        if (imgFetch.ok) {
          const arrayBuffer = await imgFetch.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          fileId = await client.uploadImageBinary(buffer, 'image/jpeg');
        }
      } catch (err) {
        console.warn('Could not re-upload remote URL, using direct link');
      }
    }

    if (!fileId && !imageUrl) {
      return NextResponse.json({ error: 'No image provided for Virtual Try-On' }, { status: 400 });
    }

    const taskIdFromYouCam = await client.createMakeupTask(
      fileId ? { fileId } : { imageUrl },
      compensation
    );

    return NextResponse.json({
      success: true,
      mode: 'real_youcam_api',
      taskId: taskIdFromYouCam,
      venueProfile: venue,
      compensation,
      telemetry: {
        step: 'YouCam Cloud Task Dispatched',
        status: 'ok',
        detail: `Task ${taskIdFromYouCam} registered on Perfect Corp GPU cluster.`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Perfect Corp GPU Dispatch Failed' },
      { status: 502 }
    );
  }
}