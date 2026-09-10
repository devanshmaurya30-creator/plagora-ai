import type { ParsedDocument } from '../types/document';
import type { AnalysisResult, DetectionOptions, Match, ProgressState } from '../types/analysis';
import { runAnalysisPipeline } from './analyzer';
import { calculateSimilarityScore } from './analyzer/scoring';
import { defaultAIProvider } from './ai/provider';
import { createAnalysis } from './analysisStore';

/**
 * Plagora AI Primary Service Facade.
 * Ready for future backend/Gemini API integration without changing UI components.
 */
export async function analyzeDocument(
  doc: ParsedDocument,
  options: DetectionOptions,
  onProgress?: (progress: ProgressState) => void
): Promise<AnalysisResult> {
  const result = await runAnalysisPipeline(doc, options, onProgress);
  createAnalysis(result);
  return result;
}

export function calculateSimilarity(matches: Match[], totalLength: number) {
  return calculateSimilarityScore(matches, totalLength);
}

export async function detectParaphrase(text: string) {
  return defaultAIProvider.detectParaphrase(text);
}

export async function findMatches(doc: ParsedDocument) {
  const options: DetectionOptions = {
    exactMatch: true,
    semanticSimilarity: true,
    paraphraseDetection: true,
    repeatedContent: true,
    depth: 'deep',
  };
  return runAnalysisPipeline(doc, options);
}
