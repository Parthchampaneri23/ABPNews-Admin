import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Category from '@/models/Category';

// Helper to generate slug
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
    const categories = await Category.find().sort({ createdAt: -1 }).populate('parentId', 'name');
    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, parentId, isActive } = body;

    // Field Validations
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Category Name is required and must be at least 2 characters long.' }, { status: 400 });
    }

    await connectDB();

    const slug = slugify(name);

    // Check if slug exists
    const existing = await Category.findOne({ slug });
    if (existing) {
      return NextResponse.json({ error: 'A category or subcategory with this name already exists.' }, { status: 400 });
    }

    const newCategory = await Category.create({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      parentId: parentId ? parentId : null,
      isActive: isActive !== undefined ? isActive : true,
    });

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 500 });
  }
}
