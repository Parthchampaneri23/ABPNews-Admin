/**
 * Metrotimes Admin - Central Application Configuration
 * Imports environment variables from .env.local with safe defaults.
 */
export const adminConfig = {
  appName: 'Metrotimes Admin Panel',
  port: process.env.PORT || 3001,
  websiteUrl: process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000',
  mongoUri: process.env.MONGODB_URI || 'mongodb+srv://parthchampanerirndtechnosoft_db_user:qwaszx123@cluster0.fn1bc3b.mongodb.net/abpnews_admin?retryWrites=true&w=majority',
  jwtSecret: process.env.JWT_SECRET || 'abpnews_super_secret_jwt_key_2026',
  upload: {
    maxImageSizeMB: 5,
    maxVideoSizeMB: 100,
    imageUploadDir: '/uploads',
    videoUploadDir: '/uploads/videos',
  },
  defaultLogo: '/logoupdate.png',
};

export default adminConfig;
