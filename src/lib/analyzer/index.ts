import type { ParsedDocument } from '../../types/document';
import type { AnalysisResult, DetectionOptions, Match, ProgressState, Source } from '../../types/analysis';
import { chunkDocument } from '../chunker';
import { detectExactMatches } from './exactMatch';
import { findSemanticMatches } from './semanticMatch';
import { detectParaphrases } from './paraphrase';
import { matchSources } from './sourceMatcher';
import { calculateOverallSimilarity } from './scoring';
import { defaultAIProvider } from '../ai/provider';

/**
 * Merges overlapping and multi-detector candidate matches on the same passage into ONE unified match.
 */
function deduplicateAndMergeMatches(matches: Match[]): Match[] {
  if (matches.length === 0) return [];

  // Group matches by passage start index range overlap
  const sorted = [...matches].sort((a, b) => a.startIndex - b.startIndex);
  const merged: Match[] = [];

  sorted.forEach((match) => {
    if (merged.length === 0) {
      merged.push({ ...match });
    } else {
      const prev = merged[merged.length - 1];
      // Check if ranges overlap substantially
      const isOverlap =
        Math.max(prev.startIndex, match.startIndex) < Math.min(prev.endIndex, match.endIndex);

      if (isOverlap) {
        // Merge into single match instance
        prev.endIndex = Math.max(prev.endIndex, match.endIndex);
        prev.similarityScore = Math.max(prev.similarityScore, match.similarityScore);
        prev.score = Math.max(prev.score, match.score);

        // Upgrade classification to strongest evidence
        if (match.classification === 'exact_match') prev.classification = 'exact_match';
        else if (match.classification === 'near_match' && prev.classification !== 'exact_match') {
          prev.classification = 'near_match';
        }

        // Combine evidence
        prev.evidence = {
          localMatch: prev.evidence.localMatch || match.evidence.localMatch,
          geminiAnalysis: prev.evidence.geminiAnalysis || match.evidence.geminiAnalysis,
          webVerification: prev.evidence.webVerification || match.evidence.webVerification,
        };

        // Combine unique sources
        if (match.sources && match.sources.length > 0) {
          const existingIds = new Set(prev.sources.map((s) => s.id));
          match.sources.forEach((s) => {
            if (!existingIds.has(s.id)) prev.sources.push(s);
          });
        }
      } else {
        merged.push({ ...match });
      }
    }
  });

  return merged;
}

export async function runAnalysisPipeline(
  doc: ParsedDocument,
  options: DetectionOptions,
  onProgress?: (progress: ProgressState) => void
): Promise<AnalysisResult> {
  const steps = [
    'Reading document',
    'Extracting text',
    'Preparing passages',
    'Checking exact & near matches',
    'Checking semantic similarity',
    'Detecting paraphrases',
    'Verifying web sources',
    'Calculating similarity score',
    'Preparing report',
  ];

  let localStatus: 'Complete' | 'Failed' = 'Complete';
  let aiStatus: 'Complete' | 'Unavailable' = 'Complete';
  let webStatus: 'Complete' | 'Unavailable' = 'Complete';

  const updateProgress = (stepIdx: number) => {
    if (onProgress) {
      onProgress({
        stepIndex: stepIdx,
        currentStep: steps[stepIdx],
        progressPercentage: Math.round(((stepIdx + 1) / steps.length) * 100),
        completedSteps: steps.slice(0, stepIdx),
        totalSteps: steps.length,
      });
    }
  };

  // Step 0: Reading document
  updateProgress(0);
  await new Promise((res) => setTimeout(res, 100));

  // Step 1: Extracting text
  updateProgress(1);
  await new Promise((res) => setTimeout(res, 150));

  // Step 2: Preparing passages (Chunking)
  updateProgress(2);
  const chunks = chunkDocument(doc.processedText);
  await new Promise((res) => setTimeout(res, 150));

  // Step 3: Checking exact & near matches (Deterministic Local Engine)
  updateProgress(3);
  let rawMatches: Match[] = [];
  try {
    if (options.exactMatch || options.repeatedContent) {
      const exactRes = detectExactMatches(chunks);
      rawMatches = [...rawMatches, ...exactRes.matches];
    }
  } catch (e) {
    localStatus = 'Failed';
  }
  await new Promise((res) => setTimeout(res, 200));

  // Step 4: Checking semantic similarity
  updateProgress(4);
  try {
    if (options.semanticSimilarity) {
      const semanticRes = await findSemanticMatches(chunks, defaultAIProvider);
      rawMatches = [...rawMatches, ...semanticRes.matches];
    }
  } catch (e) {
    aiStatus = 'Unavailable';
  }
  await new Promise((res) => setTimeout(res, 250));

  // Step 5: Detecting paraphrases
  updateProgress(5);
  try {
    if (options.paraphraseDetection) {
      const paraphraseRes = await detectParaphrases(chunks, defaultAIProvider);
      rawMatches = [...rawMatches, ...paraphraseRes.matches];
    }
  } catch (e) {
    aiStatus = 'Unavailable';
  }
  await new Promise((res) => setTimeout(res, 200));

  // Step 6: Verifying web sources
  updateProgress(6);
  let sources: Source[] = matchSources(rawMatches);

  try {
    const suspiciousCandidate = rawMatches.find((m) => m.similarityScore >= 70);
    if (suspiciousCandidate) {
      const res = await fetch('/api/verify/web', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage: suspiciousCandidate.originalText }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.sources && data.sources.length > 0) {
          const verifiedSources: Source[] = data.sources.map((ws: any, idx: number) => ({
            id: `real-web-${idx}`,
            title: ws.title,
            url: ws.url,
            domain: ws.domain,
            matchedText: ws.matchedPassage,
            similarity: ws.similarityScore || 85,
            confidence: ws.confidence || 'high',
            sourceType: 'web' as const,
            isMock: false,
            verified: true,
            quality: 'High' as const,
          }));

          sources = [...verifiedSources, ...sources];

          // Attach web verification evidence to candidate match
          suspiciousCandidate.evidence.webVerification = {
            verified: true,
            url: verifiedSources[0].url,
            domain: verifiedSources[0].domain,
            matchedPassage: verifiedSources[0].matchedText,
          };
          suspiciousCandidate.hasWebMatch = true;
        }
      }
    }
  } catch (e) {
    webStatus = 'Unavailable';
  }

  await new Promise((res) => setTimeout(res, 150));

  // Step 7: Deduplication & Overlap Resolution
  updateProgress(7);
  const unifiedMatches = deduplicateAndMergeMatches(rawMatches);
  const scoring = calculateOverallSimilarity(unifiedMatches, doc.processedText.length || 1);
  await new Promise((res) => setTimeout(res, 150));

  // Step 8: Preparing report
  updateProgress(8);
  await new Promise((res) => setTimeout(res, 100));

  const resultId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

  return {
    id: resultId,
    documentName: doc.fileName,
    wordCount: doc.wordCount,
    fileSize: doc.fileSize,
    similarityScore: scoring.similarityScore,
    exactMatchScore: scoring.exactMatchScore,
    nearMatchScore: scoring.nearMatchScore,
    paraphraseScore: scoring.paraphraseScore,
    semanticScore: scoring.semanticScore,
    webVerifiedScore: scoring.webVerifiedScore,
    originalScore: scoring.originalScore,
    matches: unifiedMatches,
    sources,
    confidence: scoring.confidence,
    status: 'completed',
    createdAt: new Date().toISOString(),
    originalText: doc.originalText,
    detectionOptions: options,
    disclaimer:
      'Similarity results are automated indicators and should be reviewed by a human. A similarity match does not by itself establish plagiarism.',
    analysisQuality: {
      localAnalysis: localStatus,
      aiAnalysis: aiStatus,
      webVerification: webStatus,
    },
  };
}

