import {
  normalizeForComparison,
  isCommonPhrase,
  isQuotation,
} from '../../src/lib/textProcessor.js';
import { calculateLevenshteinSimilarity } from '../../src/lib/analyzer/exactMatch.js';
import { calculateOverallSimilarity } from '../../src/lib/analyzer/scoring.js';
import { calculateConfidence } from '../../src/lib/analyzer/confidenceEngine.js';
import type { Match } from '../../src/types/analysis.js';

console.log('==================================================');
console.log('PLAGORA AI — ACCURACY ENGINE TEST SUITE');
console.log('==================================================');

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
    failedTests++;
  }
}

// Test 1: Quotation Detection
const quoteSample = '"Artificial intelligence is transforming modern education."';
assert(isQuotation(quoteSample) === true, 'Detects legitimate quotation marks');

// Test 2: Common Phrase Filter
const phraseSample = 'according to the study';
assert(isCommonPhrase(phraseSample) === true, 'Filters standard academic phrase');

// Test 3: Near-Match Levenshtein Similarity
const originalSent = 'Artificial intelligence is transforming modern education.';
const nearSent = 'Artificial intelligence has transformed modern education.';
const levSim = calculateLevenshteinSimilarity(
  normalizeForComparison(originalSent),
  normalizeForComparison(nearSent)
);
assert(levSim >= 85, `Calculates high near-match similarity (${levSim}%)`);

// Test 4: False Positive (Same Topic, Different Meaning)
const topicSent1 = 'Artificial intelligence is transforming modern education.';
const topicSent2 = 'Students should maintain a regular study schedule.';
const diffSim = calculateLevenshteinSimilarity(
  normalizeForComparison(topicSent1),
  normalizeForComparison(topicSent2)
);
assert(diffSim < 40, `Rejects unrelated statements on same topic (${diffSim}%)`);

// Test 5: Deduplication & Overlap Resolution
const mockMatches: Match[] = [
  {
    id: 'm1',
    matchId: 'm1',
    classification: 'exact_match',
    type: 'exact',
    score: 95,
    similarityScore: 95,
    confidence: 'high',
    originalText: 'Artificial intelligence is transforming modern education.',
    matchedText: 'Artificial intelligence is transforming modern education.',
    startIndex: 0,
    endIndex: 60,
    explanation: 'Exact match',
    evidence: { localMatch: { similarityScore: 95 } },
    sources: [],
  },
  {
    id: 'm2',
    matchId: 'm1', // Same match range overlap
    classification: 'paraphrase',
    type: 'paraphrase',
    score: 85,
    similarityScore: 85,
    confidence: 'medium',
    originalText: 'Artificial intelligence is transforming modern education.',
    matchedText: 'Modern education is transformed by AI.',
    startIndex: 0,
    endIndex: 60,
    explanation: 'Paraphrase match',
    evidence: { geminiAnalysis: { classification: 'paraphrase', score: 85, confidence: 'medium', reason: '' } },
    sources: [],
  },
];

const scoring = calculateOverallSimilarity(mockMatches, 200);
assert(
  scoring.similarityScore === 30, // 60 / 200 = 30%
  `Resolves overlapping ranges without double-counting (Score: ${scoring.similarityScore}%)`
);

// Test 6: Confidence Calculation
const confidenceRes = calculateConfidence(
  'exact_match',
  95,
  { localMatch: { similarityScore: 95 }, webVerification: { verified: true } },
  10
);
assert(confidenceRes === 'high', 'Evaluates multi-detector agreement as HIGH confidence');

console.log('==================================================');
console.log(`TEST SUMMARY: ${passedTests} Passed, ${failedTests} Failed.`);
console.log('==================================================');

if (failedTests > 0) {
  process.exit(1);
}
