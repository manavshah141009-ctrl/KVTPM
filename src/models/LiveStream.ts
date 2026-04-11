import mongoose, { Schema, models, model } from "mongoose";

export type StreamProvider = "youtube" | "embed" | "hls";

export interface ILiveStream {
  _id: mongoose.Types.ObjectId;
  title: string;
  /** YouTube video ID, HLS URL, or full embed src */
  streamKeyOrUrl: string;
  provider: StreamProvider;
  isLive: boolean;
  chatEmbedHtml?: string;
  updatedAt: Date;
  createdAt: Date;
}

const LiveStreamSchema = new Schema<ILiveStream>(
  {
    title: { type: String, default: "Live Satsang" },
    streamKeyOrUrl: { type: String, required: true },
    provider: {
      type: String,
      enum: ["youtube", "embed", "hls"],
      default: "youtube",
    },
    isLive: { type: Boolean, default: false },
    chatEmbedHtml: { type: String },
  },
  { timestamps: true }
);

/** Singleton document: we use findOne; admin updates the first doc */
export const LiveStream =
  models.LiveStream || model<ILiveStream>("LiveStream", LiveStreamSchema);
