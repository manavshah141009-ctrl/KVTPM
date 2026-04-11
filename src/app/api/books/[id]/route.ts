import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Book } from "@/models/Book";
import mongoose from "mongoose";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await dbConnect();
  const b = await Book.findOne({ _id: id, published: true }).lean();
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    id: String(b._id),
    title: b.title,
    author: b.author,
    description: b.description,
    coverUrl: b.coverUrl,
    pdfUrl: b.pdfUrl,
    featured: b.featured,
  });
}
