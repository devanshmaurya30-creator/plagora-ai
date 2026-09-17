import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Source } from '../../types/analysis';
import { X, Scale, AlertTriangle, CheckCircle, ExternalLink, Calendar, User, FileText } from 'lucide-react';

interface SourceComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceA: Source | null;
  sourceB: Source | null;
}

export const SourceComparisonModal: React.FC<SourceComparisonModalProps> = ({
  isOpen,
  onClose,
  sourceA,
  sourceB,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !sourceA || !sourceB) return null;

  // Empirical check if claims or publication dates show potential disagreement
  const yearA = sourceA.url?.match(/(19|20)\d{2}/)?.[0];
  const yearB = sourceB.url?.match(/(19|20)\d{2}/)?.[0];
  const datesDiffer = Boolean(yearA && yearB && yearA !== yearB);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white dark:bg-[#0b0c10] border border-slate-200 dark:border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-900 dark:text-slate-100"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-black/40">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-600 dark:text-cyan-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Source Intelligence Comparison</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Side-by-side evidence analysis without speculative bias</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Disagreement / Alignment Warning Bar */}
          <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center space-x-3 text-xs text-amber-800 dark:text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
            <span>
              <strong>Comparative Signal:</strong> {datesDiffer ? 'Potential publication timeframe discrepancy detected.' : 'Overlapping reference passage structure detected.'} Evidence-grounded comparison only.
            </span>
          </div>

          {/* Side-by-Side Comparison Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[65vh]">
            {/* SOURCE A */}
            <div className="bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Source A</span>
                <span className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold px-2 py-0.5 rounded-lg border border-cyan-500/30">
                  {sourceA.similarity}% Similarity
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{sourceA.title || sourceA.domain}</h3>
                {sourceA.url ? (
                  <a
                    href={sourceA.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-cyan-600 dark:text-cyan-400 hover:underline mt-1 truncate max-w-full"
                  >
                    <span className="truncate">{sourceA.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic block mt-1">Metadata unavailable (No URL)</span>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Author:</span>
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{sourceA.domain || 'Metadata unavailable'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Published Date:</span>
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{yearA || 'Metadata unavailable'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verification:</span>
                  </span>
                  <span className={sourceA.verified ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                    {sourceA.verified ? 'Web Verified' : 'Unverified'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1 mb-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Matched Excerpt:</span>
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-black/60 p-3 rounded-xl border border-slate-200 dark:border-white/10 font-mono leading-relaxed">
                  "{sourceA.matchedText || 'No excerpt recorded'}"
                </p>
              </div>
            </div>

            {/* SOURCE B */}
            <div className="bg-slate-50 dark:bg-[#131722] border border-slate-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">Source B</span>
                <span className="bg-purple-500/15 text-purple-700 dark:text-purple-300 text-xs font-mono font-bold px-2 py-0.5 rounded-lg border border-purple-500/30">
                  {sourceB.similarity}% Similarity
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">{sourceB.title || sourceB.domain}</h3>
                {sourceB.url ? (
                  <a
                    href={sourceB.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-purple-600 dark:text-purple-400 hover:underline mt-1 truncate max-w-full"
                  >
                    <span className="truncate">{sourceB.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic block mt-1">Metadata unavailable (No URL)</span>
                )}
              </div>

              <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-black/40 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Author:</span>
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{sourceB.domain || 'Metadata unavailable'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Published Date:</span>
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">{yearB || 'Metadata unavailable'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verification:</span>
                  </span>
                  <span className={sourceB.verified ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-amber-600 dark:text-amber-400 font-medium'}>
                    {sourceB.verified ? 'Web Verified' : 'Unverified'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center space-x-1 mb-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Matched Excerpt:</span>
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-black/60 p-3 rounded-xl border border-slate-200 dark:border-white/10 font-mono leading-relaxed">
                  "{sourceB.matchedText || 'No excerpt recorded'}"
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-slate-50 dark:bg-black/40 border-t border-slate-200 dark:border-white/10 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-900 dark:text-white font-medium text-xs rounded-xl transition-all cursor-pointer"
            >
              Close Comparison
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
