import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  sourceType: 'youtube' | 'local';
  videoUrl?: string; // Local upload URL path (e.g. /uploads/videos/video_123.mp4)
  youtubeUrl?: string;
  youtubeId?: string;
  thumbnail: string;
  category: string;
  duration?: string;
  views?: string;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    sourceType: { type: String, enum: ['youtube', 'local'], default: 'youtube' },
    videoUrl: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    youtubeId: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    category: { type: String, default: 'News', trim: true },
    duration: { type: String, default: '03:45' },
    views: { type: String, default: '1.2K views' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Video: Model<IVideo> = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);

export default Video;
