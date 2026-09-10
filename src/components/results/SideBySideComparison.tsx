import React, { useState, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Lock, Unlock, FileText, Globe, Eye } from 'lucide-react';
import type { Match } from '../../types/analysis';
import { MatchBadge } from './MatchBadges';
import { ConfidenceMeter } from './ConfidenceMeter';
import { sanitizeUrl } from '../../lib/urlSanitizer';
import { computeWordDiff } from '../../lib/diffEngine';

interface SideBySideComparisonProps {
  match: Match;
  className?: string;
}

export const SideBySideComparison: React.FC<SideBySideComparisonProps> = ({ match, className = '' }) => {
  const [isSyncedScroll, setIsSyncedScroll] = useState(true);
  const [showWordDiff, setShowWordDiff] = useState(true);

  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (isSyncedScroll && leftRef.current && rightRef.current) {
      rightRef.current.scrollTop = leftRef.current.scrollTop;
    }
  };

  const handleScrollRight = () => {
    if (isSyncedScroll && leftRef.current && rightRef.current) {
      leftRef.current.scrollTop = rightRef.current.scrollTop;
    }
  };

  const primarySource = match.sources?.[0];
  const safeUrl = sanitizeUrl(primarySource?.url || '');

  // Compute word-level text diffs
  const diffResult = useMemo(() => {
    return computeWordDiff(match.originalText, match.matchedText);
  }, [match.originalText, match.matchedText]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <MatchBadge
            classification={match.classification}
            type={match.type}
            webVerified={match.evidence?.webVerification?.verified || primarySource?.verified}
          />
          <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-white/10 text-white border border-white/10">
            {match.similarityScore}% similarity
          </span>
          <ConfidenceMeter confidence={match.confidence} showTooltip={false} />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Word Diff Toggle */}
          <button
            type="button"
            onClick={() => setShowWordDiff(!showWordDiff)}
            className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              showWordDiff
                ? 'border-purple-400/40 bg-purple-500/10 text-purple-300'
                : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showWordDiff ? 'Word Diff Active' : 'Plain View'}</span>
          </button>

          {/* Synced Scroll Toggle */}
          <button
            type="button"
            onClick={() => setIsSyncedScroll(!isSyncedScroll)}
            className={`text-xs font-medium px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
              isSyncedScroll
                ? 'border-blue-400/40 bg-blue-500/10 text-blue-300'
                : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            {isSyncedScroll ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isSyncedScroll ? 'Synced Scroll' : 'Independent'}</span>
          </button>

          {safeUrl && (
            <a
              href={safeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-white px-3 py-1.5 rounded-xl border border-white/15 bg-white/5 hover:border-white/30 transition-all"
            >
              <span>Visit Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Diff Legend */}
      {showWordDiff && (
        <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5">
          <span className="font-bold text-slate-300">Diff Legend:</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-red-300">Removed / Modified</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-emerald-300">Added / Reference</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Identical</span>
          </span>
        </div>
      )}

      {/* Side-by-Side Panels (Desktop 2-Cols, Mobile Stacked) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Left Panel: Your Document Passage */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/15 bg-black/60 p-5 space-y-3 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                YOUR DOCUMENT PASSAGE
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Original Excerpt</span>
            </div>

            <div
              ref={leftRef}
              onScroll={handleScrollLeft}
              className="max-h-60 overflow-y-auto text-xs text-slate-200 leading-relaxed font-sans border-l-2 border-blue-400 pl-3 py-1 pr-1 bg-white/[0.01] rounded-r-lg"
            >
              {showWordDiff ? (
                diffResult.originalTokens.map((token, idx) => {
                  if (token.type === 'removed') {
                    return (
                      <span key={idx} className="bg-red-500/20 text-red-300 line-through px-0.5 rounded mx-0.5">
                        {token.value}
                      </span>
                    );
                  }
                  return <span key={idx}>{token.value}</span>;
                })
              ) : (
                `"${match.originalText}"`
              )}
            </div>
          </div>
        </motion.div>

        {/* Right Panel: Reference Source Passage */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border border-white/15 bg-black/60 p-5 space-y-3 shadow-lg flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                VERIFIED REFERENCE MATCH
              </span>
              {primarySource && <span className="text-[10px] text-slate-400 font-mono">{primarySource.domain}</span>}
            </div>

            <div
              ref={rightRef}
              onScroll={handleScrollRight}
              className="max-h-60 overflow-y-auto text-xs text-slate-300 leading-relaxed font-sans border-l-2 border-emerald-400 pl-3 py-1 pr-1 bg-white/[0.01] rounded-r-lg"
            >
              {showWordDiff ? (
                diffResult.referenceTokens.map((token, idx) => {
                  if (token.type === 'added') {
                    return (
                      <span key={idx} className="bg-emerald-500/20 text-emerald-300 border-b border-emerald-400 px-0.5 rounded mx-0.5 font-semibold">
                        {token.value}
                      </span>
                    );
                  }
                  return <span key={idx}>{token.value}</span>;
                })
              ) : (
                `"${match.matchedText}"`
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
