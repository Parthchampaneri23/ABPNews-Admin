import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Video from '@/models/Video';

function extractYoutubeId(url: string): string {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  // If user pasted pure 11 character ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }
  return '';
}

// GET /api/videos - List all videos
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get('active');

    const query: any = {};
    if (onlyActive === 'true') {
      query.isActive = true;
    }

    const videos = await Video.find(query).sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json({ success: true, videos });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch videos' }, { status: 500 });
  }
}

// POST /api/videos - Create a new video (YouTube or Local File)
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const {
      title,
      sourceType = 'youtube',
      videoUrl,
      youtubeUrl,
      thumbnail,
      category,
      duration,
      views,
      isActive,
      order,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    let finalYoutubeId = '';
    let finalYoutubeUrl = '';
    let finalVideoUrl = '';
    let finalThumbnail = thumbnail?.trim() || '';

    if (sourceType === 'local') {
      if (!videoUrl || !videoUrl.trim()) {
        return NextResponse.json({ error: 'Please upload a video file first.' }, { status: 400 });
      }
      finalVideoUrl = videoUrl.trim();
      // If no custom thumbnail is uploaded, use a modern default video poster
      if (!finalThumbnail) {
        finalThumbnail = 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60';
      }
    } else {
      // YouTube source
      if (!youtubeUrl || !youtubeUrl.trim()) {
        return NextResponse.json({ error: 'YouTube URL or Video ID is required' }, { status: 400 });
      }
      finalYoutubeId = extractYoutubeId(youtubeUrl.trim());
      if (!finalYoutubeId) {
        return NextResponse.json(
          { error: 'Could not detect a valid YouTube Video ID from the provided URL.' },
          { status: 400 }
        );
      }
      finalYoutubeUrl = youtubeUrl.trim();
      if (!finalThumbnail) {
        finalThumbnail = `https://img.youtube.com/vi/${finalYoutubeId}/hqdefault.jpg`;
      }
    }

    const newVideo = await Video.create({
      title: title.trim(),
      sourceType: sourceType === 'local' ? 'local' : 'youtube',
      videoUrl: finalVideoUrl,
      youtubeUrl: finalYoutubeUrl,
      youtubeId: finalYoutubeId,
      thumbnail: finalThumbnail,
      category: category?.trim() || 'News',
      duration: duration?.trim() || '03:45',
      views: views?.trim() || '1.2K views',
      isActive: typeof isActive === 'boolean' ? isActive : true,
      order: typeof order === 'number' ? order : 0,
    });

    return NextResponse.json({ success: true, video: newVideo }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create video' }, { status: 500 });
  }
}
