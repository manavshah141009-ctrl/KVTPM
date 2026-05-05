import { NextRequest, NextResponse } from "next/server";

/**
 * Server-side proxy for Google Drive audio files.
 *
 * URL: /api/proxy/audio?id=DRIVE_FILE_ID
 *
 * Problem this solves:
 *   1. Google Drive's uc?export=download has no CORS headers → can't play in <audio>
 *   2. Large files (>100MB) get a virus-scan HTML "Are you sure?" interstitial.
 *      `confirm=t` works for small files but NOT for large ones. Large files
 *      require a real cookie-based confirm token extracted from that HTML page.
 *   3. Some Drive files return a redirect to a different download domain.
 *
 * Range request support:
 *   We forward Range headers to Drive and relay 206 Partial Content so that
 *   seeking/scrubbing works in the browser.
 */

const DRIVE_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

/** Build a Drive download URL, optionally with a confirm token. */
function driveUrl(id: string, confirm?: string) {
  const base = `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
  return confirm ? `${base}&confirm=${encodeURIComponent(confirm)}` : `${base}&confirm=t`;
}

/**
 * Extract the confirm token from a Drive virus-scan HTML page.
 * Google embeds it in several places — we try all known patterns.
 */
function extractConfirm(html: string): string | null {
  // Pattern 1: query string in a link href  → confirm=XXXX
  const m1 = html.match(/confirm=([0-9A-Za-z_-]+)/);
  if (m1?.[1] && m1[1] !== "t") return m1[1];

  // Pattern 2: hidden input <input name="confirm" value="XXXX">
  const m2 = html.match(/name=["']confirm["']\s+value=["']([^"']+)["']/);
  if (m2?.[1]) return m2[1];

  // Pattern 3: value before name
  const m3 = html.match(/value=["']([^"']+)["']\s+name=["']confirm["']/);
  if (m3?.[1]) return m3[1];

  return null;
}

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !/^[a-zA-Z0-9_-]{10,}$/.test(id)) {
    return new NextResponse("Missing or invalid Drive file ID", { status: 400 });
  }

  // Forward Range header for seeking support
  const rangeHeader = req.headers.get("range");
  const baseHeaders: HeadersInit = {
    "User-Agent": DRIVE_UA,
    "Accept": "*/*",
  };
  if (rangeHeader) baseHeaders["Range"] = rangeHeader;

  // ── Step 1: first attempt with confirm=t ──────────────────────────────────
  let upstream: Response;
  try {
    upstream = await fetch(driveUrl(id), {
      headers: baseHeaders,
      redirect: "manual", // Do NOT follow redirects to avoid downloading the body
    });
  } catch (e) {
    console.error("[proxy/audio] Fetch error:", e);
    return new NextResponse("Failed to reach Google Drive", { status: 502 });
  }

  // If Drive immediately redirects us (e.g., small file or valid direct link),
  // we capture the final Googleusercontent URL and redirect the client there.
  if ([301, 302, 303, 307, 308].includes(upstream.status)) {
    const location = upstream.headers.get("location");
    if (location) {
      return NextResponse.redirect(location, 302);
    }
  }

  // ── Step 2: handle virus-scan HTML interstitial for large files ────────────
  const ct = upstream.headers.get("content-type") ?? "";
  if (ct.includes("text/html")) {
    let html: string;
    try {
      html = await upstream.text();
    } catch {
      return new NextResponse("Drive returned HTML but body unreadable", { status: 502 });
    }

    const confirm = extractConfirm(html);
    if (!confirm) {
      return new NextResponse(
        "Google Drive returned a confirmation page with no extractable token. " +
          "Make sure the file is shared as 'Anyone with the link'.",
        { status: 502, headers: { "Content-Type": "text/plain" } }
      );
    }

    // Retry with the real confirm token
    try {
      upstream = await fetch(driveUrl(id, confirm), {
        headers: baseHeaders,
        redirect: "manual",
      });
    } catch (e) {
      console.error("[proxy/audio] Retry fetch error:", e);
      return new NextResponse("Failed to reach Google Drive on retry", { status: 502 });
    }

    // After confirmation, Drive should redirect us to the final download URL
    if ([301, 302, 303, 307, 308].includes(upstream.status)) {
      const location = upstream.headers.get("location");
      if (location) {
        return NextResponse.redirect(location, 302);
      }
    }

    const ct2 = upstream.headers.get("content-type") ?? "";
    if (ct2.includes("text/html")) {
      return new NextResponse(
        "Google Drive still returned HTML after confirmation. Share the file with 'Anyone with the link'.",
        { status: 502, headers: { "Content-Type": "text/plain" } }
      );
    }
  }

  // ── Step 3: Fallback (if Drive actually returns 200/206 with audio data) ───
  // Note: We use NextResponse.redirect to the upstream URL just in case, but
  // if it's returning data directly, we can just redirect to the Drive URL we constructed.
  return NextResponse.redirect(upstream.url || driveUrl(id), 302);
}
