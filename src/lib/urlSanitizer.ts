/**
 * Sanitizes URLs to ensure only safe HTTP/HTTPS protocols are opened in the browser.
 * Rejects javascript:, data:, file:, vbscript: protocols.
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
    return null;
  } catch (e) {
    // If not a full URL but starts with http:// or https://
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return null;
  }
}
