'use client';

import React, { useEffect, useState } from 'react';
import {
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Sparkles,
  Globe,
  Sliders,
  ExternalLink
} from 'lucide-react';

export default function LogoFaviconPage() {
  const [logoUrl, setLogoUrl] = useState('/logoupdate.png');
  const [faviconUrl, setFaviconUrl] = useState('/favicon update.png');
  const [siteName, setSiteName] = useState('Metrotimes');
  const [tagline, setTagline] = useState('India’s Leading News Destination');
  const [logoAltText, setLogoAltText] = useState('Metrotimes');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.success && data.settings) {
        setLogoUrl(data.settings.logoUrl || '/logoupdate.png');
        setFaviconUrl(data.settings.faviconUrl || '/favicon update.png');
        setSiteName(data.settings.siteName || 'Metrotimes');
        setTagline(data.settings.tagline || 'India’s Leading News Destination');
        setLogoAltText(data.settings.logoAltText || 'Metrotimes');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch logo & branding settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (
    file: File,
    type: 'logo' | 'favicon'
  ) => {
    if (type === 'logo') setUploadingLogo(true);
    else setUploadingFavicon(true);
    setError('');
    setSuccess('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload image.');
      }

      if (type === 'logo') {
        setLogoUrl(data.url);
      } else {
        setFaviconUrl(data.url);
      }
      setSuccess(`✨ New ${type === 'logo' ? 'Logo' : 'Favicon'} uploaded successfully! Click Save to apply.`);
    } catch (err: any) {
      setError(err.message || 'Image upload failed.');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingFavicon(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logoUrl,
          faviconUrl,
          siteName: siteName.trim(),
          tagline: tagline.trim(),
          logoAltText: logoAltText.trim(),
          footerLogoUrl: logoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save settings.');
      }

      setSuccess('🎉 Logo & Favicon settings updated dynamically across the platform!');
      // Dispatch custom event so Sidebar/Navbar updates immediately in current window
      window.dispatchEvent(new Event('site-settings-updated'));
    } catch (err: any) {
      setError(err.message || 'Failed to update settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Sliders className="w-6 h-6 text-red-600" />
            Logo & Favicon Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Dynamically customize the Metrotimes website logo, favicon, and branding from this admin portal.
          </p>
        </div>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-xl transition shadow-2xs"
        >
          <span>View Live Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
        </a>
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
          <span className="font-medium">{success}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Card 1: Main Header & Brand Logo */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-red-600" />
                Primary Website Logo
              </h2>
              <p className="text-xs text-slate-500">
                Displays in the header navigation, mobile menu, footer, and sidebar.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
              Dynamic Brand
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Logo Preview */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-700">Logo Live Preview:</span>
              <div className="p-6 bg-white rounded-2xl border border-slate-200 flex items-center justify-center min-h-[120px] shadow-xs">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={logoAltText || 'Logo Preview'}
                    className="max-h-12 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-500">No logo uploaded</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                Current URL: {logoUrl}
              </p>
            </div>

            {/* Logo Upload & Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                  Upload New Logo
                </label>
                <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm">
                  <Upload className="w-4 h-4" />
                  <span>{uploadingLogo ? 'Uploading...' : 'Choose Logo Image'}</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUploadImage(file, 'logo');
                    }}
                    disabled={uploadingLogo}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">
                  Recommended transparent PNG, SVG, or WEBP (Height: 40-70px).
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                  Logo Alt Text (SEO)
                </label>
                <input
                  type="text"
                  value={logoAltText}
                  onChange={(e) => setLogoAltText(e.target.value)}
                  placeholder="Metrotimes News"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Favicon Management */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-red-600" />
                Browser Favicon Icon
              </h2>
              <p className="text-xs text-slate-500">
                Displays on the browser tab, bookmarks bar, and search engine snippets.
              </p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
              Browser Tab
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Favicon Browser Simulation Preview */}
            <div className="space-y-2">
              <span className="block text-xs font-semibold text-slate-700">Browser Tab Simulation:</span>
              <div className="bg-slate-200 p-2.5 rounded-xl border border-slate-300">
                <div className="bg-white rounded-lg px-3 py-1.5 flex items-center space-x-2 shadow-2xs max-w-xs border border-slate-200">
                  {faviconUrl ? (
                    <img
                      src={faviconUrl}
                      alt="Favicon Preview"
                      className="w-4 h-4 rounded-sm object-contain"
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="text-xs font-medium text-slate-800 truncate">
                    {siteName} - Live News Updates
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                Current URL: {faviconUrl}
              </p>
            </div>

            {/* Favicon Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Upload New Favicon
              </label>
              <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition shadow-sm">
                <Upload className="w-4 h-4" />
                <span>{uploadingFavicon ? 'Uploading...' : 'Choose Favicon (ICO/PNG)'}</span>
                <input
                  type="file"
                  accept="image/png,image/x-icon,image/svg+xml,image/jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadImage(file, 'favicon');
                  }}
                  disabled={uploadingFavicon}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-400">
                Square format recommended (32x32, 64x64, or 128x128 px).
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Brand Metadata */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-3">
            Brand Identity Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Website / Brand Name
              </label>
              <input
                type="text"
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                placeholder="Metrotimes"
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="India’s Leading News Destination"
                className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-900 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-red-600/20 transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Logo & Favicon</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
