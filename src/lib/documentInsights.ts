import type { AnalysisResult } from '../types/analysis';

export interface SectionAnalysis {
  name: string;
  wordCount: number;
  matchCount: number;
  similarityRatio: number;
  startIndex: number;
  endIndex: number;
}

export interface RepeatedPhrase {
  phrase: string;
  occurrences: number;
}

export interface DocumentInsights {
  overallSimilarity: number;
  originalityEstimate: number;
  totalMatches: number;
  totalSources: number;
  matchDistribution: {
    exact: number;
    near: number;
    paraphrase: number;
    semantic: number;
    web: number;
  };
  mostAffectedSection?: SectionAnalysis;
  mostCommonSource?: {
    title: string;
    domain: string;
    url: string;
    matchCount: number;
    highestSimilarity: number;
  };
  sections: SectionAnalysis[];
  repeatedPhrases: RepeatedPhrase[];
  writingConsistency: {
    signal: string;
    confidence: 'low' | 'medium' | 'high';
    note: string;
  };
  hasEnoughData: boolean;
}

const COMMON_STOP_WORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
  'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if',
  'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just',
  'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
  'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back',
  'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because',
]);

/**
 * Computes deep document analytics strictly from real AnalysisResult data
 */
export function calculateDocumentInsights(analysis: AnalysisResult): DocumentInsights {
  const matches = analysis.matches || [];
  const sources = analysis.sources || [];
  const text = analysis.originalText || '';

  const totalMatches = matches.length;
  const totalSources = sources.length;
  const overallSimilarity = analysis.similarityScore || 0;
  const originalityEstimate = Math.max(0, 100 - overallSimilarity);

  // 1. Match Distribution
  const matchDistribution = {
    exact: matches.filter((m) => m.classification === 'exact_match' || m.type === 'exact').length,
    near: matches.filter((m) => m.classification === 'near_match' || m.type === 'repeated').length,
    paraphrase: matches.filter((m) => m.classification === 'paraphrase' || m.type === 'paraphrase').length,
    semantic: matches.filter((m) => m.classification === 'semantic_match' || m.type === 'semantic').length,
    web: matches.filter((m) => m.evidence?.webVerification?.verified || m.hasWebMatch).length,
  };

  // 2. Section Analysis (Chunking into 4 structural blocks or paragraphs)
  const paragraphs = text.split(/\n\n+/).filter((p) => p.trim().length > 20);
  const sections: SectionAnalysis[] = [];

  if (paragraphs.length >= 2) {
    let currentIdx = 0;
    paragraphs.forEach((para, idx) => {
      const pWords = para.split(/\s+/).length;
      const start = currentIdx;
      const end = currentIdx + para.length;
      currentIdx = end + 2;

      // Count matches inside this paragraph range
      const pMatches = matches.filter(
        (m) => (m.startIndex >= start && m.startIndex <= end) || (m.endIndex >= start && m.endIndex <= end)
      );

      const ratio = pWords > 0 ? Math.min(100, Math.round((pMatches.length / Math.max(1, pWords / 15)) * 100)) : 0;

      sections.push({
        name: `Section ${idx + 1}`,
        wordCount: pWords,
        matchCount: pMatches.length,
        similarityRatio: ratio,
        startIndex: start,
        endIndex: end,
      });
    });
  } else {
    // Single chunk fallback
    const words = text.split(/\s+/).length;
    sections.push({
      name: 'Document Content',
      wordCount: words,
      matchCount: totalMatches,
      similarityRatio: overallSimilarity,
      startIndex: 0,
      endIndex: text.length,
    });
  }

  // 3. Most Affected Section
  const sortedSections = [...sections].sort((a, b) => b.similarityRatio - a.similarityRatio);
  const mostAffectedSection = sortedSections.length > 0 && sortedSections[0].matchCount > 0 ? sortedSections[0] : undefined;

  // 4. Most Common Source
  let mostCommonSource: DocumentInsights['mostCommonSource'] = undefined;
  if (sources.length > 0) {
    const sourceMatchCounts = new Map<string, { source: typeof sources[0]; count: number; maxSim: number }>();

    matches.forEach((m) => {
      m.sources?.forEach((s) => {
        const existing = sourceMatchCounts.get(s.id) || { source: s, count: 0, maxSim: 0 };
        existing.count += 1;
        existing.maxSim = Math.max(existing.maxSim, m.similarityScore);
        sourceMatchCounts.set(s.id, existing);
      });
    });

    if (sourceMatchCounts.size > 0) {
      const top = Array.from(sourceMatchCounts.values()).sort((a, b) => b.count - a.count || b.maxSim - a.maxSim)[0];
      mostCommonSource = {
        title: top.source.title || top.source.domain,
        domain: top.source.domain,
        url: top.source.url,
        matchCount: top.count,
        highestSimilarity: top.maxSim,
      };
    }
  }

  // 5. Repeated Phrase Patterns (n-grams of 3 to 5 words occurring >= 2 times)
  const words = text.toLowerCase().split(/\s+/).map((w) => w.replace(/[^a-z0-9]/g, '')).filter(Boolean);
  const nGramCounts = new Map<string, number>();

  for (let i = 0; i < words.length - 3; i++) {
    const ngramWords = words.slice(i, i + 4);
    // Ignore if all words are common stop words
    if (ngramWords.every((w) => COMMON_STOP_WORDS.has(w))) continue;
    const phrase = ngramWords.join(' ');
    nGramCounts.set(phrase, (nGramCounts.get(phrase) || 0) + 1);
  }

  const repeatedPhrases: RepeatedPhrase[] = Array.from(nGramCounts.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([phrase, count]) => ({ phrase, occurrences: count }));

  // 6. Writing Consistency Signal (neutral tone, no AI authorship claims)
  const isHighParaphrase = matchDistribution.paraphrase > matchDistribution.exact;
  const signal = isHighParaphrase
    ? 'Writing pattern variation detected (Paraphrased cadence)'
    : matchDistribution.exact > 0
    ? 'Structural wording overlap identified'
    : 'Consistent original writing flow';

  return {
    overallSimilarity,
    originalityEstimate,
    totalMatches,
    totalSources,
    matchDistribution,
    mostAffectedSection,
    mostCommonSource,
    sections,
    repeatedPhrases,
    writingConsistency: {
      signal,
      confidence: analysis.confidence,
      note: 'Analysis observes stylistic cadence variations across text passages.',
    },
    hasEnoughData: text.length > 50,
  };
}
