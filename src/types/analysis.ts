export type MatchClassification =
  | 'exact_match'
  | 'near_match'
  | 'paraphrase'
  | 'semantic_match'
  | 'common_phrase'
  | 'quotation'
  | 'not_similar';

export type MatchType = 'exact' | 'paraphrase' | 'semantic' | 'repeated';

export type SourceType = 'web' | 'document' | 'database' | 'unknown';

export interface Evidence {
  localMatch?: {
    similarityScore: number;
    matchedPattern?: string;
    algorithm?: string;
  };
  geminiAnalysis?: {
    classification: MatchClassification;
    score: number;
    confidence: 'low' | 'medium' | 'high';
    reason: string;
  };
  webVerification?: {
    verified: boolean;
    url?: string;
    domain?: string;
    matchedPassage?: string;
  };
}

export interface Source {
  id: string;
  title: string;
  url: string;
  domain: string;
  matchedText: string;
  similarity: number; // 0 to 100
  confidence: 'low' | 'medium' | 'high';
  sourceType: SourceType;
  isMock: boolean;
  verified?: boolean;
  quality?: 'High' | 'Medium' | 'Low' | 'Unknown';
}

export interface MatchExplanation {
  matchId: string;
  matchType: MatchType | MatchClassification;
  similarity: number;
  confidence: 'low' | 'medium' | 'high';
  explanation: string;
  overlappingConcepts: string[];
  evidenceSummary: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  generatedAt?: string;
}

export type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'Harvard';

export interface SourceCitation {
  sourceId: string;
  style: CitationStyle;
  formattedCitation: string;
  metadata: {
    title: string;
    url: string;
    domain: string;
    author?: string;
    publishedDate?: string;
    publisher?: string;
  };
}

export interface Match {
  id: string;
  matchId: string;
  classification: MatchClassification;
  type: MatchType;
  score: number; // 0 to 100
  similarityScore: number;
  confidence: 'low' | 'medium' | 'high';
  originalText: string;
  matchedText: string;
  startIndex: number;
  endIndex: number;
  startWord?: number;
  endWord?: number;
  sourceId?: string;
  explanation: string;
  aiExplanation?: MatchExplanation;
  evidence: Evidence;
  sources: Source[];
  hasWebMatch?: boolean;
}

export interface ComparisonResult {
  id: string;
  docA: { name: string; wordCount: number; text: string };
  docB: { name: string; wordCount: number; text: string };
  overallSimilarity: number;
  matchingPassagesCount: number;
  exactMatchesCount: number;
  nearMatchesCount: number;
  semanticMatchesCount: number;
  matches: Match[];
  createdAt: string;
}

export interface DetectionOptions {
  exactMatch: boolean;
  semanticSimilarity: boolean;
  paraphraseDetection: boolean;
  repeatedContent: boolean;
  depth: 'quick' | 'standard' | 'deep';
}

export interface AnalysisResult {
  id: string;
  documentName: string;
  wordCount: number;
  fileSize: number;
  similarityScore: number;
  exactMatchScore: number;
  nearMatchScore: number;
  paraphraseScore: number;
  semanticScore: number;
  webVerifiedScore: number;
  originalScore: number;
  matches: Match[];
  sources: Source[];
  confidence: 'low' | 'medium' | 'high';
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  originalText: string;
  detectionOptions: DetectionOptions;
  errorMessage?: string;
  disclaimer?: string;
  analysisQuality?: {
    localAnalysis: 'Complete' | 'Failed';
    aiAnalysis: 'Complete' | 'Unavailable';
    webVerification: 'Complete' | 'Unavailable';
  };
}

export interface ProgressState {
  stepIndex: number;
  currentStep: string;
  progressPercentage: number;
  completedSteps: string[];
  totalSteps: number;
}
