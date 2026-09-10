import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ChevronLeft, ChevronRight, X, Sparkles, HelpCircle } from 'lucide-react';
import type { Match } from '../../types/analysis';

interface SmartReviewModalProps {
  matches: Match[];
  isOpen: boolean;
  onClose: () => void;
  onSelectMatch: (match: Match) => void;
  onOpenWhyFlagged: (match: Match) => void;
  onOpenAIRewrite: (match: Match) => void;
}

export const SmartReviewModal: React.FC<SmartReviewModalProps> = ({
  matches,
  isOpen,
  onClose,
  onSelectMatch,
  onOpenWhyFlagged,
  onOpenAIRewrite,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (isInput || !isOpen) return;

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev + 1) % (matches.length || 1));
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setCurrentIndex((prev) => (prev - 1 + matches.length) % (matches.length || 1));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, matches.length, onClose]);

  if (!isOpen || matches.length === 0) return null;

  const currentMatch = matches[currentIndex] || matches[0];
  const primarySource = currentMatch.sources?.[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl w-full rounded-3xl border border-white/20 bg-neutral-950 p-6 md:p-8 space-y-6 shadow-2xl text-slate-100 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl border border-amber-400/40 bg-amber-500/10 flex items-center justify-center text-amber-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">SMART REVIEW MODE</h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  Issue {currentIndex + 1} of {matches.length} (Press N for next, P for prev)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Current Match Detail Card */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white font-mono uppercase">{currentMatch.type} Match</span>
              <span className="text-sm font-extrabold font-mono text-amber-400">{currentMatch.similarityScore}% Similarity</span>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase">AFFECTED PASSAGE</span>
              <p className="text-xs text-slate-200 leading-relaxed italic bg-black/40 p-3 rounded-xl border border-white/5">
                "{currentMatch.originalText}"
              </p>
            </div>

            {primarySource && (
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono pt-2 border-t border-white/5">
                <span>Source: {primarySource.title || primarySource.domain}</span>
                <span className="text-blue-400">{currentMatch.confidence.toUpperCase()} Confidence</span>
              </div>
            )}
          </div>

          {/* Review Actions */}
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length)}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition-colors"
                title="Previous Issue (P)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => (prev + 1) % matches.length)}
                className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white transition-colors"
                title="Next Issue (N)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectMatch(currentMatch);
                  onOpenWhyFlagged(currentMatch);
                }}
                className="px-3 py-2 rounded-xl border border-blue-400/40 bg-blue-500/10 text-blue-300 text-xs font-semibold hover:bg-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Why Flagged?</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onSelectMatch(currentMatch);
                  onOpenAIRewrite(currentMatch);
                }}
                className="px-3 py-2 rounded-xl border border-cyan-400/40 bg-cyan-500/15 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Improve Passage</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
