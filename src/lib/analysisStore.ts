import type { AnalysisResult } from '../types/analysis';

const STORAGE_KEY = 'plagora_analyses';

const MOCK_PREPOPULATED_SCANS: AnalysisResult[] = [
  {
    id: 'scan-mock-1',
    documentName: 'Research_Paper.pdf',
    wordCount: 4821,
    fileSize: 4.8 * 1024 * 1024,
    similarityScore: 8,
    exactMatchScore: 3,
    nearMatchScore: 1,
    paraphraseScore: 3,
    semanticScore: 1,
    webVerifiedScore: 3,
    originalScore: 92,
    confidence: 'high',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago
    detectionOptions: {
      exactMatch: true,
      semanticSimilarity: true,
      paraphraseDetection: true,
      repeatedContent: true,
      depth: 'deep',
    },
    originalText: `Artificial intelligence and natural language processing have witnessed unprecedented growth over the last decade. Large language models (LLMs) have demonstrated exceptional capabilities in text generation, reasoning, and document comprehension.

    However, ethical challenges regarding academic integrity and original content creation have emerged simultaneously. Researchers must ensure that claims are properly attributed to foundational works. Transformer architectures utilize multi-head self-attention mechanisms to capture contextual dependencies across extensive text passages.

    In this study, we evaluate state-of-the-art plagiarism detection frameworks across multi-lingual academic corpora. Our empirical findings demonstrate that hybrid models combining exact n-gram matching with deep contextual embeddings achieve superior precision and recall metrics.`,
    matches: [
      {
        id: 'match-1',
        matchId: 'match-1',
        classification: 'exact_match',
        type: 'exact',
        score: 98,
        similarityScore: 98,
        sourceId: 'src-1',
        originalText: 'natural language processing have witnessed unprecedented growth over the last decade.',
        matchedText: 'natural language processing has witnessed unprecedented growth over the last decade.',
        startIndex: 28,
        endIndex: 111,
        confidence: 'high',
        explanation: 'Exact phrase match with indexed IEEE paper on NLP trends.',
        evidence: {
          localMatch: { similarityScore: 98, algorithm: 'Exact String Normalization' },
          webVerification: { verified: true, domain: 'ieee.org', url: 'https://ieee.org/papers/nlp-growth-trends-2024' },
        },
        sources: [
          {
            id: 'src-1',
            title: 'IEEE Transactions on Neural Networks & Learning Systems',
            url: 'https://ieee.org/papers/nlp-growth-trends-2024',
            domain: 'ieee.org',
            matchedText: 'natural language processing has witnessed unprecedented growth over the last decade.',
            similarity: 98,
            confidence: 'high',
            sourceType: 'web',
            isMock: false,
            verified: true,
            quality: 'High',
          },
        ],
        hasWebMatch: true,
      },
      {
        id: 'match-2',
        matchId: 'match-2',
        classification: 'semantic_match',
        type: 'semantic',
        score: 75,
        similarityScore: 75,
        sourceId: 'src-2',
        originalText: 'Transformer architectures utilize multi-head self-attention mechanisms to capture contextual dependencies across extensive text passages.',
        matchedText: 'Self-attention mechanisms in transformer networks capture long-range contextual relationships.',
        startIndex: 300,
        endIndex: 442,
        confidence: 'high',
        explanation: 'High semantic alignment with Vaswani et al. (Attention Is All You Need).',
        evidence: {
          geminiAnalysis: {
            classification: 'semantic_match',
            score: 75,
            confidence: 'high',
            reason: 'High semantic alignment with Vaswani et al. (Attention Is All You Need).',
          },
        },
        sources: [
          {
            id: 'src-2',
            title: 'NeurIPS Advances in Neural Information Processing Systems',
            url: 'https://proceedings.neurips.cc/paper/2017/file/attention',
            domain: 'neurips.cc',
            matchedText: 'Self-attention mechanisms in transformer networks capture long-range contextual relationships.',
            similarity: 75,
            confidence: 'high',
            sourceType: 'web',
            isMock: false,
            verified: true,
            quality: 'High',
          },
        ],
        hasWebMatch: true,
      },
    ],
    sources: [
      {
        id: 'src-1',
        title: 'IEEE Transactions on Neural Networks & Learning Systems',
        url: 'https://ieee.org/papers/nlp-growth-trends-2024',
        domain: 'ieee.org',
        matchedText: 'natural language processing has witnessed unprecedented growth over the last decade.',
        similarity: 98,
        confidence: 'high',
        sourceType: 'web',
        isMock: false,
        verified: true,
        quality: 'High',
      },
      {
        id: 'src-2',
        title: 'NeurIPS Advances in Neural Information Processing Systems',
        url: 'https://proceedings.neurips.cc/paper/2017/file/attention',
        domain: 'neurips.cc',
        matchedText: 'Self-attention mechanisms in transformer networks capture long-range contextual relationships.',
        similarity: 75,
        confidence: 'high',
        sourceType: 'web',
        isMock: false,
        verified: true,
        quality: 'High',
      },
    ],
    disclaimer:
      'Similarity results are automated indicators and should be reviewed by a human. A similarity match does not by itself establish plagiarism.',
    analysisQuality: {
      localAnalysis: 'Complete',
      aiAnalysis: 'Complete',
      webVerification: 'Complete',
    },
  },
  {
    id: 'scan-mock-2',
    documentName: 'Thesis_Draft.docx',
    wordCount: 9241,
    fileSize: 8.2 * 1024 * 1024,
    similarityScore: 17,
    exactMatchScore: 6,
    nearMatchScore: 2,
    paraphraseScore: 7,
    semanticScore: 2,
    webVerifiedScore: 6,
    originalScore: 83,
    confidence: 'high',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), // Yesterday
    detectionOptions: {
      exactMatch: true,
      semanticSimilarity: true,
      paraphraseDetection: true,
      repeatedContent: true,
      depth: 'deep',
    },
    originalText: `The rapid proliferation of generative artificial intelligence models has revolutionized digital content creation. Educational institutions are re-evaluating traditional assessment methodologies to adapt to automated writing tools.

    Artificial intelligence system architecture and data privacy guidelines must be enforced across institutional repositories. It is widely believed that proactive detection engines can foster original scholarship while encouraging ethical AI integration.`,
    matches: [
      {
        id: 'match-2-1',
        matchId: 'match-2-1',
        classification: 'paraphrase',
        type: 'paraphrase',
        score: 82,
        similarityScore: 82,
        sourceId: 'src-2-1',
        originalText: 'The rapid proliferation of generative artificial intelligence models has revolutionized digital content creation.',
        matchedText: 'Generative AI tools have rapidly altered how content is created across digital media.',
        startIndex: 0,
        endIndex: 110,
        confidence: 'medium',
        explanation: 'Paraphrased concept matching Stanford AI Index Report.',
        evidence: {
          geminiAnalysis: {
            classification: 'paraphrase',
            score: 82,
            confidence: 'medium',
            reason: 'Paraphrased concept matching Stanford AI Index Report.',
          },
        },
        sources: [
          {
            id: 'src-2-1',
            title: 'Stanford Human-Centered AI Progress Report',
            url: 'https://hai.stanford.edu/ai-index-report',
            domain: 'stanford.edu',
            matchedText: 'Generative AI tools have rapidly altered how content is created across digital media.',
            similarity: 82,
            confidence: 'medium',
            sourceType: 'web',
            isMock: false,
            verified: true,
            quality: 'High',
          },
        ],
        hasWebMatch: true,
      },
    ],
    sources: [
      {
        id: 'src-2-1',
        title: 'Stanford Human-Centered AI Progress Report',
        url: 'https://hai.stanford.edu/ai-index-report',
        domain: 'stanford.edu',
        matchedText: 'Generative AI tools have rapidly altered how content is created across digital media.',
        similarity: 82,
        confidence: 'medium',
        sourceType: 'web',
        isMock: false,
        verified: true,
        quality: 'High',
      },
    ],
    disclaimer:
      'Similarity results are automated indicators and should be reviewed by a human. A similarity match does not by itself establish plagiarism.',
    analysisQuality: {
      localAnalysis: 'Complete',
      aiAnalysis: 'Complete',
      webVerification: 'Complete',
    },
  },
  {
    id: 'scan-mock-3',
    documentName: 'Literature_Review.pdf',
    wordCount: 3120,
    fileSize: 2.1 * 1024 * 1024,
    similarityScore: 4,
    exactMatchScore: 1,
    nearMatchScore: 0,
    paraphraseScore: 2,
    semanticScore: 1,
    webVerifiedScore: 0,
    originalScore: 96,
    confidence: 'high',
    status: 'completed',
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
    detectionOptions: {
      exactMatch: true,
      semanticSimilarity: true,
      paraphraseDetection: true,
      repeatedContent: true,
      depth: 'standard',
    },
    originalText: `This literature review summarizes key advancements in modern web architectures and client-side optimization techniques. Micro-frontend applications provide modularity and independent deployment capabilities across distributed teams.`,
    matches: [],
    sources: [],
    disclaimer:
      'Similarity results are automated indicators and should be reviewed by a human. A similarity match does not by itself establish plagiarism.',
    analysisQuality: {
      localAnalysis: 'Complete',
      aiAnalysis: 'Complete',
      webVerification: 'Complete',
    },
  },
];

export function getAllAnalyses(): AnalysisResult[] {
  if (typeof window === 'undefined') return MOCK_PREPOPULATED_SCANS;
  
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_PREPOPULATED_SCANS));
      return MOCK_PREPOPULATED_SCANS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return MOCK_PREPOPULATED_SCANS;
  }
}

export function getAnalysis(id: string): AnalysisResult | null {
  const list = getAllAnalyses();
  return list.find((a) => a.id === id) || null;
}

export function createAnalysis(result: AnalysisResult): void {
  if (typeof window === 'undefined') return;
  const list = getAllAnalyses();
  const updated = [result, ...list];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export const saveAnalysis = createAnalysis;

export function updateAnalysis(id: string, updates: Partial<AnalysisResult>): void {
  if (typeof window === 'undefined') return;
  const list = getAllAnalyses();
  const idx = list.findIndex((a) => a.id === id);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
}

export function deleteAnalysis(id: string): void {
  if (typeof window === 'undefined') return;
  const list = getAllAnalyses();
  const filtered = list.filter((a) => a.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearAllAnalyses(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
}
