export function extractGoogleDriveFileId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    // /file/d/<id>/view
    const m1 = u.pathname.match(/\/file\/d\/([^/]+)/);
    if (m1?.[1]) return m1[1];
    // open?id=<id>
    const id = u.searchParams.get("id");
    if (id) return id;
    // uc?id=<id>
    const id2 = u.searchParams.get("id");
    if (id2) return id2;
  } catch {
    // not a URL
  }
  return null;
}

/**
 * Convert common Google Drive share links to a direct content URL.
 * Note: Drive sometimes blocks hotlinking / range requests; prefer a real CDN for audio streaming.
 */
export function normalizeMediaUrl(input: string): string {
  const s = input.trim();
  if (!s) return s;
  if (!/drive\.google\.com/.test(s)) return s;
  const id = extractGoogleDriveFileId(s);
  if (!id) return s;
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(id)}`;
}

