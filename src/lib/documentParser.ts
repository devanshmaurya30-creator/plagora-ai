import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import type { ParsedDocument, SupportedFileType } from '../types/document';
import { cleanText, countWords } from './textProcessor';

// Configure local pdfjs worker
if (typeof window !== 'undefined' && pdfjsLib.GlobalWorkerOptions) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
}

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

export class DocumentParseError extends Error {
  code: string;
  constructor(message: string, code: string = 'PARSER_ERROR') {
    super(message);
    this.name = 'DocumentParseError';
    this.code = code;
  }
}

export async function parseDocument(file: File): Promise<ParsedDocument> {
  if (!file) {
    throw new DocumentParseError('No file provided.', 'NO_FILE');
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new DocumentParseError(
      `File exceeds maximum limit of 20 MB (Current: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`,
      'FILE_TOO_LARGE'
    );
  }

  const extension = file.name.split('.').pop()?.toLowerCase() as SupportedFileType;

  if (extension === 'txt' || file.type === 'text/plain') {
    return parseTXT(file);
  } else if (extension === 'pdf' || file.type === 'application/pdf') {
    return parsePDF(file);
  } else if (
    extension === 'docx' ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return parseDOCX(file);
  } else {
    throw new DocumentParseError(
      `Unsupported file format ".${extension}". Plagora AI supports PDF, DOCX, and TXT files.`,
      'UNSUPPORTED_FORMAT'
    );
  }
}

export async function parseTXT(file: File): Promise<ParsedDocument> {
  try {
    const rawText = await file.text();
    if (!rawText || rawText.trim() === '') {
      throw new DocumentParseError('The uploaded TXT file is empty.', 'EMPTY_FILE');
    }

    const processedText = cleanText(rawText);
    const wordCount = countWords(processedText);

    return {
      fileName: file.name,
      fileType: 'txt',
      fileSize: file.size,
      originalText: rawText,
      processedText,
      wordCount,
      characterCount: rawText.length,
      pageCount: Math.ceil(wordCount / 300) || 1,
      metadata: {
        extractedAt: new Date().toISOString(),
        parserUsed: 'Native File Text API',
      },
    };
  } catch (err: any) {
    if (err instanceof DocumentParseError) throw err;
    throw new DocumentParseError(`Failed to read TXT file: ${err.message}`, 'TXT_READ_FAILED');
  }
}

export async function parseDOCX(file: File): Promise<ParsedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const rawText = result.value;

    if (!rawText || rawText.trim() === '') {
      throw new DocumentParseError('No readable text found in this DOCX file.', 'EMPTY_FILE');
    }

    const processedText = cleanText(rawText);
    const wordCount = countWords(processedText);

    return {
      fileName: file.name,
      fileType: 'docx',
      fileSize: file.size,
      originalText: rawText,
      processedText,
      wordCount,
      characterCount: rawText.length,
      pageCount: Math.ceil(wordCount / 300) || 1,
      metadata: {
        extractedAt: new Date().toISOString(),
        parserUsed: 'Mammoth DOCX Parser',
      },
    };
  } catch (err: any) {
    if (err instanceof DocumentParseError) throw err;
    throw new DocumentParseError(
      `Could not read DOCX document. File may be corrupted or password-protected.`,
      'DOCX_READ_FAILED'
    );
  }
}

export async function parsePDF(file: File): Promise<ParsedDocument> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageStrings + '\n\n';
    }

    if (!fullText || fullText.trim() === '') {
      throw new DocumentParseError(
        'No readable text extracted from PDF. The PDF may be scanned images or password protected.',
        'PDF_NO_TEXT'
      );
    }

    const processedText = cleanText(fullText);
    const wordCount = countWords(processedText);

    return {
      fileName: file.name,
      fileType: 'pdf',
      fileSize: file.size,
      originalText: fullText,
      processedText,
      wordCount,
      characterCount: fullText.length,
      pageCount: numPages,
      metadata: {
        extractedAt: new Date().toISOString(),
        parserUsed: 'PDF.js Parser',
        pageCount: numPages,
      },
    };
  } catch (err: any) {
    if (err instanceof DocumentParseError) throw err;
    throw new DocumentParseError(
      `Failed to extract text from PDF: ${err.message || 'Corrupted or encrypted PDF.'}`,
      'PDF_READ_FAILED'
    );
  }
}
