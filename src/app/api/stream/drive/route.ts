import { NextResponse } from "next/server";
import { extractGoogleDriveFileId } from "@/lib/media-url";

/**
 * Proxies Google Drive files so native clients (Expo AV) can play them.
 * Raw `uc?export=download` URLs often return HTML (virus scan / cookie wall) — this resolves `confirm` when needed.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const idParam = url.searchParams.get("id");
  const urlParam = url.searchParams.get("url");

  const id = idParam || (urlParam ? extractGoogleDriveFileId(urlParam) : null);
  if (!id) {
    return NextResponse.json({ error: "Provide ?id=FILE_ID or ?url= encoded Drive link" }, { status: 400 });
  }

  const driveHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "*/*",
  };

  const initial = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
  let res = await fetch(initial, { redirect: "follow", headers: driveHeaders });

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("text/html")) {
    const html = await res.text();
    const confirm =
      html.match(/confirm=([0-9A-Za-z_-]+)/)?.[1] ||
      html.match(/name="confirm"\s+value="([^"]+)"/)?.[1];
    if (confirm) {
      res = await fetch(
        `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}&confirm=${encodeURIComponent(confirm)}`,
        { redirect: "follow", headers: driveHeaders }
      );
    }
  }

  const outCt = res.headers.get("content-type") || "";
  if (!res.ok || outCt.includes("text/html")) {
    return NextResponse.json(
      { error: "Could not stream this Drive file. Ensure sharing is Anyone with the link." },
      { status: 502 }
    );
  }

  return new NextResponse(res.body, {
    status: 200,
    headers: {
      "Content-Type": outCt || "application/octet-stream",
      "Cache-Control": "public, max-age=300",
    },
  });
}
