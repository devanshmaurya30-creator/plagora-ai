/**
 * Text processing and normalization utilities for Plagora AI.
 * Never mutates original document text permanently.
 */

export const MIN_MATCH_WORDS = 5;
export const MIN_MATCH_CHARACTERS = 25;

export const COMMON_ACADEMIC_PHRASES = new Set([
  'according to the study',
  'in conclusion',
  'artificial intelligence',
  'as shown above',
  'the results indicate that',
  'furthermore the findings show',
  'it is widely believed that',
  'on the other hand',
  'in recent years',
  'a growing body of research',
  'for the purpose of',
  'in order to determine',
  'as previously discussed',
]);

export function normalizeWhitespace(text: string): string {
  return text.replace(/[\r\n\t]+/g, ' ').trim();
}

export function normalizeQuotes(text: string): string {
  return text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'");
}

export function normalizeDashes(text: string): string {
  return text.replace(/[\u2013\u2014]/g, '-');
}

export function removeRepeatedWhitespace(text: string): string {
  return text.replace(/ +/g, ' ');
}

export function cleanText(text: string): string {
  let cleaned = normalizeQuotes(text);
  cleaned = normalizeDashes(cleaned);
  cleaned = removeRepeatedWhitespace(cleaned);
  return cleaned;
}

/**
 * Normalizes text specifically for string comparison algorithms.
 * Lowercases, strips punctuation, and normalizes spacing.
 */
export function normalizeForComparison(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isCommonPhrase(text: string): boolean {
  const norm = normalizeForComparison(text);
  if (COMMON_ACADEMIC_PHRASES.has(norm)) return true;
  const wordCount = norm.split(' ').length;
  if (wordCount < MIN_MATCH_WORDS || text.length < MIN_MATCH_CHARACTERS) return true;
  return false;
}

export function isQuotation(text: string): boolean {
  if (!text) return false;
  const trimmed = text.trim();
  // Check for surrounding double/single quotes or blockquote markers
  const startsWithQuote = /^["'“‘]/.test(trimmed);
  const endsWithQuote = /["'”’]$/.test(trimmed);
  return startsWithQuote && endsWithQuote;
}

export function splitIntoSentences(text: string): string[] {
  if (!text) return [];
  const regex = /[^.!?]+[.!?]+(?=\s|$)/g;
  const matches = text.match(regex);
  if (!matches) {
    return [text.trim()].filter(Boolean);
  }
  return matches.map((s) => s.trim()).filter(Boolean);
}

export function splitIntoParagraphs(text: string): string[] {
  if (!text) return [];
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function countWords(text: string): number {
  if (!text || text.trim() === '') return 0;
  return text.trim().split(/\s+/).length;
}
