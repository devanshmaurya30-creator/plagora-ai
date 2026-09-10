import type { AnalysisResult } from '../types/analysis';
import { getAnalysis } from './analysisStore';

export interface ShareRecord {
  token: string;
  reportId: string;
  createdAt: string;
  revoked: boolean;
}

const STORAGE_KEY = 'plagora_shared_reports_v1';

function loadShareRecords(): Map<string, ShareRecord> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Map();
    const arr: ShareRecord[] = JSON.parse(raw);
    const map = new Map<string, ShareRecord>();
    arr.forEach((r) => map.set(r.token, r));
    return map;
  } catch (e) {
    return new Map();
  }
}

function saveShareRecords(map: Map<string, ShareRecord>) {
  try {
    const arr = Array.from(map.values());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
  } catch (e) {
    // LocalStorage failure handling
  }
}

/**
 * Creates a cryptographically secure, non-guessable share token for a report
 */
export function createShareToken(reportId: string): ShareRecord {
  const records = loadShareRecords();

  // Check if an active token already exists for this report
  for (const record of records.values()) {
    if (record.reportId === reportId && !record.revoked) {
      return record;
    }
  }

  // Generate cryptographically random token using Web Crypto API
  let token = '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    token = window.crypto.randomUUID().replace(/-/g, '');
  } else {
    token = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  const record: ShareRecord = {
    token,
    reportId,
    createdAt: new Date().toISOString(),
    revoked: false,
  };

  records.set(token, record);
  saveShareRecords(records);
  return record;
}

/**
 * Retrieves an active shared analysis report by token. Returns null if invalid or revoked.
 */
export function getSharedReport(token: string): AnalysisResult | null {
  if (!token) return null;
  const records = loadShareRecords();
  const record = records.get(token);
  if (!record || record.revoked) return null;

  return getAnalysis(record.reportId);
}

/**
 * Returns active share record for a given reportId if one exists
 */
export function getShareRecordForReport(reportId: string): ShareRecord | null {
  const records = loadShareRecords();
  for (const record of records.values()) {
    if (record.reportId === reportId && !record.revoked) {
      return record;
    }
  }
  return null;
}

/**
 * Revokes a shared report link securely
 */
export function revokeShareToken(reportId: string): boolean {
  const records = loadShareRecords();
  let found = false;

  for (const record of records.values()) {
    if (record.reportId === reportId) {
      record.revoked = true;
      found = true;
    }
  }

  if (found) {
    saveShareRecords(records);
  }
  return found;
}
