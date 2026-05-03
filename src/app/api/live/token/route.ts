import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { LiveStream } from "@/models/LiveStream";
import { requireAdmin } from "@/lib/api-auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const room = searchParams.get("room");
  const username = searchParams.get("username") || "Devotee-" + Math.floor(Math.random() * 1000);

  if (!room) {
    return NextResponse.json({ error: "Missing room name" }, { status: 400 });
  }

  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json({ error: "Server misconfigured: LiveKit keys missing" }, { status: 500 });
  }

  // Check if admin is requesting a broadcaster token
  const gate = await requireAdmin(req);
  const isBroadcaster = gate.ok;

  try {
    const at = new AccessToken(apiKey, apiSecret, {
      identity: username,
    });

    at.addGrant({
      roomJoin: true,
      room: room,
      canPublish: isBroadcaster,
      canSubscribe: true,
      canPublishData: isBroadcaster,
    });

    return NextResponse.json({ token: await at.toJwt() });
  } catch (e) {
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
