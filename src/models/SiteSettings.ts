import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISocialLink {
  platform: string; // 'facebook' | 'twitter' | 'instagram' | 'youtube' | 'linkedin' | 'whatsapp' | 'telegram' | 'other'
  title: string;
  url: string;
  isActive: boolean;
  icon?: string;
  order: number;
}

export interface ISiteSettings extends Document {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  logoAltText: string;
  footerLogoUrl?: string;
  socialLinks: ISocialLink[];
  createdAt: Date;
  updatedAt: Date;
}

const SocialLinkSchema = new Schema({
  platform: { type: String, required: true, default: 'other' },
  title: { type: String, required: true },
  url: { type: String, required: true, default: '#' },
  isActive: { type: Boolean, default: true },
  icon: { type: String, default: '' },
  order: { type: Number, default: 0 },
});

const defaultSocialLinks: ISocialLink[] = [
  { platform: 'facebook', title: 'Facebook', url: 'https://facebook.com', isActive: true, order: 0 },
  { platform: 'twitter', title: 'Twitter / X', url: 'https://twitter.com', isActive: true, order: 1 },
  { platform: 'instagram', title: 'Instagram', url: 'https://instagram.com', isActive: true, order: 2 },
  { platform: 'youtube', title: 'YouTube', url: 'https://youtube.com', isActive: true, order: 3 },
  { platform: 'whatsapp', title: 'WhatsApp Channel', url: 'https://whatsapp.com', isActive: false, order: 4 },
  { platform: 'telegram', title: 'Telegram', url: 'https://telegram.org', isActive: false, order: 5 },
];

const SiteSettingsSchema: Schema = new Schema(
  {
    siteName: { type: String, default: 'Metrotimes' },
    tagline: { type: String, default: 'India’s Leading News Destination' },
    logoUrl: { type: String, default: '/logoupdate.png' },
    faviconUrl: { type: String, default: '/favicon update.png' },
    logoAltText: { type: String, default: 'Metrotimes' },
    footerLogoUrl: { type: String, default: '/logoupdate.png' },
    socialLinks: { type: [SocialLinkSchema], default: defaultSocialLinks },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
