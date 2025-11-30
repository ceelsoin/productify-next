import { Job as BullJob } from 'bull';

/**
 * Type of generation job
 */
export enum JobType {
  ENHANCED_IMAGES = 'enhanced-images',
  PROMOTIONAL_VIDEO = 'promotional-video',
  VIRAL_COPY = 'viral-copy',
  VOICE_OVER = 'voice-over',
  CAPTIONS = 'captions'
}

/**
 * Job item status
 */
export enum JobItemStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Overall job status
 */
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

/**
 * Configuration for enhanced images
 */
export interface EnhancedImagesConfig {
  count: number;
  style?: string;
  enhancementLevel?: 'basic' | 'standard' | 'premium';
}

/**
 * Configuration for promotional video
 */
export interface PromotionalVideoConfig {
  duration: number;
  style?: string;
  template?: string;
  includeVoiceover?: boolean;
  includeCaptions?: boolean;
}

/**
 * Configuration for viral copy
 */
export interface ViralCopyConfig {
  platform: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  includeHashtags?: boolean;
}

/**
 * Configuration for voice-over
 */
export interface VoiceOverConfig {
  language: string;
  voice?: string;
  speed?: number;
  pitch?: number;
}

/**
 * Union type for all configs
 */
export type JobItemConfig = 
  | EnhancedImagesConfig 
  | PromotionalVideoConfig 
  | ViralCopyConfig 
  | VoiceOverConfig;

/**
 * Job item (from MongoDB)
 */
export interface JobItem {
  type: JobType;
  credits: number;
  config: JobItemConfig;
  status: JobItemStatus;
  progress: number;
  result?: unknown;
  error?: string;
}

/**
 * Original image metadata
 */
export interface OriginalImage {
  url: string;
  filename: string;
  mimeType: string;
  size: number;
}

/**
 * Product information
 */
export interface ProductInfo {
  name: string;
  description?: string;
  dimensions?: string;
  weight?: string;
}

/**
 * Job document structure (from MongoDB)
 */
export interface JobDocument {
  _id: string;
  user: string;
  productInfo: ProductInfo;
  originalImage: OriginalImage;
  items: JobItem[];
  totalCredits: number;
  status: JobStatus;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Worker job data - what gets queued
 */
export interface WorkerJobData {
  jobId: string;
  itemIndex: number;
  type: JobType;
  config: JobItemConfig;
  originalImage: OriginalImage;
  productInfo: ProductInfo;
  previousResults?: {
    enhancedImages?: string[];
    text?: string;
    captions?: string;
    audio?: string;
  };
}

/**
 * Worker job result
 */
export interface WorkerJobResult {
  jobId: string;
  itemIndex: number;
  success: boolean;
  result?: unknown;
  error?: string;
  nextWorker?: {
    queue: string;
    data: WorkerJobData;
  };
}

/**
 * Base worker interface
 */
export interface IWorker {
  queueName: string;
  concurrency: number;
  process(job: BullJob<WorkerJobData>): Promise<WorkerJobResult>;
  start(): Promise<void>;
  stop(): Promise<void>;
}
