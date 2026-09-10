import type { Match } from '../types/analysis';

export interface EvidenceLockerItem {
  id: string; // evidenceItemId
  matchId: string;
  documentId: string;
  versionId?: string;
  analysisId: string;
  originalText: string;
  matchedText: string;
  sourceTitle: string;
  sourceDomain: string;
  sourceUrl: string;
  similarity: number;
  confidence: 'low' | 'medium' | 'high';
  matchType: string;
  userNote?: string;
  collectionId?: string;
  savedAt: string;
}

export interface EvidenceCollection {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}

const STORAGE_KEY = 'plagora_evidence_locker';
const COLLECTIONS_KEY = 'plagora_evidence_collections';

export function getSavedEvidenceItems(): EvidenceLockerItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveEvidenceItem(
  match: Match,
  documentId: string,
  analysisId: string,
  userNote?: string,
  collectionId?: string
): EvidenceLockerItem {
  const items = getSavedEvidenceItems();
  const source = match.sources?.[0];

  const newItem: EvidenceLockerItem = {
    id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    matchId: match.id,
    documentId,
    analysisId,
    originalText: match.originalText,
    matchedText: match.matchedText,
    sourceTitle: source?.title || source?.domain || 'Web Source',
    sourceDomain: source?.domain || 'web-source',
    sourceUrl: source?.url || '',
    similarity: match.similarityScore || match.score || 0,
    confidence: match.confidence,
    matchType: match.type,
    userNote,
    collectionId,
    savedAt: new Date().toISOString(),
  };

  items.unshift(newItem);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return newItem;
}

export function removeEvidenceItem(id: string): void {
  const items = getSavedEvidenceItems();
  const filtered = items.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function getEvidenceCollections(): EvidenceCollection[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(COLLECTIONS_KEY);
    if (raw) return JSON.parse(raw);
    const defaults: EvidenceCollection[] = [
      { id: 'col-research', name: 'Research Paper Evidence', createdAt: new Date().toISOString() },
      { id: 'col-citations', name: 'Citation Review', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(defaults));
    return defaults;
  } catch (e) {
    return [];
  }
}

export function createEvidenceCollection(name: string): EvidenceCollection {
  const collections = getEvidenceCollections();
  const newCol: EvidenceCollection = {
    id: `col-${Date.now()}`,
    name,
    createdAt: new Date().toISOString(),
  };
  collections.push(newCol);
  localStorage.setItem(COLLECTIONS_KEY, JSON.stringify(collections));
  return newCol;
}
