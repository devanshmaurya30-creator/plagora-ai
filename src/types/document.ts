export type FileState = 
  | 'EMPTY' 
  | 'SELECTED' 
  | 'READING' 
  | 'EXTRACTING' 
  | 'READY' 
  | 'ANALYZING' 
  | 'COMPLETED' 
  | 'ERROR';

export type SupportedFileType = 'pdf' | 'docx' | 'txt';

export interface DocumentMetadata {
  extractedAt: string;
  parserUsed: string;
  encoding?: string;
  pageCount?: number;
}

export interface ParsedDocument {
  fileName: string;
  fileType: SupportedFileType;
  fileSize: number; // Bytes
  originalText: string;
  processedText: string;
  wordCount: number;
  characterCount: number;
  pageCount: number;
  metadata: DocumentMetadata;
}

export interface DocumentChunk {
  chunkId: string;
  text: string;
  startIndex: number;
  endIndex: number;
  paragraphIndex: number;
  sentenceIndex?: number;
}
