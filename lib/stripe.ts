import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
});

export type CreditPackage = {
  id: string;
  name: string;
  credits: number;
  price: number;
  priceId: string;
};

export const CREDIT_PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 100,
    price: 999,
    priceId: process.env.STRIPE_PRICE_STARTER || '',
  },
  {
    id: 'professional',
    name: 'Professional Pack',
    credits: 500,
    price: 3999,
    priceId: process.env.STRIPE_PRICE_PROFESSIONAL || '',
  },
  {
    id: 'enterprise',
    name: 'Enterprise Pack',
    credits: 1000,
    price: 6999,
    priceId: process.env.STRIPE_PRICE_ENTERPRISE || '',
  },
];
