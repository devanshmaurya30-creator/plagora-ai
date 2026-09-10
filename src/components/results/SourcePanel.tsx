import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Globe, FileText, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { Match, Source } from '../../types/analysis';
import { sanitizeUrl } from '../../lib/urlSanitizer';
import { MagneticIcon } from '../ui/MagneticIcon';
import { TiltCard } from '../ui/TiltCard';

interface SourcePanelProps {
  sources: Source[];
  matches: Match[];
  selectedMatchId: string | null;
  onSelectMatch: (match: Match) => void;
}

export const SourcePanel: React.FC<SourcePanelProps> = ({
  sources,
  matches,
  selectedMatchId,
  onSelectMatch,
}) => {
  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'web':
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
      case 'document':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Database className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2">
          <span>Matched Sources</span>
          <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs text-slate-300 font-mono">
            {sources.length}
          </span>
        </h3>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Reference & Web</span>
      </div>

      {sources.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-500 border border-white/10 rounded-xl bg-white/[0.01]">
          No verified web source found for these passages.
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
          {sources.map((src, idx) => {
            const correspondingMatch = matches.find((m) => m.sourceId === src.id) || matches[0];
            const isSelected = selectedMatchId === correspondingMatch?.id;
            const safeUrl = sanitizeUrl(src.url);

            return (
              <motion.div
                key={src.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <TiltCard
                  maxRotate={1.5}
                  liftY={-4}
                  onClick={() => correspondingMatch && onSelectMatch(correspondingMatch)}
                  className={`p-4 transition-all duration-300 ${
                    isSelected
                      ? 'border-white/50 bg-white/[0.09] shadow-[0_0_25px_rgba(255,255,255,0.12)] ring-1 ring-white/30'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg border border-white/10 bg-white/5">
                        <MagneticIcon maxOffset={2}>{getSourceIcon(src.sourceType)}</MagneticIcon>
                      </div>
                      <span className="text-xs font-medium text-slate-300 truncate max-w-[150px]">
                        {src.domain}
                      </span>
                    </div>

                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${
                        src.similarity > 70
                          ? 'border-red-500/30 bg-red-500/10 text-red-400'
                          : src.similarity > 30
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                          : 'border-blue-500/30 bg-blue-500/10 text-blue-400'
                      }`}
                    >
                      {src.similarity}% similarity
                    </span>
                  </div>

                  <h4 className="text-xs font-semibold text-white line-clamp-2 mb-2">
                    {src.title}
                  </h4>

                  <p className="text-[11px] text-slate-400 line-clamp-2 bg-black/40 p-2 rounded border border-white/5 italic">
                    "{src.matchedText}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-3 pt-2 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <span className="uppercase text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                        {src.confidence} confidence
                      </span>
                      {src.verified && (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" /> Verified
                        </span>
                      )}
                    </div>

                    {safeUrl ? (
                      <a
                        href={safeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-blue-400 hover:text-white font-medium transition-colors"
                      >
                        <span>Open Source</span>
                        <MagneticIcon maxOffset={2}>
                          <ExternalLink className="w-3 h-3" />
                        </MagneticIcon>
                      </a>
                    ) : (
                      <span className="text-slate-500">Mock Index</span>
                    )}
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Verification Notice */}
      <div className="mt-4 p-3 rounded-xl border border-white/10 bg-white/[0.01] text-[11px] text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
        <span>Web verification checks publicly accessible sources found during this scan.</span>
      </div>
    </div>
  );
};
