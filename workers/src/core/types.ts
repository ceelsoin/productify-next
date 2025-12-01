import { Job as BullJob } from 'bull';

/**
 * Type of generation job
 */
export enum JobType {
  ENHANCED_IMAGES = 'enhanced-images',
  PROMOTIONAL_VIDEO = 'promotional-video',
  VIRAL_COPY = 'viral-copy',
  PRODUCT_DESCRIPTION = 'product-description',
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
  scenario?: string;
  style?: string;
  enhancementLevel?: 'basic' | 'standard' | 'premium';
  orientation?: 'portrait' | 'square'; // Default: portrait (1024x1792), square (1024x1024)
}

/**
 * Configuration for image editing with Nano Banana Edit
 */
export interface ImageEditConfig {
  imageUrl: string; // URL da imagem para editar
  editPrompt: string; // Prompt de edição em linguagem natural
  outputFormat?: 'PNG' | 'JPEG'; // Formato de saída (padrão: JPEG)
  imageSize?: '1:1' | '9:16' | '16:9' | '3:4' | '4:3' | '2:3' | '3:2' | '5:4' | '4:5' | '21:9' | 'auto'; // Aspect ratio
}

/**
 * Configuration for promotional video
 */
export interface PromotionalVideoConfig {
  duration: number;
  style?: string;
  template?: string;
  audioType: 'voiceover' | 'ambient'; // VST (narração) ou música ambiente
  ambientMusicId?: string; // ID da música ambiente selecionada
  includeCaptions?: boolean; // Legendas (requer voiceover)
  transitions?: 'fade' | 'slide' | 'zoom';
  textOverlay?: boolean;
}

/**
 * Configuration for viral copy
 */
export interface ViralCopyConfig {
  platform: string;
  tone?: string;
  length?: 'short' | 'medium' | 'long';
  includeHashtags?: boolean;
  includeEmojis?: boolean;
  language?: string;
}

/**
 * Configuration for product description
 */
export interface ProductDescriptionConfig {
  targetAudience?: string;
  includeEmojis?: boolean;
  language?: string;
  style?: 'marketplace' | 'ecommerce' | 'professional';
}

/**
 * Configuration for voice-over (narração com OpenAI TTS)
 */
export interface VoiceOverConfig {
  language: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'; // OpenAI TTS voices
  speed?: number; // 0.25 to 4.0
  model?: 'tts-1' | 'tts-1-hd';
  scriptText?: string; // Texto para narrar (gerado automaticamente se não fornecido)
}

/**
 * Configuration for captions (transcrição com Whisper.cpp)
 */
export interface CaptionsConfig {
  audioUrl: string; // URL do áudio para transcrever
  language?: string;
  format?: 'srt' | 'vtt' | 'json'; // JSON para usar no Remotion
}

/**
 * Union type for all configs
 */
export type JobItemConfig = 
  | EnhancedImagesConfig 
  | PromotionalVideoConfig 
  | ViralCopyConfig 
  | ProductDescriptionConfig
  | VoiceOverConfig
  | CaptionsConfig;

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
  itemType?: JobType; // Explicit item type for routing
  pipelineName?: string; // Pipeline name for prompt lookup
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
