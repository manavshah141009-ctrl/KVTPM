import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { LiveStream } from "@/models/LiveStream";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    await dbConnect();
    const status = await LiveStream.findOne() || await LiveStream.create({ 
      title: "Live Satsang", 
      streamKeyOrUrl: "satsang-room", 
      provider: "livekit",
      isLive: false 
    });
    return NextResponse.json(status);
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch status" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  try {
    const body = await req.json();
    await dbConnect();
    const status = await LiveStream.findOneAndUpdate({}, body, { new: true, upsert: true });
    return NextResponse.json(status);
  } catch (e) {
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
