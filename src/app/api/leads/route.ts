import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { dbConnect } from "@/lib/db";
import { BookLead } from "@/models/BookLead";
import { z } from "zod";

const LeadSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(10),
  bookId: z.string(),
  bookTitle: z.string(),
  action: z.enum(["read", "download"]),
});

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  await dbConnect();
  const leads = await BookLead.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(leads);
}

export async function POST(req: Request) {
  try {
    const json = await req.json().catch(() => null);
    const parsed = LeadSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    await dbConnect();

    // Check if a lead with this phone already exists
    const existing = await BookLead.findOne({ phone: parsed.data.phone });
    
    if (existing) {
      // User is already registered, just allow them through
      return NextResponse.json({ ok: true, recognized: true });
    }

    const lead = await BookLead.create(parsed.data);
    return NextResponse.json({ ok: true, lead });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: `Lead error: ${msg}` }, { status: 500 });
  }
}
