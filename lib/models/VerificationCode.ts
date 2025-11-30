import { Schema, model, models, Document } from 'mongoose';

export interface IVerificationCode extends Document {
  code: string;
  user: Schema.Types.ObjectId;
  phone: string;
  countryCode: string;
  phoneVerified: string; // Telefone completo que foi verificado (countryCode + phone)
  verified: boolean;
  expires: Date;
  active: boolean;
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
  {
    code: {
      type: String,
      required: true,
      length: 6,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
      default: 'BR',
    },
    phoneVerified: {
      type: String,
      index: true, // Index para buscar telefones já verificados
    },
    expires: {
      type: Date,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    usedAt: {
      type: Date,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index para busca rápida por telefone e código ativo
VerificationCodeSchema.index({ phone: 1, countryCode: 1, active: 1 });

// Index para limpeza automática de códigos expirados (TTL)
VerificationCodeSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

export const VerificationCode =
  models.VerificationCode ||
  model<IVerificationCode>('VerificationCode', VerificationCodeSchema);
