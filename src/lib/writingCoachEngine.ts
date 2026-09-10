import type { WritingSuggestion, WritingMetrics } from '../types/writingCoach';
import type { AnalysisResult } from '../types/analysis';

class WritingCoachEngine {
  /**
   * Analyze document text for authentic writing improvements
   */
  public analyzeDocumentWriting(analysis: AnalysisResult): {
    metrics: WritingMetrics;
    suggestions: WritingSuggestion[];
  } {
    const text = analysis.originalText || '';
    if (!text.trim()) {
      return {
        metrics: {
          readabilityGrade: 'N/A',
          averageSentenceLength: 0,
          repetitionScore: 100,
          clarityScore: 100,
          academicToneScore: 100,
        },
        suggestions: [],
      };
    }

    const sentences = text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);

    const words = text.split(/\s+/).filter(Boolean);
    const avgSentenceLength = Math.round(words.length / (sentences.length || 1));

    const suggestions: WritingSuggestion[] = [];
    const sentenceCounts = new Map<string, number>();

    sentences.forEach((sentence, idx) => {
      const lower = sentence.toLowerCase();
      const startIndex = text.indexOf(sentence);
      const endIndex = startIndex >= 0 ? startIndex + sentence.length : 0;

      const containsClaim = /\d+%|\b(in\s+(?:19|20)\d{2}|demonstrated|found that|increased by)\b/i.test(sentence);
      const containsCitation = /\[\d+\]|\([A-Z][a-z]+,\s*(?:19|20)\d{2}\)/.test(sentence);

      // Repetition check
      const normalized = lower.replace(/[^a-z0-9\s]/g, '');
      const count = (sentenceCounts.get(normalized) || 0) + 1;
      sentenceCounts.set(normalized, count);

      if (count > 1) {
        suggestions.push({
          id: `write-rep-${idx}`,
          passageText: sentence,
          startIndex: startIndex >= 0 ? startIndex : 0,
          endIndex,
          category: 'repetition',
          priority: 'HIGH PRIORITY',
          originalText: sentence,
          suggestedText: this.generateRepetitionFix(sentence),
          explanation: 'This phrase or sentence structure repeats previously used wording in the document.',
          altersClaim: containsClaim,
          claimWarning: containsClaim ? 'This rewrite may change the meaning of the original claim. Review before applying.' : undefined,
          altersCitation: containsCitation,
          citationWarning: containsCitation ? 'Citation context may need review.' : undefined,
        });
      }

      // Sentence complexity / verbosity (>35 words)
      const sentenceWords = sentence.split(/\s+/);
      if (sentenceWords.length > 35) {
        suggestions.push({
          id: `write-complex-${idx}`,
          passageText: sentence,
          startIndex: startIndex >= 0 ? startIndex : 0,
          endIndex,
          category: 'verbosity',
          priority: 'MEDIUM PRIORITY',
          originalText: sentence,
          suggestedText: this.shortenSentence(sentence),
          explanation: 'This sentence is unusually long (over 35 words). Splitting it will improve readability and clarity.',
          altersClaim: containsClaim,
          claimWarning: containsClaim ? 'This rewrite may change the meaning of the original claim. Review before applying.' : undefined,
          altersCitation: containsCitation,
          citationWarning: containsCitation ? 'Citation context may need review.' : undefined,
        });
      }

      // Weak transitions
      if (/^(and|but|also|so|plus|besides)\b/i.test(sentence)) {
        suggestions.push({
          id: `write-trans-${idx}`,
          passageText: sentence,
          startIndex: startIndex >= 0 ? startIndex : 0,
          endIndex,
          category: 'weak_transition',
          priority: 'LOW PRIORITY',
          originalText: sentence,
          suggestedText: this.improveTransition(sentence),
          explanation: 'Starting a sentence with an informal conjunction weakens academic tone and transition flow.',
          altersClaim: containsClaim,
          altersCitation: containsCitation,
        });
      }

      // Vague wording / filler phrases
      if (/\b(a lot of|in order to|due to the fact that|at the end of the day|it is widely known that)\b/i.test(sentence)) {
        suggestions.push({
          id: `write-vague-${idx}`,
          passageText: sentence,
          startIndex: startIndex >= 0 ? startIndex : 0,
          endIndex,
          category: 'vague_wording',
          priority: 'MEDIUM PRIORITY',
          originalText: sentence,
          suggestedText: sentence
            .replace(/due to the fact that/gi, 'because')
            .replace(/in order to/gi, 'to')
            .replace(/a lot of/gi, 'numerous')
            .replace(/it is widely known that/gi, 'evidence indicates that'),
          explanation: 'Replacing wordy filler expressions with direct academic phrasing improves conciseness.',
          altersClaim: containsClaim,
          altersCitation: containsCitation,
        });
      }
    });

    // Calculate metrics
    const readabilityGrade = avgSentenceLength > 28 ? 'Advanced Academic' : avgSentenceLength > 20 ? 'Standard Academic' : 'Accessible';
    const clarityScore = Math.max(50, 100 - suggestions.length * 5);
    const repetitionScore = Math.max(60, 100 - Array.from(sentenceCounts.values()).filter((c) => c > 1).length * 15);
    const academicToneScore = Math.max(55, 100 - suggestions.filter((s) => s.category === 'weak_transition' || s.category === 'vague_wording').length * 8);

    return {
      metrics: {
        readabilityGrade,
        averageSentenceLength: avgSentenceLength,
        repetitionScore,
        clarityScore,
        academicToneScore,
      },
      suggestions,
    };
  }

  private generateRepetitionFix(text: string): string {
    return text.replace(/furthermore,/gi, 'Additionally,').replace(/moreover,/gi, 'In tandem,');
  }

  private shortenSentence(text: string): string {
    const parts = text.split(/,\s+(and|which|while|because|although)\s+/i);
    if (parts.length >= 3) {
      return `${parts[0]}. ${parts[1].charAt(0).toUpperCase() + parts[1].slice(1)} ${parts.slice(2).join(' ')}`;
    }
    return text;
  }

  private improveTransition(text: string): string {
    return text
      .replace(/^And\b/i, 'Furthermore,')
      .replace(/^But\b/i, 'However,')
      .replace(/^Also\b/i, 'Additionally,')
      .replace(/^So\b/i, 'Consequently,');
  }
}

export const writingCoachEngine = new WritingCoachEngine();
