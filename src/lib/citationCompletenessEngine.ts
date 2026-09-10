import type { AnalysisResult } from '../types/analysis';
import type { CitationCompletenessSection, CitationRiskItem, CitationRiskLevel } from '../types/writingCoach';

class CitationCompletenessEngine {
  /**
   * Analyze document sections and passages for citation completeness
   */
  public analyzeCompleteness(analysis: AnalysisResult): {
    sections: CitationCompletenessSection[];
    riskItems: CitationRiskItem[];
  } {
    const text = analysis.originalText || '';
    if (!text.trim()) {
      return { sections: [], riskItems: [] };
    }

    const rawParagraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
    const sections: CitationCompletenessSection[] = [];
    const riskItems: CitationRiskItem[] = [];

    rawParagraphs.forEach((paragraph, idx) => {
      const sectionId = `sec-${idx + 1}`;
      const title = paragraph.length > 40 ? `${paragraph.slice(0, 40)}...` : paragraph;
      const sentences = paragraph.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 15);

      let totalPassages = sentences.length;
      let citedPassages = 0;
      let claimsCount = 0;

      sentences.forEach((sentence, sIdx) => {
        const hasInlineCitation = /\[\d+\]|\([A-Z][a-z]+,\s*(?:19|20)\d{2}\)/.test(sentence);
        const isQuotation = /"[^"]+"/.test(sentence);
        const isFactualClaim = /\d+%|\b(in\s+(?:19|20)\d{2}|according to|demonstrated that|found that)\b/i.test(sentence);

        if (hasInlineCitation || isQuotation) {
          citedPassages++;
        }

        if (isFactualClaim) {
          claimsCount++;
        }

        const startIndex = text.indexOf(sentence);
        const endIndex = startIndex >= 0 ? startIndex + sentence.length : 0;

        // Check if passage has similarity match without explicit citation
        const matchingMatch = analysis.matches.find((m) => m.originalText.includes(sentence));

        if (isFactualClaim && !hasInlineCitation && !isQuotation) {
          const riskLevel: CitationRiskLevel = matchingMatch ? 'HIGH RISK' : 'REVIEW';
          riskItems.push({
            id: `risk-${idx}-${sIdx}`,
            passageText: sentence,
            startIndex: startIndex >= 0 ? startIndex : 0,
            endIndex,
            riskLevel,
            reason: matchingMatch
              ? 'Review recommended: This passage has high similarity with an external source but lacks an inline citation.'
              : 'Review recommended: This factual claim or statistic has no identifiable supporting inline citation.',
            hasCitation: false,
            metadataCompletenessScore: matchingMatch?.sources[0]?.url ? 4 : 2,
            missingFields: matchingMatch?.sources[0]?.url ? ['author', 'date'] : ['author', 'title', 'url', 'date'],
            suggestedAction: 'Generate and insert citation using verified source metadata.',
          });
        }
      });

      let coverageStatus: 'High' | 'Good' | 'Review' | 'Needs Review' | 'Not enough data' = 'Good';
      const ratio = totalPassages > 0 ? citedPassages / totalPassages : 0;

      if (totalPassages === 0) {
        coverageStatus = 'Not enough data';
      } else if (ratio >= 0.6 || claimsCount === 0) {
        coverageStatus = 'High';
      } else if (ratio >= 0.3) {
        coverageStatus = 'Good';
      } else if (claimsCount > 1 && ratio < 0.2) {
        coverageStatus = 'Needs Review';
      } else {
        coverageStatus = 'Review';
      }

      sections.push({
        sectionId,
        title,
        totalPassages,
        citedPassages,
        claimsCount,
        coverageStatus,
        coveragePercentage: totalPassages > 0 ? Math.round(ratio * 100) : undefined,
      });
    });

    return { sections, riskItems };
  }
}

export const citationCompletenessEngine = new CitationCompletenessEngine();
