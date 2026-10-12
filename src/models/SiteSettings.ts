import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISiteSettings extends Document {
  siteName: string;
  tagline: string;
  logoUrl: string;
  faviconUrl: string;
  logoAltText: string;
  footerLogoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SiteSettingsSchema: Schema = new Schema(
  {
    siteName: { type: String, default: 'Metrotimes' },
    tagline: { type: String, default: 'India’s Leading News Destination' },
    logoUrl: { type: String, default: '/logoupdate.png' },
    faviconUrl: { type: String, default: '/favicon update.png' },
    logoAltText: { type: String, default: 'Metrotimes' },
    footerLogoUrl: { type: String, default: '/logoupdate.png' },
  },
  { timestamps: true }
);

const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);

export default SiteSettings;
