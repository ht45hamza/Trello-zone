import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  full_name: string;
  email: string;
  password: string;
  avatar: string;
  phone_number: string;
  address: string;
  refreshToken: string;
  otp: string;
  otpExpiry: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema: Schema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    avatar: {
      type: String,
      default: '',
    },
    phone_number: {
      type: String,
      default: '',
      trim: true,
    },
    address: {
      type: String,
      default: '',
      trim: true,
    },
    refreshToken: {
      type: String,
      default: '',
    },
    otp: {
      type: String,
      default: '',
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>('User', userSchema);
