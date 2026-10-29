import { NextRequest, NextResponse } from 'next/server';

// Temporary in-memory cache for demo uploads (valid while serverless container is warm)
// For permanent production, swap this with Vercel Blob (@vercel/blob)
const uploadCache = new Map<string, { buffer: Buffer; contentType: string; createdAt: number }>();

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const id = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    uploadCache.set(id, {
      buffer,
      contentType: file.type || 'image/jpeg',
      createdAt: Date.now(),
    });

    // Clean up cache entries older than 30 minutes
    const expiry = Date.now() - 30 * 60 * 1000;
    for (const [key, value] of uploadCache.entries()) {
      if (value.createdAt < expiry) {
        uploadCache.delete(key);
      }
    }

    // Determine host dynamically (Vercel sets x-forwarded-host)
    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const publicUrl = `${protocol}://${host}/api/upload?id=${id}`;

    return NextResponse.json({ success: true, url: publicUrl });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id || !uploadCache.has(id)) {
    return new NextResponse('Image expired or not found', { status: 404 });
  }

  const fileData = uploadCache.get(id)!;
  return new NextResponse(fileData.buffer, {
    headers: {
      'Content-Type': fileData.contentType,
      'Cache-Control': 'public, max-age=1800',
    },
  });
}
