import mongoose, { Schema, Document } from 'mongoose';

export interface IImageEdit extends Document {
  user: mongoose.Types.ObjectId;
  taskId: string;
  originalImageUrl: string;
  editedImageUrl?: string;
  editPrompt: string;
  outputFormat: 'PNG' | 'JPEG';
  imageSize: string;
  status: 'processing' | 'completed' | 'failed';
  error?: string;
  creditsUsed: number;
  createdAt: Date;
  completedAt?: Date;
}

const ImageEditSchema = new Schema<IImageEdit>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  taskId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  originalImageUrl: {
    type: String,
    required: true,
  },
  editedImageUrl: {
    type: String,
  },
  editPrompt: {
    type: String,
    required: true,
  },
  outputFormat: {
    type: String,
    enum: ['PNG', 'JPEG'],
    default: 'JPEG',
  },
  imageSize: {
    type: String,
    default: 'auto',
  },
  status: {
    type: String,
    enum: ['processing', 'completed', 'failed'],
    default: 'processing',
  },
  error: {
    type: String,
  },
  creditsUsed: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
});

// Index for faster queries
ImageEditSchema.index({ user: 1, createdAt: -1 });
ImageEditSchema.index({ status: 1 });

export default mongoose.models.ImageEdit || mongoose.model<IImageEdit>('ImageEdit', ImageEditSchema);
