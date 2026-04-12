import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Track } from "@/models/Track";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
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
  } catch (err) {
    console.error("[api/tracks] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
