import { diffWords } from 'diff';

export interface DiffToken {
  value: string;
  type: 'added' | 'removed' | 'changed' | 'unchanged';
}

/**
 * Computes word-level diff between original document text and reference text.
 */
export function computeWordDiff(originalText: string, referenceText: string): {
  originalTokens: DiffToken[];
  referenceTokens: DiffToken[];
  addedCount: number;
  removedCount: number;
  unchangedCount: number;
} {
  const changes = diffWords(originalText || '', referenceText || '', { ignoreCase: true });

  const originalTokens: DiffToken[] = [];
  const referenceTokens: DiffToken[] = [];

  let addedCount = 0;
  let removedCount = 0;
  let unchangedCount = 0;

  changes.forEach((change) => {
    if (change.added) {
      addedCount += change.value.trim().split(/\s+/).filter(Boolean).length;
      referenceTokens.push({ value: change.value, type: 'added' });
    } else if (change.removed) {
      removedCount += change.value.trim().split(/\s+/).filter(Boolean).length;
      originalTokens.push({ value: change.value, type: 'removed' });
    } else {
      unchangedCount += change.value.trim().split(/\s+/).filter(Boolean).length;
      originalTokens.push({ value: change.value, type: 'unchanged' });
      referenceTokens.push({ value: change.value, type: 'unchanged' });
    }
  });

  return {
    originalTokens,
    referenceTokens,
    addedCount,
    removedCount,
    unchangedCount,
  };
}
