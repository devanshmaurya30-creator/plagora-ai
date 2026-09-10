import { GoogleGenAI } from '@google/genai';
import {
  SEMANTIC_SIMILARITY_SYSTEM_PROMPT,
  createSemanticSimilarityPrompt,
} from '../prompts/semanticSimilarity.js';
import {
  PARAPHRASE_DETECTION_SYSTEM_PROMPT,
  createParaphrasePrompt,
} from '../prompts/paraphraseDetection.js';
import {
  PASSAGE_CLASSIFICATION_SYSTEM_PROMPT,
  createPassageClassificationPrompt,
} from '../prompts/passageClassification.js';
import {
  MATCH_EXPLANATION_SYSTEM_PROMPT,
  createMatchExplanationPrompt,
} from '../prompts/matchExplanation.js';
import {
  REWRITE_ORIGINALITY_SYSTEM_PROMPT,
  createRewritePrompt,
} from '../prompts/rewriteOriginality.js';
import { extractGroundingSources } from './webSourceService.js';
import type { VerifiedWebSource } from './webSourceService.js';
import { searchCache } from './searchCache.js';

export class GeminiServiceError extends Error {
  code: string;
  constructor(message: string, code: string = 'GEMINI_ERROR') {
    super(message);
    this.name = 'GeminiServiceError';
    this.code = code;
  }
}

export interface SemanticAnalysisResult {
  similarityScore: number;
  sameMeaning: boolean;
  relationship: 'same_meaning' | 'related' | 'different';
  confidence: 'low' | 'medium' | 'high';
  reason: string;
}

export interface ParaphraseAnalysisResult {
  isParaphrase: boolean;
  score: number;
  confidence: 'low' | 'medium' | 'high';
  reason: string;
  changedStructure: boolean;
  preservedMeaning: boolean;
}

export interface ClassificationAnalysisResult {
  classification:
    | 'exact_match'
    | 'near_match'
    | 'paraphrase'
    | 'semantic_match'
    | 'common_phrase'
    | 'quotation'
    | 'not_similar';
  score: number;
  confidence: 'low' | 'medium' | 'high';
  reason: string;
  webSources?: VerifiedWebSource[];
}

