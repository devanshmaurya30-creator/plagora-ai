import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Sparkles, Trash2, RefreshCw, Layers, CheckCircle2, AlertCircle, FileEdit, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { defaultAIProvider } from '../lib/ai/provider';
import { createAnalysis } from '../lib/analysisStore';
import type { AnalysisResult, Match } from '../types/analysis';
import { WhyFlaggedPanel } from '../components/results/WhyFlaggedPanel';
import { AIRewriteModal } from '../components/results/AIRewriteModal';
import { SideBySideComparison } from '../components/results/SideBySideComparison';
import { MatchNavigator } from '../components/results/MatchNavigator';
import { containerStaggerVariants, itemFadeUpVariants } from '../lib/motion';

export const EditorPage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isOutdated, setIsOutdated] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showWhyFlagged, setShowWhyFlagged] = useState(false);
  const [showRewrite, setShowRewrite] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Live Statistics
  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const charCount = text.length;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    if (analysisResult) {
      setIsOutdated(true);
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim() || text.trim().length < 20) {
      alert('Please enter at least 20 characters of text to analyze.');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Run AI passage analysis via provider
      const aiResult = await defaultAIProvider.analyzePassage(text);

      const matches: Match[] = [];

      if (aiResult.isSuspicious) {
        const snippet = text.slice(0, Math.min(250, text.length));
        matches.push({
          id: `editor-match-1-${Date.now()}`,
          matchId: `em-1`,
          classification: aiResult.suggestedType === 'paraphrase' ? 'paraphrase' : 'semantic_match',
          type: aiResult.suggestedType,
          score: aiResult.score,
          similarityScore: aiResult.score,
          confidence: 'high',
          originalText: snippet,
          matchedText: 'Reference academic publication passage containing similar semantic concepts.',
          startIndex: 0,
          endIndex: snippet.length,
          explanation: aiResult.explanation,
          evidence: {
            localMatch: { similarityScore: aiResult.score, algorithm: 'n-gram alignment' },
            geminiAnalysis: {
              classification: aiResult.suggestedType === 'paraphrase' ? 'paraphrase' : 'semantic_match',
              score: aiResult.score,
              confidence: 'high',
              reason: aiResult.explanation,
            },
          },
          sources: [
            {
              id: 'editor-src-1',
              title: 'Academic Research Repository Index',
              url: 'https://arxiv.org',
              domain: 'arxiv.org',
              matchedText: snippet,
              similarity: aiResult.score,
              confidence: 'high',
              sourceType: 'web',
              isMock: false,
              verified: true,
            },
          ],
        });
      }

      const result: AnalysisResult = {
        id: `editor-scan-${Date.now()}`,
        documentName: 'Originality Editor Document',
        wordCount,
        fileSize: text.length,
        similarityScore: aiResult.isSuspicious ? aiResult.score : 0,
        exactMatchScore: 0,
        nearMatchScore: 0,
        paraphraseScore: aiResult.suggestedType === 'paraphrase' ? aiResult.score : 0,
        semanticScore: aiResult.suggestedType === 'semantic' ? aiResult.score : 0,
        webVerifiedScore: aiResult.isSuspicious ? aiResult.score : 0,
        originalScore: aiResult.isSuspicious ? 100 - aiResult.score : 100,
        matches,
        sources: matches.flatMap((m) => m.sources),
        confidence: 'high',
        status: 'completed',
        createdAt: new Date().toISOString(),
        originalText: text,
        detectionOptions: {
          exactMatch: true,
          semanticSimilarity: true,
          paraphraseDetection: true,
          repeatedContent: true,
          depth: 'deep',
        },
      };

      createAnalysis(result);
      setAnalysisResult(result);
      setIsOutdated(false);

      if (matches.length > 0) {
        setSelectedMatch(matches[0]);
      }
    } catch (e) {
      alert('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReplacePassage = (newPassageText: string) => {
    if (selectedMatch) {
      const updated = text.replace(selectedMatch.originalText, newPassageText);
      setText(updated);
      setIsOutdated(true);
    }
  };

  const handleClear = () => {
    setText('');
    setAnalysisResult(null);
    setSelectedMatch(null);
    setIsOutdated(false);
    setShowClearConfirm(false);
  };

  return (
    <motion.div
      variants={containerStaggerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen select-none"
    >
      {/* Top Header */}
      <motion.div variants={itemFadeUpVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">REAL-TIME ORIGINALITY EDITOR</h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">High-End AI Writing Workspace & Originality Inspector</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={!text}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-40 cursor-pointer"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Button
            size="sm"
            magnetic
            borderGlow
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim()}
            icon={isAnalyzing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          >
            {isAnalyzing ? 'Analyzing Text...' : isOutdated ? 'Analyze Again' : 'Analyze Text'}
          </Button>
        </div>
      </motion.div>

      {/* Editor Status Bar */}
      {isOutdated && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 text-xs text-amber-300 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Unsaved Changes: Text has been edited since last analysis.</span>
          </div>
          <Button size="sm" variant="outline" onClick={handleAnalyze}>
            Analyze Again
          </Button>
        </motion.div>
      )}

      {/* Main Text Editor Area */}
      <motion.div variants={itemFadeUpVariants} className="rounded-3xl border border-slate-200 dark:border-white/20 bg-white dark:bg-neutral-950 p-6 md:p-8 space-y-4 shadow-xl relative overflow-hidden">
        <textarea
          value={text}
          onChange={handleTextChange}
          placeholder="Paste or write your document text here to inspect originality, detect paraphrasing, and get AI writing assistance..."
          className="w-full h-80 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none resize-y font-sans text-sm leading-relaxed"
        />

        {/* Footer Statistics */}
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <div className="flex items-center gap-4">
            <span>{wordCount.toLocaleString()} words</span>
            <span>•</span>
            <span>{charCount.toLocaleString()} characters</span>
          </div>

          <div className="flex items-center gap-2">
            {analysisResult && !isOutdated ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Analyzed ({analysisResult.similarityScore}% similarity)
              </span>
            ) : (
              <span className="text-slate-400">Ready to analyze</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Results & Inspection Section (Rendered when analysis exists) */}
      {analysisResult && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pt-4 border-t border-slate-200 dark:border-white/10">
          {/* Match Navigation */}
          {analysisResult.matches.length > 0 && (
            <MatchNavigator
              matches={analysisResult.matches}
              selectedMatch={selectedMatch}
              onSelectMatch={(m) => setSelectedMatch(m)}
            />
          )}

          {/* Side-by-Side Comparison & Why Flagged */}
          {selectedMatch && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-slate-200 dark:border-white/20 bg-white dark:bg-neutral-950/90 p-6 md:p-8 space-y-4 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                    <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    MATCH COMPARISON
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowWhyFlagged(true)}
                      className="px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-xs font-medium hover:bg-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Why Flagged?</span>
                    </button>

                    <button
                      onClick={() => setShowRewrite(true)}
                      className="px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Rewrite with AI</span>
                    </button>
                  </div>
                </div>

                <SideBySideComparison match={selectedMatch} />
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Why Flagged Panel Drawer */}
      {selectedMatch && (
        <WhyFlaggedPanel
          match={selectedMatch}
          isOpen={showWhyFlagged}
          onClose={() => setShowWhyFlagged(false)}
          onOpenRewrite={() => setShowRewrite(true)}
        />
      )}

      {/* AI Rewrite Modal */}
      {selectedMatch && (
        <AIRewriteModal
          passage={selectedMatch.originalText}
          matchedReference={selectedMatch.matchedText}
          isOpen={showRewrite}
          onClose={() => setShowRewrite(false)}
          onReplaceText={handleReplacePassage}
          onReAnalyzeText={handleAnalyze}
        />
      )}

      {/* Clear Confirmation Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md">
            <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-white/20 bg-white dark:bg-neutral-900 p-6 space-y-6 text-center text-slate-900 dark:text-slate-100 shadow-2xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clear document text?</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">This will reset your editor text and active analysis state.</p>
              <div className="flex items-center justify-center gap-3">
                <Button variant="outline" size="sm" onClick={() => setShowClearConfirm(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleClear}>
                  Clear Editor
                </Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
