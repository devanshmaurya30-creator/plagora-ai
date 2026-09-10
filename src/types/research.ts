export interface ResearchNote {
  id: string;
  documentId: string;
  versionId: string;
  analysisId: string;
  entityType: 'section' | 'passage' | 'match' | 'source' | 'evidence' | 'citation' | 'claim';
  entityId: string;
  entityTitle?: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SourceComparisonItem {
  sourceAId: string;
  sourceBId: string;
  sourceATitle: string;
  sourceBTitle: string;
  overlappingClaims: string[];
  differentClaims: string[];
  disagreementsDetected: boolean;
  notes?: string;
}

export interface ResearchMetric {
  sourcesReviewed: number;
  evidenceSaved: number;
  citationRisks: number;
  unresolvedMatches: number;
  researchNotesCount: number;
  sectionsNeedingReview: number;
  claimsVerifiedCount: number;
}

export interface ResearchSearchFilter {
  query: string;
  type: 'all' | 'text' | 'sources' | 'evidence' | 'citations' | 'notes' | 'claims';
}
