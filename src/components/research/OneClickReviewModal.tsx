import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AnalysisResult } from '../../types/analysis';
import type { ClaimItem } from '../../types/claim';
import type { CitationRiskItem, WritingSuggestion } from '../../types/writingCoach';
import { X, CheckCircle, ChevronLeft, ChevronRight, Shield, ExternalLink, Sparkles } from 'lucide-react';

interface ReviewQueueItem {
  id: string;
  type: 'match' | 'citation' | 'claim' | 'writing';
  priority: 'HIGH PRIORITY' | 'MEDIUM PRIORITY' | 'LOW PRIORITY';
  title: string;
  passage: string;
  reason: string;
  confidence: string;
  sourceTitle?: string;
  sourceUrl?: string;
  actionLabel: string;
}

interface OneClickReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult;
  claims?: ClaimItem[];
  citationRisks?: CitationRiskItem[];
  writingSuggestions?: WritingSuggestion[];
  onOpenFocusMode?: () => void;
}

export const OneClickReviewModal: React.FC<OneClickReviewModalProps> = ({
  isOpen,
  onClose,
  analysis,
  claims = [],
  citationRisks = [],
  writingSuggestions = [],
  onOpenFocusMode,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  // Build empirical review queue from real data
  const queue: ReviewQueueItem[] = [];

  // 1. High-confidence similarity matches
  analysis.matches.forEach((m, idx) => {
    queue.push({
      id: `review-match-${idx}`,
      type: 'match',
      priority: m.similarityScore > 65 ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY',
      title: `Similarity Overlap (${m.similarityScore}%)`,
      passage: m.originalText,
      reason: m.explanation || 'Significant vocabulary sequence alignment detected.',
      confidence: m.confidence || 'high',
      sourceTitle: m.sources[0]?.title,
      sourceUrl: m.sources[0]?.url,
      actionLabel: 'Review Source & Citation',
    });
  });

  // 2. Citation Risks
  citationRisks.forEach((cr, idx) => {
    queue.push({
      id: `review-cit-${idx}`,
      type: 'citation',
      priority: 'HIGH PRIORITY',
      title: 'Missing Citation Context',
      passage: cr.passageText,
      reason: cr.reason,
      confidence: 'medium',
      actionLabel: 'Insert Inline Citation',
    });
  });

  // 3. Claims
  claims
    .filter((c) => c.verificationStatus === 'UNCLEAR' || c.verificationStatus === 'INSUFFICIENT_EVIDENCE')
    .forEach((c, idx) => {
      queue.push({
        id: `review-claim-${idx}`,
        type: 'claim',
        priority: 'MEDIUM PRIORITY',
        title: `Unverified ${c.claimType} Claim`,
        passage: c.text,
        reason: c.explanation || 'Factual assertion lacks verified supporting evidence.',
        confidence: `${c.confidence}%`,
        actionLabel: 'Verify Claim Online',
      });
    });

  // 4. Writing Quality Issues
  writingSuggestions.forEach((ws, idx) => {
    queue.push({
      id: `review-write-${idx}`,
      priority: ws.priority,
      type: 'writing',
      title: `Writing Quality: ${ws.category.replace('_', ' ')}`,
      passage: ws.originalText,
      reason: ws.explanation,
      confidence: 'high',
      actionLabel: 'Apply AI Writing Suggestion',
    });
  });

  const currentItem = queue[currentIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0b0c10] border border-white/15 rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/40">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">One-Click Document Review Queue</h2>
                <p className="text-xs text-gray-400">
                  {queue.length} prioritized review item(s) detected across analysis signals
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Issue Stepper Body */}
          {currentItem ? (
            <div className="p-6 space-y-5">
              {/* Stepper Navigation */}
              <div className="flex items-center justify-between text-xs text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
                <span className="font-semibold text-white">
                  Issue {currentIndex + 1} of {queue.length}
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : queue.length - 1))}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentIndex((prev) => (prev < queue.length - 1 ? prev + 1 : 0))}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Item Details Card */}
              <div className="bg-[#131722] border border-white/10 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      currentItem.priority === 'HIGH PRIORITY'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {currentItem.priority}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">Confidence: {currentItem.confidence}</span>
                </div>

                <div>
                  <h3 className="font-bold text-white text-base">{currentItem.title}</h3>
                  <p className="text-xs text-gray-300 mt-1">{currentItem.reason}</p>
                </div>

                <div className="bg-black/60 p-4 rounded-xl border border-white/10 font-mono text-xs text-gray-200 leading-relaxed">
                  "{currentItem.passage}"
                </div>

                {currentItem.sourceTitle && (
                  <div className="text-xs bg-cyan-950/20 border border-cyan-500/20 p-3 rounded-lg flex items-center justify-between">
                    <span className="text-gray-300">
                      Matched Source: <strong className="text-white">{currentItem.sourceTitle}</strong>
                    </span>
                    {currentItem.sourceUrl && (
                      <a
                        href={currentItem.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-cyan-400 hover:underline flex items-center space-x-1"
                      >
                        <span>Open Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Next Actions */}
              <div className="flex items-center justify-between pt-2">
                {onOpenFocusMode && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenFocusMode();
                    }}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-xs rounded-xl transition-all flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Open in Focus Mode</span>
                  </button>
                )}

                <button
                  onClick={() => setCurrentIndex((prev) => (prev < queue.length - 1 ? prev + 1 : 0))}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                >
                  Mark Reviewed & Next
                </button>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
              <p className="font-semibold text-white text-sm">All caught up!</p>
              <p className="mt-1">No outstanding high-priority review issues found in this document version.</p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
