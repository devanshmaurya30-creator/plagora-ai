import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, PieChart, Layers, Repeat, Cpu } from 'lucide-react';
import type { AnalysisResult, Match } from '../../types/analysis';
import { calculateDocumentInsights } from '../../lib/documentInsights';

interface DocumentInsightsSectionProps {
  analysis: AnalysisResult;
  onSelectMatch?: (match: Match) => void;
  onSelectFilter?: (filter: string) => void;
  className?: string;
}

export const DocumentInsightsSection: React.FC<DocumentInsightsSectionProps> = ({
  analysis,
  onSelectFilter,
  className = '',
}) => {
  const insights = calculateDocumentInsights(analysis);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-3xl border border-white/20 bg-neutral-950/90 p-6 md:p-8 space-y-8 shadow-2xl backdrop-blur-2xl text-slate-100 select-none ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 flex items-center justify-center text-cyan-400 shadow-md">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">DEEP DOCUMENT INSIGHTS</h3>
            <p className="text-xs text-slate-400 mt-0.5">Empirical content distribution and section-level analytics</p>
          </div>
        </div>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Overall Similarity</span>
          <span className="text-2xl font-black font-mono text-white">{insights.overallSimilarity}%</span>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Originality Estimate</span>
          <span className="text-2xl font-black font-mono text-emerald-400">{insights.originalityEstimate}%</span>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Total Matches</span>
          <span className="text-2xl font-black font-mono text-blue-400">{insights.totalMatches}</span>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">Verified Sources</span>
          <span className="text-2xl font-black font-mono text-purple-400">{insights.totalSources}</span>
        </div>
      </div>

      {/* Match Distribution Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
          <PieChart className="w-4 h-4 text-blue-400" />
          MATCH TYPE DISTRIBUTION
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Exact Match', count: insights.matchDistribution.exact, filter: 'Exact', color: 'bg-red-500 text-red-300' },
            { label: 'Near Match', count: insights.matchDistribution.near, filter: 'Near Match', color: 'bg-amber-500 text-amber-300' },
            { label: 'Paraphrase', count: insights.matchDistribution.paraphrase, filter: 'Paraphrase', color: 'bg-blue-500 text-blue-300' },
            { label: 'Semantic Match', count: insights.matchDistribution.semantic, filter: 'Semantic', color: 'bg-purple-500 text-purple-300' },
          ].map((item) => (
            <div
              key={item.label}
              onClick={() => onSelectFilter && onSelectFilter(item.filter)}
              className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.015] hover:bg-white/5 transition-all cursor-pointer space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-300">{item.label}</span>
                <span className="text-xs font-mono font-bold text-white">{item.count}</span>
              </div>
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full ${item.color.split(' ')[0]}`}
                  style={{ width: `${insights.totalMatches > 0 ? (item.count / insights.totalMatches) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section Score Breakdown */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
          <Layers className="w-4 h-4 text-cyan-400" />
          SECTION-LEVEL SIMILARITY CONCENTRATION
        </h4>

        <div className="space-y-2">
          {insights.sections.map((sec) => (
            <div key={sec.name} className="p-3.5 rounded-2xl border border-white/10 bg-black/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white">{sec.name}</span>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-slate-400">{sec.wordCount} words</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-400">{sec.matchCount} matches</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-bold text-cyan-400">{sec.similarityRatio}% affected</span>
                </div>
              </div>

              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${sec.similarityRatio}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full ${
                    sec.similarityRatio > 40 ? 'bg-red-500' : sec.similarityRatio > 15 ? 'bg-amber-400' : 'bg-cyan-400'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Highlights Grid: Most Affected Section & Most Common Source */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.mostAffectedSection && (
          <div className="p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block font-mono">
              MOST AFFECTED SECTION
            </span>
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-bold text-white">{insights.mostAffectedSection.name}</h5>
              <span className="text-xs font-mono font-bold text-amber-300">
                {insights.mostAffectedSection.similarityRatio}% similarity
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Concentrates {insights.mostAffectedSection.matchCount} detected similarity match{insights.mostAffectedSection.matchCount === 1 ? '' : 'es'}.
            </p>
          </div>
        )}

        {insights.mostCommonSource && (
          <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/5 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block font-mono">
              MOST REFERENCED SOURCE
            </span>
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-bold text-white truncate max-w-[200px]">{insights.mostCommonSource.title}</h5>
              <span className="text-xs font-mono font-bold text-purple-300">
                {insights.mostCommonSource.highestSimilarity}% strongest
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Domain: {insights.mostCommonSource.domain} ({insights.mostCommonSource.matchCount} match{insights.mostCommonSource.matchCount === 1 ? '' : 'es'})
            </p>
          </div>
        )}
      </div>

      {/* Repeated Phrases & Writing Consistency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
        {/* Repeated Phrases */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono flex items-center gap-1">
            <Repeat className="w-3 h-3 text-blue-400" />
            REPEATED PHRASE PATTERNS
          </span>
          {insights.repeatedPhrases.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No significant repeated phrase sequences detected.</p>
          ) : (
            <div className="space-y-1.5">
              {insights.repeatedPhrases.map((item) => (
                <div key={item.phrase} className="flex items-center justify-between text-xs p-2 rounded-xl bg-white/[0.02] border border-white/5">
                  <span className="text-slate-300 italic">"{item.phrase}"</span>
                  <span className="font-mono text-[10px] text-slate-400">{item.occurrences}x</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Writing Consistency */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            WRITING CONSISTENCY SIGNAL
          </span>
          <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span>{insights.writingConsistency.signal}</span>
              <span className="text-[10px] font-mono text-cyan-400 uppercase">{insights.writingConsistency.confidence} confidence</span>
            </div>
            <p className="text-[11px] text-slate-400">{insights.writingConsistency.note}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
