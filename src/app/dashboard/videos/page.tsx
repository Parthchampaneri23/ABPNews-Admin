'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Video as VideoIcon,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Play,
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  Film,
  RefreshCw,
  Search,
  Check,
  X,
  Upload,
  Globe,
  HardDrive,
  FileVideo
} from 'lucide-react';

interface VideoItem {
  _id: string;
  title: string;
  sourceType?: 'youtube' | 'local';
  videoUrl?: string;
  youtubeUrl?: string;
  youtubeId?: string;
  thumbnail: string;
  category: string;
  duration?: string;
  views?: string;
  isActive: boolean;
  order: number;
  createdAt: string;
}

export default function VideosManagementPage() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [sourceType, setSourceType] = useState<'youtube' | 'local'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [category, setCategory] = useState('News');
  const [duration, setDuration] = useState('03:45');
  const [views, setViews] = useState('1.5K views');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [previewId, setPreviewId] = useState('');

  // Upload States
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadedVideoName, setUploadedVideoName] = useState('');
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Auto-detect YouTube ID from URL for instant preview
  const extractYoutubeId = (url: string) => {
    if (!url) return '';
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (match && match[1]) return match[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return '';
  };

  useEffect(() => {
    if (sourceType === 'youtube') {
      const id = extractYoutubeId(youtubeUrl);
      setPreviewId(id);
      if (id && (!thumbnail || thumbnail.includes('img.youtube.com'))) {
        setThumbnail(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
      }
    }
  }, [youtubeUrl, sourceType]);

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/videos');
      const data = await res.json();
      if (data.success && data.videos) {
        setVideos(data.videos);
      }
    } catch (e) {
      console.error('Failed to load videos', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const openCreateModal = () => {
    setEditingVideo(null);
    setTitle('');
    setSourceType('youtube');
    setYoutubeUrl('');
    setVideoUrl('');
    setThumbnail('');
    setUploadedVideoName('');
    setCategory('News');
    setDuration('03:45');
    setViews('1.5K views');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (v: VideoItem) => {
    setEditingVideo(v);
    setTitle(v.title);
    setSourceType(v.sourceType || (v.videoUrl ? 'local' : 'youtube'));
    setYoutubeUrl(v.youtubeUrl || '');
    setVideoUrl(v.videoUrl || '');
    setThumbnail(v.thumbnail || '');
    setUploadedVideoName(v.videoUrl ? v.videoUrl.split('/').pop() || '' : '');
    setCategory(v.category || 'News');
    setDuration(v.duration || '03:45');
    setViews(v.views || '1.5K views');
    setIsActive(v.isActive);
    setIsModalOpen(true);
  };

  // Handle local video file upload
  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      alert('Video file size exceeds 100MB limit. For larger videos, consider embedding a YouTube URL.');
      return;
    }

    setUploadingVideo(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload/video', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVideoUrl(data.url);
        setUploadedVideoName(file.name);
      } else {
        alert(data.error || 'Failed to upload video');
      }
    } catch (err) {
      alert('Error uploading video file.');
    } finally {
      setUploadingVideo(false);
    }
  };

  // Handle local thumbnail image upload
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingThumbnail(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setThumbnail(data.url);
      } else {
        alert(data.error || 'Failed to upload thumbnail image');
      }
    } catch (err) {
      alert('Error uploading thumbnail image.');
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please fill out the video title.');
      return;
    }

    if (sourceType === 'youtube' && !youtubeUrl.trim()) {
      alert('Please provide a valid YouTube link or ID.');
      return;
    }

    if (sourceType === 'local' && !videoUrl.trim()) {
      alert('Please choose and upload a video file from your computer.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        sourceType,
        youtubeUrl: youtubeUrl.trim(),
        videoUrl: videoUrl.trim(),
        thumbnail: thumbnail.trim(),
        category: category.trim(),
        duration: duration.trim(),
        views: views.trim(),
        isActive,
      };

      let res;
      if (editingVideo) {
        res = await fetch(`/api/videos/${editingVideo._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/videos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setIsModalOpen(false);
        loadVideos();
      } else {
        alert(data.error || 'Failed to save video');
      }
    } catch (err) {
      alert('Error saving video. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/videos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleActive: true }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVideos((prev) =>
          prev.map((v) => (v._id === id ? { ...v, isActive: !currentStatus } : v))
        );
      }
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this video from website?')) return;
    try {
      const res = await fetch(`/api/videos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok && data.success) {
        setVideos((prev) => prev.filter((v) => v._id !== id));
      } else {
        alert(data.error || 'Failed to delete video');
      }
    } catch (err) {
      alert('Error deleting video');
    }
  };

  const filteredVideos = videos.filter(
    (v) =>
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <VideoIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Website Video Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Upload local videos directly or embed YouTube reports for the live website Video Hub
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Video</span>
        </button>
      </div>

      {/* Filter and Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search videos by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs font-medium border border-slate-200 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold text-slate-500 self-end sm:self-auto">
          <span>Total: <strong className="text-slate-800">{videos.length}</strong></span>
          <span>Published: <strong className="text-emerald-600">{videos.filter(v => v.isActive).length}</strong></span>
          <button
            onClick={loadVideos}
            title="Reload videos"
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm font-semibold">
          Loading videos from database...
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center space-y-3">
          <Film className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Videos Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Get started by uploading a local video or adding a YouTube report to display on the live website.
          </p>
          <button
            onClick={openCreateModal}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
          >
            Add Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVideos.map((item) => {
            const isLocal = item.sourceType === 'local' || (!item.youtubeId && !!item.videoUrl);
            const thumbSrc = item.thumbnail || (item.youtubeId ? `https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=800&auto=format&fit=crop&q=60');

            return (
              <div
                key={item._id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  item.isActive ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-60'
                }`}
              >
                {/* Thumbnail Area */}
                <div>
                  <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden group">
                    <img
                      src={thumbSrc}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      {isLocal ? (
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </div>
                      ) : (
                        <a
                          href={item.youtubeUrl || `https://www.youtube.com/watch?v=${item.youtubeId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-10 h-10 bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                        >
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        </a>
                      )}
                    </div>

                    {/* Source Type Badge */}
                    <span className="absolute top-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded flex items-center space-x-1">
                      {isLocal ? (
                        <>
                          <HardDrive className="w-3 h-3 text-blue-400" />
                          <span>Local</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3 text-red-400" />
                          <span>YouTube</span>
                        </>
                      )}
                    </span>

                    <span className="absolute top-2 left-2 bg-red-600 text-white font-bold text-[9px] px-2 py-0.5 rounded uppercase tracking-wider">
                      {item.category}
                    </span>

                    <span className="absolute bottom-2 right-2 bg-black/80 text-white font-bold text-[10px] px-2 py-0.5 rounded">
                      {item.duration || '03:45'}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-4 space-y-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug hover:text-red-600 transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.views || '1.2K views'}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                        {isLocal ? 'Uploaded MP4' : `ID: ${item.youtubeId}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleActive(item._id, item.isActive)}
                    className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                      item.isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {item.isActive ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live on Site</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-slate-500" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(item)}
                      title="Edit video"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      title="Delete video"
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-white rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Add / Edit Video */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn my-6 max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-red-600 text-white rounded-lg">
                  <VideoIcon className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {editingVideo ? 'Edit Website Video' : 'Add New Video to Website'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveVideo} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                  Video Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Ground Report: Mumbai Metro Phase 3 Inspection"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                />
              </div>

              {/* Source Type Selector (YouTube vs Local Upload) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Video Source Option *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSourceType('youtube')}
                    className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      sourceType === 'youtube'
                        ? 'border-red-600 bg-red-50/70 text-red-700 shadow-xs ring-1 ring-red-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Globe className="w-4 h-4 text-red-600" />
                    <span>YouTube Link / ID</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSourceType('local')}
                    className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      sourceType === 'local'
                        ? 'border-blue-600 bg-blue-50/70 text-blue-700 shadow-xs ring-1 ring-blue-600'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <HardDrive className="w-4 h-4 text-blue-600" />
                    <span>Upload From Local</span>
                  </button>
                </div>
              </div>

              {/* OPTION A: YouTube Link Input */}
              {sourceType === 'youtube' && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    YouTube Video Link or ID *
                  </label>
                  <input
                    type="text"
                    required={sourceType === 'youtube'}
                    placeholder="e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ or dQw4w9WgXcQ"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                  <p className="text-[11px] text-slate-400">
                    Accepts standard YouTube links, share links (youtu.be), or pure 11-char video IDs.
                  </p>

                  {/* YouTube Preview Box */}
                  {previewId && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center space-x-3 mt-2">
                      <img
                        src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
                        alt="Preview"
                        className="w-20 h-12 object-cover rounded-md bg-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                          YouTube Detected
                        </span>
                        <p className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
                          ID: {previewId}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* OPTION B: Local Video File Upload */}
              {sourceType === 'local' && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Select Local Video File (MP4, WebM, MOV) *
                  </label>

                  <input
                    type="file"
                    ref={videoInputRef}
                    accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
                    onChange={handleVideoFileUpload}
                    className="hidden"
                  />

                  <div
                    onClick={() => videoInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                      videoUrl
                        ? 'border-emerald-400 bg-emerald-50/40'
                        : 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20'
                    }`}
                  >
                    {uploadingVideo ? (
                      <div className="py-2 space-y-1">
                        <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                        <p className="text-xs font-bold text-slate-600">Uploading video file...</p>
                        <p className="text-[10px] text-slate-400">Please wait while the file uploads</p>
                      </div>
                    ) : videoUrl ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 text-left min-w-0">
                          <div className="p-2 bg-emerald-600 text-white rounded-lg shrink-0">
                            <FileVideo className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {uploadedVideoName || 'Video File Uploaded'}
                            </p>
                            <span className="text-[10px] text-emerald-600 font-bold">
                              Ready for publish (Saved locally)
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-blue-600 underline shrink-0 ml-2">
                          Change
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5 py-1">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="text-xs font-bold text-slate-700">
                          Click to Browse & Upload Video File
                        </p>
                        <p className="text-[10px] text-slate-400">
                          Supported formats: MP4, WebM, MOV, MKV (Max 100MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Category & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Category Tag
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-white"
                  >
                    <option value="Politics">Politics</option>
                    <option value="News">News</option>
                    <option value="Technology">Technology</option>
                    <option value="Business">Business</option>
                    <option value="Sports">Sports</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Special Report">Special Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                    Duration (e.g. 04:15)
                  </label>
                  <input
                    type="text"
                    placeholder="04:15 or Live"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Thumbnail Image Section (Upload local or URL) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Video Thumbnail / Poster Image
                  </label>
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Upload Image</span>
                  </button>
                  <input
                    type="file"
                    ref={thumbInputRef}
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={sourceType === 'youtube' ? 'Auto-generated from YouTube if left empty' : 'Paste image URL or click Upload Image above'}
                    value={thumbnail}
                    onChange={(e) => setThumbnail(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
                  />
                </div>

                {uploadingThumbnail && (
                  <p className="text-[11px] text-blue-600 font-medium mt-1">Uploading thumbnail...</p>
                )}

                {thumbnail && (
                  <div className="mt-2 flex items-center space-x-2">
                    <img
                      src={thumbnail}
                      alt="Thumbnail Preview"
                      className="w-16 h-10 object-cover rounded border border-slate-200"
                    />
                    <span className="text-[10px] text-slate-500 truncate max-w-[300px]">
                      {thumbnail}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Toggle */}
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded cursor-pointer"
                />
                <label htmlFor="activeCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Display this video publicly on website immediately
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingVideo || uploadingThumbnail}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingVideo ? 'Update Video' : 'Add Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
