import { NextResponse } from "next/server";
import { getAdminFromCookies } from "@/lib/auth";

export async function GET() {
  const admin = await getAdminFromCookies();
  if (!admin) return NextResponse.json({ authenticated: false });
  return NextResponse.json({ authenticated: true, email: admin.email });
}
