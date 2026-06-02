import mongoose, { Document, Schema } from 'mongoose';

export interface ICard extends Document {
  title: string;
  description: string;
  list_id: mongoose.Types.ObjectId;
  board_id: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  labels: { text: string; color: string }[];
  due_date?: Date;
  position: number;
  attachments: { url: string; name: string; file_type: string }[];
  activities: { _id?: mongoose.Types.ObjectId; title: string; is_completed: boolean; picture?: string }[];
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema: Schema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Card title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    list_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'List',
      required: true,
    },
    board_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    labels: [
      {
        text: String,
        color: String,
      },
    ],
    due_date: {
      type: Date,
    },
    position: {
      type: Number,
      default: 0,
    },
    attachments: [
      {
        url: String,
        name: String,
        file_type: String,
      },
    ],
      activities: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
        },
        is_completed: {
          type: Boolean,
          default: false,
        },
        picture: {
          type: String,
          default: '',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ICard>('Card', cardSchema);
