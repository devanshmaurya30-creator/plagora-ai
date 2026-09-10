import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, HelpCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import type { AnalysisResult, Match } from '../../types/analysis';

interface ImprovementCenterSectionProps {
  analysis: AnalysisResult;
  selectedMatch: Match | null;
  onSelectMatch: (match: Match) => void;
  onOpenWhyFlagged: (match: Match) => void;
  onOpenAIRewrite: (match: Match) => void;
  className?: string;
}

export interface SmartMatchPriority {
  match: Match;
  priorityLabel: 'HIGH PRIORITY REVIEW' | 'MEDIUM PRIORITY REVIEW' | 'LOW PRIORITY OPTIONAL REVIEW';
  priorityColor: string;
  sectionName: string;
  reason: string;
}

export const ImprovementCenterSection: React.FC<ImprovementCenterSectionProps> = ({
  analysis,
  selectedMatch,
  onSelectMatch,
  onOpenWhyFlagged,
  onOpenAIRewrite,
  className = '',
}) => {
  const matches = analysis.matches || [];

  // Categorize matches by smart priority based on real evidence
  const prioritizedQueue: SmartMatchPriority[] = matches.map((m) => {
    const isVerifiedWeb = m.evidence?.webVerification?.verified || m.hasWebMatch;
    const sim = m.similarityScore || m.score || 0;

    let priorityLabel: SmartMatchPriority['priorityLabel'] = 'LOW PRIORITY OPTIONAL REVIEW';
    let priorityColor = 'border-slate-500/40 bg-slate-500/10 text-slate-300';
    let reason = 'Minor textual similarity concentration detected.';

    if (sim >= 70 || (isVerifiedWeb && sim >= 50)) {
      priorityLabel = 'HIGH PRIORITY REVIEW';
      priorityColor = 'border-red-500/40 bg-red-500/10 text-red-300';
      reason = 'High phrase alignment with verified web source.';
    } else if (sim >= 40 || isVerifiedWeb) {
      priorityLabel = 'MEDIUM PRIORITY REVIEW';
      priorityColor = 'border-amber-500/40 bg-amber-500/10 text-amber-300';
      reason = 'Moderate paraphrase or semantic overlap identified.';
    }

    return {
      match: m,
      priorityLabel,
      priorityColor,
      sectionName: `Passage #${m.id.slice(-4).toUpperCase()}`,
      reason,
    };
  });

  if (matches.length === 0) {
    return (
      <div className={`rounded-3xl border border-white/15 bg-neutral-950 p-6 md:p-8 space-y-4 text-center select-none ${className}`}>
        <div className="w-12 h-12 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white tracking-tight">ORIGINALITY IMPROVEMENT CENTER</h3>
          <p className="text-xs text-slate-400">No significant similarity matches detected requiring review.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border border-white/20 bg-neutral-950/90 p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-2xl text-slate-100 select-none ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border border-amber-400/40 bg-amber-500/10 flex items-center justify-center text-amber-400 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight uppercase">ORIGINALITY IMPROVEMENT CENTER</h3>
            <p className="text-xs text-slate-400 mt-0.5">Continuous Evidence-Based Originality & Paraphrase Workflow</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>{prioritizedQueue.length} review item{prioritizedQueue.length === 1 ? '' : 's'} queued</span>
        </div>
      </div>

      {/* Improvement Queue Cards */}
      <div className="space-y-3">
        {prioritizedQueue.map((item, idx) => {
          const isSelected = selectedMatch?.id === item.match.id;

          return (
            <motion.div
              key={item.match.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onSelectMatch(item.match)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                isSelected
                  ? 'border-cyan-400/50 bg-cyan-500/10 shadow-lg'
                  : 'border-white/10 bg-white/[0.02] hover:border-white/20'
              }`}
            >
              {/* Priority & Classification Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`text-[9px] font-bold font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${item.priorityColor}`}>
                    {item.priorityLabel}
                  </span>
                  <span className="text-xs font-bold text-white font-mono">{item.sectionName}</span>
                </div>

                <span className="text-xs font-mono font-bold text-amber-400">
                  {item.match.similarityScore || item.match.score}% similarity
                </span>
              </div>

              {/* Matched Excerpt */}
              <p className="text-xs text-slate-300 leading-relaxed italic line-clamp-2 bg-black/40 p-2.5 rounded-xl border border-white/5 font-sans">
                "{item.match.originalText}"
              </p>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> {item.reason}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMatch(item.match);
                      onOpenWhyFlagged(item.match);
                    }}
                    className="px-2.5 py-1 rounded-xl border border-blue-400/30 bg-blue-500/10 text-blue-300 text-xs font-medium hover:bg-blue-500/20 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Why Flagged?</span>
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMatch(item.match);
                      onOpenAIRewrite(item.match);
                    }}
                    className="px-2.5 py-1 rounded-xl border border-cyan-400/40 bg-cyan-500/15 text-cyan-300 text-xs font-medium hover:bg-cyan-500/25 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Improve Passage</span>
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
