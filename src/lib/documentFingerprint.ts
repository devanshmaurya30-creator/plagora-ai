/**
 * Computes a deterministic content fingerprint (hash) from normalized document text
 */
export function generateDocumentFingerprint(text: string): string {
  if (!text) return 'fp-empty';

  // Normalize text by removing non-alphanumeric characters & extra whitespace
  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }

  const positiveHash = Math.abs(hash).toString(36);
  return `fp-${positiveHash}-${normalized.length}`;
}

export function isNearDuplicate(textA: string, textB: string): boolean {
  if (!textA || !textB) return false;
  const fpA = generateDocumentFingerprint(textA);
  const fpB = generateDocumentFingerprint(textB);
  if (fpA === fpB) return true;

  // Length delta check
  const lenDiff = Math.abs(textA.length - textB.length);
  const maxLen = Math.max(textA.length, textB.length);
  if (maxLen > 0 && lenDiff / maxLen < 0.05) {
    // Quick character overlap estimate
    return textA.slice(0, 200) === textB.slice(0, 200);
  }

  return false;
}
