export type ClaimType =
  | 'statistic'
  | 'date'
  | 'numerical'
  | 'scientific'
  | 'historical'
  | 'assertion'
  | 'finding';

export type ClaimVerificationStatus =
  | 'VERIFIED'
  | 'SUPPORTED'
  | 'UNCLEAR'
  | 'CONFLICTING'
  | 'INSUFFICIENT_EVIDENCE'
  | 'NOT_VERIFIABLE';

export interface ClaimEvidence {
  sourceTitle: string;
  url?: string;
  matchedPassage: string;
  isSupporting: boolean; // true = supporting evidence, false = contradicting evidence
  confidence: number;
}

export interface ClaimItem {
  claimId: string;
  documentId: string;
  versionId: string;
  analysisId: string;
  sectionId?: string;
  text: string;
  startIndex: number;
  endIndex: number;
  claimType: ClaimType;
  verificationStatus: ClaimVerificationStatus;
  confidence: number; // 0 to 100
  explanation?: string;
  evidence: ClaimEvidence[];
  sources: Array<{
    id: string;
    title: string;
    url: string;
    author?: string;
    publishedDate?: string;
  }>;
  createdAt: string;
}
