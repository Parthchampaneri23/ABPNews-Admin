import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided.' }, { status: 400 });
    }

    // Validate MIME type for videos
    const validVideoTypes = [
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-matroska',
    ];
    if (!validVideoTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mov|mkv|ogg)$/i)) {
      return NextResponse.json(
        { error: 'Invalid video format. Supported formats: MP4, WebM, MOV, MKV, OGG.' },
        { status: 400 }
      );
    }

    // Max video file size: 100MB
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Video file size exceeds 100MB limit. For larger videos, consider embedding a YouTube link.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split('.').pop() || 'mp4';
    const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    await mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/videos/${fileName}`;

    return NextResponse.json({ success: true, url: publicUrl, fileName });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Video upload failed' }, { status: 500 });
  }
}
