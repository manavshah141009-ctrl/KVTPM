import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { Admin } from "@/models/Admin";
import { setAdminSession, signAdminToken, verifyPassword } from "@/lib/auth";
import { z } from "zod";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { email, password } = parsed.data;

    await dbConnect();
    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (!admin) {
      const count = await Admin.countDocuments();
      if (count === 0) {
        return NextResponse.json(
          {
            error:
              "No admin exists in this database. Check MONGODB_URI, then seed: npm run seed:admin -- you@email.com YourPassword",
          },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await verifyPassword(password, admin.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signAdminToken({
      sub: String(admin._id),
      email: admin.email,
    });
    await setAdminSession(token);

    // We return token for mobile clients; web still uses httpOnly cookie session.
    return NextResponse.json({ ok: true, email: admin.email, token });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Login error: ${msg}` }, { status: 500 });
  }
}
