import { Schema, model, models } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  countryCode?: string;
  credits: number;
  image?: string;
  emailVerified?: Date;
  phoneVerified: boolean;
  acceptMarketing: boolean;
  provider?: 'credentials' | 'google' | 'facebook' | 'twitter';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Nome é obrigatório'],
    },
    email: {
      type: String,
      required: [true, 'Email é obrigatório'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
    },
    countryCode: {
      type: String,
      default: 'BR',
    },
    credits: {
      type: Number,
      default: 100, // 100 créditos grátis
    },
    image: {
      type: String,
    },
    emailVerified: {
      type: Date,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    acceptMarketing: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ['credentials', 'google', 'facebook', 'twitter'],
      default: 'credentials',
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare password
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = models.User || model<IUser>('User', UserSchema);
