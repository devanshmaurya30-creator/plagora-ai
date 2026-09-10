import type { AnalysisResult, Match } from '../types/analysis';
import { getAllAnalyses, getAnalysis, saveAnalysis } from './analysisStore';
import { computeWordDiff } from './diffEngine';

export type AnalysisStatus = 'not_analyzed' | 'analyzing' | 'completed' | 'outdated' | 'failed';

export interface DocumentVersion {
  id: string; // versionId
  documentId: string;
  versionNumber: number;
  label: string; // e.g. "v1", "v2", "v3 (Restored from v1)"
  originalText: string;
  wordCount: number;
  characterCount: number;
  createdAt: string;
  analysisId?: string;
  analysisStatus: AnalysisStatus;
  similarityScore?: number;
  changeNote?: string;
}

export interface WorkspaceDocument {
  id: string; // documentId
  name: string;
  fileType: 'pdf' | 'docx' | 'txt';
  fileSize: number;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  currentVersionId: string;
  versions: DocumentVersion[];
  status: AnalysisStatus;
}

export interface MatchChangeSummary {
  newMatches: Match[];
  resolvedMatches: Match[];
  unchangedMatches: Match[];
  changedMatches: Match[];
  similarityDelta: number; // e.g. -7
  matchesDelta: number; // e.g. -5
  affectedWordsDelta: number;
  sourcesDelta: number;
  summaryText: string;
}

const WORKSPACE_STORAGE_KEY = 'plagora_workspace_documents';

/**
 * Ensures legacy analyses in localStorage are cleanly migrated into WorkspaceDocuments
 */
export function getAllWorkspaceDocuments(): WorkspaceDocument[] {
  if (typeof window === 'undefined') return [];

  let docs: WorkspaceDocument[] = [];
  try {
    const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (raw) {
      docs = JSON.parse(raw);
    }
  } catch (e) {
    docs = [];
  }

  // Hydrate with analyses from analysisStore if missing
  const allAnalyses = getAllAnalyses();
  let updated = false;

  allAnalyses.forEach((analysis) => {
    const existingDoc = docs.find((d) => d.id === analysis.id || d.versions.some((v) => v.analysisId === analysis.id));
    if (!existingDoc) {
      const ext = analysis.documentName.split('.').pop()?.toLowerCase();
      const fileType: 'pdf' | 'docx' | 'txt' = ext === 'pdf' ? 'pdf' : ext === 'docx' ? 'docx' : 'txt';

      const versionId = `ver-${analysis.id}-1`;
      const version: DocumentVersion = {
        id: versionId,
        documentId: analysis.id,
        versionNumber: 1,
        label: 'v1 Initial Upload',
        originalText: analysis.originalText || '',
        wordCount: analysis.wordCount || 0,
        characterCount: (analysis.originalText || '').length,
        createdAt: analysis.createdAt,
        analysisId: analysis.id,
        analysisStatus: 'completed',
        similarityScore: analysis.similarityScore,
        changeNote: 'Initial upload & analysis',
      };

      const newDoc: WorkspaceDocument = {
        id: analysis.id,
        name: analysis.documentName,
        fileType,
        fileSize: analysis.fileSize || 1024 * 50,
        wordCount: analysis.wordCount || 0,
        createdAt: analysis.createdAt,
        updatedAt: analysis.createdAt,
        currentVersionId: versionId,
        versions: [version],
        status: 'completed',
      };

      docs.unshift(newDoc);
      updated = true;
    }
  });

  if (updated) {
    saveWorkspaceDocuments(docs);
  }

  return docs;
}

export function saveWorkspaceDocuments(docs: WorkspaceDocument[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(docs));
}

export function getWorkspaceDocument(id: string): WorkspaceDocument | null {
  const docs = getAllWorkspaceDocuments();
  return docs.find((d) => d.id === id) || null;
}

