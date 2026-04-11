import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { dbConnect } from "@/lib/db";
import { normalizeMediaUrl } from "@/lib/media-url";
import { Book } from "@/models/Book";
import { z } from "zod";
import mongoose from "mongoose";

const Patch = z.object({
  title: z.string().min(1).optional(),
  author: z.string().optional(),
  description: z.string().min(1).optional(),
  coverUrl: z.union([z.string().min(1), z.literal("")]).optional(),
  pdfUrl: z.union([z.string().min(1), z.literal("")]).optional(),
  featured: z.boolean().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const json = await req.json().catch(() => null);
  const parsed = Patch.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const data = { ...parsed.data };
  if (data.coverUrl === "") data.coverUrl = undefined;
  if (data.pdfUrl === "") data.pdfUrl = undefined;
  if (typeof data.coverUrl === "string") data.coverUrl = normalizeMediaUrl(data.coverUrl);
  if (typeof data.pdfUrl === "string") data.pdfUrl = normalizeMediaUrl(data.pdfUrl);
  await dbConnect();
  const b = await Book.findByIdAndUpdate(id, data, { new: true });
  if (!b) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(b);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const gate = await requireAdmin(_req);
  if (!gate.ok) return gate.response;
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await dbConnect();
  await Book.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
