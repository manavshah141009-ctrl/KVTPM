import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { dbConnect } from "@/lib/db";
import { LiveStream } from "@/models/LiveStream";
import { z } from "zod";

const Put = z.object({
  title: z.string().min(1).optional(),
  streamKeyOrUrl: z.string(),
  provider: z.enum(["youtube", "embed", "hls", "livekit"]).optional(),
  isLive: z.boolean().optional(),
  chatEmbedHtml: z.string().optional().nullable(),
});

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;
  await dbConnect();
  let doc = await LiveStream.findOne().sort({ updatedAt: -1 });
  if (!doc) {
    doc = await LiveStream.create({
      title: "Live Satsang",
      streamKeyOrUrl: "",
      provider: "youtube",
      isLive: false,
    });
  }
  return NextResponse.json(doc);
}

export async function PUT(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;
  const json = await req.json().catch(() => null);
  const parsed = Put.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  await dbConnect();
  let doc = await LiveStream.findOne().sort({ updatedAt: -1 });
  if (!doc) {
    doc = await LiveStream.create({ ...parsed.data, title: parsed.data.title ?? "Live Satsang" });
  } else {
    Object.assign(doc, parsed.data);
    if (parsed.data.chatEmbedHtml === null) doc.chatEmbedHtml = undefined;
    await doc.save();
  }
  return NextResponse.json(doc);
}
