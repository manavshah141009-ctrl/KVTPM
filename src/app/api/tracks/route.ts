import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Track } from "@/models/Track";

export async function GET() {
  await dbConnect();
  const tracks = await Track.find({ published: true }).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json(
    tracks.map((t) => ({
      id: String(t._id),
      title: t.title,
      artist: t.artist,
      description: t.description,
      audioUrl: t.audioUrl,
      durationSec: t.durationSec,
      order: t.order,
    }))
  );
}
