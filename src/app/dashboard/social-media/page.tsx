'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Save,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Globe,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface SocialLinkItem {
  _id?: string;
  platform: string;
  title: string;
  url: string;
  isActive: boolean;
  order: number;
}

const PLATFORM_PRESETS = [
  { id: 'facebook', name: 'Facebook', defaultUrl: 'https://facebook.com/metrotimes' },
  { id: 'twitter', name: 'Twitter / X', defaultUrl: 'https://twitter.com/metrotimes' },
  { id: 'instagram', name: 'Instagram', defaultUrl: 'https://instagram.com/metrotimes' },
  { id: 'youtube', name: 'YouTube', defaultUrl: 'https://youtube.com/@metrotimes' },
  { id: 'whatsapp', name: 'WhatsApp Channel', defaultUrl: 'https://whatsapp.com/channel/...' },
  { id: 'telegram', name: 'Telegram', defaultUrl: 'https://t.me/metrotimes' },
  { id: 'linkedin', name: 'LinkedIn', defaultUrl: 'https://linkedin.com/company/metrotimes' },
  { id: 'other', name: 'Custom Website / Link', defaultUrl: 'https://' },
];

export default function SocialMediaManagementPage() {
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // New Link Input State
  const [newPlatform, setNewPlatform] = useState('facebook');
  const [newTitle, setNewTitle] = useState('Facebook');
  const [newUrl, setNewUrl] = useState('');

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings?.socialLinks) {
        setLinks(data.settings.socialLinks);
      }
    } catch (e) {
      console.error('Failed to load social settings', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handlePlatformChange = (val: string) => {
    setNewPlatform(val);
    const preset = PLATFORM_PRESETS.find((p) => p.id === val);
    if (preset) {
      setNewTitle(preset.name);
      if (!newUrl || newUrl === 'https://') {
        setNewUrl(preset.defaultUrl);
      }
    }
  };

  const handleAddLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) {
      alert('Please provide a title and social media URL.');
      return;
    }

    const newItem: SocialLinkItem = {
      platform: newPlatform,
      title: newTitle.trim(),
      url: newUrl.trim(),
      isActive: true,
      order: links.length,
    };

    setLinks([...links, newItem]);
    setNewUrl('');
    setNewPlatform('facebook');
    setNewTitle('Facebook');
  };

  const handleRemove = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleToggle = (index: number) => {
    setLinks(
      links.map((item, i) => (i === index ? { ...item, isActive: !item.isActive } : item))
    );
  };

  const handleUpdateField = (index: number, field: keyof SocialLinkItem, val: any) => {
    setLinks(
      links.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...links];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    setLinks(copy);
  };

  const moveDown = (index: number) => {
    if (index === links.length - 1) return;
    const copy = [...links];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    setLinks(copy);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setSavedSuccess(false);
    try {
      const reordered = links.map((item, idx) => ({ ...item, order: idx }));
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ socialLinks: reordered }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLinks(data.settings.socialLinks);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } else {
        alert(data.error || 'Failed to save social links.');
      }
    } catch (err) {
      alert('Network error saving social media links.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Social Media Accounts Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Manage all social media icons, profile URLs, and channels shown in the website footer
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center space-x-3 text-emerald-800 text-xs font-bold animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Social media accounts successfully updated! The live website footer will now show these links.</span>
        </div>
      )}

      {/* Add New Social Link Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
          <Plus className="w-4 h-4 text-red-600" />
          <span>Add New Social Account / Channel</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Platform Type
            </label>
            <select
              value={newPlatform}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-white"
            >
              {PLATFORM_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Display Name
            </label>
            <input
              type="text"
              placeholder="e.g. Metrotimes Facebook"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
              Profile URL / Channel Link
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={handleAddLink}
              className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Account</span>
            </button>
          </div>
        </div>
      </div>

      {/* Existing Social Links List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Configured Social Channels ({links.length})
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Toggle visibility, update URLs, or reorder the icons that display in the footer
            </p>
          </div>

          <button
            onClick={loadSettings}
            title="Reload from database"
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            Loading social links...
          </div>
        ) : links.length === 0 ? (
          <div className="py-16 text-center text-xs font-semibold text-slate-400">
            No social accounts configured yet. Add your first link using the form above.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {links.map((item, idx) => (
              <div
                key={idx}
                className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
                  item.isActive ? 'bg-white hover:bg-slate-50/60' : 'bg-slate-50/70 opacity-60'
                }`}
              >
                {/* Drag / Order controls + Platform icon */}
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveDown(idx)}
                      disabled={idx === links.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-20 cursor-pointer"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <span className="w-6 text-center text-xs font-bold text-slate-400 font-mono">
                    #{idx + 1}
                  </span>

                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                    {item.platform.slice(0, 2)}
                  </div>

                  <div className="w-36 min-w-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {item.platform}
                    </span>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleUpdateField(idx, 'title', e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-red-600 focus:outline-none py-0.5"
                    />
                  </div>
                </div>

                {/* URL Input */}
                <div className="flex-1 min-w-0 max-w-xl">
                  <div className="flex items-center space-x-2">
                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => handleUpdateField(idx, 'url', e.target.value)}
                      className="w-full text-xs font-medium border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-white"
                      placeholder="https://..."
                    />
                    {item.url && item.url !== '#' && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        title="Open Link"
                        className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Toggle & Delete */}
                <div className="flex items-center space-x-3 self-end md:self-auto shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggle(idx)}
                    className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                      item.isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {item.isActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Visible on Website</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Delete Account"
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-medium">
            Remember to click <strong>&quot;Save All Changes&quot;</strong> after editing URLs or toggling visibility.
          </span>
          <button
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center space-x-1.5 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
