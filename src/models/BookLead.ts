import mongoose, { Schema, models, model } from "mongoose";

export interface IBookLead {
  _id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  bookId: mongoose.Types.ObjectId;
  bookTitle: string;
  action: "read" | "download";
  createdAt: Date;
  updatedAt: Date;
}

const BookLeadSchema = new Schema<IBookLead>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    bookTitle: { type: String, required: true },
    action: { type: String, enum: ["read", "download"], required: true },
  },
  { timestamps: true }
);

export const BookLead = models.BookLead || model<IBookLead>("BookLead", BookLeadSchema);
