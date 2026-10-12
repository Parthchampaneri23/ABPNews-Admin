'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  AlertCircle,
  CheckCircle2,
  Globe,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Search,
  Check,
  FileText,
  AlignLeft,
  Share2,
  Code2,
  Tag,
  Link2,
  Radio,
  Zap,
  Clock,
  X,
  ListFilter,
  Eye
} from 'lucide-react';

interface NewsFormProps {
  isEdit?: boolean;
}

interface AniArticleItem {
  id: string;
  title: string;
  url: string;
  imageUrl?: string;
  category?: string;
}

export default function NewsFormPage({ isEdit = false }: NewsFormProps) {
  const router = useRouter();
  const params = useParams();
  const newsId = params?.id as string;

  // Form Fields
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [contentBody, setContentBody] = useState('');
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

  // SEO Friendly Fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [schemaScript, setSchemaScript] = useState('');
  const [showSeoSection, setShowSeoSection] = useState(true);

  // Categories lists
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);

  // Live ANI feed states
  const [aniUrlInput, setAniUrlInput] = useState('');
  const [fetchingAniArticle, setFetchingAniArticle] = useState(false);
  const [showFeedDrawer, setShowFeedDrawer] = useState(false);
  const [feedArticles, setFeedArticles] = useState<AniArticleItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedSearch, setFeedSearch] = useState('');
  const [selectedFeedUrl, setSelectedFeedUrl] = useState('');
  const [lastFeedSync, setLastFeedSync] = useState<string>('Just now');
  const [isLiveAutoSync, setIsLiveAutoSync] = useState(true);
  const [showAllNewsModal, setShowAllNewsModal] = useState(false);

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
    } else if (!isEdit) {
      // Auto-load top 5 live articles initially
      fetchAniFeed(false);
    }
  }, [isEdit, newsId]);

  // Real-time background feed synchronization every 20 seconds
  useEffect(() => {
    if (isEdit || !isLiveAutoSync) return;
    const interval = setInterval(() => {
      fetchAniFeed(true); // background silent refresh
    }, 20000);
    return () => clearInterval(interval);
  }, [isEdit, isLiveAutoSync]);

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
        setTitle(n.title || '');
        setSummary(n.summary || '');
        
        // Populate content in single unified structured text box
        if (Array.isArray(n.content)) {
          setContentBody(n.content.join('\n\n'));
        } else {
          setContentBody(n.content || '');
        }

        setImage(n.image || '');
        setCategoryId(typeof n.categoryId === 'object' ? n.categoryId._id : n.categoryId);
        setSubCategoryId(typeof n.subCategoryId === 'object' ? n.subCategoryId?._id : n.subCategoryId || '');
        setAuthor(n.author || 'Metrotimes Editor');
        setReadTime(n.readTime || '3 min read');
        setPublishedDate(n.publishedDate || new Date().toISOString().split('T')[0]);
        setIsFeatured(n.isFeatured || false);
        setIsTrending(n.isTrending || false);
        setStatus(n.status || 'published');

        // Populate SEO fields with intelligent fallbacks
        const slug = n.slug || 'news';
        const fallbackTitle = n.metaTitle || `${n.title} | Metrotimes`;
        const fallbackDesc = n.metaDescription || n.summary || '';
        const fallbackCanonical = n.canonicalUrl || `https://metrotimes.com/news/${slug}`;
        const fallbackKeywords = n.metaKeywords || 'Metrotimes, News, India, Latest Updates';
        const fallbackSchema = n.schemaScript || `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": ${JSON.stringify(n.title || '')},
  "description": ${JSON.stringify(n.summary || '')},
  "image": [${JSON.stringify(n.image || '')}],
  "datePublished": ${JSON.stringify(n.publishedDate || new Date().toISOString())},
  "author": {
    "@type": "Person",
    "name": ${JSON.stringify(n.author || 'Metrotimes Editor')}
  },
  "publisher": {
    "@type": "Organization",
    "name": "Metrotimes",
    "logo": {
      "@type": "ImageObject",
      "url": "https://metrotimes.com/logo1.png"
    }
  }
}
</script>`;

        setMetaTitle(fallbackTitle);
        setMetaDescription(fallbackDesc);
        setMetaKeywords(fallbackKeywords);
        setCanonicalUrl(fallbackCanonical);
        setSchemaScript(fallbackSchema);
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

  // Auto-generate SEO fields when Title, Summary, or Image change (only if not manually filled)
  const handleAutoGenerateSeo = () => {
    if (!title.trim()) return;
    const cleanTitle = title.trim();
    const cleanSummary = summary.trim() || cleanTitle;
    const cleanSlug = cleanTitle
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const words = cleanTitle
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3)
      .slice(0, 6);

    const generatedKeywords = ['Metrotimes', 'News', 'Latest Updates', ...words].join(', ');
    const generatedCanonical = `https://metrotimes.com/news/${cleanSlug}`;
    const generatedMetaTitle = `${cleanTitle} | Metrotimes`;

    const generatedSchema = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": ${JSON.stringify(cleanTitle)},
  "description": ${JSON.stringify(cleanSummary)},
  "image": [${JSON.stringify(image || 'https://metrotimes.com/logo1.png')}],
  "datePublished": ${JSON.stringify(publishedDate || new Date().toISOString())},
  "author": {
    "@type": "Person",
    "name": ${JSON.stringify(author || 'Metrotimes Editor')}
  },
  "publisher": {
    "@type": "Organization",
    "name": "Metrotimes",
    "logo": {
      "@type": "ImageObject",
      "url": "https://metrotimes.com/logo1.png"
    }
  }
}
</script>`;

    setMetaTitle(generatedMetaTitle);
    setMetaDescription(cleanSummary);
    setMetaKeywords(generatedKeywords);
    setCanonicalUrl(generatedCanonical);
    setSchemaScript(generatedSchema);
  };

  // Load Live ANI Feed
  const fetchAniFeed = async (silent: boolean = false) => {
    if (!silent) setLoadingFeed(true);
    try {
      const res = await fetch('/api/news/ani-feed');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setFeedArticles(data.data);
        const now = new Date();
        setLastFeedSync(
          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );
      } else if (!silent) {
        setError(data.message || 'Failed to load live ANI feed');
      }
    } catch (err) {
      if (!silent) setError('Failed to connect to ANI news service');
    } finally {
      if (!silent) setLoadingFeed(false);
    }
  };

  const handleToggleFeedDrawer = () => {
    const nextState = !showFeedDrawer;
    setShowFeedDrawer(nextState);
    if (nextState && feedArticles.length === 0) {
      fetchAniFeed();
    }
  };

  // Auto Fetch Article content by URL
  const handleFetchFromUrl = async (targetUrl?: string) => {
    const urlToFetch = targetUrl || aniUrlInput.trim();
    if (!urlToFetch) {
      setError('Please provide a valid ANI news article URL.');
      return;
    }

    setError('');
    setSuccess('');
    setFetchingAniArticle(true);
    setSelectedFeedUrl(urlToFetch);

    try {
      const res = await fetch('/api/news/fetch-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlToFetch }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch article details.');
      }

      const art = data.data;

      // Populate Title
      if (art.title) setTitle(art.title);

      // Populate Clean Short Description / Summary
      if (art.summary) setSummary(art.summary);

      // Populate Complete Structured Article Body into one single box
      if (art.fullArticleBody) {
        setContentBody(art.fullArticleBody);
      } else if (Array.isArray(art.paragraphs) && art.paragraphs.length > 0) {
        setContentBody(art.paragraphs.join('\n\n'));
      }

      // Populate Image
      if (art.image) {
        setImage(art.image);
      }

      // Populate All SEO Fields Automatically
      if (art.metaTitle) setMetaTitle(art.metaTitle);
      if (art.metaDescription) setMetaDescription(art.metaDescription);
      if (art.metaKeywords) setMetaKeywords(art.metaKeywords);
      if (art.canonicalUrl) setCanonicalUrl(art.canonicalUrl);
      if (art.schemaScript) setSchemaScript(art.schemaScript);

      // Auto Category Matching
      if (art.categoryHint && categories.length > 0) {
        const hint = art.categoryHint.toLowerCase();
        const matched = categories.find(
          (c) =>
            !c.parentId &&
            (c.slug.toLowerCase() === hint ||
              c.name.toLowerCase() === hint ||
              c.slug.toLowerCase().includes(hint) ||
              hint.includes(c.slug.toLowerCase()) ||
              c.name.toLowerCase().includes(hint) ||
              hint.includes(c.name.toLowerCase()))
        );

        if (matched) {
          setCategoryId(matched._id);

          // Subcategory matching
          if (art.subCategoryHint) {
            const subHint = art.subCategoryHint.toLowerCase();
            const subs = categories.filter((c) =>
              typeof c.parentId === 'object' && c.parentId !== null
                ? c.parentId._id === matched._id
                : c.parentId === matched._id
            );
            const matchedSub = subs.find(
              (s) =>
                s.slug.toLowerCase() === subHint ||
                s.name.toLowerCase() === subHint ||
                s.slug.toLowerCase().includes(subHint) ||
                subHint.includes(s.slug.toLowerCase())
            );
            if (matchedSub) {
              setSubCategoryId(matchedSub._id);
            }
          }
        }
      }

      setSuccess('✨ Live article data & complete SEO metadata loaded successfully!');
      window.scrollTo({ top: 380, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch article content');
    } finally {
      setFetchingAniArticle(false);
    }
  };

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

      setImage(data.url);
    } catch (err) {
      setError('Image upload failed due to network issue.');
    } finally {
      setUploading(false);
    }
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
      setError('Article Short Description must be at least 10 characters long.');
      return;
    }

    if (!contentBody.trim() || contentBody.trim().length < 30) {
      setError('Full Article Content is required (at least 30 characters).');
      return;
    }

    if (!categoryId) {
      setError('Please select a Main Category.');
      return;
    }

    if (!image) {
      setError('Please upload a main news article image or fetch from live ANI link.');
      return;
    }

    // Split paragraphs cleanly by double newlines or single newlines
    const formattedParagraphs = contentBody
      .split(/\n\s*\n|\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    setSubmitting(true);

    try {
      const payload = {
        title: title.trim(),
        summary: summary.trim(),
        content: formattedParagraphs,
        image,
        categoryId,
        subCategoryId: subCategoryId || null,
        author: author.trim(),
        readTime: readTime.trim(),
        publishedDate,
        isFeatured,
        isTrending,
        status,
        // SEO Fields
        metaTitle: metaTitle.trim() || `${title.trim()} | Metrotimes`,
        metaDescription: metaDescription.trim() || summary.trim(),
        metaKeywords: metaKeywords.trim(),
        canonicalUrl: canonicalUrl.trim(),
        schemaScript: schemaScript.trim(),
        ogTitle: metaTitle.trim() || `${title.trim()} | Metrotimes`,
        ogDescription: metaDescription.trim() || summary.trim(),
        ogImage: image,
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
  const filteredFeed = feedArticles.filter((item) =>
    item.title.toLowerCase().includes(feedSearch.toLowerCase()) ||
    (item.category && item.category.toLowerCase().includes(feedSearch.toLowerCase()))
  );

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
              Fill all required news details, fetch live data from ANI website, or upload media locally.
            </p>
          </div>
        </div>
      </div>

      {/* Top 5 Latest Live Articles from ANI Website */}
      {!isEdit && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                <Radio className="w-5 h-5 text-red-600 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                    Top 5 Latest Live News Articles
                  </h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    Live Syncing
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct from official <span className="text-slate-800 font-mono font-semibold">aninews.in</span>. Auto-refreshes when new articles are published on ANI. Click any article to load complete content &amp; SEO.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowAllNewsModal(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                title="Browse and search all live articles from ANI"
              >
                <Eye className="w-3.5 h-3.5 text-white" />
                <span>View All Live News ({feedArticles.length})</span>
              </button>

              <div className="hidden md:flex items-center text-[11px] text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 font-mono">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                <span>Synced: {lastFeedSync}</span>
              </div>

              <button
                type="button"
                onClick={() => fetchAniFeed(false)}
                disabled={loadingFeed}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 text-xs font-semibold transition cursor-pointer shadow-2xs"
                title="Refresh latest feed now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingFeed ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>

          {/* Top 5 Articles Cards */}
          {loadingFeed && feedArticles.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-slate-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
              <span>Connecting to ANI live news stream...</span>
            </div>
          ) : feedArticles.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
              No live articles detected currently.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5">
              {feedArticles.slice(0, 5).map((item, index) => {
                const isSelected = selectedFeedUrl === item.url;
                const isFetchingThis = fetchingAniArticle && selectedFeedUrl === item.url;
                return (
                  <div
                    key={item.id || item.url}
                    className={`p-3 rounded-xl border transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-red-50/70 border-red-300 shadow-xs ring-1 ring-red-400'
                        : 'bg-slate-50/70 hover:bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Rank Badge */}
                      <div className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                        #{index + 1}
                      </div>

                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-14 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200 hidden sm:block"
                        />
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          {item.category && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">
                              {item.category}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                            <Zap className="w-3 h-3 text-amber-500" />
                            Live on ANI
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 truncate hover:text-red-600 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/70 transition"
                        title="View live source on aninews.in"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <button
                        type="button"
                        onClick={() => handleFetchFromUrl(item.url)}
                        disabled={fetchingAniArticle}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                      >
                        {isFetchingThis ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Importing...</span>
                          </>
                        ) : isSelected ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Loaded</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-yellow-300" />
                            <span>Auto-Fill Article</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: Browse All Live Articles from ANI */}
      {showAllNewsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/70">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                  <Globe className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    All Live News Articles from ANI Feed
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-200">
                      {feedArticles.length} Live Stories
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Filter or search through all freshly scraped ANI news articles and click &quot;Auto-Fill Article&quot; to import instantly.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllNewsModal(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Filter Bar */}
            <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={feedSearch}
                  onChange={(e) => setFeedSearch(e.target.value)}
                  placeholder="Search articles or category..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
                />
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs text-slate-500 font-mono">
                  Showing {filteredFeed.length} of {feedArticles.length}
                </span>

                <button
                  type="button"
                  onClick={() => fetchAniFeed(false)}
                  disabled={loadingFeed}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingFeed ? 'animate-spin text-red-600' : 'text-slate-500'}`} />
                  <span>Sync Fresh Feed</span>
                </button>
              </div>
            </div>

            {/* Scrollable Articles List */}
            <div className="p-5 overflow-y-auto space-y-2.5 flex-1 bg-slate-50/40">
              {loadingFeed ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3 text-slate-500 text-xs">
                  <RefreshCw className="w-8 h-8 animate-spin text-red-600" />
                  <span>Fetching full live stream from www.aninews.in...</span>
                </div>
              ) : filteredFeed.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  No articles found matching &quot;{feedSearch}&quot;.
                </div>
              ) : (
                filteredFeed.map((item, index) => {
                  const isSelected = selectedFeedUrl === item.url;
                  const isFetchingThis = fetchingAniArticle && selectedFeedUrl === item.url;
                  return (
                    <div
                      key={item.id || item.url}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-red-50/70 border-red-300 ring-1 ring-red-400'
                          : 'bg-white hover:bg-slate-50/80 border-slate-200/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {index + 1}
                        </div>

                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="w-16 h-12 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200 hidden sm:block"
                          />
                        )}

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {item.category && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 border border-red-200 uppercase tracking-wider">
                                {item.category}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-medium">ANI Live Wire</span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 hover:text-red-600 transition-colors">
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                          title="View live source on aninews.in"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          type="button"
                          onClick={async () => {
                            await handleFetchFromUrl(item.url);
                            setShowAllNewsModal(false);
                          }}
                          disabled={fetchingAniArticle}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-sm ${
                            isSelected
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {isFetchingThis ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Importing...</span>
                            </>
                          ) : isSelected ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Loaded</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                              <span>Auto-Fill Article</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
              <span>Click &quot;Auto-Fill Article&quot; to populate headline, body, images, and SEO into the editor.</span>
              <button
                type="button"
                onClick={() => setShowAllNewsModal(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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

        {/* Featured Image */}
        <div>
          <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Main Featured Image (Stored inside public/uploads) *
          </label>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="cursor-pointer inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition">
              <Upload className="w-4 h-4" />
              <span>{uploading ? 'Uploading Local Image...' : 'Upload Image File'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>

            {image && (
              <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg max-w-full overflow-hidden">
                <img
                  src={image}
                  alt="Preview"
                  className="w-10 h-10 object-cover rounded shadow-sm border border-slate-200"
                />
                <span className="text-xs text-slate-600 font-mono truncate max-w-xs">{image}</span>
                <button
                  type="button"
                  onClick={() => setImage('')}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold ml-2"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Short Description (Summary) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-red-600" />
              <span>Short Description / Summary *</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {summary.length} characters
            </span>
          </div>
          <textarea
            required
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Clean 1-2 sentence lead summary of the article..."
            className="w-full border border-slate-300 rounded-xl p-3.5 text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-sans"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Displayed on cards, category archives, and under headline on detail pages.
          </p>
        </div>

        {/* Unified Full Article Content Box */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <FileText className="w-3.5 h-3.5 text-red-600" />
              <span>Full Article Body (Structured Content) *</span>
            </label>
            <span className="text-[11px] text-slate-400 font-mono">
              {contentBody ? contentBody.split(/\n\s*\n|\n/).filter(p => p.trim()).length : 0} paragraphs
            </span>
          </div>

          <textarea
            required
            rows={14}
            value={contentBody}
            onChange={(e) => setContentBody(e.target.value)}
            placeholder="Complete structured article content. Separate paragraphs with blank lines (Enter twice)..."
            className="w-full border border-slate-300 rounded-xl p-4 text-sm text-slate-900 leading-relaxed focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 font-sans font-normal resize-y shadow-inner"
          />
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
            <span>💡 Separate paragraphs with double Enter / blank lines. Each paragraph will be formatted cleanly in the live website reader.</span>
          </p>
        </div>

        {/* SEO FRIENDLY MODULE */}
        <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
          <div
            onClick={() => setShowSeoSection(!showSeoSection)}
            className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200/80 cursor-pointer flex items-center justify-between border-b border-slate-200 transition"
          >
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-red-600 text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  SEO & Search Engine Optimization
                  <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    SEO Friendly
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Meta title, description, keywords, canonical link and JSON-LD schema
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAutoGenerateSeo();
                }}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-slate-300 text-slate-700 hover:text-red-600 rounded-lg shadow-2xs hover:bg-slate-50 transition flex items-center space-x-1"
                title="Regenerate SEO from current Title and Summary"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Auto-Fill SEO</span>
              </button>
              {showSeoSection ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </div>
          </div>

          {showSeoSection && (
            <div className="p-5 space-y-4 bg-white">
              {/* Meta Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Meta Title (Browser Tab & Google SERP)
                  </label>
                  <span className={`text-[10px] font-mono ${metaTitle.length > 60 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {metaTitle.length}/60 chars
                  </span>
                </div>
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Headline | Metrotimes"
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              {/* Meta Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Meta Description
                  </label>
                  <span className={`text-[10px] font-mono ${metaDescription.length > 160 ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                    {metaDescription.length}/160 chars
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder="Concise 150-160 character summary snippet for search results..."
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              {/* Meta Keywords & Canonical */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <Tag className="w-3 h-3 text-red-600" />
                    <span>Meta Keywords (Comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={metaKeywords}
                    onChange={(e) => setMetaKeywords(e.target.value)}
                    placeholder="Metrotimes, World News, Breaking Updates"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1 flex items-center space-x-1">
                    <Link2 className="w-3 h-3 text-red-600" />
                    <span>Canonical URL</span>
                  </label>
                  <input
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://metrotimes.com/news/article-slug"
                    className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>
              </div>

              {/* Schema Script (JSON-LD) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1">
                    <Code2 className="w-3 h-3 text-red-600" />
                    <span>Structured Data Schema (JSON-LD NewsArticle)</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Google Rich Snippets Ready
                  </span>
                </div>
                <textarea
                  rows={5}
                  value={schemaScript}
                  onChange={(e) => setSchemaScript(e.target.value)}
                  placeholder={`<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "NewsArticle",\n  "headline": "..."\n}\n</script>`}
                  className="w-full border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-red-500 font-mono bg-slate-50"
                />
              </div>
            </div>
          )}
        </div>

        {/* Metadata grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-200">
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
