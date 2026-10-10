import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import News from '@/models/News';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const news = await News.findById(id).populate('categoryId').populate('subCategoryId');
    if (!news) {
      return NextResponse.json({ error: 'News article not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, news });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch news article' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, summary, content, image, categoryId, subCategoryId, author, readTime, publishedDate, isFeatured, isTrending, status } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      return NextResponse.json({ error: 'Title must be at least 5 characters long.' }, { status: 400 });
    }

    if (!summary || typeof summary !== 'string' || summary.trim().length < 10) {
      return NextResponse.json({ error: 'Summary must be at least 10 characters long.' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Please select a Category.' }, { status: 400 });
    }

    if (!image) {
      return NextResponse.json({ error: 'An Image path is required.' }, { status: 400 });
    }

    await connectDB();

    let slug = slugify(title);
    const existingSlug = await News.findOne({ slug, _id: { $ne: id } });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const formattedContent = Array.isArray(content)
      ? content
      : content.split('\n\n').filter((p: string) => p.trim() !== '');

    const updatedNews = await News.findByIdAndUpdate(
      id,
      {
        title: title.trim(),
        slug,
        summary: summary.trim(),
        content: formattedContent,
        image,
        categoryId,
        subCategoryId: subCategoryId || null,
        author: author ? author.trim() : 'ABP News Editor',
        readTime: readTime ? readTime.trim() : '3 min read',
        publishedDate: publishedDate || new Date().toISOString().split('T')[0],
        isFeatured: !!isFeatured,
        isTrending: !!isTrending,
        status: status || 'published',
      },
      { new: true }
    );

    if (!updatedNews) {
      return NextResponse.json({ error: 'News article not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, news: updatedNews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update news article' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    await News.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'News article deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete news article' }, { status: 500 });
  }
}
