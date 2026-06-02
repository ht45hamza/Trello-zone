import mongoose, { Document, Schema } from 'mongoose';

export interface IBoard extends Document {
  title: string;
  description?: string;
  background_color: string;
  background_image?: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  starredBy: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const boardSchema: Schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    background_color: {
      type: String,
      default: '#0079bf',
    },
    background_image: {
      type: String,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    starredBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBoard>('Board', boardSchema);
