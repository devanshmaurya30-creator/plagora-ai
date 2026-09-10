import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Globe, ExternalLink, ArrowUpDown, BookOpen, Layers } from 'lucide-react';
import type { Source, Match } from '../../types/analysis';
import { rankSources } from '../../lib/sourceRanker';
import type { SourceSortOption, RankedSource } from '../../lib/sourceRanker';
import { CitationPanel } from './CitationPanel';
import { sanitizeUrl } from '../../lib/urlSanitizer';

interface SmartSourcePanelProps {
  sources: Source[];
  matches: Match[];
  selectedMatchId?: string | null;
  onSelectMatch: (match: Match) => void;
  className?: string;
}

export const SmartSourcePanel: React.FC<SmartSourcePanelProps> = ({
  sources,
  matches,
  onSelectMatch,
  className = '',
}) => {
  const [sortBy, setSortBy] = useState<SourceSortOption>('Most Relevant');
  const [filterVerification, setFilterVerification] = useState<string>('All');
  const [citationSource, setCitationSource] = useState<Source | null>(null);

  // Compute smart ranked and deduplicated sources
  const rankedList: RankedSource[] = useMemo(() => {
    return rankSources(sources, matches, sortBy, filterVerification);
  }, [sources, matches, sortBy, filterVerification]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with Sort & Filter Controls */}
      <div className="rounded-2xl border border-white/15 bg-black/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">RANKED SOURCES ({rankedList.length})</h3>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2 py-1 rounded-xl text-[11px] text-slate-300">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SourceSortOption)}
              className="bg-transparent text-white focus:outline-none cursor-pointer text-[11px]"
            >
              <option value="Most Relevant" className="bg-neutral-900 text-white">Most Relevant</option>
              <option value="Most Matches" className="bg-neutral-900 text-white">Most Matches</option>
              <option value="Strongest Match" className="bg-neutral-900 text-white">Strongest Match</option>
            </select>
          </div>
        </div>

        {/* Verification Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {['All', 'Verified', 'Probable'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterVerification(st)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer ${
                filterVerification === st
                  ? 'bg-white/15 text-white border border-white/20'
                  : 'bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Source Cards List */}
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
        {rankedList.length === 0 ? (
          <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.01] text-center text-xs text-slate-400 space-y-1">
            <p>No verified web sources matching the current filter.</p>
          </div>
        ) : (
          rankedList.map((source) => {
            const safeUrl = sanitizeUrl(source.url || '');
            const matchingPassages = matches.filter(
              (m) => m.sources?.some((s) => s.id === source.id || s.domain.toLowerCase() === source.domain.toLowerCase())
            );

            return (
              <motion.div
                key={source.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-2xl border border-white/10 bg-neutral-950/80 p-4 space-y-3 hover:border-white/20 transition-all select-none"
              >
                {/* Rank & Relevance Row */}
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-mono text-[10px] font-bold flex items-center justify-center border border-white/15">
                      #{source.rank}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{source.domain}</span>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      source.relevance === 'HIGH RELEVANCE'
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : source.relevance === 'MEDIUM RELEVANCE'
                        ? 'border-blue-500/40 bg-blue-500/10 text-blue-300'
                        : 'border-slate-500/40 bg-slate-500/10 text-slate-400'
                    }`}
                  >
                    {source.relevance}
                  </span>
                </div>

                {/* Title & Domain */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white leading-snug line-clamp-2">{source.title || source.domain}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span>{source.strongestSimilarity}% strongest match</span>
                    <span>•</span>
                    <span>{source.matchCount} passage{source.matchCount === 1 ? '' : 's'}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {matchingPassages.length > 0 && (
                      <button
                        onClick={() => onSelectMatch(matchingPassages[0])}
                        className="text-[10px] font-semibold text-blue-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Layers className="w-3 h-3" />
                        <span>View Matches</span>
                      </button>
                    )}

                    <button
                      onClick={() => setCitationSource(source)}
                      className="text-[10px] font-semibold text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>Cite Source</span>
                    </button>
                  </div>

                  {safeUrl && (
                    <a
                      href={safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Citation Modal */}
      {citationSource && (
        <CitationPanel
          source={citationSource}
          isOpen={Boolean(citationSource)}
          onClose={() => setCitationSource(null)}
        />
      )}
    </div>
  );
};
