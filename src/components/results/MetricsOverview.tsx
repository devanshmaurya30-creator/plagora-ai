import React from 'react';
import { motion } from 'framer-motion';
import { ProgressRing } from '../ui/ProgressRing';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import type { AnalysisResult } from '../../types/analysis';

interface MetricsOverviewProps {
  analysis: AnalysisResult;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ analysis }) => {
  const getStatusBadge = (score: number) => {
    if (score <= 10) {
      return {
        label: 'Low Similarity',
        color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
      };
    }
    if (score <= 25) {
      return {
        label: 'Moderate Similarity',
        color: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
      };
    }
    return {
      label: 'High Similarity',
      color: 'border-red-500/30 bg-red-500/10 text-red-400',
    };
  };

  const status = getStatusBadge(analysis.similarityScore);

  const metrics = [
    {
      label: 'Exact Matches',
      value: `${analysis.exactMatchScore || 0}%`,
      barColor: 'bg-red-500',
      textColor: 'text-red-400',
    },
    {
      label: 'Near Matches',
      value: `${analysis.nearMatchScore || 0}%`,
      barColor: 'bg-rose-400',
      textColor: 'text-rose-400',
    },
    {
      label: 'Paraphrased Matches',
      value: `${analysis.paraphraseScore || 0}%`,
      barColor: 'bg-amber-500',
      textColor: 'text-amber-400',
    },
    {
      label: 'Semantic Matches',
      value: `${analysis.semanticScore || 0}%`,
      barColor: 'bg-blue-500',
      textColor: 'text-blue-400',
    },
  ];

  return (
    <div className="rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-xl p-6 shadow-2xl space-y-6">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left: Score Circular Indicator */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <ProgressRing score={analysis.similarityScore} size={150} strokeWidth={9} />
          <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Right: Metrics Grid */}
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m, idx) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="p-4 rounded-xl border border-white/10 bg-white/[0.02] flex flex-col justify-between"
            >
              <span className="text-xs text-slate-400 font-medium">{m.label}</span>
              <div className="mt-3">
                <span className={`text-2xl font-extrabold font-mono ${m.textColor}`}>
                  {m.value}
                </span>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div className={`h-full ${m.barColor}`} style={{ width: m.value }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Analysis Quality Status Bar (Item 29) */}
      <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
          Analysis Quality Status
        </span>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-slate-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Local: {analysis.analysisQuality?.localAnalysis || 'Complete'}
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            {analysis.analysisQuality?.aiAnalysis === 'Unavailable' ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
            )}
            AI: {analysis.analysisQuality?.aiAnalysis || 'Complete'}
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            {analysis.analysisQuality?.webVerification === 'Unavailable' ? (
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
            )}
            Web Verification: {analysis.analysisQuality?.webVerification || 'Complete'}
          </span>
        </div>
      </div>
    </div>
  );
};
