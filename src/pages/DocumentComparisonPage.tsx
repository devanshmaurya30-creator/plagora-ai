import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, Upload, FileText, Play, CheckCircle2, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { parseDocument } from '../lib/documentParser';
import type { Match, ComparisonResult } from '../types/analysis';
import { SideBySideComparison } from '../components/results/SideBySideComparison';
import { MatchNavigator } from '../components/results/MatchNavigator';
import { createAnalysis } from '../lib/analysisStore';
import { containerStaggerVariants, itemFadeUpVariants } from '../lib/motion';

export const DocumentComparisonPage: React.FC = () => {
  const [docA, setDocA] = useState<{ name: string; text: string; wordCount: number } | null>(null);
  const [docB, setDocB] = useState<{ name: string; text: string; wordCount: number } | null>(null);

  const [loadingA, setLoadingA] = useState(false);
  const [loadingB, setLoadingB] = useState(false);

  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const handleFileUpload = async (file: File, docType: 'A' | 'B') => {
    if (docType === 'A') setLoadingA(true);
    else setLoadingB(true);

    try {
      const parsed = await parseDocument(file);
      const data = {
        name: parsed.fileName,
        text: parsed.originalText,
        wordCount: parsed.wordCount,
      };

      if (docType === 'A') setDocA(data);
      else setDocB(data);
    } catch (e) {
      alert(`Could not extract text from ${file.name}. Please try a valid TXT, PDF, or DOCX file.`);
    } finally {
      if (docType === 'A') setLoadingA(false);
      else setLoadingB(false);
    }
  };

  const handleRunComparison = async () => {
    if (!docA || !docB) return;
    setIsComparing(true);

    try {
      const res = await fetch('/api/analysis/compare-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textA: docA.text,
          textB: docB.text,
          docNameA: docA.name,
          docNameB: docB.name,
        }),
      });

      if (res.ok) {
        const data: ComparisonResult = await res.json();
        setComparisonResult(data);
        if (data.matches.length > 0) {
          setSelectedMatch(data.matches[0]);
        }

        // Save as analysis report in history
        createAnalysis({
          id: data.id,
          documentName: `${docA.name} vs ${docB.name}`,
          wordCount: docA.wordCount + docB.wordCount,
          fileSize: docA.text.length + docB.text.length,
          similarityScore: data.overallSimilarity,
          exactMatchScore: Math.round((data.exactMatchesCount / (data.matchingPassagesCount || 1)) * 100),
          nearMatchScore: Math.round((data.nearMatchesCount / (data.matchingPassagesCount || 1)) * 100),
          paraphraseScore: 0,
          semanticScore: 0,
          webVerifiedScore: 0,
          originalScore: Math.max(0, 100 - data.overallSimilarity),
          matches: data.matches,
          sources: [
            {
              id: 'comp-src-b',
              title: docB.name,
              url: '',
              domain: docB.name,
              matchedText: docB.text.slice(0, 200),
              similarity: data.overallSimilarity,
              confidence: 'high',
              sourceType: 'document',
              isMock: false,
              verified: true,
            },
          ],
          confidence: 'high',
          status: 'completed',
          createdAt: data.createdAt,
          originalText: docA.text,
          detectionOptions: {
            exactMatch: true,
            semanticSimilarity: true,
            paraphraseDetection: true,
            repeatedContent: true,
            depth: 'standard',
          },
        });
      }
    } catch (e) {
      alert('Document comparison failed. Please try again.');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <motion.div
      variants={containerStaggerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen select-none"
    >
      {/* Top Header */}
      <motion.div variants={itemFadeUpVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border border-purple-400/40 bg-purple-500/10 flex items-center justify-center text-purple-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight uppercase">DOCUMENT COMPARISON MODE</h1>
            <p className="text-xs text-slate-400">Compare Two Documents (Doc A vs Doc B) for Exact & Semantic Overlap</p>
          </div>
        </div>

        {/* Start Comparison CTA */}
        <Button
          size="sm"
          magnetic
          borderGlow
          onClick={handleRunComparison}
          disabled={!docA || !docB || isComparing}
          icon={isComparing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
        >
          {isComparing ? 'Comparing Documents...' : 'Compare Documents'}
        </Button>
      </motion.div>

      {/* Dual Upload Zones (Document A vs Document B) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Document A Upload Zone */}
        <motion.div variants={itemFadeUpVariants} className="rounded-3xl border border-white/15 bg-neutral-950 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              DOCUMENT A
            </span>
            {docA && <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</span>}
          </div>

          {!docA ? (
            <label className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-white/[0.01]">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-xs text-slate-300 font-semibold">{loadingA ? 'Extracting Text...' : 'Drop Document A or Browse File'}</span>
              <span className="text-[10px] text-slate-500 font-mono">PDF, DOCX, TXT (Max 10MB)</span>
              <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'A')} className="hidden" />
            </label>
          ) : (
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[200px]">{docA.name}</span>
                <button onClick={() => setDocA(null)} className="text-[10px] text-slate-400 hover:text-red-400 cursor-pointer">
                  Replace
                </button>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{docA.wordCount.toLocaleString()} words extracted</span>
            </div>
          )}
        </motion.div>

        {/* Document B Upload Zone */}
        <motion.div variants={itemFadeUpVariants} className="rounded-3xl border border-white/15 bg-neutral-950 p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" />
              DOCUMENT B
            </span>
            {docB && <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</span>}
          </div>

          {!docB ? (
            <label className="border-2 border-dashed border-white/20 hover:border-white/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors bg-white/[0.01]">
              <Upload className="w-8 h-8 text-slate-400" />
              <span className="text-xs text-slate-300 font-semibold">{loadingB ? 'Extracting Text...' : 'Drop Document B or Browse File'}</span>
              <span className="text-[10px] text-slate-500 font-mono">PDF, DOCX, TXT (Max 10MB)</span>
              <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'B')} className="hidden" />
            </label>
          ) : (
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white truncate max-w-[200px]">{docB.name}</span>
                <button onClick={() => setDocB(null)} className="text-[10px] text-slate-400 hover:text-red-400 cursor-pointer">
                  Replace
                </button>
              </div>
              <span className="text-[10px] font-mono text-slate-400">{docB.wordCount.toLocaleString()} words extracted</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Comparison Results Area */}
      {comparisonResult && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-4 border-t border-white/10">
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Overall Similarity</span>
              <span className="text-2xl font-black font-mono text-white">{comparisonResult.overallSimilarity}%</span>
            </div>
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Matching Passages</span>
              <span className="text-2xl font-black font-mono text-blue-400">{comparisonResult.matchingPassagesCount}</span>
            </div>
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Exact Matches</span>
              <span className="text-2xl font-black font-mono text-red-400">{comparisonResult.exactMatchesCount}</span>
            </div>
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Near / Paraphrase</span>
              <span className="text-2xl font-black font-mono text-amber-400">{comparisonResult.nearMatchesCount}</span>
            </div>
          </div>

          {/* Match Navigation */}
          {comparisonResult.matches.length > 0 && (
            <MatchNavigator
              matches={comparisonResult.matches}
              selectedMatch={selectedMatch}
              onSelectMatch={(m) => setSelectedMatch(m)}
            />
          )}

          {/* Side-by-Side Diff View */}
          {selectedMatch && (
            <div className="rounded-3xl border border-white/20 bg-neutral-950/90 p-6 md:p-8 space-y-4 shadow-2xl">
              <SideBySideComparison match={selectedMatch} />
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
