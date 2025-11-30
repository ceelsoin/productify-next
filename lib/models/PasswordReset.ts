import mongoose, { Schema, Document } from 'mongoose';

export interface IPasswordReset extends Document {
  user: mongoose.Types.ObjectId;
  token: string;
  expires: Date;
  used: boolean;
  usedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    expires: {
      type: Date,
      required: true,
      index: true,
    },
    used: {
      type: Boolean,
      default: false,
    },
    usedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Índice TTL para deletar automaticamente tokens expirados após 24 horas
passwordResetSchema.index({ expires: 1 }, { expireAfterSeconds: 86400 });

// Índice composto para busca eficiente
passwordResetSchema.index({ token: 1, used: 1 });

const PasswordReset =
  mongoose.models.PasswordReset ||
  mongoose.model<IPasswordReset>('PasswordReset', passwordResetSchema);

export default PasswordReset;
