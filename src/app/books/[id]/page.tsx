import Link from "next/link";
import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import { Book } from "@/models/Book";
import mongoose from "mongoose";
import type { Metadata } from "next";
import { gdriveThumbnailUrl, gdriveDownloadUrl, isGdriveUrl } from "@/lib/gdrive";

import { BookDetailContent } from "./book-detail-content";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return { title: "Book" };
  try {
    await dbConnect();
    const b = await Book.findOne({ _id: id, published: true }).lean();
    if (!b) return { title: "Book" };
    // Safety check for title and description to prevent crashes if fields are missing
    return { 
      title: b.title || "Book", 
      description: (b.description || "").slice(0, 160) 
    };
  } catch {
    return { title: "Book" };
  }
}

export default async function BookDetailPage({ params }: Props) {
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) notFound();

  await dbConnect();
  const b = await Book.findOne({ _id: id, published: true }).lean();
  if (!b) notFound();

  return <BookDetailContent book={JSON.parse(JSON.stringify(b))} />;
}
