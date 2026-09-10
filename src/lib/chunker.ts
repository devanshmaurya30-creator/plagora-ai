import type { DocumentChunk } from '../types/document';
import { splitIntoParagraphs, splitIntoSentences } from './textProcessor';

export interface ChunkerOptions {
  maxChunkSize?: number; // Target max characters per chunk (e.g. 500)
  overlap?: number; // Overlap characters between chunks if needed
}

export function chunkDocument(
  text: string,
  options: ChunkerOptions = {}
): DocumentChunk[] {
  const maxChunkSize = options.maxChunkSize || 500;
  const chunks: DocumentChunk[] = [];
  
  if (!text || text.trim() === '') {
    return chunks;
  }

  const paragraphs = splitIntoParagraphs(text);
  let chunkCounter = 0;
  let currentIndex = 0;

  paragraphs.forEach((paragraph, pIdx) => {
    // Find starting index of paragraph in original text
    const pStartIndex = text.indexOf(paragraph, currentIndex);
    const pEndIndex = pStartIndex !== -1 ? pStartIndex + paragraph.length : currentIndex + paragraph.length;
    
    if (pStartIndex !== -1) {
      currentIndex = pEndIndex;
    }

    if (paragraph.length <= maxChunkSize) {
      chunkCounter++;
      chunks.push({
        chunkId: `chunk-${chunkCounter}`,
        text: paragraph,
        startIndex: pStartIndex !== -1 ? pStartIndex : 0,
        endIndex: pEndIndex,
        paragraphIndex: pIdx,
      });
    } else {
      // Split large paragraph into sentences
      const sentences = splitIntoSentences(paragraph);
      let currentSentenceChunk = '';
      let sStartIndex = pStartIndex !== -1 ? pStartIndex : 0;
      
      sentences.forEach((sentence, sIdx) => {
        if ((currentSentenceChunk + ' ' + sentence).length > maxChunkSize && currentSentenceChunk !== '') {
          chunkCounter++;
          const sEndIndex = sStartIndex + currentSentenceChunk.length;
          chunks.push({
            chunkId: `chunk-${chunkCounter}`,
            text: currentSentenceChunk.trim(),
            startIndex: sStartIndex,
            endIndex: sEndIndex,
            paragraphIndex: pIdx,
            sentenceIndex: sIdx,
          });
          
          sStartIndex = sEndIndex + 1;
          currentSentenceChunk = sentence;
        } else {
          currentSentenceChunk = currentSentenceChunk ? `${currentSentenceChunk} ${sentence}` : sentence;
        }
      });

      if (currentSentenceChunk.trim() !== '') {
        chunkCounter++;
        chunks.push({
          chunkId: `chunk-${chunkCounter}`,
          text: currentSentenceChunk.trim(),
          startIndex: sStartIndex,
          endIndex: sStartIndex + currentSentenceChunk.length,
          paragraphIndex: pIdx,
        });
      }
    }
  });

  return chunks;
}
