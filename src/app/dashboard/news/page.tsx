'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  FileEdit,
  ExternalLink,
  Eye
} from 'lucide-react';

export default function NewsListPage() {
  const [news, setNews] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchNews();
  }, []);

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

  const fetchNews = async () => {
    setLoading(true);
    try {
      let url = '/api/news?';
      if (selectedCategory) url += `category=${selectedCategory}&`;
      if (selectedStatus) url += `status=${selectedStatus}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setNews(data.news || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedCategory, selectedStatus]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete article:\n"${title}"?`)) return;

    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to delete article.');
        return;
      }

      fetchNews();
    } catch (err) {
      alert('Delete request failed.');
    }
  };

  const filteredNews = news.filter((item) =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            News Articles Module
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage all news articles, detail page contents, local uploads, and publication statuses.
          </p>
        </div>

        <Link
          href="/dashboard/news/create"
          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Create News Article</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search news by title or keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-red-500"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <th className="py-3.5 px-6">Image</th>
                <th className="py-3.5 px-6">Article Headline & Summary</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Author & Date</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading news articles...
                  </td>
                </tr>
              ) : filteredNews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No articles found matching filters.
                  </td>
                </tr>
              ) : (
                filteredNews.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-6">
                      <div className="w-14 h-10 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={item.image || '/placeholder.jpg'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3.5 px-6 max-w-md">
                      <Link
                        href={`/dashboard/news/edit/${item._id}`}
                        className="font-bold text-slate-900 hover:text-red-600 line-clamp-1 transition"
                      >
                        {item.title}
                      </Link>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {item.summary}
                      </p>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {item.categoryId?.name || 'Uncategorized'}
                      </span>
                      {item.subCategoryId?.name && (
                        <span className="block mt-1 text-[11px] text-purple-700 font-medium">
                          ↳ {item.subCategoryId.name}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-xs text-slate-600">
                      <span className="font-semibold text-slate-800 block">{item.author}</span>
                      <span className="text-slate-400">{item.publishedDate}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      {item.status === 'published' ? (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          <FileEdit className="w-3 h-3" />
                          <span className="capitalize">{item.status}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right space-x-2">
                      <Link
                        href={`/dashboard/news/edit/${item._id}`}
                        className="inline-block p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit Article"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(item._id, item.title)}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                        title="Delete Article"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
