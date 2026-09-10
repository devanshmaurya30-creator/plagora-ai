import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Network, ShieldCheck, Globe, BookOpen, Layers } from 'lucide-react';
import type { Match, Source } from '../../types/analysis';

interface SimilarityExplanationGraphProps {
  matches: Match[];
  sources: Source[];
  selectedMatch: Match | null;
  onSelectMatch: (match: Match) => void;
  className?: string;
}

export const SimilarityExplanationGraph: React.FC<SimilarityExplanationGraphProps> = ({
  matches,
  sources,
  selectedMatch,
  onSelectMatch,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'accessible'>('visual');

  const currentMatch = selectedMatch || matches[0];
  const primarySource = currentMatch?.sources?.[0] || sources[0];

  return (
    <div className={`rounded-3xl border border-white/20 bg-neutral-950/90 p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-2xl text-slate-100 select-none ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border border-blue-400/40 bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-md">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight uppercase">SIMILARITY EXPLANATION GRAPH</h3>
            <p className="text-xs text-slate-400">Interactive Evidence Relationship Topology</p>
          </div>
        </div>

        {/* Accessible List Toggle */}
        <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-0.5 rounded-xl text-xs font-mono">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'visual' ? 'bg-white/20 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Visual Graph
          </button>
          <button
            onClick={() => setViewMode('accessible')}
            className={`px-3 py-1 rounded-lg transition-all ${
              viewMode === 'accessible' ? 'bg-white/20 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            List View
          </button>
        </div>
      </div>

      {/* Visual SVG Relationship Graph */}
      {viewMode === 'visual' ? (
        <div className="p-6 rounded-2xl border border-white/10 bg-black/60 relative space-y-6 overflow-x-auto">
          <div className="flex items-center justify-around min-w-[600px] py-4 relative">
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-white/20 stroke-2">
              <line x1="15%" y1="50%" x2="40%" y2="50%" strokeDasharray="4 4" />
              <line x1="40%" y1="50%" x2="65%" y2="50%" strokeDasharray="4 4" />
              <line x1="65%" y1="50%" x2="85%" y2="50%" strokeDasharray="4 4" />
            </svg>

            {/* Node 1: Your Document Passage */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              onClick={() => currentMatch && onSelectMatch(currentMatch)}
              className="relative z-10 p-4 rounded-2xl border border-blue-400/40 bg-blue-500/10 text-center cursor-pointer max-w-[140px] space-y-1 shadow-lg"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto border border-blue-400/30">
                <Layers className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block font-mono">YOUR DOCUMENT</span>
              <span className="text-[11px] text-white font-semibold line-clamp-1">Passage #{currentMatch?.id.slice(-4) || '1'}</span>
            </motion.div>

            {/* Node 2: Match Engine */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative z-10 p-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 text-center max-w-[140px] space-y-1 shadow-lg"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-400/30 font-bold text-xs">
                {currentMatch?.similarityScore || currentMatch?.score || 0}%
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block font-mono">DETECTED MATCH</span>
              <span className="text-[11px] text-white font-semibold uppercase">{currentMatch?.type || 'Exact'}</span>
            </motion.div>

            {/* Node 3: Source */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative z-10 p-4 rounded-2xl border border-purple-400/40 bg-purple-500/10 text-center max-w-[140px] space-y-1 shadow-lg"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-400/30">
                <Globe className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 block font-mono">VERIFIED SOURCE</span>
              <span className="text-[11px] text-white font-semibold line-clamp-1">{primarySource?.domain || 'web-source'}</span>
            </motion.div>

            {/* Node 4: Confidence & Citation Context */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="relative z-10 p-4 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 text-center max-w-[140px] space-y-1 shadow-lg"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-400/30">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block font-mono">CONFIDENCE</span>
              <span className="text-[11px] text-white font-semibold uppercase">{currentMatch?.confidence || 'HIGH'}</span>
            </motion.div>
          </div>

          {/* Active Topology Details Card */}
          {currentMatch && (
            <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 font-mono">ACTIVE RELATIONSHIP EVIDENCE</span>
                <span className="text-[10px] font-mono text-slate-400">Match ID: {currentMatch.id}</span>
              </div>
              <p className="text-slate-200 italic font-sans leading-relaxed">"{currentMatch.originalText}"</p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5 font-mono">
                <span>Source: {primarySource?.title || primarySource?.domain}</span>
                <button onClick={() => onSelectMatch(currentMatch)} className="text-blue-400 hover:text-white font-semibold flex items-center gap-1 cursor-pointer">
                  <span>Inspect Evidence</span>
                  <BookOpen className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Accessible List View Fallback */
        <div className="space-y-3">
          {matches.map((m, i) => (
            <div
              key={m.id}
              onClick={() => onSelectMatch(m)}
              className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/5 transition-all cursor-pointer flex items-center justify-between text-xs"
            >
              <div className="space-y-1">
                <span className="font-bold text-white font-mono">Match #{i + 1} ({m.type.toUpperCase()})</span>
                <p className="text-slate-400 italic line-clamp-1 font-sans">"{m.originalText}"</p>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-amber-400">{m.similarityScore}% sim</span>
                <span className="block text-[10px] text-slate-500">{m.confidence.toUpperCase()} confidence</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
