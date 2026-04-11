import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { LiveStream } from "@/models/LiveStream";

export async function GET() {
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
}