export interface MatchExplanationResult {
  explanation: string;
  overlappingConcepts: string[];
  evidenceSummary: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface RewriteResult {
  rewrittenText: string;
  explanation: string;
  keyChanges: string[];
}

export class GeminiService {
  private ai: GoogleGenAI | null = null;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey.trim() !== '') {
      this.ai = new GoogleGenAI({ apiKey });
    }
  }

  private ensureClient(): GoogleGenAI {
    if (!this.ai) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey.trim() === '') {
        throw new GeminiServiceError(
          'GEMINI_API_KEY is not configured on the server.',
          'MISSING_API_KEY'
        );
      }
      this.ai = new GoogleGenAI({ apiKey });
    }
    return this.ai;
  }

  /**
   * Exponential backoff retry wrapper
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 2
  ): Promise<T> {
    let lastError: any;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err: any) {
        lastError = err;
        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 500;
          await new Promise((res) => setTimeout(res, delay));
        }
      }
    }
    throw new GeminiServiceError(
      `AI analysis request failed after retries: ${lastError?.message || 'Network error'}`,
      'API_FAILURE'
    );
  }

  /**
   * Helper to invoke Gemini generateContent with JSON mode
   */
  private async generateJSON<T>(systemInstruction: string, promptText: string): Promise<T> {
    const ai = this.ensureClient();

    return this.executeWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: promptText,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const text = response.text;
      if (!text) {
        throw new GeminiServiceError('Empty response received from Gemini model.', 'EMPTY_RESPONSE');
      }

      try {
        return JSON.parse(text) as T;
      } catch (e: any) {
        throw new GeminiServiceError('Invalid JSON structure returned by model.', 'INVALID_JSON');
      }
    });
  }

  /**
   * Perform Gemini Google Search Grounding for a passage
   */
  async searchAndVerifyWeb(passage: string): Promise<VerifiedWebSource[]> {
    const cached = searchCache.get<VerifiedWebSource[]>(passage);
    if (cached) return cached;

    const ai = this.ensureClient();

    const result = await this.executeWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: `Find published online articles, research papers, or web documents that contain or paraphrase this passage: "${passage}"`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const candidate = response.candidates?.[0];
      const groundingMetadata = candidate?.groundingMetadata;
      const webSources = extractGroundingSources(groundingMetadata, passage);

      searchCache.set(passage, webSources);
      return webSources;
    });

    return result;
  }

  /**
   * Semantic Similarity Analysis
   */
  async compareSemanticSimilarity(
    candidate: string,
    reference: string
  ): Promise<SemanticAnalysisResult> {
    const prompt = createSemanticSimilarityPrompt(candidate, reference);
    return this.generateJSON<SemanticAnalysisResult>(
      SEMANTIC_SIMILARITY_SYSTEM_PROMPT,
      prompt
    );
  }

  /**
   * Paraphrase Detection
   */
  async detectParaphrase(
    original: string,
    candidate: string
  ): Promise<ParaphraseAnalysisResult> {
    const prompt = createParaphrasePrompt(original, candidate);
    return this.generateJSON<ParaphraseAnalysisResult>(
      PARAPHRASE_DETECTION_SYSTEM_PROMPT,
      prompt
    );
  }

  /**
   * Passage Classification with Web Grounding Option
   */
  async classifyPassage(passage: string, includeWebSearch = true): Promise<ClassificationAnalysisResult> {
    const prompt = createPassageClassificationPrompt(passage);
    const classification = await this.generateJSON<ClassificationAnalysisResult>(
      PASSAGE_CLASSIFICATION_SYSTEM_PROMPT,
      prompt
    );

    if (includeWebSearch && classification.score >= 70) {
      try {
        const webSources = await this.searchAndVerifyWeb(passage);
        classification.webSources = webSources;
      } catch (err) {
        // Fallback safely if web search unavailable
        classification.webSources = [];
      }
    }

    return classification;
  }

  /**
   * AI Match Explanation ("Why Flagged?")
   */
  async explainMatch(data: {
    originalText: string;
    matchedText: string;
    classification: string;
    matchType: string;
    similarityScore: number;
    evidence?: any;
    sourceDomain?: string;
  }): Promise<MatchExplanationResult> {
    const prompt = createMatchExplanationPrompt(data);
    return this.generateJSON<MatchExplanationResult>(
      MATCH_EXPLANATION_SYSTEM_PROMPT,
      prompt
    );
  }

  /**
   * AI Rewrite for Originality
   */
  async rewriteForOriginality(data: {
    passage: string;
    context?: string;
    matchedReference?: string;
  }): Promise<RewriteResult> {
    const prompt = createRewritePrompt(data);
    return this.generateJSON<RewriteResult>(
      REWRITE_ORIGINALITY_SYSTEM_PROMPT,
      prompt
    );
  }

  /**
   * AI Analysis Chat ("Ask Plagora")
   */
  async chatAnalysis(data: {
    analysisSummary: any;
    history?: Array<{ role: 'user' | 'assistant'; text: string }>;
    userQuestion: string;
  }): Promise<{ reply: string }> {
    const ai = this.ensureClient();
    const { ANALYSIS_CHAT_SYSTEM_PROMPT, createAnalysisChatPrompt } = await import('../prompts/analysisChat.js');
    const prompt = createAnalysisChatPrompt(data);

    return this.executeWithRetry(async () => {
      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction: ANALYSIS_CHAT_SYSTEM_PROMPT,
          temperature: 0.2,
        },
      });

      const text = response.text || 'I could not generate a response based on the current analysis data.';
      return { reply: text };
    });
  }
}

export const geminiService = new GeminiService();
