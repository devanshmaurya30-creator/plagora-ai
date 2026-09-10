import { generatePDFReport } from '../../src/lib/pdfGenerator';
import type { AnalysisResult } from '../../src/types/analysis';

async function testPdfReportGeneration() {
  console.log('--- Testing Upgraded Multi-Page Enterprise PDF Report Generation ---');

  const mockAnalysis: AnalysisResult = {
    id: 'scan-test-enterprise-99',
    documentName: 'Academic_Research_Paper_Transformers.pdf',
    wordCount: 3450,
    fileSize: 1048576,
    similarityScore: 24,
    exactMatchScore: 8,
    nearMatchScore: 4,
    paraphraseScore: 7,
    semanticScore: 5,
    webVerifiedScore: 12,
    originalScore: 76,
    confidence: 'high',
    status: 'completed',
    createdAt: new Date().toISOString(),
    originalText: 'Artificial intelligence and natural language processing have experienced monumental shifts...',
    detectionOptions: {
      exactMatch: true,
      semanticSimilarity: true,
      paraphraseDetection: true,
      repeatedContent: true,
      depth: 'deep',
    },
    disclaimer: 'Similarity results are automated indicators and should be reviewed by a human.',
    analysisQuality: {
      localAnalysis: 'Complete',
      aiAnalysis: 'Complete',
      webVerification: 'Complete',
    },
    matches: [
      {
        id: 'match-1',
        matchId: 'match-1',
        type: 'exact',
        sourceId: 'src-1',
        originalText: 'Natural language processing has witnessed unprecedented growth over the last decade driven by transformer models.',
        matchedText: 'Natural language processing has witnessed unprecedented growth over the last decade driven by deep learning.',
        startIndex: 0,
        endIndex: 110,
        similarityScore: 88,
        score: 88,
        classification: 'exact_match',
        confidence: 'high',
        explanation: 'Verbatim phrase match against published computer science literature.',
        evidence: {
          localMatch: { similarityScore: 88, algorithm: 'ngram_hash' },
          webVerification: {
            verified: true,
            url: 'https://proceedings.neurips.cc/paper/2017/file/attention',
            domain: 'neurips.cc',
          },
        },
        sources: [
          {
            id: 'src-1',
            title: 'NeurIPS Proceedings: Attention & Transformer Mechanics',
            url: 'https://proceedings.neurips.cc/paper/2017/file/attention',
            domain: 'neurips.cc',
            matchedText: 'Natural language processing has witnessed unprecedented growth over the last decade...',
            similarity: 88,
            confidence: 'high',
            sourceType: 'web',
            isMock: false,
            verified: true,
            quality: 'High',
          },
        ],
      },
    ],
    sources: [
      {
        id: 'src-1',
        title: 'NeurIPS Proceedings: Attention & Transformer Mechanics',
        url: 'https://proceedings.neurips.cc/paper/2017/file/attention',
        domain: 'neurips.cc',
        matchedText: 'Natural language processing has witnessed unprecedented growth...',
        similarity: 88,
        confidence: 'high',
        sourceType: 'web',
        isMock: false,
        verified: true,
        quality: 'High',
      },
    ],
  };

  await generatePDFReport(mockAnalysis, (status) => {
    console.log(`[PDF Progress] ${status}`);
  });

  console.log('✅ Enterprise PDF Report Generation Test PASSED');
}

testPdfReportGeneration().catch((err) => {
  console.error('❌ PDF Report Generation Test Failed:', err);
  process.exit(1);
});
