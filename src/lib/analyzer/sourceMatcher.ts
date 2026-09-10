import type { Match, Source } from '../../types/analysis';

export function matchSources(matches: Match[]): Source[] {
  const sourcesMap = new Map<string, Source>();

  // Pre-configured mock sources matching analysis types
  const defaultMockSources: Source[] = [
    {
      id: 'src-arxiv-org',
      title: '[Mock Source] Journal of Artificial Intelligence & Machine Learning Research (2024)',
      url: 'https://arxiv.org/abs/2103.09871',
      domain: 'arxiv.org',
      matchedText: 'Natural language processing has witnessed unprecedented growth over the last decade...',
      similarity: 98,
      confidence: 'high',
      sourceType: 'web',
      isMock: true,
    },
    {
      id: 'src-neurips-cc',
      title: '[Mock Source] NeurIPS Proceedings: Attention & Transformer Mechanics',
      url: 'https://proceedings.neurips.cc/paper/2017/file/attention',
      domain: 'neurips.cc',
      matchedText: 'Transformer architectures utilize multi-head self-attention mechanisms to capture contextual dependencies...',
      similarity: 94,
      confidence: 'high',
      sourceType: 'document',
      isMock: true,
    },
    {
      id: 'src-mit-edu',
      title: '[Mock Source] MIT Academic Repository: Global AI Governance and Data Standards',
      url: 'https://mit.edu/research/ai-governance-2025',
      domain: 'mit.edu',
      matchedText: 'Artificial intelligence system architecture and data privacy guidelines...',
      similarity: 78,
      confidence: 'medium',
      sourceType: 'database',
      isMock: true,
    },
    {
      id: 'src-stanford-edu',
      title: '[Mock Source] Stanford HAI AI Index Annual Progress Report',
      url: 'https://hai.stanford.edu/ai-index-report',
      domain: 'stanford.edu',
      matchedText: 'The rapid proliferation of generative artificial intelligence models has revolutionized digital content creation...',
      similarity: 65,
      confidence: 'medium',
      sourceType: 'web',
      isMock: true,
    },
  ];

  if (matches.length === 0) {
    return [];
  }

  // Pick relevant sources based on matches or map matched items
  matches.forEach((m) => {
    if (m.type === 'exact') {
      sourcesMap.set(defaultMockSources[0].id, defaultMockSources[0]);
    } else if (m.type === 'paraphrase') {
      sourcesMap.set(defaultMockSources[1].id, defaultMockSources[1]);
    } else if (m.type === 'semantic') {
      sourcesMap.set(defaultMockSources[2].id, defaultMockSources[2]);
    }
  });

  if (sourcesMap.size === 0) {
    sourcesMap.set(defaultMockSources[3].id, defaultMockSources[3]);
  }

  return Array.from(sourcesMap.values());
}
