import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { dbConnect } from "@/lib/db";
import { normalizeMediaUrl } from "@/lib/media-url";
import { Track } from "@/models/Track";
import { z } from "zod";
import mongoose from "mongoose";

const Patch = z.object({
  title: z.string().min(1).optional(),
  artist: z.string().optional(),
  description: z.string().optional(),
  audioUrl: z.string().min(1).optional(),
  durationSec: z.number().optional(),
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
  await dbConnect();
  const update = {
    ...parsed.data,
    ...(parsed.data.audioUrl ? { audioUrl: normalizeMediaUrl(parsed.data.audioUrl) } : null),
  };
  const t = await Track.findByIdAndUpdate(id, update, { new: true });
  if (!t) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(t);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const gate = await requireAdmin(_req);
  if (!gate.ok) return gate.response;
  const { id } = await ctx.params;
  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await dbConnect();
  await Track.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
