import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Book } from "@/models/Book";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    await dbConnect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const b: any = await Book.findOne({ _id: id, published: true }).lean();
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
  } catch (err) {
    console.error("[api/books/id] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
