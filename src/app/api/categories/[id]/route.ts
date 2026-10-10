import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, description, parentId, isActive } = body;

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Category Name must be at least 2 characters.' }, { status: 400 });
    }

    await connectDB();

    const slug = slugify(name);
    const existing = await Category.findOne({ slug, _id: { $ne: id } });
    if (existing) {
      return NextResponse.json({ error: 'Another category with this name already exists.' }, { status: 400 });
    }

    const updatedCat = await Category.findByIdAndUpdate(
      id,
      {
        name: name.trim(),
        slug,
        description: description ? description.trim() : '',
        parentId: parentId ? parentId : null,
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true }
    );

    if (!updatedCat) {
      return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, category: updatedCat });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();

    const hasSubcats = await Category.findOne({ parentId: id });
    if (hasSubcats) {
      return NextResponse.json({ error: 'Cannot delete a main category that contains active sub-categories.' }, { status: 400 });
    }

    await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
