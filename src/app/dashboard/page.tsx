'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  FolderTree,
  FileCheck,
  FileEdit,
  TrendingUp,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [recentNews, setRecentNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setRecentNews(data.recentNews || []);
      }
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total News Articles', value: stats?.totalNews || 0, icon: Newspaper, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Published Articles', value: stats?.publishedNews || 0, icon: FileCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Draft Articles', value: stats?.draftNews || 0, icon: FileEdit, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Main Categories', value: stats?.totalCategories || 0, icon: FolderTree, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Overview</h1>
          <p className="text-sm text-slate-500 mt-1">
            Overview of news publications, categories, sub-categories, and local media uploads.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/news/create"
            className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create News Article</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
              </div>
              <div className={`p-3 rounded-lg ${card.bg} ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Articles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recently Added Articles</h2>
            <p className="text-xs text-slate-500">Live MongoDB records seeded with local image storage</p>
          </div>
          <Link
            href="/dashboard/news"
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/60 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-6">Image</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {recentNews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 text-sm">
                    No articles found in database.
                  </td>
                </tr>
              ) : (
                recentNews.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-6">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt=""
                        className="w-12 h-9 object-cover rounded-md border border-slate-200 bg-slate-100"
                      />
                    </td>
                    <td className="py-3 px-6 font-medium text-slate-900 max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-3 px-6 text-slate-600 text-xs font-semibold">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {item.categoryId?.name || 'General'}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-xs text-slate-500">
                      {item.publishedDate}
                    </td>
                    <td className="py-3 px-6">
                      <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="capitalize">{item.status}</span>
                      </span>
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
