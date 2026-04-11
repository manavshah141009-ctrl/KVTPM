import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { dbConnect } from "@/lib/db";
import { normalizeMediaUrl } from "@/lib/media-url";
import { Track } from "@/models/Track";
import { z } from "zod";

const Create = z.object({
  title: z.string().min(1),
  artist: z.string().optional(),
  description: z.string().optional(),
  audioUrl: z.string().min(1),
  durationSec: z.number().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
});

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;
  await dbConnect();
  const tracks = await Track.find().sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(tracks);
}

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;
  const json = await req.json().catch(() => null);
  const parsed = Create.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  await dbConnect();
  const t = await Track.create({
    ...parsed.data,
    audioUrl: normalizeMediaUrl(parsed.data.audioUrl),
  });
  return NextResponse.json(t);
}
