import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import News from '@/models/News';
import Category from '@/models/Category';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let query: any = {};

    if (category) {
      query.categoryId = category;
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const newsList = await News.find(query)
      .populate('categoryId', 'name slug')
      .populate('subCategoryId', 'name slug')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, news: newsList });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch news' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, summary, content, image, categoryId, subCategoryId, author, readTime, publishedDate, isFeatured, isTrending, status } = body;

    // Field Validations
    if (!title || typeof title !== 'string' || title.trim().length < 5) {
      return NextResponse.json({ error: 'Title is required and must be at least 5 characters long.' }, { status: 400 });
    }

    if (!summary || typeof summary !== 'string' || summary.trim().length < 10) {
      return NextResponse.json({ error: 'Summary is required and must be at least 10 characters long.' }, { status: 400 });
    }

    if (!content || (Array.isArray(content) && content.length === 0) || (typeof content === 'string' && !content.trim())) {
      return NextResponse.json({ error: 'Full Content body is required.' }, { status: 400 });
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Please select a Category.' }, { status: 400 });
    }

    if (!image) {
      return NextResponse.json({ error: 'An Image must be uploaded for the news article.' }, { status: 400 });
    }

    await connectDB();

    let slug = slugify(title);
    const existingSlug = await News.findOne({ slug });
    if (existingSlug) {
      slug = `${slug}-${Date.now()}`;
    }

    const formattedContent = Array.isArray(content)
      ? content
      : content.split('\n\n').filter((p: string) => p.trim() !== '');

    const newNews = await News.create({
      title: title.trim(),
      slug,
      summary: summary.trim(),
      content: formattedContent,
      image, // Local image path e.g. /uploads/filename.png
      categoryId,
      subCategoryId: subCategoryId || null,
      author: author ? author.trim() : 'ABP News Editor',
      readTime: readTime ? readTime.trim() : '3 min read',
      publishedDate: publishedDate || new Date().toISOString().split('T')[0],
      timeAgo: 'Just now',
      isFeatured: !!isFeatured,
      isTrending: !!isTrending,
      status: status || 'published',
    });

    return NextResponse.json({ success: true, news: newNews }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create news' }, { status: 500 });
  }
}
