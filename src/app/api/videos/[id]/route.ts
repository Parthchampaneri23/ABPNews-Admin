import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Video from '@/models/Video';

function extractYoutubeId(url: string): string {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return match[1];
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) {
    return url.trim();
  }
  return '';
}

// PUT /api/videos/[id] - Update video or toggle status
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const existing = await Video.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (body.toggleActive) {
      existing.isActive = !existing.isActive;
      await existing.save();
      return NextResponse.json({ success: true, video: existing });
    }

    if (body.title) existing.title = body.title.trim();
    if (body.category) existing.category = body.category.trim();
    if (body.duration) existing.duration = body.duration.trim();
    if (body.views) existing.views = body.views.trim();
    if (body.sourceType) existing.sourceType = body.sourceType;
    if (body.videoUrl !== undefined) existing.videoUrl = body.videoUrl.trim();
    if (typeof body.order === 'number') existing.order = body.order;
    if (typeof body.isActive === 'boolean') existing.isActive = body.isActive;

    if (existing.sourceType === 'youtube' && body.youtubeUrl && body.youtubeUrl.trim() !== existing.youtubeUrl) {
      existing.youtubeUrl = body.youtubeUrl.trim();
      const extractedId = extractYoutubeId(body.youtubeUrl.trim());
      if (extractedId) {
        existing.youtubeId = extractedId;
      }
    }

    if (body.thumbnail) {
      existing.thumbnail = body.thumbnail.trim();
    } else if (existing.sourceType === 'youtube' && existing.youtubeId && (!existing.thumbnail || existing.thumbnail.includes('img.youtube.com'))) {
      existing.thumbnail = `https://img.youtube.com/vi/${existing.youtubeId}/hqdefault.jpg`;
    }

    await existing.save();
    return NextResponse.json({ success: true, video: existing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update video' }, { status: 500 });
  }
}

// DELETE /api/videos/[id] - Delete video
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await Video.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Video deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete video' }, { status: 500 });
  }
}
