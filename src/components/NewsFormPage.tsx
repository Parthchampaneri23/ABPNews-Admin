'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Plus,
  Trash2
} from 'lucide-react';

interface NewsFormProps {
  isEdit?: boolean;
}

export default function NewsFormPage({ isEdit = false }: NewsFormProps) {
  const router = useRouter();
  const params = useParams();
  const newsId = params?.id as string;

  // Form Fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [contentParagraphs, setContentParagraphs] = useState<string[]>(['']);
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [author, setAuthor] = useState('Metrotimes Live Web Desk');
  const [readTime, setReadTime] = useState('3 min read');
  const [publishedDate, setPublishedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isFeatured, setIsFeatured] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [status, setStatus] = useState<'published' | 'draft' | 'archived'>('published');

  // Categories lists
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(isEdit);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEdit && newsId) {
      fetchNewsDetail();
    }
  }, [isEdit, newsId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNewsDetail = async () => {
    try {
      const res = await fetch(`/api/news/${newsId}`);
      const data = await res.json();
      if (data.success && data.news) {
        const n = data.news;
        setTitle(n.title);
        setSummary(n.summary);
        setContentParagraphs(
          Array.isArray(n.content) && n.content.length > 0
            ? n.content
            : [n.content || '']
        );
        setImage(n.image || '');
        setCategoryId(typeof n.categoryId === 'object' ? n.categoryId._id : n.categoryId);
        setSubCategoryId(typeof n.subCategoryId === 'object' ? n.subCategoryId?._id : n.subCategoryId || '');
        setAuthor(n.author || 'ABP News Editor');
        setReadTime(n.readTime || '3 min read');
        setPublishedDate(n.publishedDate || new Date().toISOString().split('T')[0]);
        setIsFeatured(n.isFeatured || false);
        setIsTrending(n.isTrending || false);
        setStatus(n.status || 'published');
      } else {
        setError('Article not found');
      }
    } catch (err) {
      setError('Failed to load news article details');
    } finally {
      setLoading(false);
    }
  };

  // Dynamically filter subcategories when category changes
  useEffect(() => {
    if (categoryId) {
      const subs = categories.filter(
        (c) =>
          typeof c.parentId === 'object' && c.parentId !== null
            ? c.parentId._id === categoryId
            : c.parentId === categoryId
      );
      setSubCategories(subs);
    } else {
      setSubCategories([]);
    }
  }, [categoryId, categories]);

  // Image Upload Handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to upload image.');
        setUploading(false);
        return;
      }

      setImage(data.url); // Local path e.g. /uploads/filename.png
    } catch (err) {
      setError('Image upload failed due to network issue.');
    } finally {
      setUploading(false);
    }
  };

  // Content paragraph dynamic handlers
  const handleParagraphChange = (index: number, value: string) => {
    const updated = [...contentParagraphs];
    updated[index] = value;
    setContentParagraphs(updated);
  };

  const addParagraph = () => {
    setContentParagraphs([...contentParagraphs, '']);
  };

  const removeParagraph = (index: number) => {
    if (contentParagraphs.length === 1) return;
    const updated = contentParagraphs.filter((_, i) => i !== index);
    setContentParagraphs(updated);
  };

  // Submit Handler with Validations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Strict Field Validations
    if (!title.trim() || title.trim().length < 5) {
      setError('Article Title must be at least 5 characters long.');
      return;
    }

    if (!summary.trim() || summary.trim().length < 10) {
      setError('Article Summary must be at least 10 characters long.');
      return;
    }

    const validParagraphs = contentParagraphs.filter((p) => p.trim() !== '');
    if (validParagraphs.length === 0) {
      setError('At least one detailed content paragraph is required.');
      return;
    }

    if (!categoryId) {
      setError('Please select a Main Category.');
      return;
    }

    if (!image) {
      setError('Please upload a main news article image (saved inside public/uploads).');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        content: validParagraphs,
        image,
        categoryId,
        subCategoryId: subCategoryId || null,
        author: author.trim(),
        readTime: readTime.trim(),
        publishedDate,
        isFeatured,
        isTrending,
        status,
      };

      const url = isEdit ? `/api/news/${newsId}` : '/api/news';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save news article.');
        setSubmitting(false);
        return;
      }

      setSuccess(isEdit ? 'News article updated successfully!' : 'News article created successfully!');
      setTimeout(() => {
        router.push('/dashboard/news');
      }, 1000);
    } catch (err) {
      setError('Network error during submission.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const mainCategoriesList = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isEdit ? 'Edit News Article' : 'Create New Article'}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Fill all required news details, select dynamic categories, and upload image locally.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span className="font-medium">{success} Redirecting to articles list...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Article Title / Headline *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter high impact headline news title..."
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm font-semibold text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
        </div>

        {/* Categories Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Main Category *
            </label>
            <select
              required
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubCategoryId('');
              }}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-500 bg-white"
            >
              <option value="">-- Select Category --</option>
              {mainCategoriesList.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Sub-Category (Optional)
            </label>
            <select
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              disabled={!categoryId || subCategories.length === 0}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-500 bg-white disabled:bg-slate-100 disabled:text-slate-400"
            >
              <option value="">-- Select Sub-Category --</option>
              {subCategories.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Local Image Upload */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Main Featured Image * (Stored inside public/uploads)
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <label className="cursor-pointer inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-lg transition shadow-xs">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading...' : 'Upload Image File'}</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>

            {image && (
              <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span className="font-mono text-[11px] truncate max-w-xs">{image}</span>
              </div>
            )}
          </div>

          {image && (
            <div className="mt-3 w-48 h-32 rounded-xl border border-slate-200 overflow-hidden bg-slate-100">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Summary / Short Lead Paragraph *
          </label>
          <textarea
            rows={2}
            required
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Provide a concise 1-2 line summary of the article..."
            className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Content Paragraphs (Detail Page Data) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
              Full Content Paragraphs (Detail Page Body) *
            </label>
            <button
              type="button"
              onClick={addParagraph}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-red-600 hover:text-red-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Paragraph</span>
            </button>
          </div>

          <div className="space-y-3">
            {contentParagraphs.map((paragraph, idx) => (
              <div key={idx} className="flex items-start space-x-2">
                <textarea
                  rows={3}
                  value={paragraph}
                  onChange={(e) => handleParagraphChange(idx, e.target.value)}
                  placeholder={`Paragraph ${idx + 1} content (HTML or plain text supported)...`}
                  className="flex-1 border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-500"
                />
                {contentParagraphs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParagraph(idx)}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition"
                    title="Remove Paragraph"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Metadata Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Author Name
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Estimated Read Time
            </label>
            <input
              type="text"
              value={readTime}
              onChange={(e) => setReadTime(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Publish Date
            </label>
            <input
              type="date"
              value={publishedDate}
              onChange={(e) => setPublishedDate(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        {/* Flags & Status */}
        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <span className="text-xs font-medium text-slate-700">Lead / Featured Article</span>
            </label>

            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
              />
              <span className="text-xs font-medium text-slate-700">Trending News</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Status:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-red-500 bg-white"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-md shadow-red-600/20 transition disabled:opacity-50"
          >
            {submitting ? 'Saving Article...' : isEdit ? 'Update News Article' : 'Publish News Article'}
          </button>
        </div>
      </form>
    </div>
  );
}
