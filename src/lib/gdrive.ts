/**
 * Google Drive URL utilities.
 *
 * Google Drive share links look like:
 *   https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing
 * or the old uc?id= form:
 *   https://drive.google.com/uc?id=<FILE_ID>
 *
 * The browser cannot play / display these directly — we must convert them.
 */

/** Extract the file ID from any Google Drive URL, or return null. */
export function gdriveFileId(url: string): string | null {
  if (!url) return null;
  // /file/d/<id>/...
  const m1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]{10,})/);
  if (m1) return m1[1];
  // ?id=<id> or &id=<id>
  const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/);
  if (m2) return m2[1];
  return null;
}

/** Is this URL a Google Drive link? */
export function isGdriveUrl(url: string): boolean {
  return url.includes("drive.google.com");
}

/**
 * Convert a Drive share link to a URL that the browser's <audio> element can
 * actually stream. We route through our own server-side proxy at
 * /api/proxy/audio?id=... which fetches from Drive without CORS restrictions
 * and relays the bytes (including Range/206 support for seeking).
 *
 * NOTE: The `baseUrl` parameter is needed server-side (absolute URL required
 * for fetch). On the client it defaults to an empty string (relative URL).
 */
export function gdriveAudioUrl(url: string, baseUrl = ""): string {
  const id = gdriveFileId(url);
  if (!id) return url; // not a Drive link, return as-is
  return `${baseUrl}/api/proxy/audio?id=${id}`;
}

/**
 * Convert a Drive share link to an embed/preview URL for use inside an
 * <iframe> (PDF viewer). Drive's /preview endpoint renders the file with
 * their built-in viewer and works for PDFs.
 */
export function gdrivePdfPreviewUrl(url: string): string {
  const id = gdriveFileId(url);
  if (!id) return url;
  return `https://drive.google.com/file/d/${id}/preview`;
}

/**
 * Convert a Drive share link (or image file) to a thumbnail/image URL
 * that the browser can load directly in an <img> tag.
 */
export function gdriveThumbnailUrl(url: string, size = 400): string {
  const id = gdriveFileId(url);
  if (!id) return url;
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
}

/**
 * Convert a Drive share link to a direct download URL for the download button.
 */
export function gdriveDownloadUrl(url: string): string {
  const id = gdriveFileId(url);
  if (!id) return url;
  return `https://drive.google.com/uc?export=download&id=${id}`;
}
