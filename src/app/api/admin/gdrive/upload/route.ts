import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/api-auth";
import { google } from "googleapis";
import { Readable } from "stream";

export const dynamic = "force-dynamic";

/**
 * Uploads a recording blob to Google Drive using OAuth2 credentials.
 * This approach uses the user's own storage quota.
 */
export async function POST(req: Request) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return gate.response;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const folderId = process.env.GOOGLE_DRIVE_ARCHIVE_FOLDER_ID;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("[gdrive] file:", file.name, "size:", file.size, "folder:", folderId);

    // --- OAuth2 Authentication ---
    const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      console.error("[gdrive] OAuth2 credentials missing in .env");
      return NextResponse.json(
        { error: "Google OAuth2 credentials not configured" },
        { status: 501 }
      );
    }

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
    oauth2Client.setCredentials({ refresh_token: refreshToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // Convert Web File -> Node Readable stream
    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileName = `Satsang_${new Date().toISOString().replace(/[:.]/g, "-")}.webm`;

    console.log("[gdrive] Starting upload to Drive...");

    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: folderId ? [folderId] : undefined,
      },
      media: {
        mimeType: file.type || "audio/webm",
        body: stream,
      },
      // Important for shared folders/drives
      supportsAllDrives: true,
      fields: "id, webViewLink",
    });

    console.log("[gdrive] Upload successful:", res.data.id, res.data.webViewLink);

    return NextResponse.json({
      success: true,
      fileId: res.data.id,
      link: res.data.webViewLink,
    });
  } catch (error) {
    console.error("[gdrive] ERROR:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
