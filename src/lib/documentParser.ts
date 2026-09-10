import './polyfills';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';
import mammoth from 'mammoth';
import type { ParsedDocument, SupportedFileType } from '../types/document';
import { cleanText, countWords } from './textProcessor';

// Configure local pdfjs worker with fallback support
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

/**
 * Safely read a File into an ArrayBuffer using native file.arrayBuffer() with FileReader fallback
 * for iOS Safari and legacy webview compatibility.
 */
async function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === 'function') {
    try {
      const buffer = await file.arrayBuffer();
      if (buffer && buffer.byteLength > 0) {
        return buffer;
      }
    } catch {
      // Fallback to FileReader if native arrayBuffer() fails or throws
    }
  }

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new DocumentParseError('Could not read file buffer.', 'FILE_READ_FAILED'));
      }
    };
    reader.onerror = () => {
      reject(new DocumentParseError('FileReader encountered an error reading the file.', 'FILE_READ_FAILED'));
    };
    reader.readAsArrayBuffer(file);
  });
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
    throw new DocumentParseError(`Failed to read TXT file: ${err?.message || 'Unknown read error.'}`, 'TXT_READ_FAILED');
  }
}

export async function parseDOCX(file: File): Promise<ParsedDocument> {
  try {
    const arrayBuffer = await readFileAsArrayBuffer(file);
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
    const arrayBuffer = await readFileAsArrayBuffer(file);
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new DocumentParseError('The uploaded PDF file is empty or unreadable.', 'EMPTY_FILE');
    }

    // Convert ArrayBuffer to Uint8Array for TypedArray compatibility across WebKit/V8
    const uint8Array = new Uint8Array(arrayBuffer);

    let pdf: pdfjsLib.PDFDocumentProxy;

    try {
      const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        useSystemFonts: true,
        disableRange: true,
        disableStream: true,
        disableAutoFetch: true,
        isEvalSupported: false,
        verbosity: 0,
      });
      pdf = await loadingTask.promise;
    } catch (primaryErr: any) {
      console.warn('[Plagora PDF Engine] Primary worker load failed, attempting inline parsing fallback:', primaryErr);
      
      // Inline worker fallback for restrictive mobile webview sandboxes
      try {
        const fallbackTask = pdfjsLib.getDocument({
          data: uint8Array,
          useSystemFonts: true,
          disableRange: true,
          disableStream: true,
          disableAutoFetch: true,
          isEvalSupported: false,
          disableWorker: true,
          verbosity: 0,
        } as any);
        pdf = await fallbackTask.promise;
      } catch (fallbackErr: any) {
        const detail = fallbackErr?.message || primaryErr?.message || 'Corrupted or encrypted PDF format.';
        throw new DocumentParseError(
          `Unable to parse PDF structure: ${detail}`,
          'PDF_PARSE_FAILED'
        );
      }
    }

    let fullText = '';
    const numPages = pdf.numPages;

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        if (textContent && Array.isArray(textContent.items)) {
          const pageStrings = textContent.items
            .map((item: any) => (item && typeof item.str === 'string' ? item.str : ''))
            .filter((str) => str.trim().length > 0)
            .join(' ');
          if (pageStrings.trim()) {
            fullText += pageStrings + '\n\n';
          }
        }
      } catch (pageErr) {
        console.warn(`[Plagora PDF Engine] Skipping page ${pageNum} due to parse warning:`, pageErr);
      }
    }

    if (!fullText || fullText.trim() === '') {
      throw new DocumentParseError(
        'No readable text extracted from PDF. The PDF may consist of scanned images or password protection.',
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
        parserUsed: 'PDF.js Engine (Cross-Platform Mobile Ready)',
        pageCount: numPages,
      },
    };
  } catch (err: any) {
    if (err instanceof DocumentParseError) throw err;
    const errorMsg = typeof err === 'object' && err?.message ? err.message : String(err || 'Unknown PDF parsing error.');
    throw new DocumentParseError(
      `Failed to extract text from PDF: ${errorMsg}`,
      'PDF_READ_FAILED'
    );
  }
}
