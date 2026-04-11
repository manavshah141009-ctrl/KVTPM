import { NextResponse } from "next/server";
import { getAdminFromCookies, verifyAdminToken } from "./auth";
import type { AdminJwt } from "./auth";

export async function requireAdmin(): Promise<
  { ok: true; admin: AdminJwt } | { ok: false; response: NextResponse }
>;
export async function requireAdmin(
  req: Request
): Promise<{ ok: true; admin: AdminJwt } | { ok: false; response: NextResponse }>;
export async function requireAdmin(
  req?: Request
): Promise<{ ok: true; admin: AdminJwt } | { ok: false; response: NextResponse }> {
  // Mobile clients: Authorization: Bearer <token>
  const authHeader = req?.headers.get("authorization") || req?.headers.get("Authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    const admin = verifyAdminToken(token);
    if (admin) return { ok: true, admin };
  }

  // Web admin: httpOnly cookie
  const admin = await getAdminFromCookies();
  if (!admin) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  return { ok: true, admin };
}
