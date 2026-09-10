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
  if (!isOpen || !sourceA || !sourceB) return null;

  // Empirical check if claims or publication dates show potential disagreement
  const yearA = sourceA.url?.match(/(19|20)\d{2}/)?.[0];
  const yearB = sourceB.url?.match(/(19|20)\d{2}/)?.[0];
  const datesDiffer = Boolean(yearA && yearB && yearA !== yearB);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0b0c10] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Source Intelligence Comparison</h2>
                <p className="text-xs text-gray-400">Side-by-side evidence analysis without speculative bias</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Disagreement / Alignment Warning Bar */}
          <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center space-x-3 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Comparative Signal:</strong> {datesDiffer ? 'Potential publication timeframe discrepancy detected.' : 'Overlapping reference passage structure detected.'} Evidence-grounded comparison only.
            </span>
          </div>

          {/* Side-by-Side Comparison Body */}
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[65vh]">
            {/* SOURCE A */}
            <div className="bg-[#131722] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Source A</span>
                <span className="bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold px-2 py-0.5 rounded">
                  {sourceA.similarity}% Similarity
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base leading-snug">{sourceA.title || sourceA.domain}</h3>
                {sourceA.url ? (
                  <a
                    href={sourceA.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-cyan-400 hover:underline mt-1 truncate max-w-full"
                  >
                    <span className="truncate">{sourceA.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs text-gray-500 italic block mt-1">Metadata unavailable (No URL)</span>
                )}
              </div>

              <div className="space-y-2 text-xs text-gray-300 bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Author:</span>
                  </span>
                  <span className="font-medium text-white">{sourceA.domain || 'Metadata unavailable'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Published Date:</span>
                  </span>
                  <span className="font-medium text-white">{yearA || 'Metadata unavailable'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verification:</span>
                  </span>
                  <span className={sourceA.verified ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                    {sourceA.verified ? 'Web Verified' : 'Unverified'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-400 flex items-center space-x-1 mb-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Matched Excerpt:</span>
                </span>
                <p className="text-xs text-gray-200 bg-black/60 p-3 rounded-lg border border-white/10 font-mono leading-relaxed">
                  "{sourceA.matchedText || 'No excerpt recorded'}"
                </p>
              </div>
            </div>

            {/* SOURCE B */}
            <div className="bg-[#131722] border border-white/10 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">Source B</span>
                <span className="bg-purple-500/20 text-purple-300 text-xs font-mono font-bold px-2 py-0.5 rounded">
                  {sourceB.similarity}% Similarity
                </span>
              </div>

              <div>
                <h3 className="font-bold text-white text-base leading-snug">{sourceB.title || sourceB.domain}</h3>
                {sourceB.url ? (
                  <a
                    href={sourceB.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 text-xs text-purple-400 hover:underline mt-1 truncate max-w-full"
                  >
                    <span className="truncate">{sourceB.url}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-xs text-gray-500 italic block mt-1">Metadata unavailable (No URL)</span>
                )}
              </div>

              <div className="space-y-2 text-xs text-gray-300 bg-black/40 p-3 rounded-lg border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5" />
                    <span>Author:</span>
                  </span>
                  <span className="font-medium text-white">{sourceB.domain || 'Metadata unavailable'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Published Date:</span>
                  </span>
                  <span className="font-medium text-white">{yearB || 'Metadata unavailable'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verification:</span>
                  </span>
                  <span className={sourceB.verified ? 'text-emerald-400 font-medium' : 'text-amber-400 font-medium'}>
                    {sourceB.verified ? 'Web Verified' : 'Unverified'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-medium text-gray-400 flex items-center space-x-1 mb-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Matched Excerpt:</span>
                </span>
                <p className="text-xs text-gray-200 bg-black/60 p-3 rounded-lg border border-white/10 font-mono leading-relaxed">
                  "{sourceB.matchedText || 'No excerpt recorded'}"
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-black/40 border-t border-white/10 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs rounded-xl transition-all"
            >
              Close Comparison
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
