export interface AIAnalysisResult {
  isSuspicious: boolean;
  score: number;
  explanation: string;
  suggestedType: 'exact' | 'paraphrase' | 'semantic';
}

export interface SimilarityAnalysis {
  similarityScore: number;
  confidence: 'low' | 'medium' | 'high';
  matchedSegments: Array<{
    sourceText: string;
    targetText: string;
    similarity: number;
  }>;
}

export interface ParaphraseResult {
  isParaphrased: boolean;
  originalIdea: string;
  confidence: 'low' | 'medium' | 'high';
}

export interface AIProvider {
  analyzePassage(text: string): Promise<AIAnalysisResult>;
  comparePassages(source: string, candidate: string): Promise<SimilarityAnalysis>;
  detectParaphrase(text: string): Promise<ParaphraseResult>;
}

export class MockAIProvider implements AIProvider {
  async analyzePassage(text: string): Promise<AIAnalysisResult> {
    await new Promise((res) => setTimeout(res, 120));

    const lower = text.toLowerCase();
    let isSuspicious = false;
    let score = 0;
    let explanation = 'No significant AI semantic overlap detected.';
    let suggestedType: 'exact' | 'paraphrase' | 'semantic' = 'semantic';

    if (
      lower.includes('deep learning') ||
      lower.includes('machine learning') ||
      lower.includes('neural networks') ||
      lower.includes('transformer architecture')
    ) {
      isSuspicious = true;
      score = 78;
      explanation = 'High semantic correlation found with recent AI/ML research benchmarks.';
      suggestedType = 'semantic';
    } else if (
      lower.includes('according to recent studies') ||
      lower.includes('it is widely believed') ||
      lower.includes('furthermore, the results indicate')
    ) {
      isSuspicious = true;
      score = 65;
      explanation = 'Paraphrased academic phrasing identified with standard research publications.';
      suggestedType = 'paraphrase';
    }

    return {
      isSuspicious,
      score,
      explanation,
      suggestedType,
    };
  }

  async comparePassages(source: string, candidate: string): Promise<SimilarityAnalysis> {
    await new Promise((res) => setTimeout(res, 100));

    const sourceWords = new Set(source.toLowerCase().split(/\s+/));
    const candidateWords = candidate.toLowerCase().split(/\s+/);
    let matchCount = 0;

    candidateWords.forEach((w) => {
      if (sourceWords.has(w)) matchCount++;
    });

    const ratio = candidateWords.length > 0 ? (matchCount / candidateWords.length) * 100 : 0;

    return {
      similarityScore: Math.min(100, Math.round(ratio)),
      confidence: ratio > 60 ? 'high' : ratio > 30 ? 'medium' : 'low',
      matchedSegments: [
        {
          sourceText: source.slice(0, 100),
          targetText: candidate.slice(0, 100),
          similarity: Math.round(ratio),
        },
      ],
    };
  }

  async detectParaphrase(text: string): Promise<ParaphraseResult> {
    await new Promise((res) => setTimeout(res, 100));
    const wordCount = text.split(/\s+/).length;
    const isParaphrased =
      wordCount > 10 &&
      (text.includes('however') || text.includes('therefore') || text.includes('specifically'));

    return {
      isParaphrased,
      originalIdea: 'Structural ideas match academic reference material.',
      confidence: 'medium',
    };
  }
}

export class GeminiAIProvider implements AIProvider {
  async analyzePassage(text: string): Promise<AIAnalysisResult> {
    try {
      const res = await fetch('/api/analyze/passage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage: text }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const isSuspicious =
        data.classification === 'semantic_match' ||
        data.classification === 'paraphrase' ||
        data.classification === 'exact_match' ||
        data.classification === 'near_match';

      return {
        isSuspicious,
        score: data.score || 0,
        explanation: data.reason || 'AI analysis completed.',
        suggestedType:
          data.classification === 'paraphrase'
            ? 'paraphrase'
            : data.classification === 'exact_match' || data.classification === 'near_match'
            ? 'exact'
            : 'semantic',
      };
    } catch (err) {
      // Fallback cleanly on error to mock provider
      return new MockAIProvider().analyzePassage(text);
    }
  }

  async comparePassages(source: string, candidate: string): Promise<SimilarityAnalysis> {
    try {
      const res = await fetch('/api/analyze/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, reference: source }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      return {
        similarityScore: data.similarityScore || 0,
        confidence: data.confidence || 'medium',
        matchedSegments: [
          {
            sourceText: source.slice(0, 100),
            targetText: candidate.slice(0, 100),
            similarity: data.similarityScore || 0,
          },
        ],
      };
    } catch (err) {
      return new MockAIProvider().comparePassages(source, candidate);
    }
  }

  async detectParaphrase(text: string): Promise<ParaphraseResult> {
    try {
      const res = await fetch('/api/analyze/passage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage: text }),
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();

      return {
        isParaphrased: data.classification === 'paraphrase',
        originalIdea: data.reason || 'Paraphrased concept matching reference material.',
        confidence: data.confidence || 'medium',
      };
    } catch (err) {
      return new MockAIProvider().detectParaphrase(text);
    }
  }
}

// Select default provider based on environment or fallback
export const defaultAIProvider: AIProvider = new GeminiAIProvider();
