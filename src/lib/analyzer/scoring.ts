import type { Match } from '../../types/analysis';

export interface ScoreBreakdown {
  similarityScore: number;
  exactMatchScore: number;
  nearMatchScore: number;
  paraphraseScore: number;
  semanticScore: number;
  webVerifiedScore: number;
  originalScore: number;
  confidence: 'low' | 'medium' | 'high';
}

export function calculateOverallSimilarity(
  matches: Match[],
  totalCharacterCount: number
): ScoreBreakdown {
  if (!matches || matches.length === 0 || totalCharacterCount === 0) {
    return {
      similarityScore: 0,
      exactMatchScore: 0,
      nearMatchScore: 0,
      paraphraseScore: 0,
      semanticScore: 0,
      webVerifiedScore: 0,
      originalScore: 100,
      confidence: 'low',
    };
  }

  // Filter out benign matches (quotations, common phrases, not_similar)
  const meaningfulMatches = matches.filter(
    (m) =>
      m.classification === 'exact_match' ||
      m.classification === 'near_match' ||
      m.classification === 'paraphrase' ||
      m.classification === 'semantic_match'
  );

  if (meaningfulMatches.length === 0) {
    return {
      similarityScore: 0,
      exactMatchScore: 0,
      nearMatchScore: 0,
      paraphraseScore: 0,
      semanticScore: 0,
      webVerifiedScore: 0,
      originalScore: 100,
      confidence: 'low',
    };
  }

  // Intervals by classification for sub-score calculations
  let exactChars = 0;
  let nearChars = 0;
  let paraphraseChars = 0;
  let semanticChars = 0;
  let webVerifiedChars = 0;

  // Deduplicate overlapping character intervals across all meaningful matches to avoid double counting
  const intervals: Array<[number, number]> = meaningfulMatches.map((m) => {
    const len = Math.max(0, m.endIndex - m.startIndex);
    if (m.classification === 'exact_match') exactChars += len;
    if (m.classification === 'near_match') nearChars += len;
    if (m.classification === 'paraphrase') paraphraseChars += len;
    if (m.classification === 'semantic_match') semanticChars += len;
    if (m.evidence.webVerification?.verified) webVerifiedChars += len;

    return [m.startIndex, m.endIndex];
  });

  // Sort intervals by start index
  intervals.sort((a, b) => a[0] - b[0]);

  // Merge overlapping intervals
  const mergedIntervals: Array<[number, number]> = [];
  intervals.forEach(([start, end]) => {
    if (mergedIntervals.length === 0) {
      mergedIntervals.push([start, end]);
    } else {
      const last = mergedIntervals[mergedIntervals.length - 1];
      if (start <= last[1]) {
        last[1] = Math.max(last[1], end);
      } else {
        mergedIntervals.push([start, end]);
      }
    }
  });

  const totalMatchedChars = mergedIntervals.reduce(
    (acc, [s, e]) => acc + (e - s),
    0
  );

  const rawSimilarity = Math.min(100, (totalMatchedChars / totalCharacterCount) * 100);
  const similarityScore = Math.round(rawSimilarity);

  const exactMatchScore = Math.min(100, Math.round((exactChars / totalCharacterCount) * 100));
  const nearMatchScore = Math.min(100, Math.round((nearChars / totalCharacterCount) * 100));
  const paraphraseScore = Math.min(100, Math.round((paraphraseChars / totalCharacterCount) * 100));
  const semanticScore = Math.min(100, Math.round((semanticChars / totalCharacterCount) * 100));
  const webVerifiedScore = Math.min(100, Math.round((webVerifiedChars / totalCharacterCount) * 100));
  const originalScore = Math.max(0, 100 - similarityScore);

  let confidence: 'low' | 'medium' | 'high' = 'low';
  const highConfMatches = meaningfulMatches.filter((m) => m.confidence === 'high').length;
  if (highConfMatches >= 2 || similarityScore > 20) {
    confidence = 'high';
  } else if (meaningfulMatches.length > 0) {
    confidence = 'medium';
  }

  return {
    similarityScore,
    exactMatchScore,
    nearMatchScore,
    paraphraseScore,
    semanticScore,
    webVerifiedScore,
    originalScore,
    confidence,
  };
}

export function calculateSimilarityScore(
  matches: Match[],
  totalCharacterCount: number
): ScoreBreakdown {
  return calculateOverallSimilarity(matches, totalCharacterCount);
}
