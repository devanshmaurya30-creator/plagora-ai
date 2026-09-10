import type { ClaimItem, ClaimType, ClaimVerificationStatus } from '../types/claim';
import type { AnalysisResult } from '../types/analysis';

class ClaimVerificationEngine {
  /**
   * Deterministically extract verifiable factual claims from document text.
   * Excludes subjective opinions, personal reflections, or aesthetic judgments.
   */
  public extractClaimsFromDocument(
    documentId: string,
    versionId: string,
    analysisResult: AnalysisResult
  ): ClaimItem[] {
    const text = analysisResult.originalText || '';
    if (!text.trim()) return [];

    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 20);

    const claims: ClaimItem[] = [];
    let currentCharIndex = 0;

    sentences.forEach((sentence, idx) => {
      const startIndex = text.indexOf(sentence, currentCharIndex);
      const endIndex = startIndex >= 0 ? startIndex + sentence.length : currentCharIndex + sentence.length;
      if (startIndex >= 0) currentCharIndex = endIndex;

      // Opinion / subjective filter
      if (this.isSubjectiveOpinion(sentence)) return;

      const claimType = this.detectClaimType(sentence);
      if (!claimType) return;

      // Check existing matches and sources for supporting evidence
      const matchingMatch = analysisResult.matches.find(
        (m) => m.originalText.includes(sentence) || sentence.includes(m.originalText)
      );

      const matchingSource = analysisResult.sources.find(
        (s) => sentence.includes(s.matchedText) || (s.matchedText && s.matchedText.includes(sentence))
      );

      let status: ClaimVerificationStatus = 'INSUFFICIENT_EVIDENCE';
      let confidence = 45;
      const evidenceList: any[] = [];
      const sourceList: any[] = [];

      if (matchingSource && matchingSource.verified) {
        status = 'VERIFIED';
        confidence = 90;
        evidenceList.push({
          sourceTitle: matchingSource.title || matchingSource.domain,
          url: matchingSource.url,
          matchedPassage: matchingSource.matchedText || sentence,
          isSupporting: true,
          confidence: 90,
        });
        sourceList.push({
          id: matchingSource.id,
          title: matchingSource.title,
          url: matchingSource.url,
        });
      } else if (matchingMatch) {
        status = 'SUPPORTED';
        confidence = 75;
        evidenceList.push({
          sourceTitle: matchingMatch.sources[0]?.title || 'External Reference',
          url: matchingMatch.sources[0]?.url || '',
          matchedPassage: matchingMatch.matchedText || sentence,
          isSupporting: true,
          confidence: 75,
        });
        if (matchingMatch.sources[0]) {
          sourceList.push({
            id: matchingMatch.sources[0].id,
            title: matchingMatch.sources[0].title,
            url: matchingMatch.sources[0].url,
          });
        }
      } else if (this.hasCitationMarker(sentence)) {
        status = 'SUPPORTED';
        confidence = 80;
      }

      claims.push({
        claimId: `claim-${analysisResult.id}-${idx}`,
        documentId,
        versionId,
        analysisId: analysisResult.id,
        text: sentence,
        startIndex: startIndex >= 0 ? startIndex : 0,
        endIndex,
        claimType,
        verificationStatus: status,
        confidence,
        explanation: this.generateClaimExplanation(claimType, status),
        evidence: evidenceList,
        sources: sourceList,
        createdAt: new Date().toISOString(),
      });
    });

    return claims;
  }

  private isSubjectiveOpinion(sentence: string): boolean {
    const opinionRegex = /\b(i think|i believe|in my opinion|in my view|i feel|awesome|wonderful|beautiful|we feel|we believe|personally)\b/i;
    return opinionRegex.test(sentence);
  }

  private detectClaimType(sentence: string): ClaimType | null {
    const lower = sentence.toLowerCase();

    // Statistics / Percentages
    if (/\d+([.,]\d+)?\s*%|\b\d+\s+out of\s+\d+\b|\bp\s*<\s*0\.\d+/i.test(sentence)) {
      return 'statistic';
    }
    // Numerical data
    if (/\b\d{1,3}(,\d{3})+|\b(million|billion|trillion|hundreds|thousands)\b/i.test(sentence)) {
      return 'numerical';
    }
    // Dates / Years
    if (/\b(18|19|20)\d{2}\b|\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/i.test(sentence)) {
      return 'date';
    }
    // Scientific statements
    if (/\b(molecule|photosynthesis|quantum|genome|gene|protein|enzyme|cell|algorithm|neural network|entropy|temperature|celsius)\b/i.test(lower)) {
      return 'scientific';
    }
    // Research findings
    if (/\b(found that|demonstrated that|concluded that|study revealed|researchers showed|results indicate|experiment|published in)\b/i.test(sentence)) {
      return 'finding';
    }
    // Historical statements
    if (/\b(treaty|war|reign|empire|founding|revolution|charter|constitution|century)\b/i.test(sentence)) {
      return 'historical';
    }
    // Named factual assertions
    if (/\b[A-Z][a-z]+\s+(et al\.|concluded|argued|established|discovered|proposed)\b/.test(sentence)) {
      return 'assertion';
    }

    return null;
  }

  private hasCitationMarker(sentence: string): boolean {
    return /\[\d+\]|\([A-Z][a-z]+,\s*(?:19|20)\d{2}\)/.test(sentence);
  }

  private generateClaimExplanation(type: ClaimType, status: ClaimVerificationStatus): string {
    switch (status) {
      case 'VERIFIED':
        return `This ${type} claim is supported by verified online source evidence.`;
      case 'SUPPORTED':
        return `This ${type} claim has corresponding reference text and citation alignment.`;
      case 'UNCLEAR':
        return `This ${type} claim lacks clear attribution or full source metadata.`;
      case 'CONFLICTING':
        return `Different sources provide conflicting metrics or data for this ${type} claim.`;
      case 'INSUFFICIENT_EVIDENCE':
        return `Insufficient evidence found in the current dataset for this ${type} claim.`;
      case 'NOT_VERIFIABLE':
        return `This statement contains general descriptive phrasing that cannot be independently verified.`;
    }
  }

  /**
   * Online Gemini Search Grounding for explicit claim verification
   */
  public async verifyClaimOnline(claim: ClaimItem): Promise<ClaimItem> {
    try {
      const res = await fetch('/api/verify/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimText: claim.text }),
      });

      if (!res.ok) throw new Error('Verification service error');
      const data = await res.json();

      return {
        ...claim,
        verificationStatus: data.status || 'INSUFFICIENT_EVIDENCE',
        confidence: data.confidence || 50,
        explanation: data.explanation,
        sources: data.sources || claim.sources,
        evidence: (data.supportingEvidence || []).map((evText: string) => ({
          sourceTitle: data.sources?.[0]?.title || 'Web Search Grounding',
          url: data.sources?.[0]?.url || '',
          matchedPassage: evText,
          isSupporting: true,
          confidence: data.confidence || 80,
        })),
      };
    } catch {
      return {
        ...claim,
        verificationStatus: 'INSUFFICIENT_EVIDENCE',
        explanation: 'Web verification unavailable. Using empirical document evidence.',
      };
    }
  }
}

export const claimVerificationEngine = new ClaimVerificationEngine();
