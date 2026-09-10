import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Layers } from 'lucide-react';
import type { Match } from '../../types/analysis';

interface MatchNavigatorProps {
  matches: Match[];
  selectedMatch: Match | null;
  onSelectMatch: (match: Match | null) => void;
  className?: string;
}

export const MatchNavigator: React.FC<MatchNavigatorProps> = ({
  matches,
  selectedMatch,
  onSelectMatch,
  className = '',
}) => {
  const totalMatches = matches.length;
  const currentIndex = selectedMatch ? matches.findIndex((m) => m.id === selectedMatch.id) : -1;

  const handleNext = () => {
    if (totalMatches === 0) return;
    if (currentIndex < totalMatches - 1) {
      onSelectMatch(matches[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (totalMatches === 0) return;
    if (currentIndex > 0) {
      onSelectMatch(matches[currentIndex - 1]);
    }
  };

  const handleClose = () => {
    onSelectMatch(null);
  };

  // Global Keyboard Shortcuts (N -> Next, P -> Prev, Esc -> Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (isInput) return; // Do not trigger when typing inside inputs

      if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNext();
      } else if (e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, totalMatches, handleNext, handlePrevious, handleClose]);

  if (totalMatches === 0) return null;

  return (
    <div
      className={`rounded-2xl border border-white/20 bg-neutral-950/90 p-3.5 shadow-2xl backdrop-blur-2xl flex items-center justify-between gap-4 select-none ${className}`}
    >
      {/* Left: Counter & Icon */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-blue-400">
          <Layers className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">MATCH</span>

          {/* Animated Counter Number (Requirement 3) */}
          <div className="px-2.5 py-0.5 rounded-lg border border-white/15 bg-white/10 font-mono text-xs font-bold text-white shadow-inner min-w-[55px] text-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentIndex >= 0 ? currentIndex + 1 : 'none'}
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -8, opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="inline-block"
              >
                {currentIndex >= 0 ? currentIndex + 1 : 1}
              </motion.span>
            </AnimatePresence>
            <span className="text-slate-500 mx-1">/</span>
            <span>{totalMatches}</span>
          </div>
        </div>
      </div>

      {/* Middle: Shortcut Hints */}
      <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-slate-300">P</kbd> Previous
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-slate-300">N</kbd> Next
        </span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-slate-300">Esc</kbd> Close
        </span>
      </div>

      {/* Right: Prev, Next & Close Buttons */}
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={currentIndex <= 0 ? undefined : { scale: 1.05 }}
          whileTap={currentIndex <= 0 ? undefined : { scale: 0.95 }}
          onClick={handlePrevious}
          disabled={currentIndex <= 0}
          className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </motion.button>

        <motion.button
          whileHover={currentIndex >= totalMatches - 1 ? undefined : { scale: 1.05 }}
          whileTap={currentIndex >= totalMatches - 1 ? undefined : { scale: 0.95 }}
          onClick={handleNext}
          disabled={currentIndex >= totalMatches - 1}
          className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 text-xs font-semibold text-white hover:bg-white/10 hover:border-white/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>

        {selectedMatch && (
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-1"
            title="Close match details (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
