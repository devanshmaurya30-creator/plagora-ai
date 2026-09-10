export type CitationCompletenessStatus =
  | 'SUPPORTED'
  | 'NEEDS_REVIEW'
  | 'POTENTIALLY_MISSING'
  | 'UNDETERMINED';

export type CitationRiskLevel = 'LOW RISK' | 'REVIEW' | 'HIGH RISK' | 'UNDETERMINED';

export interface CitationCompletenessSection {
  sectionId: string;
  title: string;
  totalPassages: number;
  citedPassages: number;
  claimsCount: number;
  coverageStatus: 'High' | 'Good' | 'Review' | 'Needs Review' | 'Not enough data';
  coveragePercentage?: number;
}

export interface CitationRiskItem {
  id: string;
  passageText: string;
  startIndex: number;
  endIndex: number;
  riskLevel: CitationRiskLevel;
  reason: string;
  hasCitation: boolean;
  metadataCompletenessScore: number; // 0 to 5
  missingFields: string[];
  suggestedAction: string;
}

export type WritingIssueCategory =
  | 'repetition'
  | 'unclear_sentence'
  | 'awkward_wording'
  | 'weak_transition'
  | 'verbosity'
  | 'terminology'
  | 'vague_wording'
  | 'redundancy';

export interface WritingSuggestion {
  id: string;
  passageText: string;
  startIndex: number;
  endIndex: number;
  category: WritingIssueCategory;
  priority: 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY';
  originalText: string;
  suggestedText: string;
  explanation: string;
  altersClaim: boolean;
  claimWarning?: string;
  altersCitation: boolean;
  citationWarning?: string;
}

export interface WritingMetrics {
  readabilityGrade: string;
  averageSentenceLength: number;
  repetitionScore: number;
  clarityScore: number;
  academicToneScore: number;
}
