import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Copy, Check, ExternalLink, X, Globe, ShieldCheck } from 'lucide-react';
import type { Source, CitationStyle } from '../../types/analysis';
import { generateCitation } from '../../lib/citationGenerator';
import { sanitizeUrl } from '../../lib/urlSanitizer';

interface CitationPanelProps {
  source: Source;
  isOpen: boolean;
  onClose: () => void;
  onInsertCitation?: (formattedCitation: string) => void;
}

export const CitationPanel: React.FC<CitationPanelProps> = ({ source, isOpen, onClose, onInsertCitation }) => {
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>('APA');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const citation = generateCitation(source, selectedStyle);
  const safeUrl = sanitizeUrl(source.url || '');

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.formattedCitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = () => {
    if (onInsertCitation) {
      onInsertCitation(` (${citation.formattedCitation})`);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg w-full rounded-3xl border border-white/20 bg-neutral-950 p-6 md:p-8 space-y-6 shadow-2xl text-slate-100 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl border border-purple-400/40 bg-purple-500/10 flex items-center justify-center text-purple-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">CITATION GENERATOR</h3>
                <p className="text-[11px] text-slate-400">Academic Citation Formatting</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Source Metadata Overview */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 font-mono">
                <Globe className="w-3 h-3 text-purple-400" />
                {source.domain || 'Web Source'}
              </span>
              {source.verified && (
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Verified Source
                </span>
              )}
            </div>
            <h4 className="text-xs font-bold text-white leading-snug">{source.title || source.domain}</h4>
          </div>

          {/* Citation Style Selector Pills */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
              CITATION STYLE
            </span>
            <div className="grid grid-cols-4 gap-2">
              {(['APA', 'MLA', 'Chicago', 'Harvard'] as CitationStyle[]).map((style) => {
                const isActive = selectedStyle === style;
                return (
                  <button
                    key={style}
                    onClick={() => setSelectedStyle(style)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'border-purple-400/50 bg-purple-500/15 text-purple-300 shadow-md'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {style}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generated Citation Box with Smooth Crossfade */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
              FORMATTED {selectedStyle} CITATION
            </span>

            <div className="p-4 rounded-2xl border border-purple-500/30 bg-purple-500/[0.03] text-xs font-serif leading-relaxed text-slate-100 min-h-20 flex items-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={selectedStyle}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  {citation.formattedCitation}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t border-white/10">
            {safeUrl ? (
              <a
                href={safeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-purple-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <span>Open Source</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <span className="text-[11px] text-slate-500">Source link unavailable</span>
            )}

            <div className="flex items-center gap-2">
              {onInsertCitation && (
                <button
                  onClick={handleInsert}
                  className="py-2.5 px-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all cursor-pointer shadow-md"
                >
                  Insert Citation
                </button>
              )}

              <button
                onClick={handleCopy}
                className="py-2.5 px-4 rounded-xl border border-purple-400/40 bg-purple-500/20 hover:bg-purple-500/30 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Citation Copied' : 'Copy Citation'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
