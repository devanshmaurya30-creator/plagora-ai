import type { DocumentChunk } from '../../types/document';
import type { Match, MatchClassification } from '../../types/analysis';
import {
  normalizeForComparison,
  isCommonPhrase,
  isQuotation,
  countWords,
  MIN_MATCH_WORDS,
  MIN_MATCH_CHARACTERS,
} from '../textProcessor';
import { calculateConfidence } from './confidenceEngine';

/**
 * Calculates Levenshtein similarity percentage (0-100) between two strings.
 */
export function calculateLevenshteinSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  if (len1 === 0 || len2 === 0) return 0;
  if (str1 === str2) return 100;

  const track = Array(len2 + 1)
    .fill(null)
    .map(() => Array(len1 + 1).fill(null));

  for (let i = 0; i <= len1; i += 1) track[0][i] = i;
  for (let j = 0; j <= len2; j += 1) track[j][0] = j;

  for (let j = 1; j <= len2; j += 1) {
    for (let i = 1; i <= len1; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1, // deletion
        track[j - 1][i] + 1, // insertion
        track[j - 1][i - 1] + indicator // substitution
      );
    }
  }

  const distance = track[len2][len1];
  const maxLen = Math.max(len1, len2);
  return Math.round(((maxLen - distance) / maxLen) * 100);
}

/**
 * Calculates Jaccard similarity percentage (0-100) based on token sets.
 */
export function calculateJaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  return Math.round((intersection.size / union.size) * 100);
}

const KNOWN_EXACT_PATTERNS = [
  {
    pattern: "natural language processing has witnessed unprecedented growth over the last decade",
    sourceTitle: "Modern NLP Benchmarks & Advances",
    domain: "arxiv.org",
    url: "https://arxiv.org/abs/2103.09871"
  },
  {
    pattern: "transformer architectures utilize multi-head self-attention mechanisms to capture contextual dependencies",
    sourceTitle: "Attention Is All You Need — Technical Review",
    domain: "neurips.cc",
    url: "https://proceedings.neurips.cc/paper/2017/file/attention"
  },
  {
    pattern: "artificial intelligence system architecture and data privacy guidelines",
    sourceTitle: "Global AI Governance Framework",
    domain: "mit.edu",
    url: "https://mit.edu/research/ai-governance-2025"
  },
  {
    pattern: "the rapid proliferation of generative artificial intelligence models has revolutionized digital content creation",
    sourceTitle: "Generative AI Impact Report",
    domain: "stanford.edu",
    url: "https://hai.stanford.edu/ai-index-report"
  }
];

export function detectExactMatches(chunks: DocumentChunk[]): { matches: Match[] } {
  const matches: Match[] = [];
  let idCounter = 1;

  chunks.forEach((chunk) => {
    const origText = chunk.text;
    const wordCnt = countWords(origText);

    // 1. Check for Quotations
    if (isQuotation(origText)) {
      const matchId = `quote-${idCounter++}`;
      matches.push({
        id: matchId,
        matchId,
        classification: 'quotation',
        type: 'exact',
        score: 0,
        similarityScore: 0,
        confidence: 'high',
        originalText: origText,
        matchedText: origText,
        startIndex: chunk.startIndex,
        endIndex: chunk.endIndex,
        explanation: 'Quoted content detected with quotation markers.',
        evidence: {
          localMatch: { similarityScore: 100, algorithm: 'Quotation Detector' },
        },
        sources: [],
      });
      return;
    }

    // 2. Check for Common Phrases / Short Passages
    if (isCommonPhrase(origText) && wordCnt < MIN_MATCH_WORDS) {
      const matchId = `common-${idCounter++}`;
      matches.push({
        id: matchId,
        matchId,
        classification: 'common_phrase',
        type: 'exact',
        score: 0,
        similarityScore: 0,
        confidence: 'high',
        originalText: origText,
        matchedText: origText,
        startIndex: chunk.startIndex,
        endIndex: chunk.endIndex,
        explanation: 'Standard academic terminology or common phrase.',
        evidence: {
          localMatch: { similarityScore: 0, algorithm: 'Common Phrase Filter' },
        },
        sources: [],
      });
      return;
    }

    const normChunk = normalizeForComparison(origText);

    // 3. Check against indexed reference patterns
    KNOWN_EXACT_PATTERNS.forEach((known) => {
      const normKnown = normalizeForComparison(known.pattern);

      if (normChunk.includes(normKnown) || normKnown.includes(normChunk)) {
        const matchId = `exact-${idCounter++}`;
        const isExact = normChunk === normKnown;
        const classification: MatchClassification = isExact ? 'exact_match' : 'near_match';
        const similarityScore = isExact ? 98 : calculateLevenshteinSimilarity(normChunk, normKnown);

        const evidence = {
          localMatch: {
            similarityScore,
            matchedPattern: known.pattern,
            algorithm: isExact ? 'Exact String Normalization' : 'Near-Match Levenshtein',
          },
        };

        const confidence = calculateConfidence(classification, similarityScore, evidence, wordCnt);

        matches.push({
          id: matchId,
          matchId,
          classification,
          type: isExact ? 'exact' : 'repeated',
          score: similarityScore,
          similarityScore,
          confidence,
          originalText: origText,
          matchedText: known.pattern,
          startIndex: chunk.startIndex,
          endIndex: chunk.endIndex,
          sourceId: `src-${known.domain.replace('.', '-')}`,
          explanation: isExact
            ? `Distinctive wording is substantially identical to indexed publication on ${known.domain}.`
            : `Most words and sentence structure are shared with indexed publication on ${known.domain}.`,
          evidence,
          sources: [
            {
              id: `src-${known.domain.replace('.', '-')}`,
              title: known.sourceTitle,
              url: known.url,
              domain: known.domain,
              matchedText: known.pattern,
              similarity: similarityScore,
              confidence,
              sourceType: 'web',
              isMock: true,
            },
          ],
        });
      }
    });

    // 4. Intra-document Repeated Passages
    chunks.forEach((otherChunk) => {
      if (chunk.chunkId !== otherChunk.chunkId && chunk.text.length >= MIN_MATCH_CHARACTERS) {
        const normOther = normalizeForComparison(otherChunk.text);
        if (normChunk === normOther && chunk.startIndex < otherChunk.startIndex) {
          const matchId = `exact-repeat-${idCounter++}`;
          const evidence = {
            localMatch: { similarityScore: 95, algorithm: 'Intra-Document String Compare' },
          };
          const confidence = calculateConfidence('exact_match', 95, evidence, wordCnt);

          matches.push({
            id: matchId,
            matchId,
            classification: 'exact_match',
            type: 'repeated',
            score: 95,
            similarityScore: 95,
            confidence,
            originalText: origText,
            matchedText: otherChunk.text,
            startIndex: chunk.startIndex,
            endIndex: chunk.endIndex,
            explanation: 'Duplicate passage repeated inside the document.',
            evidence,
            sources: [],
          });
        }
      }
    });
  });

  return { matches };
}
