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
    } else if (!settings.socialLinks || settings.socialLinks.length === 0) {
      settings.socialLinks = [
        { platform: 'facebook', title: 'Facebook', url: 'https://facebook.com', isActive: true, order: 0 },
        { platform: 'twitter', title: 'Twitter / X', url: 'https://twitter.com', isActive: true, order: 1 },
        { platform: 'instagram', title: 'Instagram', url: 'https://instagram.com', isActive: true, order: 2 },
        { platform: 'youtube', title: 'YouTube', url: 'https://youtube.com', isActive: true, order: 3 },
        { platform: 'whatsapp', title: 'WhatsApp Channel', url: 'https://whatsapp.com', isActive: false, order: 4 },
        { platform: 'telegram', title: 'Telegram', url: 'https://telegram.org', isActive: false, order: 5 },
      ] as any;
      await settings.save();
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
    const { siteName, tagline, logoUrl, faviconUrl, logoAltText, footerLogoUrl, socialLinks } = body;

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
        socialLinks: socialLinks || undefined,
      });
    } else {
      if (siteName !== undefined) settings.siteName = siteName;
      if (tagline !== undefined) settings.tagline = tagline;
      if (logoUrl !== undefined) settings.logoUrl = logoUrl;
      if (faviconUrl !== undefined) settings.faviconUrl = faviconUrl;
      if (logoAltText !== undefined) settings.logoAltText = logoAltText;
      if (footerLogoUrl !== undefined) settings.footerLogoUrl = footerLogoUrl;
      if (socialLinks !== undefined) settings.socialLinks = socialLinks;
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
