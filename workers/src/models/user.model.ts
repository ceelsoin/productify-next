import mongoose from 'mongoose';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  credits: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
  phone: String,
  countryCode: String,
  credits: {
    type: Number,
    default: 100,
  },
  image: String,
  emailVerified: Date,
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
}, {
  timestamps: true,
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
