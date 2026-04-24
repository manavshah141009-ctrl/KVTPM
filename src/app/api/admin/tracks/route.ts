import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { dbConnect } from "@/lib/db";
import { normalizeMediaUrl } from "@/lib/media-url";
import { Track } from "@/models/Track";
import { z } from "zod";

async function validateOverlap(scheduleType: string, fixedTime: string, durationSec: number) {
  if (scheduleType !== "fixed" || !fixedTime || !durationSec) return null;
  const existing = await Track.find({ scheduleType: "fixed" });
  
  const timeToSeconds = (timeStr: string) => {
    const [h, m, s] = timeStr.split(":").map(Number);
    return (h * 3600) + (m * 60) + (s || 0);
  };

  const nStart = timeToSeconds(fixedTime);
  const nEnd = nStart + durationSec;

  for (const t of existing) {
    if (!t.fixedTime || !t.durationSec) continue;
    const eStart = timeToSeconds(t.fixedTime);
    const eEnd = eStart + t.durationSec;
    if (Math.max(nStart, eStart) < Math.min(nEnd, eEnd) || 
        Math.max(nStart, eStart + 86400) < Math.min(nEnd, eEnd + 86400) ||
        Math.max(nStart, eStart - 86400) < Math.min(nEnd, eEnd - 86400)) {
      return `Time overlaps with track "${t.title}" (scheduled at ${t.fixedTime})`;
    }
  }
  return null;
}

const Create = z.object({
  title: z.string().min(1),
  artist: z.string().optional(),
  description: z.string().optional(),
  audioUrl: z.string().min(1),
  durationSec: z.number().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
  scheduleType: z.enum(["rotation", "fixed"]).optional(),
  fixedTime: z.string().optional(),
  isRepeating: z.boolean().optional(),
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
  
  const { scheduleType, fixedTime, durationSec } = parsed.data;
  if (scheduleType === "fixed" && fixedTime && durationSec) {
    const overlapErr = await validateOverlap(scheduleType, fixedTime, durationSec);
    if (overlapErr) {
      return NextResponse.json({ error: overlapErr }, { status: 400 });
    }
  }

  const t = await Track.create({
    ...parsed.data,
    audioUrl: normalizeMediaUrl(parsed.data.audioUrl),
  });
  return NextResponse.json(t);
}
