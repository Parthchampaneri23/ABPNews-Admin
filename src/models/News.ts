import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INews extends Document {
  title: string;
  slug: string;
  originalId?: string;
  summary: string;
  content: string[];
  image: string; // Local saved path inside /uploads/
  originalImageLink?: string;
  categoryId: mongoose.Types.ObjectId;
  subCategoryId?: mongoose.Types.ObjectId | null;
  author: string;
  readTime: string;
  publishedDate: string;
  timeAgo?: string;
  isFeatured: boolean;
  isTrending: boolean;
  isBreaking?: boolean;
  status: 'draft' | 'published' | 'archived';
  views: number;
  // SEO Friendly Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  canonicalUrl?: string;
  schemaScript?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    originalId: { type: String, default: '' },
    summary: { type: String, required: true },
    content: { type: [String], required: true },
    image: { type: String, required: true },
    originalImageLink: { type: String, default: '' },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategoryId: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    author: { type: String, default: 'Metrotimes Editor' },
    readTime: { type: String, default: '3 min read' },
    publishedDate: { type: String, required: true },
    timeAgo: { type: String, default: 'Just now' },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBreaking: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    views: { type: Number, default: 0 },
    // SEO Schema Properties
    metaTitle: { type: String, trim: true, default: '' },
    metaDescription: { type: String, trim: true, default: '' },
    metaKeywords: { type: String, trim: true, default: '' },
    canonicalUrl: { type: String, trim: true, default: '' },
    schemaScript: { type: String, trim: true, default: '' },
    ogTitle: { type: String, trim: true, default: '' },
    ogDescription: { type: String, trim: true, default: '' },
    ogImage: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

NewsSchema.index({ title: 'text', summary: 'text' });

const News: Model<INews> = mongoose.models.News || mongoose.model<INews>('News', NewsSchema);

export default News;
