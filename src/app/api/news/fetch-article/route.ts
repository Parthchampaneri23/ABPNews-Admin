import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json(
        { success: false, message: 'Valid article URL is required' },
        { status: 400 }
      );
    }

    // Step 1: Fetch article HTML
    const response = await axios.get(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 12000,
    });

    const $ = cheerio.load(response.data);

    // Extract Title
    let rawTitle =
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      $('title').text().trim() ||
      '';

    rawTitle = rawTitle.replace(/\s+/g, ' ').trim();

    // Extract Article Content specifically from main article container (.content.count-br, .content, article)
    let contentHtml =
      $('.content.count-br').first().html() ||
      $('.content_detail').first().html() ||
      $('article .content').first().html() ||
      $('div.content').first().html() ||
      $('article').first().html() ||
      '';

    let paragraphs: string[] = [];

    if (contentHtml) {
      // Replace <br> and <br/> with double newlines
      const withNewlines = contentHtml.replace(/<br\s*[\/]?>/gi, '\n\n');
      const contentCheerio = cheerio.load(withNewlines);
      
      // Remove unwanted boilerplate tags, scripts, styles, social embeds
      contentCheerio('script, style, iframe, .ads, .social-share, ul, ol').remove();

      const rawText = contentCheerio.text();
      const chunks = rawText.split(/\n\s*\n/);

      for (const chunk of chunks) {
        let trimmed = chunk.trim().replace(/\s+/g, ' ');

        // Filter out site headers, dateline teasers, boilerplate and related headline links
        const lower = trimmed.toLowerCase();
        if (
          trimmed.length < 35 ||
          lower.includes('add ani as a trusted source') ||
          lower.includes('all rights reserved') ||
          lower.includes('copyrights') ||
          lower.includes('terms of use') ||
          lower.includes('download the app') ||
          lower.startsWith('updated:') ||
          lower.startsWith('ani | updated:') ||
          lower.startsWith('read also:') ||
          lower.startsWith('also read:')
        ) {
          continue;
        }

        // Clean dateline prefix if present (e.g., "Geneva [Switzerland], October 12 (ANI): ")
        // and remove trailing (ANI)
        trimmed = trimmed.replace(/^[A-Za-z\s]+\[[^\]]+\][,\s]+[A-Za-z0-9,\s]+\(ANI\)\s*:\s*/i, '');
        trimmed = trimmed.replace(/\s*\(ANI\)\s*$/i, '');

        if (trimmed.length > 30) {
          paragraphs.push(trimmed);
        }
      }
    }

    // Fallback if specific container not found
    if (paragraphs.length === 0) {
      $('article p, div.article-body p, p').each((_, el) => {
        let text = $(el).text().trim().replace(/\s+/g, ' ');
        const lower = text.toLowerCase();
        if (
          text.length > 45 &&
          !lower.includes('add ani as a trusted source') &&
          !lower.includes('all rights reserved') &&
          !lower.includes('copyrights') &&
          !lower.startsWith('updated:')
        ) {
          text = text.replace(/^[A-Za-z\s]+\[[^\]]+\][,\s]+[A-Za-z0-9,\s]+\(ANI\)\s*:\s*/i, '');
          text = text.replace(/\s*\(ANI\)\s*$/i, '');
          paragraphs.push(text);
        }
      });
    }

    // Structured full article text in one single clean structured body
    const fullArticleBody = paragraphs.join('\n\n');

    // Clean Short Description (Summary) - first sentence/paragraph or og:description
    let summary =
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      (paragraphs.length > 0 ? paragraphs[0] : rawTitle);

    summary = summary.replace(/\s+/g, ' ').trim();
    // Clean dateline or "(ANI)" from summary if present
    summary = summary.replace(/^[A-Za-z\s]+\[[^\]]+\][,\s]+[A-Za-z0-9,\s]+\(ANI\)\s*:\s*/i, '');
    summary = summary.replace(/\s*\(ANI\)\s*$/i, '').trim();

    // Lead Image
    let imageUrl =
      $('meta[property="og:image"]').attr('content') ||
      $('article img').first().attr('src') ||
      $('img').first().attr('src') ||
      '';

    if (imageUrl && !imageUrl.startsWith('http')) {
      try {
        const parsedUrl = new URL(url);
        imageUrl = `${parsedUrl.protocol}//${parsedUrl.host}${imageUrl}`;
      } catch (e) {
        // ignore
      }
    }

    // Download remote image to local /uploads directory
    let localSavedImagePath = '';
    if (imageUrl && imageUrl.startsWith('http')) {
      try {
        const imgRes = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }

        const ext = path.extname(new URL(imageUrl).pathname) || '.jpg';
        const cleanExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase()) ? ext.toLowerCase() : '.jpg';
        const filename = `ani-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${cleanExt}`;
        const filePath = path.join(uploadsDir, filename);

        fs.writeFileSync(filePath, Buffer.from(imgRes.data));
        localSavedImagePath = `/uploads/${filename}`;
      } catch (imgErr) {
        console.warn('Could not download image locally, will keep remote URL:', imgErr);
        localSavedImagePath = imageUrl;
      }
    }

    // Category extraction from URL
    let categoryHint = '';
    let subCategoryHint = '';
    try {
      const parsedUrl = new URL(url);
      const parts = parsedUrl.pathname.split('/').filter(Boolean);
      if (parts.length >= 2 && parts[0] === 'news') {
        categoryHint = parts[1] || '';
        if (parts.length >= 3) {
          subCategoryHint = parts[2] || '';
        }
      }
    } catch (e) {
      // ignore
    }

    // Extract meta keywords if present on page
    let extractedKeywords = $('meta[name="keywords"]').attr('content') || '';
    if (!extractedKeywords) {
      const words = rawTitle
        .replace(/[^a-zA-Z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .slice(0, 8);
      extractedKeywords = ['Metrotimes', categoryHint, ...words].filter(Boolean).join(', ');
    }

    const generatedSlug = rawTitle
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const metaTitle = `${rawTitle} | Metrotimes`;
    const metaDescription = summary;
    const canonicalUrl = `https://metrotimes.com/news/${generatedSlug}`;
    const schemaScript = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": ${JSON.stringify(rawTitle)},
  "description": ${JSON.stringify(summary)},
  "image": [${JSON.stringify(localSavedImagePath || imageUrl)}],
  "datePublished": ${JSON.stringify(new Date().toISOString())},
  "author": {
    "@type": "Person",
    "name": "Metrotimes Editor"
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

    return NextResponse.json({
      success: true,
      data: {
        title: rawTitle,
        summary: summary,
        fullArticleBody: fullArticleBody,
        paragraphs: paragraphs,
        image: localSavedImagePath || imageUrl,
        categoryHint,
        subCategoryHint,
        sourceUrl: url,
        metaTitle,
        metaDescription,
        metaKeywords: extractedKeywords,
        canonicalUrl,
        schemaScript,
        ogTitle: metaTitle,
        ogDescription: summary,
        ogImage: localSavedImagePath || imageUrl,
      },
    });
  } catch (error: any) {
    console.error('Fetch Article Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch article data from URL' },
      { status: 500 }
    );
  }
}
