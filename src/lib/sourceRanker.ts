import type { Source, Match } from '../types/analysis';
import { sanitizeUrl } from './urlSanitizer';

export interface RankedSource extends Source {
  matchCount: number;
  strongestSimilarity: number;
  averageSimilarity: number;
  relevance: 'HIGH RELEVANCE' | 'MEDIUM RELEVANCE' | 'LOW RELEVANCE';
  rank: number;
}

export type SourceSortOption = 'Most Relevant' | 'Most Matches' | 'Strongest Match';

/**
 * Ranks, deduplicates, and filters web sources based strictly on empirical match data
 */
export function rankSources(
  sources: Source[],
  matches: Match[],
  sortBy: SourceSortOption = 'Most Relevant',
  filterVerification: string = 'All'
): RankedSource[] {
  if (!sources || sources.length === 0) return [];

  // Deduplicate sources by normalized URL or domain
  const sourceMap = new Map<string, Source>();
  sources.forEach((s) => {
    const key = (s.url ? sanitizeUrl(s.url) : s.domain.toLowerCase()) || s.id;
    if (!sourceMap.has(key)) {
      sourceMap.set(key, s);
    }
  });

  const uniqueSources = Array.from(sourceMap.values());

  // Calculate empirical match metrics per source
  const ranked: RankedSource[] = uniqueSources.map((source) => {
    const matchingPassages = matches.filter(
      (m) => m.sources?.some((s) => s.id === source.id || s.domain.toLowerCase() === source.domain.toLowerCase())
    );

    const matchCount = matchingPassages.length || (source.similarity > 0 ? 1 : 0);
    const similarities = matchingPassages.map((m) => m.similarityScore);
    const strongestSimilarity = similarities.length > 0 ? Math.max(...similarities) : source.similarity || 0;
    const averageSimilarity =
      similarities.length > 0
        ? Math.round(similarities.reduce((a, b) => a + b, 0) / similarities.length)
        : source.similarity || 0;

    // Relevance score calculation = (strongestSim * 0.5) + (matchCount * 12) + (verified ? 20 : 0)
    const isVerified = source.verified || matchingPassages.some((m) => m.evidence?.webVerification?.verified);
    const relevanceScore = strongestSimilarity * 0.5 + matchCount * 12 + (isVerified ? 20 : 0);

    let relevance: 'HIGH RELEVANCE' | 'MEDIUM RELEVANCE' | 'LOW RELEVANCE' = 'LOW RELEVANCE';
    if (relevanceScore >= 60 || strongestSimilarity >= 75) {
      relevance = 'HIGH RELEVANCE';
    } else if (relevanceScore >= 30 || strongestSimilarity >= 45) {
      relevance = 'MEDIUM RELEVANCE';
    }

    return {
      ...source,
      matchCount,
      strongestSimilarity,
      averageSimilarity,
      relevance,
      rank: 1,
    };
  });

  // Filter by verification status
  const filtered = ranked.filter((s) => {
    if (filterVerification === 'All') return true;
    if (filterVerification === 'Verified') return s.verified === true;
    if (filterVerification === 'Probable') return s.verified !== true && s.matchCount > 0;
    if (filterVerification === 'Unavailable') return s.matchCount === 0;
    return true;
  });

  // Sort sources
  filtered.sort((a, b) => {
    if (sortBy === 'Most Matches') {
      return b.matchCount - a.matchCount || b.strongestSimilarity - a.strongestSimilarity;
    }
    if (sortBy === 'Strongest Match') {
      return b.strongestSimilarity - a.strongestSimilarity || b.matchCount - a.matchCount;
    }
    // Default: Most Relevant
    const scoreA = a.strongestSimilarity * 0.5 + a.matchCount * 12 + (a.verified ? 20 : 0);
    const scoreB = b.strongestSimilarity * 0.5 + b.matchCount * 12 + (b.verified ? 20 : 0);
    return scoreB - scoreA;
  });

  // Assign 1-indexed rank
  return filtered.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}
