import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Track } from "@/models/Track";

export const dynamic = "force-dynamic";

/**
 * GET /api/radio
 *
 * Returns data for the timestamp-based virtual radio:
 *   - tracks: all published tracks with a durationSec > 0
 *   - startEpoch: Unix timestamp (seconds) anchoring the radio clock (t=0)
 *   - totalDuration: sum of all track durations in seconds
 *
 * Every client computes:
 *   elapsed = (Date.now()/1000 - startEpoch) % totalDuration
 * then walks the track list to find which track is "live" and at what offset.
 *
 * This gives every visitor exactly the same synchronized playback
 * with zero streaming cost.
 */
export async function GET() {
  try {
    await dbConnect();

    // Only include tracks that have a valid duration set
    const tracks = await Track.find({
      published: true,
      durationSec: { $gt: 0 },
    })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    if (!tracks.length) {
      console.warn("[api/radio] No published tracks with durationSec found");
      return NextResponse.json(
        { tracks: [], startEpoch: null, totalDuration: 0 },
        {
          headers: {
            "Cache-Control": "no-store",
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Filter rotation tracks for math purposes
    const rotationTracks = tracks.filter((t) => t.scheduleType !== "fixed");

    // Anchor the radio clock to the createdAt of the first rotation track.
    // This value never changes so every client always agrees on t=0.
    const firstCreatedAt = rotationTracks.length
      ? rotationTracks[0].createdAt
      : (tracks[0]?.createdAt ?? Date.now());
    const startEpoch = Math.floor(new Date(firstCreatedAt as string | number | Date).getTime() / 1000);
    const totalDuration = rotationTracks.reduce((s, t) => s + (t.durationSec ?? 0), 0);

    console.log(
      `[api/radio] Serving ${tracks.length} tracks (${rotationTracks.length} rotation), totalDuration=${totalDuration}s, epoch=${startEpoch}`
    );

    return NextResponse.json(
      {
        tracks: tracks.map((t) => ({
          id: String(t._id),
          title: t.title,
          artist: t.artist ?? null,
          audioUrl: t.audioUrl,
          durationSec: t.durationSec,
          order: t.order ?? 0,
          scheduleType: t.scheduleType || "rotation",
          fixedTime: t.fixedTime,
          isRepeating: t.isRepeating ?? true,
          createdAt: t.createdAt,
        })),
        startEpoch,
        totalDuration,
      },
      {
        headers: {
          // Never cache — position must always be fresh
          "Cache-Control": "no-store",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("[api/radio] Error:", err);
    return NextResponse.json(
      { tracks: [], startEpoch: null, totalDuration: 0 },
      {
        status: 500,
        headers: { "Cache-Control": "no-store", "Content-Type": "application/json" },
      }
    );
  }
}
