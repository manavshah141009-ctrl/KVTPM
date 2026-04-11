import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { dbConnect } from "@/lib/db";
import { normalizeMediaUrl } from "@/lib/media-url";
import { Book } from "@/models/Book";
import { z } from "zod";

const Create = z.object({
  title: z.string().min(1),
  author: z.string().optional(),
  description: z.string().min(1),
  coverUrl: z.string().min(1).optional().or(z.literal("")),
  pdfUrl: z.string().min(1).optional().or(z.literal("")),
  featured: z.boolean().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;
  await dbConnect();
  const books = await Book.find().sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json(books);
}

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;
  const json = await req.json().catch(() => null);
  const parsed = Create.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const payload = {
    ...parsed.data,
    coverUrl: parsed.data.coverUrl ? normalizeMediaUrl(parsed.data.coverUrl) : undefined,
    pdfUrl: parsed.data.pdfUrl ? normalizeMediaUrl(parsed.data.pdfUrl) : undefined,
  };
  await dbConnect();
  const b = await Book.create(payload);
  return NextResponse.json(b);
}
