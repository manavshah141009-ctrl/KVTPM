import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Book } from "@/models/Book";

export async function GET() {
  await dbConnect();
  const books = await Book.find({ published: true }).sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json(
    books.map((b) => ({
      id: String(b._id),
      title: b.title,
      author: b.author,
      description: b.description,
      coverUrl: b.coverUrl,
      pdfUrl: b.pdfUrl,
      featured: b.featured,
    }))
  );
}
