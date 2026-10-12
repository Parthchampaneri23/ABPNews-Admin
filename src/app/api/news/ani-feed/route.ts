import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import axios from 'axios';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const targetUrl = 'https://www.aninews.in/';
    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const articles: { id: string; title: string; url: string; imageUrl?: string; category?: string }[] = [];

    let index = 0;
    $('a[href*="/news/"]').each((_, el) => {
      const href = $(el).attr('href');
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      const img = $(el).find('img').attr('src') || $(el).parent().find('img').attr('src') || '';

      if (href && text.length > 20) {
        const fullUrl = href.startsWith('http') ? href : `https://www.aninews.in${href}`;

        // Avoid generic navigation links like "Read More"
        const lower = text.toLowerCase();
        if (lower === 'read more' || lower === 'see all' || lower.includes('terms of use')) {
          return;
        }

        // Extract category hint from URL pattern /news/category/subcategory/...
        const parts = href.replace(/^https?:\/\/[^\/]+/, '').split('/').filter(Boolean);
        const cat = parts[1] || 'general';

        if (!articles.some((a) => a.url === fullUrl || a.title === text)) {
          index++;
          articles.push({
            id: `ani_live_${index}_${Math.random().toString(36).substring(2, 7)}`,
            title: text,
            url: fullUrl,
            imageUrl: img ? (img.startsWith('http') ? img : `https://www.aninews.in${img}`) : undefined,
            category: cat.toUpperCase(),
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      count: articles.length,
      data: articles.slice(0, 60),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Scrape Feed Error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch ANI live articles feed' },
      { status: 500 }
    );
  }
}
