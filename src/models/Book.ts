import mongoose, { Schema, models, model } from "mongoose";

export interface IBook {
  _id: mongoose.Types.ObjectId;
  title: string;
  author?: string;
  description: string;
  coverUrl?: string;
  pdfUrl?: string;
  featured: boolean;
  order: number;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, trim: true },
    description: { type: String, required: true, trim: true },
    coverUrl: { type: String, trim: true },
    pdfUrl: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

BookSchema.index({ order: 1, published: 1 });

export const Book = models.Book || model<IBook>("Book", BookSchema);
