import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Google Drive audio files.
 *
 * URL: /api/proxy/audio?id=DRIVE_FILE_ID
 *
 * Why this is needed:
 *   Google Drive's uc?export=download endpoint does NOT send CORS headers,
 *   so browsers refuse to stream it into an <audio> element. By fetching
 *   server-side (where CORS doesn't apply) and re-serving from our own
 *   origin, the browser plays it without any cross-origin issues.
 *
 * Range request support:
 *   HTML audio elements use byte-range requests to seek. We forward the
 *   Range header to Drive and relay the 206 Partial Content response, so
 *   scrubbing / seeking works correctly.
 */

// Google Drive may issue a redirect to a "confirm" URL for large files.
// We append confirm=t to skip the virus-scan interstitial.
function driveDownloadUrl(id: string) {
  return `https://drive.google.com/uc?export=download&id=${id}&confirm=t`;
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^[a-zA-Z0-9_-]{10,}$/.test(id)) {
    return new NextResponse("Missing or invalid Drive file ID", { status: 400 });
  }

  // Forward Range header so the audio element can seek
  const rangeHeader = req.headers.get("range");
  const fetchHeaders: HeadersInit = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  };
  if (rangeHeader) fetchHeaders["Range"] = rangeHeader;

  let upstream: Response;
  try {
    upstream = await fetch(driveDownloadUrl(id), {
      headers: fetchHeaders,
      redirect: "follow",
    });
  } catch {
    return new NextResponse("Failed to fetch from Google Drive", { status: 502 });
  }

  // If Drive returned an HTML page (e.g. the confirm/virus scan page),
  // reject early instead of sending HTML to the audio element.
  const contentType = upstream.headers.get("content-type") ?? "";
  if (contentType.includes("text/html")) {
    return new NextResponse(
      "Google Drive returned a confirmation page. Make sure the file is shared as 'Anyone with the link'.",
      { status: 502, headers: { "Content-Type": "text/plain" } }
    );
  }

  // Build response headers
  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", contentType || "audio/mpeg");
  responseHeaders.set("Accept-Ranges", "bytes");
  responseHeaders.set("Cache-Control", "public, max-age=86400"); // cache 24h

  // Relay Content-Length and Content-Range for Range requests
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) responseHeaders.set("Content-Length", contentLength);

  const contentRange = upstream.headers.get("content-range");
  if (contentRange) responseHeaders.set("Content-Range", contentRange);

  // CORS — allow our own origin
  responseHeaders.set("Access-Control-Allow-Origin", "*");

  return new NextResponse(upstream.body, {
    status: upstream.status, // 200 or 206 (Partial Content)
    headers: responseHeaders,
  });
}
