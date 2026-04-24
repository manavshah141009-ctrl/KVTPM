import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { dbConnect } from "@/lib/db";
import { normalizeMediaUrl } from "@/lib/media-url";
import { Track } from "@/models/Track";
import { z } from "zod";
import mongoose from "mongoose";

async function validateOverlap(scheduleType: string, fixedTime: string, durationSec: number, excludeId: string) {
  if (scheduleType !== "fixed" || !fixedTime || !durationSec) return null;
  const existing = await Track.find({ scheduleType: "fixed", _id: { $ne: excludeId } });
  
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

const Patch = z.object({
  title: z.string().min(1).optional(),
  artist: z.string().optional(),
  description: z.string().optional(),
  audioUrl: z.string().min(1).optional(),
  durationSec: z.number().optional(),
  order: z.number().optional(),
  published: z.boolean().optional(),
  scheduleType: z.enum(["rotation", "fixed"]).optional(),
  fixedTime: z.string().optional(),
  isRepeating: z.boolean().optional(),
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

  // For PATCH, we need to merge the incoming data with the existing track
  // to ensure we have scheduleType, fixedTime, and durationSec.
  const existingTrack = await Track.findById(id);
  if (!existingTrack) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const finalScheduleType = parsed.data.scheduleType ?? existingTrack.scheduleType;
  const finalFixedTime = parsed.data.fixedTime ?? existingTrack.fixedTime;
  const finalDurationSec = parsed.data.durationSec ?? existingTrack.durationSec;

  if (finalScheduleType === "fixed" && finalFixedTime && finalDurationSec) {
    const overlapErr = await validateOverlap(finalScheduleType, finalFixedTime, finalDurationSec, id);
    if (overlapErr) {
      return NextResponse.json({ error: overlapErr }, { status: 400 });
    }
  }

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
