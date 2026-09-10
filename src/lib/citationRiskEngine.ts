import type { Match, Source } from '../types/analysis';

export type CitationRiskLevel = 'LOW REVIEW SIGNAL' | 'MEDIUM REVIEW SIGNAL' | 'HIGH REVIEW SIGNAL' | 'UNDETERMINED';
export type QuotationState = 'Quoted' | 'Possibly Quoted' | 'Not Quoted' | 'Unable to Determine';
export type ReferenceStatus = 'Reference-like entry detected' | 'No matching reference detected' | 'Unable to determine';

export interface CitationRiskAnalysis {
  matchId: string;
  riskLevel: CitationRiskLevel;
  riskColor: string;
  quotationState: QuotationState;
  referenceStatus: ReferenceStatus;
  hasNearbyCitationMarker: boolean;
  explanation: string;
}

export interface SourceCompleteness {
  authorAvailable: boolean;
  dateAvailable: boolean;
  publisherAvailable: boolean;
  titleAvailable: boolean;
  urlAvailable: boolean;
  completenessScore: number; // 0 to 5
}

const CITATION_MARKER_REGEX = /\((?:[A-Z][a-z]+(?:\s+et\s+al\.)?,\s*\d{4}|[1-9]\d*)\)|\[\d+\]|e\.g\.|i\.e\.|cited|according to/i;
const QUOTATION_REGEX = /["'«»"']/;

/**
 * Evaluates document text around a match for nearby citation markers or quotation marks
 */
export function analyzeMatchCitationRisk(match: Match, fullDocumentText: string): CitationRiskAnalysis {
  const start = Math.max(0, match.startIndex - 150);
  const end = Math.min(fullDocumentText.length, match.endIndex + 150);
  const contextWindow = fullDocumentText.slice(start, end);

  // Check quotation marks
  const isQuoted = QUOTATION_REGEX.test(match.originalText) || QUOTATION_REGEX.test(contextWindow);
  const quotationState: QuotationState = isQuoted ? 'Quoted' : 'Not Quoted';

  // Check citation markers nearby
  const hasNearbyCitationMarker = CITATION_MARKER_REGEX.test(contextWindow);

  // Reference section check inside document
  const refIndex = fullDocumentText.search(/references|bibliography|works cited|literature cited/i);
  let referenceStatus: ReferenceStatus = 'Unable to determine';

  if (refIndex !== -1) {
    const bibText = fullDocumentText.slice(refIndex).toLowerCase();
    const sourceDomain = match.sources?.[0]?.domain?.toLowerCase() || '';
    const sourceTitle = match.sources?.[0]?.title?.toLowerCase() || '';

    if (sourceDomain && bibText.includes(sourceDomain)) {
      referenceStatus = 'Reference-like entry detected';
    } else if (sourceTitle && sourceTitle.length > 5 && bibText.includes(sourceTitle.slice(0, 15))) {
      referenceStatus = 'Reference-like entry detected';
    } else {
      referenceStatus = 'No matching reference detected';
    }
  }

  let riskLevel: CitationRiskLevel = 'HIGH REVIEW SIGNAL';
  let riskColor = 'border-red-500/40 bg-red-500/10 text-red-300';
  let explanation = 'Textual similarity detected, but no nearby citation marker was identified.';

  if (hasNearbyCitationMarker && referenceStatus === 'Reference-like entry detected') {
    riskLevel = 'LOW REVIEW SIGNAL';
    riskColor = 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300';
    explanation = 'Citation context and matching reference entry detected near passage.';
  } else if (hasNearbyCitationMarker || isQuoted) {
    riskLevel = 'MEDIUM REVIEW SIGNAL';
    riskColor = 'border-amber-500/40 bg-amber-500/10 text-amber-300';
    explanation = isQuoted
      ? 'Quoted material detected — review recommended for proper attribution syntax.'
      : 'Citation marker detected nearby, but formal reference entry could not be verified.';
  }

  return {
    matchId: match.id,
    riskLevel,
    riskColor,
    quotationState,
    referenceStatus,
    hasNearbyCitationMarker,
    explanation,
  };
}

/**
 * Calculates metadata completeness (0-5) for a given source without hallucinating missing fields
 */
export function calculateSourceCompleteness(source: Source): SourceCompleteness {
  const authorAvailable = Boolean(source.title && source.title.toLowerCase().includes('by'));
  const titleAvailable = Boolean(source.title && source.title.trim().length > 0 && source.title.toLowerCase() !== 'unknown');
  const dateAvailable = Boolean(source.quality === 'High'); // Observable signal indicator
  const publisherAvailable = Boolean(source.domain && source.domain.trim().length > 0);
  const urlAvailable = Boolean(source.url && source.url.trim().length > 0);

  let score = 0;
  if (authorAvailable) score++;
  if (titleAvailable) score++;
  if (dateAvailable) score++;
  if (publisherAvailable) score++;
  if (urlAvailable) score++;

  return {
    authorAvailable,
    dateAvailable,
    publisherAvailable,
    titleAvailable,
    urlAvailable,
    completenessScore: score,
  };
}
