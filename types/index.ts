export type Product = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ProductImage = {
  id: string;
  productId: string;
  originalUrl: string;
  enhancedUrl?: string;
  width: number;
  height: number;
  format: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
};

export type ProductVideo = {
  id: string;
  productId: string;
  templateId: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
};

export type User = {
  id: string;
  email: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
};

export type CreditTransaction = {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'deduction' | 'refund';
  description: string;
  stripePaymentId?: string;
  createdAt: Date;
};
