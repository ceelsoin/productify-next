import { Schema, model, models } from 'mongoose';

export interface IJobItem {
  type: 'enhanced-images' | 'promotional-video' | 'viral-copy' | 'voice-over';
  credits: number;
  config?: {
    // Enhanced Images Config
    scenario?: string;
    // Promotional Video Config
    music?: boolean;
    narration?: boolean;
    subtitles?: boolean;
    template?: string;
    // Viral Copy Config
    tone?: string;
    objective?: string;
    style?: string;
    // Voice Over Config
    voice?: string;
    speed?: number;
  };
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: {
    // URLs dos arquivos gerados
    files?: string[];
    // Texto gerado (para viral copy)
    text?: string;
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
    enum: ['enhanced-images', 'promotional-video', 'viral-copy', 'voice-over'],
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
