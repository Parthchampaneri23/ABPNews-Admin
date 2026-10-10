import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import News from '@/models/News';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();

    const totalNews = await News.countDocuments();
    const publishedNews = await News.countDocuments({ status: 'published' });
    const draftNews = await News.countDocuments({ status: 'draft' });
    const totalCategories = await Category.countDocuments({ parentId: null });
    const totalSubcategories = await Category.countDocuments({ parentId: { $ne: null } });

    const recentNews = await News.find()
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalNews,
        publishedNews,
        draftNews,
        totalCategories,
        totalSubcategories,
      },
      recentNews,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
