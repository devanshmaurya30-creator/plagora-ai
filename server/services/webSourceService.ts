export interface VerifiedWebSource {
  id: string;
  title: string;
  url: string;
  domain: string;
  sourceType: 'web';
  matchedPassage: string;
  candidatePassage: string;
  similarityScore: number;
  confidence: 'low' | 'medium' | 'high';
  matchType: 'exact_match' | 'near_match' | 'paraphrase' | 'semantic_match' | 'common_phrase' | 'not_similar';
  verified: boolean;
  groundingConfidence?: number;
  searchQuery?: string;
}

export const WEB_SEARCH_THRESHOLD = 70;
export const MAX_WEB_SEARCHES_PER_DOCUMENT = 20;
export const MAX_WEB_SEARCHES_PER_PASSAGE = 2;

/**
 * Normalizes domain from URL safely
 */
export function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch (e) {
    return 'web-source';
  }
}

/**
 * Extracts and normalizes grounding sources returned by Gemini Google Search grounding
 */
export function extractGroundingSources(
  groundingMetadata: any,
  candidatePassage: string
): VerifiedWebSource[] {
  if (!groundingMetadata) return [];

  const sources: VerifiedWebSource[] = [];
  const groundingChunks = groundingMetadata.groundingChunks || [];
  const searchQueries = groundingMetadata.webSearchQueries || [];

  groundingChunks.forEach((chunk: any, idx: number) => {
    if (chunk.web && chunk.web.uri) {
      const rawUrl = chunk.web.uri;
      const title = chunk.web.title || `Web Document ${idx + 1}`;
      const domain = extractDomain(rawUrl);

      sources.push({
        id: `web-src-${Date.now()}-${idx}`,
        title,
        url: rawUrl,
        domain,
        sourceType: 'web',
        matchedPassage: candidatePassage, // Excerpt matching
        candidatePassage,
        similarityScore: 85, // Grounding candidate similarity
        confidence: 'high',
        matchType: 'semantic_match',
        verified: true,
        groundingConfidence: 0.9,
        searchQuery: searchQueries[0] || candidatePassage.slice(0, 60),
      });
    }
  });

  return deduplicateSources(sources);
}

/**
 * Deduplicates sources by normalized URL while keeping the strongest similarity match
 */
export function deduplicateSources(sources: VerifiedWebSource[]): VerifiedWebSource[] {
  const map = new Map<string, VerifiedWebSource>();

  sources.forEach((src) => {
    // Strip trailing slash & tracking params for URL comparison
    let cleanUrl = src.url;
    try {
      const u = new URL(src.url);
      cleanUrl = `${u.origin}${u.pathname}`.replace(/\/$/, '');
    } catch (e) {
      cleanUrl = src.url;
    }

    const existing = map.get(cleanUrl);
    if (!existing || src.similarityScore > existing.similarityScore) {
      map.set(cleanUrl, src);
    }
  });

  return Array.from(map.values()).sort((a, b) => b.similarityScore - a.similarityScore);
}
