import mongoose, { Schema, Document } from 'mongoose';
import { 
  JobStatus, 
  JobItemStatus, 
  JobType,
  JobItemConfig,
  EnhancedImagesConfig,
  PromotionalVideoConfig,
  ViralCopyConfig,
  VoiceOverConfig,
} from '../core/types';

/**
 * Strongly typed result for each job type
 */
export interface EnhancedImagesResult {
  images: string[];
  count: number;
}

export interface ViralCopyResult {
  text: string;
  platform: string;
  wordCount: number;
}

export interface VoiceOverResult {
  audioUrl: string;
  duration: number;
  format: string;
  language: string;
}

export interface CaptionsResult {
  captions: string;
  format: string;
}

export interface PromotionalVideoResult {
  videoUrl: string;
  duration: number;
  format: string;
}

export type JobItemResult = 
  | EnhancedImagesResult 
  | ViralCopyResult 
  | VoiceOverResult 
  | CaptionsResult 
  | PromotionalVideoResult;

/**
 * Job item with discriminated union based on type
 */
export type IJobItem = 
  | {
      type: JobType.ENHANCED_IMAGES;
      credits: number;
      config: EnhancedImagesConfig;
      status: JobItemStatus;
      progress: number;
      result?: EnhancedImagesResult;
      error?: string;
    }
  | {
      type: JobType.VIRAL_COPY;
      credits: number;
      config: ViralCopyConfig;
      status: JobItemStatus;
      progress: number;
      result?: ViralCopyResult;
      error?: string;
    }
  | {
      type: JobType.VOICE_OVER;
      credits: number;
      config: VoiceOverConfig;
      status: JobItemStatus;
      progress: number;
      result?: VoiceOverResult;
      error?: string;
    }
  | {
      type: JobType.CAPTIONS;
      credits: number;
      config: Record<string, unknown>;
      status: JobItemStatus;
      progress: number;
      result?: CaptionsResult;
      error?: string;
    }
  | {
      type: JobType.PROMOTIONAL_VIDEO;
      credits: number;
      config: PromotionalVideoConfig;
      status: JobItemStatus;
      progress: number;
      result?: PromotionalVideoResult;
      error?: string;
    };

export interface IJob extends Document {
  user: mongoose.Types.ObjectId;
  productInfo: {
    name: string;
    description?: string;
    dimensions?: string;
    weight?: string;
  };
  originalImage: {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  };
  items: IJobItem[];
  totalCredits: number;
  creditsSpent: number;
  creditsRefunded: number;
  status: JobStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
}

const JobItemSchema = new Schema({
  type: {
    type: String,
    enum: Object.values(JobType),
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  config: {
    type: Schema.Types.Mixed,
    required: true,
  },
  status: {
    type: String,
    enum: Object.values(JobItemStatus),
    default: JobItemStatus.PENDING,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  result: Schema.Types.Mixed,
  error: String,
}, { _id: false });

const JobSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  productInfo: {
    name: {
      type: String,
      required: true,
    },
    description: String,
    dimensions: String,
    weight: String,
  },
  originalImage: {
    url: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
  },
  items: {
    type: [JobItemSchema],
    required: true,
  },
  totalCredits: {
    type: Number,
    required: true,
  },
  creditsSpent: {
    type: Number,
    default: 0,
    required: true,
  },
  creditsRefunded: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: Object.values(JobStatus),
    default: JobStatus.PENDING,
    index: true,
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  completedAt: Date,
  failedAt: Date,
  refundedAt: Date,
}, {
  timestamps: true,
});

// Compound index for user queries
JobSchema.index({ user: 1, status: 1 });
JobSchema.index({ createdAt: -1 });

export const Job = mongoose.models.Job || mongoose.model<IJob>('Job', JobSchema);
