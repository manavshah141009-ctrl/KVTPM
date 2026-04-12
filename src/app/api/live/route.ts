import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { LiveStream } from "@/models/LiveStream";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();
    const doc = await LiveStream.findOne().sort({ updatedAt: -1 }).lean();
    if (!doc) {
      return NextResponse.json({
        title: "Live Satsang",
        provider: "youtube",
        streamKeyOrUrl: "",
        isLive: false,
        chatEmbedHtml: undefined as string | undefined,
      });
    }
    return NextResponse.json({
      title: doc.title,
      provider: doc.provider,
      streamKeyOrUrl: doc.streamKeyOrUrl,
      isLive: doc.isLive,
      chatEmbedHtml: doc.chatEmbedHtml,
    });
  } catch (err) {
    console.error("[api/live] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
