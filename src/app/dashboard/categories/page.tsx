'use client';

import React, { useEffect, useState } from 'react';
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  X,
  Layers,
  Search
} from 'lucide-react';

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: { _id: string; name: string } | string | null;
  isActive: boolean;
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Alerts
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (category?: CategoryItem) => {
    setError('');
    setSuccess('');
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setDescription(category.description || '');
      setParentId(
        typeof category.parentId === 'object' && category.parentId !== null
          ? category.parentId._id
          : (category.parentId as string) || ''
      );
      setIsActive(category.isActive);
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
      setParentId('');
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || name.trim().length < 2) {
      setError('Category name must be at least 2 characters.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        parentId: parentId ? parentId : null,
        isActive,
      };

      const url = editingCategory ? `/api/categories/${editingCategory._id}` : '/api/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Failed to save category.');
        setSubmitting(false);
        return;
      }

      setSuccess(editingCategory ? 'Category updated successfully!' : 'Category created successfully!');
      fetchCategories();
      setTimeout(() => {
        closeModal();
      }, 800);
    } catch (err: any) {
      setError('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to delete category.');
        return;
      }

      fetchCategories();
    } catch (err) {
      alert('Delete operation failed.');
    }
  };

  const mainCategories = categories.filter((c) => !c.parentId);

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Categories & Sub-Categories Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Dynamically create, update, and manage news categories and nested sub-categories.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Category / Sub-Category</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by category name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium hidden sm:block">
          Total Entries: <span className="text-slate-900 font-bold">{categories.length}</span>
        </div>
      </div>

      {/* Table List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/70 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
                <th className="py-3 px-6">Type</th>
                <th className="py-3 px-6">Category Name</th>
                <th className="py-3 px-6">Slug</th>
                <th className="py-3 px-6">Parent Category</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading categories...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No categories found. Click 'Add New Category' to create one.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat) => {
                  const parentObj = typeof cat.parentId === 'object' ? cat.parentId : null;
                  const isSub = !!cat.parentId;

                  return (
                    <tr key={cat._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-6">
                        {isSub ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                            <Layers className="w-3 h-3" />
                            <span>Sub-Category</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <FolderTree className="w-3 h-3" />
                            <span>Main Category</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 font-semibold text-slate-900">
                        {cat.name}
                      </td>
                      <td className="py-3.5 px-6 text-xs font-mono text-slate-500">
                        /{cat.slug}
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-600 font-medium">
                        {parentObj ? parentObj.name : '— Top Level —'}
                      </td>
                      <td className="py-3.5 px-6">
                        {cat.isActive ? (
                          <span className="inline-flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-6 text-right space-x-2">
                        <button
                          onClick={() => openModal(cat)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat._id, cat.name)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Category Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingCategory ? 'Edit Category' : 'Create New Category / Sub-Category'}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{success}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. National News or Cricket"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Parent Category (Optional - Select to make Sub-Category)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-white"
                >
                  <option value="">-- None (Top Level Main Category) --</option>
                  {mainCategories
                    .filter((c) => c._id !== editingCategory?._id)
                    .map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this category section..."
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                />
                <label htmlFor="isActiveCheck" className="text-xs font-medium text-slate-700 select-none">
                  Active (Visible in Portal)
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
