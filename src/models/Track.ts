import mongoose, { Schema, models, model } from "mongoose";

export interface ITrack {
  _id: mongoose.Types.ObjectId;
  title: string;
  artist?: string;
  description?: string;
  audioUrl: string;
  durationSec?: number;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema = new Schema<ITrack>(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: String, trim: true },
    description: { type: String, trim: true },
    audioUrl: { type: String, required: true },
    durationSec: { type: Number },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

TrackSchema.index({ order: 1, published: 1 });

export const Track = models.Track || model<ITrack>("Track", TrackSchema);
