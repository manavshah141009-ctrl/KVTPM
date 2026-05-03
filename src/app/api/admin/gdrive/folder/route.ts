import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { listFolderContents } from "@/lib/gdrive";

export async function GET(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("id");

  if (!folderId) {
    return NextResponse.json({ error: "Folder ID required" }, { status: 400 });
  }

  try {
    const files = await listFolderContents(folderId);
    return NextResponse.json(files);
  } catch (e) {
    console.error("[GDRIVE_SYNC_ERROR]", e);
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
