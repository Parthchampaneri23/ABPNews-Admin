import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';

export async function GET() {
  try {
    await connectDB();
    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = await SiteSettings.create({
        siteName: 'Metrotimes',
        tagline: 'India’s Leading News Destination',
        logoUrl: '/logoupdate.png',
        faviconUrl: '/favicon update.png',
        logoAltText: 'Metrotimes',
        footerLogoUrl: '/logoupdate.png',
      });
    }
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch site settings' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { siteName, tagline, logoUrl, faviconUrl, logoAltText, footerLogoUrl } = body;

    await connectDB();
    let settings = await SiteSettings.findOne();

    if (!settings) {
      settings = await SiteSettings.create({
        siteName: siteName || 'Metrotimes',
        tagline: tagline || 'India’s Leading News Destination',
        logoUrl: logoUrl || '/logoupdate.png',
        faviconUrl: faviconUrl || '/favicon update.png',
        logoAltText: logoAltText || 'Metrotimes',
        footerLogoUrl: footerLogoUrl || '/logoupdate.png',
      });
    } else {
      if (siteName !== undefined) settings.siteName = siteName;
      if (tagline !== undefined) settings.tagline = tagline;
      if (logoUrl !== undefined) settings.logoUrl = logoUrl;
      if (faviconUrl !== undefined) settings.faviconUrl = faviconUrl;
      if (logoAltText !== undefined) settings.logoAltText = logoAltText;
      if (footerLogoUrl !== undefined) settings.footerLogoUrl = footerLogoUrl;
      await settings.save();
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update site settings' },
      { status: 500 }
    );
  }
}
