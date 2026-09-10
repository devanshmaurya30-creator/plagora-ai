import type { DocumentChunk } from '../../types/document';
import type { Match } from '../../types/analysis';
import type { AIProvider } from '../ai/provider';
import { countWords } from '../textProcessor';
import { calculateConfidence } from './confidenceEngine';

export async function detectParaphrases(
  chunks: DocumentChunk[],
  aiProvider: AIProvider
): Promise<{ matches: Match[] }> {
  const matches: Match[] = [];
  let idCounter = 1;

  for (const chunk of chunks) {
    if (chunk.text.length < 40) continue;

    const paraphraseCheck = await aiProvider.detectParaphrase(chunk.text);

    if (paraphraseCheck.isParaphrased) {
      const wordCnt = countWords(chunk.text);
      const matchId = `paraphrase-${idCounter++}`;
      const evidence = {
        geminiAnalysis: {
          classification: 'paraphrase' as const,
          score: 82,
          confidence: paraphraseCheck.confidence,
          reason: paraphraseCheck.originalIdea,
        },
      };

      const confidence = calculateConfidence('paraphrase', 82, evidence, wordCnt);

      matches.push({
        id: matchId,
        matchId,
        classification: 'paraphrase',
        type: 'paraphrase',
        score: 82,
        similarityScore: 82,
        confidence,
        originalText: chunk.text,
        matchedText: paraphraseCheck.originalIdea,
        startIndex: chunk.startIndex,
        endIndex: chunk.endIndex,
        explanation:
          'The wording and structure differ, but the central information and relationships remain substantially similar.',
        evidence,
        sources: [],
      });
    }
  }

  return { matches };
}
