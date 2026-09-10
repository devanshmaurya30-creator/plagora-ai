import type { MatchClassification, Evidence } from '../../types/analysis';

export function calculateConfidence(
  classification: MatchClassification,
  similarityScore: number,
  evidence: Evidence,
  wordCount: number
): 'low' | 'medium' | 'high' {
  let confidencePoints = 0;

  // 1. Classification weights
  if (classification === 'exact_match') confidencePoints += 40;
  if (classification === 'near_match') confidencePoints += 30;
  if (classification === 'paraphrase') confidencePoints += 25;
  if (classification === 'semantic_match') confidencePoints += 20;

  // 2. Similarity Score strength
  if (similarityScore >= 85) confidencePoints += 30;
  else if (similarityScore >= 70) confidencePoints += 20;
  else if (similarityScore >= 50) confidencePoints += 10;

  // 3. Multi-detector Agreement Evidence
  if (evidence.localMatch && evidence.geminiAnalysis) {
    confidencePoints += 15; // Agreement between deterministic & AI
  }
  if (evidence.webVerification?.verified) {
    confidencePoints += 25; // Verified by real Google Search Grounding
  }

  // 4. Passage Length context
  if (wordCount >= 15) confidencePoints += 10;
  else if (wordCount < 6) confidencePoints -= 20;

  if (confidencePoints >= 65) return 'high';
  if (confidencePoints >= 35) return 'medium';
  return 'low';
}
