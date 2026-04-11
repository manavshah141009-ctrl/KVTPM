import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const COOKIE = "kvtp_admin";
const JWT_SECRET = process.env.JWT_SECRET || "dev-insecure-change-me";

export type AdminJwt = { sub: string; email: string };

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAdminToken(payload: AdminJwt, expiresIn = "7d"): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyAdminToken(token: string): AdminJwt | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminJwt;
  } catch {
    return null;
  }
}

export async function setAdminSession(token: string): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

export async function getAdminFromCookies(): Promise<AdminJwt | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  return verifyAdminToken(raw);
}
