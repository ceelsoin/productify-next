import { Schema, model, models } from 'mongoose';

export interface IJobItem {
  type: 'enhanced-images' | 'promotional-video' | 'viral-copy' | 'product-description' | 'voice-over' | 'captions';
  credits: number;
  config?: {
    // Enhanced Images Config
    scenario?: string;
    language?: string;
    // Promotional Video Config
    music?: boolean;
    narration?: boolean;
    subtitles?: boolean;
    template?: string;
    // Viral Copy Config
    platform?: string;
    tone?: string;
    includeEmojis?: boolean;
    includeHashtags?: boolean;
    // Product Description Config
    style?: string;
    targetAudience?: string;
    // Voice Over Config
    voice?: string;
    objective?: string;
    speed?: number;
    // Captions Config
    format?: string;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    // URLs dos arquivos gerados
    files?: string[];
    // Texto gerado (para viral copy e product description)
    text?: string;
    // Tipo de resultado (para diferenciar viral copy de product description)
    type?: string;
    // Platform (para viral copy)
    platform?: string;
    // Style (para product description)
    style?: string;
    // Contagem de palavras
    wordCount?: number;
    // Mensagem de erro (se falhou)
    error?: string;
  };
  startedAt?: Date;
  completedAt?: Date;
}

export interface IJob {
  _id: string;
  user: string; // Referência ao User._id
  productInfo: {
    name: string;
    description?: string;
    dimensions?: {
      height?: number;
      width?: number;
      depth?: number;
      weight?: number;
    };
  };
  originalImage: {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  };
  items: IJobItem[];
  totalCredits: number;
  creditsSpent: number;
  creditsRefunded: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  progress: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  refundedAt?: Date;
}

const JobItemSchema = new Schema<IJobItem>({
  type: {
    type: String,
    enum: ['enhanced-images', 'promotional-video', 'viral-copy', 'product-description', 'voice-over', 'captions'],
    required: true,
  },
  credits: {
    type: Number,
    required: true,
  },
  config: {
    type: Schema.Types.Mixed,
    default: {},
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
  },
  result: {
    files: [String],
    text: String,
    type: String,
    platform: String,
    style: String,
    wordCount: Number,
    error: String,
  },
  startedAt: Date,
  completedAt: Date,
});

const JobSchema = new Schema<IJob>(
  {
    user: {
      type: String,
      required: true,
      index: true,
    },
    productInfo: {
      name: {
        type: String,
        required: true,
      },
      description: String,
      dimensions: {
        height: Number,
        width: Number,
        depth: Number,
        weight: Number,
      },
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
      size: {
        type: Number,
        required: true,
      },
      mimeType: {
        type: String,
        required: true,
      },
    },
    items: [JobItemSchema],
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
      enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
      default: 'pending',
      index: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    startedAt: Date,
    completedAt: Date,
    failedAt: Date,
    refundedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Índices compostos para queries comuns
JobSchema.index({ user: 1, createdAt: -1 });
JobSchema.index({ user: 1, status: 1 });

export const Job = models.Job || model<IJob>('Job', JobSchema);
