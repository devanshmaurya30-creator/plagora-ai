import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';

async function testPdfExtraction() {
  console.log('--- Testing PDF.js Extraction ---');

  // 1. Create a sample PDF in memory using jsPDF
  const doc = new jsPDF();
  doc.text('Plagora AI PDF Extraction Test Document', 10, 10);
  doc.text('This is line 2 of the extracted PDF text for plagiarism verification.', 10, 20);
  doc.addPage();
  doc.text('Page 2 content: Gemini semantic similarity and web verification engine.', 10, 10);

  const pdfArrayBuffer = doc.output('arraybuffer');

  // 2. Parse PDF buffer using pdfjs-dist
  const loadingTask = pdfjsLib.getDocument({ data: pdfArrayBuffer });
  const pdf = await loadingTask.promise;

  console.log(`Extracted PDF Pages: ${pdf.numPages}`);

  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map((item: any) => item.str).join(' ');
    fullText += pageText + '\n\n';
  }

  console.log('Extracted Text Content:\n' + fullText.trim());

  if (fullText.includes('Plagora AI PDF Extraction Test Document') && pdf.numPages === 2) {
    console.log('✅ PDF Extraction Test PASSED');
  } else {
    console.error('❌ PDF Extraction Test FAILED');
    process.exit(1);
  }
}

testPdfExtraction().catch((err) => {
  console.error('❌ Test execution error:', err);
  process.exit(1);
});