export function createWorkspaceDocument(
  name: string,
  fileType: 'pdf' | 'docx' | 'txt',
  fileSize: number,
  originalText: string,
  analysis?: AnalysisResult
): WorkspaceDocument {
  const docs = getAllWorkspaceDocuments();
  const docId = analysis?.id || `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const versionId = `ver-${docId}-1`;
  const words = originalText.trim().split(/\s+/).filter(Boolean).length;
  const now = new Date().toISOString();

  const v1: DocumentVersion = {
    id: versionId,
    documentId: docId,
    versionNumber: 1,
    label: 'v1 Initial Upload',
    originalText,
    wordCount: words,
    characterCount: originalText.length,
    createdAt: now,
    analysisId: analysis?.id,
    analysisStatus: analysis ? 'completed' : 'not_analyzed',
    similarityScore: analysis?.similarityScore,
    changeNote: 'Initial upload',
  };

  const newDoc: WorkspaceDocument = {
    id: docId,
    name,
    fileType,
    fileSize,
    wordCount: words,
    createdAt: now,
    updatedAt: now,
    currentVersionId: versionId,
    versions: [v1],
    status: analysis ? 'completed' : 'not_analyzed',
  };

  if (analysis) {
    saveAnalysis(analysis);
  }

  docs.unshift(newDoc);
  saveWorkspaceDocuments(docs);
  return newDoc;
}

export function addDocumentVersion(
  documentId: string,
  newText: string,
  changeNote: string = 'Content updated',
  analysis?: AnalysisResult
): { document: WorkspaceDocument; version: DocumentVersion } | null {
  const docs = getAllWorkspaceDocuments();
  const doc = docs.find((d) => d.id === documentId);
  if (!doc) return null;

  const nextVerNum = doc.versions.length + 1;
  const versionId = `ver-${documentId}-${nextVerNum}`;
  const words = newText.trim().split(/\s+/).filter(Boolean).length;
  const now = new Date().toISOString();

  const newVersion: DocumentVersion = {
    id: versionId,
    documentId,
    versionNumber: nextVerNum,
    label: `v${nextVerNum} ${changeNote}`,
    originalText: newText,
    wordCount: words,
    characterCount: newText.length,
    createdAt: now,
    analysisId: analysis?.id,
    analysisStatus: analysis ? 'completed' : 'outdated',
    similarityScore: analysis?.similarityScore,
    changeNote,
  };

  doc.versions.unshift(newVersion);
  doc.currentVersionId = versionId;
  doc.wordCount = words;
  doc.updatedAt = now;
  doc.status = analysis ? 'completed' : 'outdated';

  if (analysis) {
    saveAnalysis(analysis);
  }

  saveWorkspaceDocuments(docs);
  return { document: doc, version: newVersion };
}

export function restoreDocumentVersion(
  documentId: string,
  targetVersionId: string
): { document: WorkspaceDocument; version: DocumentVersion } | null {
  const docs = getAllWorkspaceDocuments();
  const doc = docs.find((d) => d.id === documentId);
  if (!doc) return null;

  const targetVer = doc.versions.find((v) => v.id === targetVersionId);
  if (!targetVer) return null;

  // Create a new version derived from target version (Restore safety!)
  const nextVerNum = doc.versions.length + 1;
  const versionId = `ver-${documentId}-${nextVerNum}`;
  const now = new Date().toISOString();

  const restoredVersion: DocumentVersion = {
    id: versionId,
    documentId,
    versionNumber: nextVerNum,
    label: `v${nextVerNum} (Restored from v${targetVer.versionNumber})`,
    originalText: targetVer.originalText,
    wordCount: targetVer.wordCount,
    characterCount: targetVer.characterCount,
    createdAt: now,
    analysisId: targetVer.analysisId,
    analysisStatus: targetVer.analysisId ? 'completed' : 'not_analyzed',
    similarityScore: targetVer.similarityScore,
    changeNote: `Restored content from v${targetVer.versionNumber}`,
  };

  doc.versions.unshift(restoredVersion);
  doc.currentVersionId = versionId;
  doc.wordCount = targetVer.wordCount;
  doc.updatedAt = now;
  doc.status = targetVer.analysisId ? 'completed' : 'not_analyzed';

  saveWorkspaceDocuments(docs);
  return { document: doc, version: restoredVersion };
}

export function renameWorkspaceDocument(documentId: string, newName: string): void {
  const docs = getAllWorkspaceDocuments();
  const doc = docs.find((d) => d.id === documentId);
  if (doc) {
    doc.name = newName;
    doc.updatedAt = new Date().toISOString();
    saveWorkspaceDocuments(docs);
  }
}

export function deleteWorkspaceDocument(documentId: string): void {
  const docs = getAllWorkspaceDocuments();
  const filtered = docs.filter((d) => d.id !== documentId);
  saveWorkspaceDocuments(filtered);
}

export function updateVersionAnalysisResult(
  documentId: string,
  versionId: string,
  analysis: AnalysisResult
): void {
  const docs = getAllWorkspaceDocuments();
  const doc = docs.find((d) => d.id === documentId);
  if (doc) {
    const ver = doc.versions.find((v) => v.id === versionId);
    if (ver) {
      ver.analysisId = analysis.id;
      ver.analysisStatus = 'completed';
      ver.similarityScore = analysis.similarityScore;
    }
    if (doc.currentVersionId === versionId) {
      doc.status = 'completed';
    }
    doc.updatedAt = new Date().toISOString();
    saveAnalysis(analysis);
    saveWorkspaceDocuments(docs);
  }
}

/**
 * Compares two document versions and derives smart match change telemetry
 */
export function compareDocumentVersions(
  verA: DocumentVersion,
  verB: DocumentVersion
): MatchChangeSummary {
  const analysisA = verA.analysisId ? getAnalysis(verA.analysisId) : null;
  const analysisB = verB.analysisId ? getAnalysis(verB.analysisId) : null;

  const matchesA = analysisA?.matches || [];
  const matchesB = analysisB?.matches || [];

  const simA = analysisA?.similarityScore || 0;
  const simB = analysisB?.similarityScore || 0;
  const similarityDelta = simB - simA;

  const newMatches: Match[] = [];
  const resolvedMatches: Match[] = [];
  const unchangedMatches: Match[] = [];
  const changedMatches: Match[] = [];

  matchesB.forEach((mB) => {
    const matchedInA = matchesA.find(
      (mA) =>
        mA.originalText.trim() === mB.originalText.trim() ||
        (mA.sourceId && mA.sourceId === mB.sourceId)
    );
    if (!matchedInA) {
      newMatches.push(mB);
    } else if (matchedInA.similarityScore === mB.similarityScore) {
      unchangedMatches.push(mB);
    } else {
      changedMatches.push(mB);
    }
  });

  matchesA.forEach((mA) => {
    const matchedInB = matchesB.find(
      (mB) =>
        mB.originalText.trim() === mA.originalText.trim() ||
        (mB.sourceId && mB.sourceId === mA.sourceId)
    );
    if (!matchedInB) {
      resolvedMatches.push(mA);
    }
  });

  const sourcesA = analysisA?.sources?.length || 0;
  const sourcesB = analysisB?.sources?.length || 0;

  const diffResult = computeWordDiff(verA.originalText, verB.originalText);
  const affectedWordsDelta = diffResult.addedCount - diffResult.removedCount;

  let summaryText = '';
  if (similarityDelta < 0) {
    summaryText = `Detected similarity decreased by ${Math.abs(similarityDelta)}% (from ${simA}% to ${simB}%).`;
  } else if (similarityDelta > 0) {
    summaryText = `Detected similarity increased by ${similarityDelta}% (from ${simA}% to ${simB}%).`;
  } else {
    summaryText = `Overall similarity concentration remained at ${simA}%.`;
  }

  return {
    newMatches,
    resolvedMatches,
    unchangedMatches,
    changedMatches,
    similarityDelta,
    matchesDelta: matchesB.length - matchesA.length,
    affectedWordsDelta,
    sourcesDelta: sourcesB - sourcesA,
    summaryText,
  };
}
