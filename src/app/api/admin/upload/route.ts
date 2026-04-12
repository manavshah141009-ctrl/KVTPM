import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { saveUpload } from "@/lib/storage";
import { z } from "zod";

const Folder = z.enum(["audio", "books", "covers"]);

export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form: any = await req.formData();
  const file = form.get("file");
  const folderRaw = form.get("folder");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }
  const folder = Folder.safeParse(typeof folderRaw === "string" ? folderRaw : "");
  if (!folder.success) {
    return NextResponse.json({ error: "invalid folder" }, { status: 400 });
  }

  const stored = await saveUpload(file, folder.data);
  return NextResponse.json(stored);
}
