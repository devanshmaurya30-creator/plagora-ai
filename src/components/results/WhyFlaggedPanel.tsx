import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, RefreshCw, Layers, FileEdit } from 'lucide-react';
import type { Match } from '../../types/analysis';
import { MatchBadge } from './MatchBadges';
import { ConfidenceMeter } from './ConfidenceMeter';

interface WhyFlaggedPanelProps {
  match: Match;
  isOpen: boolean;
  onClose: () => void;
  onViewComparison?: () => void;
  onOpenRewrite?: () => void;
}

export const WhyFlaggedPanel: React.FC<WhyFlaggedPanelProps> = ({
  match,
  isOpen,
  onClose,
  onViewComparison,
  onOpenRewrite,
}) => {
  const [loading, setLoading] = useState(false);
  const [explanationData, setExplanationData] = useState<{
    explanation: string;
    overlappingConcepts: string[];
    evidenceSummary: string;
    riskLevel: 'Low' | 'Medium' | 'High';
  } | null>(match.aiExplanation || null);

  const handleRegenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analysis/explain-match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: match.originalText,
          matchedText: match.matchedText,
          classification: match.classification,
          matchType: match.type,
          similarityScore: match.similarityScore,
          evidence: match.evidence,
          sourceDomain: match.sources?.[0]?.domain || '',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setExplanationData(data);
      }
    } catch (e) {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/70 backdrop-blur-sm select-none">
        {/* Backdrop overlay click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Sliding Panel */}
        <motion.div
          initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
          animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, x: 50, filter: 'blur(8px)' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-neutral-950 border-l border-white/15 h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl flex flex-col justify-between"
        >
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl border border-blue-400/40 bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight">WHY WAS THIS FLAGGED?</h3>
                  <p className="text-[11px] text-slate-400">Match Inspection & Proof Evidence</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Match Badges & Risk */}
            <div className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="space-y-1">
                <MatchBadge classification={match.classification} type={match.type} />
                <span className="text-2xl font-extrabold font-mono text-white block mt-1">
                  {match.similarityScore}% <span className="text-xs font-normal text-slate-400 font-sans">Similarity</span>
                </span>
              </div>
              <ConfidenceMeter confidence={match.confidence} />
            </div>

            {/* Loading Shimmer State */}
            {loading ? (
              <div className="p-6 rounded-2xl border border-white/10 bg-white/5 space-y-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-full" />
                <div className="h-3 bg-white/10 rounded w-5/6" />
              </div>
            ) : (
              /* Explanation Content */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl border border-white/10 bg-black/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">AI EXPLANATION</span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {explanationData?.explanation ||
                      match.explanation ||
                      'Potential similarity detected: structural sentence cadence and vocabulary sequences align with reference content.'}
                  </p>
                </div>

                {/* Overlapping Concepts */}
                {explanationData?.overlappingConcepts && explanationData.overlappingConcepts.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Key Detected Overlaps:</span>
                    <div className="flex flex-wrap gap-2">
                      {explanationData.overlappingConcepts.map((concept) => (
                        <span key={concept} className="text-xs px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-300 border border-blue-400/30 font-medium">
                          {concept}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence Excerpt */}
                <div className="space-y-3 pt-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Evidence Breakdown</span>

                  <div className="space-y-2 text-xs">
                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                      <span className="text-[10px] text-slate-500 block font-mono">YOUR DOCUMENT</span>
                      <p className="text-slate-200 italic mt-1">"{match.originalText}"</p>
                    </div>

                    <div className="p-3 rounded-xl border border-white/10 bg-white/[0.02]">
                      <span className="text-[10px] text-slate-500 block font-mono">REFERENCE MATCH</span>
                      <p className="text-slate-300 italic mt-1">"{match.matchedText}"</p>
                    </div>
                  </div>
                </div>

                {/* Citation Context & Risk Signal (Part 2/3) */}
                <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">CITATION REVIEW SIGNAL</span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/10 text-amber-300">
                      CITATION CONTEXT CHECK
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Plagora evaluated nearby text context for citation markers, quotation syntax, and bibliography entry matches.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="pt-6 border-t border-white/10 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {onViewComparison && (
                <button
                  onClick={() => {
                    onClose();
                    onViewComparison();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>View Diff</span>
                </button>
              )}

              {onOpenRewrite && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenRewrite();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-semibold text-cyan-300 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <FileEdit className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Rewrite AI</span>
                </button>
              )}
            </div>

            <button
              onClick={handleRegenerate}
              disabled={loading}
              className="w-full py-2 px-3 rounded-xl border border-white/10 bg-black text-[11px] text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate Explanation</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