/**
 * Smart Partial Analysis Retry (Requirement 17 & 22)
 * Retries ONLY the failed analysis stage without requiring document re-upload.
 */
export async function retryStageInPipeline(
  existingResult: AnalysisResult,
  stageToRetry: 'ai' | 'web'
): Promise<AnalysisResult> {
  const chunks = chunkDocument(existingResult.originalText);
  let updatedMatches = [...existingResult.matches];
  let updatedSources = [...existingResult.sources];
  let aiQuality = existingResult.analysisQuality?.aiAnalysis || 'Complete';
  let webQuality = existingResult.analysisQuality?.webVerification || 'Complete';

  if (stageToRetry === 'ai') {
    try {
      const semanticRes = await findSemanticMatches(chunks, defaultAIProvider);
      const paraphraseRes = await detectParaphrases(chunks, defaultAIProvider);
      updatedMatches = deduplicateAndMergeMatches([...updatedMatches, ...semanticRes.matches, ...paraphraseRes.matches]);
      aiQuality = 'Complete';
    } catch (e) {
      aiQuality = 'Unavailable';
    }
  }

  if (stageToRetry === 'web') {
    try {
      const suspiciousCandidate = updatedMatches.find((m) => m.similarityScore >= 60) || updatedMatches[0];
      if (suspiciousCandidate) {
        const res = await fetch('/api/verify/web', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ passage: suspiciousCandidate.originalText }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.sources && data.sources.length > 0) {
            const verifiedSources: Source[] = data.sources.map((ws: any, idx: number) => ({
              id: `real-web-retry-${idx}`,
              title: ws.title,
              url: ws.url,
              domain: ws.domain,
              matchedText: ws.matchedPassage,
              similarity: ws.similarityScore || 85,
              confidence: ws.confidence || 'high',
              sourceType: 'web' as const,
              isMock: false,
              verified: true,
              quality: 'High' as const,
            }));

            updatedSources = [...verifiedSources, ...updatedSources];
            suspiciousCandidate.evidence.webVerification = {
              verified: true,
              url: verifiedSources[0].url,
              domain: verifiedSources[0].domain,
              matchedPassage: verifiedSources[0].matchedText,
            };
            suspiciousCandidate.hasWebMatch = true;
          }
        }
      }
      webQuality = 'Complete';
    } catch (e) {
      webQuality = 'Unavailable';
    }
  }

  const scoring = calculateOverallSimilarity(updatedMatches, existingResult.originalText.length || 1);

  return {
    ...existingResult,
    matches: updatedMatches,
    sources: updatedSources,
    similarityScore: scoring.similarityScore,
    exactMatchScore: scoring.exactMatchScore,
    nearMatchScore: scoring.nearMatchScore,
    paraphraseScore: scoring.paraphraseScore,
    semanticScore: scoring.semanticScore,
    webVerifiedScore: scoring.webVerifiedScore,
    analysisQuality: {
      localAnalysis: existingResult.analysisQuality?.localAnalysis || 'Complete',
      aiAnalysis: aiQuality,
      webVerification: webQuality,
    },
  };
}
