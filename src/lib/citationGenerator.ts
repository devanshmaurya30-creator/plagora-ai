import type { Source, CitationStyle, SourceCitation } from '../types/analysis';
import { sanitizeUrl } from './urlSanitizer';

/**
 * Clean string helper to remove undefined / null / unknown / placeholder values
 */
function cleanValue(val?: string | null): string | undefined {
  if (!val) return undefined;
  const trimmed = val.trim();
  if (
    !trimmed ||
    trimmed.toLowerCase() === 'unknown' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed.toLowerCase() === 'n/a'
  ) {
    return undefined;
  }
  return trimmed;
}

/**
 * Formats bibliographic citations deterministically from real source metadata
 */
export function generateCitation(source: Source, style: CitationStyle = 'APA'): SourceCitation {
  const safeUrl = sanitizeUrl(source.url || '');
  const title = cleanValue(source.title) || cleanValue(source.domain) || 'Published Online Document';
  const domain = cleanValue(source.domain) || 'Web Source';
  const accessYear = new Date().getFullYear();

  // Try extracting publisher or domain
  const publisher = domain.replace(/^www\./i, '');

  let formatted = '';

  switch (style) {
    case 'APA':
      formatted = `${publisher}. (${accessYear}). ${title}. ${safeUrl || ''}`.trim();
      break;

    case 'MLA':
      formatted = `"${title}." ${publisher}, ${accessYear}, ${safeUrl || ''}.`.trim();
      break;

    case 'Chicago':
      formatted = `"${title}." ${publisher}. Accessed ${accessYear}. ${safeUrl || ''}.`.trim();
      break;

    case 'Harvard':
      formatted = `${publisher} (${accessYear}) '${title}'. Available at: ${safeUrl || ''} (Accessed: ${accessYear}).`.trim();
      break;

    default:
      formatted = `${publisher}. (${accessYear}). ${title}. ${safeUrl || ''}`.trim();
  }

  return {
    sourceId: source.id,
    style,
    formattedCitation: formatted,
    metadata: {
      title,
      url: safeUrl || '',
      domain,
      publisher,
      publishedDate: String(accessYear),
    },
  };
}
