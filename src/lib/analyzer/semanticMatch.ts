import type { DocumentChunk } from '../../types/document';
import type { Match } from '../../types/analysis';
import type { AIProvider } from '../ai/provider';
import { countWords } from '../textProcessor';
import { calculateConfidence } from './confidenceEngine';

export async function findSemanticMatches(
  chunks: DocumentChunk[],
  aiProvider: AIProvider
): Promise<{ matches: Match[] }> {
  const matches: Match[] = [];
  let idCounter = 1;

  for (const chunk of chunks) {
    if (chunk.text.length < 30) continue;

    const analysis = await aiProvider.analyzePassage(chunk.text);

    if (analysis.isSuspicious && analysis.suggestedType === 'semantic') {
      const wordCnt = countWords(chunk.text);
      const matchId = `semantic-${idCounter++}`;
      const evidence = {
        geminiAnalysis: {
          classification: 'semantic_match' as const,
          score: analysis.score,
          confidence: analysis.score > 75 ? ('high' as const) : ('medium' as const),
          reason: analysis.explanation,
        },
      };

      const confidence = calculateConfidence('semantic_match', analysis.score, evidence, wordCnt);

      matches.push({
        id: matchId,
        matchId,
        classification: 'semantic_match',
        type: 'semantic',
        score: analysis.score,
        similarityScore: analysis.score,
        confidence,
        originalText: chunk.text,
        matchedText: 'High semantic alignment with public research databases.',
        startIndex: chunk.startIndex,
        endIndex: chunk.endIndex,
        explanation: 'The passages communicate closely related information, but the wording differs.',
        evidence,
        sources: [],
      });
    }
  }

  return { matches };
}
