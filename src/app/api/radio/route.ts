import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    streamUrl: process.env.STREAM_URL || null,
  });
}
