import { jsPDF } from 'jspdf';
import type { AnalysisResult } from '../types/analysis';

/**
 * Sanitizes document name for safe PDF filename creation.
 */
function sanitizeFileName(name: string): string {
  return name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Generates a Multi-Page Professional Business-Grade AI Similarity Audit Report.
 */
export async function generatePDFReport(
  analysis: AnalysisResult,
  onProgress?: (status: string) => void
): Promise<void> {
  const updateStatus = (msg: string) => {
    if (onProgress) onProgress(msg);
  };

  updateStatus('Preparing enterprise report...');
  await new Promise((res) => setTimeout(res, 200));

  updateStatus('Formatting document layout...');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 18;
  const contentWidth = pageWidth - 2 * margin; // 174 mm

  // Color Palette Constants
  const darkHeader = [15, 15, 20];
  const cardBg = [248, 249, 250];
  const cardBorder = [226, 232, 240];
  const textDark = [15, 23, 42];
  const textSlate = [71, 85, 105];
  const textMuted = [148, 163, 184];
  const accentBlue = [37, 99, 235];
  const accentEmerald = [16, 185, 129];
  const accentAmber = [217, 119, 6];
  const accentRose = [225, 29, 72];

  const reportIdStr = `PLA-${analysis.id.slice(0, 12).toUpperCase()}`;
  const formattedDate = new Date(analysis.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Helper to add standard Header & Footer to pages
  const applyHeaderFooter = (pageNumber: number, totalPages: number) => {
    doc.setPage(pageNumber);

    // Header (skip on cover page)
    if (pageNumber > 1) {
      doc.setFillColor(darkHeader[0], darkHeader[1], darkHeader[2]);
      doc.rect(0, 0, pageWidth, 12, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('PLAGORA AI  |  SIMILARITY AUDIT REPORT', margin, 8);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 180, 190);
      doc.text(`REPORT ID: ${reportIdStr}`, pageWidth - margin, 8, { align: 'right' });
    }

    // Footer (all pages)
    const footerY = pageHeight - 10;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
    doc.text('CONFIDENTIAL & PROPRIETARY  •  © 2026 Devansh Maurya Inc. All rights reserved.', margin, footerY);
    doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, footerY, { align: 'right' });
  };

  // =========================================================================
  // PAGE 1: EXECUTIVE COVER PAGE
  // =========================================================================
  updateStatus('Generating cover page...');

  // Top Dark Header Banner
  doc.setFillColor(darkHeader[0], darkHeader[1], darkHeader[2]);
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Brand Logo Icon Box
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, 18, 12, 12, 2.5, 2.5, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 15, 20);
  doc.text('P', margin + 4, 26);

  // Title in Header Banner
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PLAGORA AI', margin + 18, 25);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 180, 200);
  doc.text('ENTERPRISE AI-POWERED PLAGIARISM & SIMILARITY AUDIT ENGINE', margin + 18, 32);

  // Main Cover Title Block
  let coverY = 85;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.text('AUTOMATED CONTENT INTEGRITY REPORT', margin, coverY);

  coverY += 8;
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Similarity Audit Report', margin, coverY);

  coverY += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
  doc.text('Multi-Pass Exact, Near-Match, Paraphrase, & Web Grounding Verification', margin, coverY);

  coverY += 12;
  doc.setDrawColor(accentBlue[0], accentBlue[1], accentBlue[2]);
  doc.setLineWidth(0.8);
  doc.line(margin, coverY, margin + 40, coverY);
  doc.setLineWidth(0.2);

  coverY += 25;

  // Metadata Card Box
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, coverY, contentWidth, 75, 4, 4, 'FD');

  let metaY = coverY + 12;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('AUDIT SPECIFICATIONS & METADATA', margin + 8, metaY);

  metaY += 10;
  doc.setFontSize(9);

  const metaRows = [
    ['Document Name:', analysis.documentName],
    ['Report Identification:', reportIdStr],
    ['Audit Execution Date:', formattedDate],
    ['Document Word Count:', `${analysis.wordCount.toLocaleString()} words`],
    ['Character Count:', `${(analysis.originalText?.length || 0).toLocaleString()} characters`],
    ['Analysis Engine Version:', 'Plagora AI Multi-Pass Engine v2.0 (Gemini Powered)'],
  ];

  metaRows.forEach(([label, val]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
    doc.text(label, margin + 8, metaY);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(val, margin + 65, metaY, { maxWidth: 95 });

    metaY += 8;
  });

  // Cover Page Bottom Notice
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'This document contains confidential automated analysis generated by Plagora AI. Results represent similarity indicators.',
    margin,
    pageHeight - 25,
    { maxWidth: contentWidth }
  );

  // =========================================================================
  // PAGE 2: EXECUTIVE SUMMARY & OVERVIEW
  // =========================================================================
  updateStatus('Generating executive summary...');
  doc.addPage();
  let y = 25;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('1. EXECUTIVE SUMMARY', margin, y);

  y += 8;

  // Primary Score Callout Card
  const scoreVal = analysis.similarityScore;
  const scoreColor = scoreVal <= 10 ? accentEmerald : scoreVal <= 25 ? accentAmber : accentRose;
  const statusText =
    scoreVal <= 10
      ? 'LOW SIMILARITY'
      : scoreVal <= 25
      ? 'MODERATE SIMILARITY'
      : 'HIGH SIMILARITY';

  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, 'FD');

  // Big Score Display
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.text(`${scoreVal}%`, margin + 10, y + 24);

  // Score Details Text
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('OVERALL SIMILARITY SCORE', margin + 48, y + 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
  doc.text(`Classification: ${statusText}   •   AI Confidence: ${analysis.confidence.toUpperCase()}`, margin + 48, y + 24);

  y += 46;

  // Key Summary Metric Cards Row
  const cardW = (contentWidth - 12) / 4;
  const subMetrics = [
    { label: 'Exact Match', val: `${analysis.exactMatchScore || 0}%`, color: accentRose },
    { label: 'Paraphrased', val: `${analysis.paraphraseScore || 0}%`, color: accentAmber },
    { label: 'Semantic', val: `${analysis.semanticScore || 0}%`, color: accentBlue },
    { label: 'Web Verified', val: `${analysis.webVerifiedScore || 0}%`, color: accentEmerald },
  ];

  subMetrics.forEach((m, idx) => {
    const xPos = margin + idx * (cardW + 4);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(xPos, y, cardW, 24, 2.5, 2.5, 'FD');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(m.color[0], m.color[1], m.color[2]);
    doc.text(m.val, xPos + 5, y + 13);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
    doc.text(m.label, xPos + 5, y + 19);
  });

  y += 32;

  // Factual Interpretation Narrative Box
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('ANALYSIS NARRATIVE & INTERPRETATION', margin, y);

  y += 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 30, 2.5, 2.5, 'FD');

  let narrativeText = '';
  if (scoreVal <= 10) {
    narrativeText =
      'Low overall similarity was detected across the analyzed document. The content exhibits strong structural originality with minimal verbatim or semantic overlap against known reference corpora.';
  } else if (scoreVal <= 25) {
    narrativeText =
      'Moderate similarity was identified across specific sections. Several passages contain matching terminology or structural paraphrasing that warrant human editorial review.';
  } else {
    narrativeText =
      'Substantial similarity was detected across multiple passages. Significant exact, near-match, or paraphrased content was identified, requiring thorough source verification.';
  }

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
  doc.text(narrativeText, margin + 6, y + 10, { maxWidth: contentWidth - 12 });

  y += 38;

  // Detailed Document Information Table
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('DOCUMENT INFORMATION SUMMARY', margin, y);

  y += 6;

  const docTableData = [
    ['Document File Name', analysis.documentName],
    ['Total Word Count', `${analysis.wordCount.toLocaleString()} words`],
    ['Total Character Count', `${(analysis.originalText?.length || 0).toLocaleString()} chars`],
    ['Total Matches Flagged', `${analysis.matches.length} candidate matches`],
    ['Verified Web Sources', `${analysis.sources?.length || 0} external sources`],
    ['Audit Status', 'Completed'],
  ];

  docTableData.forEach(([label, val], idx) => {
    const rowY = y + idx * 7;
    doc.setFillColor(idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.rect(margin, rowY, contentWidth, 7, 'F');
    doc.setDrawColor(240, 240, 245);
    doc.line(margin, rowY + 7, margin + contentWidth, rowY + 7);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
    doc.text(label, margin + 4, rowY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(val, margin + 80, rowY + 5);
  });

  // =========================================================================
  // PAGE 3: SIMILARITY BREAKDOWN & CONTENT DISTRIBUTION
  // =========================================================================
  updateStatus('Formatting score breakdown...');
  doc.addPage();
  y = 25;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('2. SIMILARITY BREAKDOWN & CONTENT DISTRIBUTION', margin, y);

  y += 10;

  // Visual Score Distribution Progress Bars
  const scoreCategories = [
    { label: 'Exact Matches (Verbatim Copying)', score: analysis.exactMatchScore || 0, color: accentRose },
    { label: 'Near Matches (Minor Substitutions)', score: analysis.nearMatchScore || 0, color: accentAmber },
    { label: 'Paraphrased Content (Sentence Restructuring)', score: analysis.paraphraseScore || 0, color: [234, 179, 8] },
    { label: 'Semantic Matches (Conceptual Similarity)', score: analysis.semanticScore || 0, color: accentBlue },
    { label: 'Verified Web Sources', score: analysis.webVerifiedScore || 0, color: [99, 102, 241] },
    { label: 'Unmatched Original Text', score: analysis.originalScore || Math.max(0, 100 - scoreVal), color: accentEmerald },
  ];

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('DETAILED DETECTION CATEGORY BREAKDOWN', margin, y);

  y += 8;

  scoreCategories.forEach((cat) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(textDark[0], textDark[1], textDark[2]);
    doc.text(cat.label, margin, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(cat.color[0], cat.color[1], cat.color[2]);
    doc.text(`${cat.score}%`, pageWidth - margin, y, { align: 'right' });

    y += 4;
    // Progress Bar Track
    doc.setFillColor(240, 242, 245);
    doc.roundedRect(margin, y, contentWidth, 4, 1, 1, 'F');

    // Progress Bar Fill
    const fillW = Math.max(2, (cat.score / 100) * contentWidth);
    doc.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
    doc.roundedRect(margin, y, fillW, 4, 1, 1, 'F');

    y += 9;
  });

  y += 10;

  // Breakdown Summary Note Box
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('SCORING INTEGRITY & INTERVAL DEDUPLICATION', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
  doc.text(
    'Plagora AI uses interval deduplication to resolve overlapping candidate matches. Character ranges flagged across multiple detection passes are merged to ensure overall similarity score reflects exact union metrics without double counting.',
    margin + 6,
    y + 14,
    { maxWidth: contentWidth - 12 }
  );

  // =========================================================================
  // PAGE 4+: DETAILED MATCH ANALYSIS & SIDE-BY-SIDE EVIDENCE
  // =========================================================================
  updateStatus('Formatting match evidence...');
  doc.addPage();
  y = 25;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('3. DETAILED MATCH EVIDENCE & EXPLANATION', margin, y);

  y += 10;

  if (!analysis.matches || analysis.matches.length === 0) {
    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'FD');

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(accentEmerald[0], accentEmerald[1], accentEmerald[2]);
    doc.text('NO SIGNIFICANT SIMILARITY MATCHES IDENTIFIED', margin + 8, y + 12);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
    doc.text(
      'No meaningful similarity matches were identified in the analyzed content using the available detection methods.',
      margin + 8,
      y + 20,
      { maxWidth: contentWidth - 16 }
    );
  } else {
    analysis.matches.forEach((m, idx) => {
      // Check for page break
      if (y > 220) {
        doc.addPage();
        y = 25;
      }

      const matchNum = idx + 1;
      const typeLabel = m.classification.toUpperCase().replace('_', ' ');
      const simVal = m.similarityScore;

      // Header for individual match
      doc.setFillColor(245, 247, 250);
      doc.setDrawColor(220, 225, 230);
      doc.roundedRect(margin, y, contentWidth, 10, 2, 2, 'FD');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`MATCH #${matchNum} — ${typeLabel}`, margin + 4, y + 6.5);

      doc.setTextColor(simVal > 70 ? accentRose[0] : simVal > 30 ? accentAmber[0] : accentBlue[0], 0, 0);
      doc.text(`${simVal}% SIMILARITY`, pageWidth - margin - 4, y + 6.5, { align: 'right' });

      y += 14;

      // Side-by-Side Comparison Box
      const colW = (contentWidth - 6) / 2;

      // Left Column: Candidate Text
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(accentBlue[0], accentBlue[1], accentBlue[2]);
      doc.roundedRect(margin, y, colW, 35, 2, 2, 'FD');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
      doc.text('YOUR DOCUMENT PASSAGE', margin + 4, y + 6);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      const origText = `"${m.originalText.replace(/[\r\n]+/g, ' ')}"`;
      const truncatedOrig = origText.length > 180 ? origText.slice(0, 180) + '... [Excerpt]' : origText;
      doc.text(truncatedOrig, margin + 4, y + 12, { maxWidth: colW - 8 });

      // Right Column: Reference Text
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(accentEmerald[0], accentEmerald[1], accentEmerald[2]);
      doc.roundedRect(margin + colW + 6, y, colW, 35, 2, 2, 'FD');

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentEmerald[0], accentEmerald[1], accentEmerald[2]);
      doc.text('VERIFIED REFERENCE MATCH', margin + colW + 10, y + 6);

      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
      const matchText = `"${m.matchedText.replace(/[\r\n]+/g, ' ')}"`;
      const truncatedMatch = matchText.length > 180 ? matchText.slice(0, 180) + '... [Excerpt]' : matchText;
      doc.text(truncatedMatch, margin + colW + 10, y + 12, { maxWidth: colW - 8 });

      y += 39;

      // Explanation note
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
      doc.text(`AI Explanation: `, margin, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(m.explanation, margin + 22, y, { maxWidth: contentWidth - 22 });

      y += 10;
    });
  }

  // =========================================================================
  // PAGE X: VERIFIED WEB SOURCES
  // =========================================================================
  updateStatus('Formatting verified web sources...');
  doc.addPage();
  y = 25;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('4. VERIFIED WEB SOURCE VERIFICATION', margin, y);

  y += 10;

  if (!analysis.sources || analysis.sources.length === 0) {
    doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
    doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
    doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
    doc.text('No verified web matches were identified.', margin + 8, y + 14);
  } else {
    analysis.sources.forEach((src, idx) => {
      if (y > 230) {
        doc.addPage();
        y = 25;
      }

      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
      doc.roundedRect(margin, y, contentWidth, 28, 2.5, 2.5, 'FD');

      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(textDark[0], textDark[1], textDark[2]);
      doc.text(`Source #${idx + 1} — ${src.title || 'Web Reference Document'}`, margin + 6, y + 7, {
        maxWidth: contentWidth - 45,
      });

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
      doc.text(`${src.similarity}% Match`, pageWidth - margin - 6, y + 7, { align: 'right' });

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
      doc.text(`Domain: ${src.domain || 'web-reference'}   •   Type: ${src.sourceType.toUpperCase()}   •   Verified: ${src.verified ? 'YES' : 'NO'}`, margin + 6, y + 14);

      if (src.url) {
        doc.setTextColor(accentBlue[0], accentBlue[1], accentBlue[2]);
        doc.text(`URL: ${src.url}`, margin + 6, y + 21, { maxWidth: contentWidth - 12 });
      }

      y += 33;
    });
  }

  // =========================================================================
  // FINAL PAGE: METHODOLOGY & AUDIT DISCLAIMER
  // =========================================================================
  updateStatus('Formatting methodology & disclaimers...');
  doc.addPage();
  y = 25;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('5. METHODOLOGY & LEGAL DISCLAIMER', margin, y);

  y += 10;

  // Methodology Explanation Card
  doc.setFillColor(cardBg[0], cardBg[1], cardBg[2]);
  doc.setDrawColor(cardBorder[0], cardBorder[1], cardBorder[2]);
  doc.roundedRect(margin, y, contentWidth, 48, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('PLAGORA AI MULTI-PASS ANALYSIS METHODOLOGY', margin + 8, y + 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(textSlate[0], textSlate[1], textSlate[2]);
  const methodDesc =
    'Plagora AI evaluates text through a multi-pass pipeline combining deterministic character hashing, Levenshtein edit distance near-matching, Google Gemini AI paraphrase classification, vector semantic similarity analysis, and live web search grounding. Overlapping intervals are deduplicated to produce an accurate union similarity score.';
  doc.text(methodDesc, margin + 8, y + 18, { maxWidth: contentWidth - 16 });

  y += 56;

  // Mandatory Legal Disclaimer Box
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(252, 165, 165);
  doc.roundedRect(margin, y, contentWidth, 40, 3, 3, 'FD');

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(accentRose[0], accentRose[1], accentRose[2]);
  doc.text('MANDATORY AUDIT DISCLAIMER', margin + 8, y + 10);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(127, 29, 29);
  const disclaimer1 =
    '• Similarity results are automated indicators and should be reviewed by a human. A similarity match does not by itself establish plagiarism.';
  const disclaimer2 =
    '• Absence of a verified web match does not prove that content is original.';
  const disclaimer3 =
    '• Analysis depends on public web indexing and model evaluation parameters.';

  doc.text(disclaimer1, margin + 8, y + 18, { maxWidth: contentWidth - 16 });
  doc.text(disclaimer2, margin + 8, y + 26, { maxWidth: contentWidth - 16 });
  doc.text(disclaimer3, margin + 8, y + 32, { maxWidth: contentWidth - 16 });

  // Apply Headers & Footers across all generated pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    applyHeaderFooter(i, totalPages);
  }

  updateStatus('Finalizing PDF document...');
  await new Promise((res) => setTimeout(res, 200));

  const cleanName = sanitizeFileName(analysis.documentName);
  doc.save(`Plagora_AI_Similarity_Audit_${cleanName}.pdf`);
}
