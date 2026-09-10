import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import type { Match } from '../../types/analysis';

interface DocumentViewerProps {
  text: string;
  matches: Match[];
  selectedMatchId: string | null;
  onSelectMatch: (match: Match) => void;
}

interface SearchOccurrence {
  index: number;
  length: number;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  text,
  matches,
  selectedMatchId,
  onSelectMatch,
}) => {
  const selectedRef = useRef<HTMLElement>(null);
  const activeSearchRef = useRef<HTMLElement>(null);

  // Document Search State
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find occurrences of search query inside document
  const searchOccurrences = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length === 0) return [];
    const query = searchQuery.toLowerCase();
    const occs: SearchOccurrence[] = [];
    let pos = 0;
    const lowerText = text.toLowerCase();

    while ((pos = lowerText.indexOf(query, pos)) !== -1) {
      occs.push({ index: pos, length: query.length });
      pos += query.length;
    }
    return occs;
  }, [text, searchQuery]);

  // Keyboard shortcut Ctrl+F / Cmd+F & Esc listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        if (!isInput) {
          e.preventDefault();
          setSearchOpen(true);
          setTimeout(() => searchInputRef.current?.focus(), 50);
        }
      }

      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchOpen]);

  // Smooth scroll to match when selected
  useEffect(() => {
    if (selectedMatchId && selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedMatchId]);

  // Smooth scroll to active search result
  useEffect(() => {
    if (searchOccurrences.length > 0 && activeSearchRef.current) {
      activeSearchRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeSearchIndex, searchOccurrences]);

  const handleNextSearch = () => {
    if (searchOccurrences.length === 0) return;
    setActiveSearchIndex((prev) => (prev + 1) % searchOccurrences.length);
  };

  const handlePrevSearch = () => {
    if (searchOccurrences.length === 0) return;
    setActiveSearchIndex((prev) => (prev - 1 + searchOccurrences.length) % searchOccurrences.length);
  };

  if (!text) {
    return (
      <div className="p-8 text-center text-slate-500 border border-white/10 rounded-2xl bg-neutral-950">
        No text content available to display.
      </div>
    );
  }

  // View Mode: Highlights vs Similarity Heatmap
  const [viewMode, setViewMode] = useState<'highlights' | 'heatmap'>('highlights');

  // Helper to render text paragraphs with crisp, pixel-sharp plagiarism highlights & search matches
  const renderHighlightedParagraphs = () => {
    const sortedMatches = [...matches].sort((a, b) => a.startIndex - b.startIndex);

    if (sortedMatches.length === 0 && searchOccurrences.length === 0) {
      return text.split(/\n\s*\n/).map((para, idx) => (
        <p key={idx} className="mb-4 leading-relaxed text-slate-200 font-sans text-sm" style={{ filter: 'none', opacity: 1 }}>
          {para}
        </p>
      ));
    }

    const elements: React.ReactNode[] = [];
    let lastIndex = 0;

    sortedMatches.forEach((match, mIdx) => {
      if (match.startIndex > lastIndex) {
        const prefix = text.slice(lastIndex, match.startIndex);
        elements.push(
          <span key={`text-${lastIndex}`} style={{ filter: 'none', opacity: 1 }}>
            {prefix}
          </span>
        );
      }

      const matchText = text.slice(match.startIndex, match.endIndex) || match.originalText;
      const isSelected = selectedMatchId === match.id;

      let bgStyle = 'bg-blue-500/20 border-blue-500/50 text-white';
      let selectedBgStyle = 'bg-blue-500/35 border-2 border-blue-400 text-white ring-1 ring-white/60';

      if (viewMode === 'heatmap') {
        const sim = match.similarityScore || match.score || 0;
        if (sim >= 80) {
          bgStyle = 'bg-red-500/25 border-red-500/60 text-white';
          selectedBgStyle = 'bg-red-500/40 border-2 border-red-400 text-white ring-2 ring-red-400/50';
        } else if (sim >= 50) {
          bgStyle = 'bg-orange-500/20 border-orange-500/50 text-white';
          selectedBgStyle = 'bg-orange-500/35 border-2 border-orange-400 text-white ring-2 ring-orange-400/50';
        } else if (sim >= 25) {
          bgStyle = 'bg-amber-500/15 border-amber-500/40 text-white';
          selectedBgStyle = 'bg-amber-500/30 border-2 border-amber-400 text-white ring-2 ring-amber-400/50';
        } else {
          bgStyle = 'bg-emerald-500/10 border-emerald-500/30 text-white';
          selectedBgStyle = 'bg-emerald-500/25 border-2 border-emerald-400 text-white ring-2 ring-emerald-400/50';
        }
      } else {
        if (match.type === 'exact' || match.type === 'repeated' || match.classification === 'exact_match') {
          bgStyle = 'bg-red-500/20 border-red-500/50 text-white';
          selectedBgStyle = 'bg-red-500/35 border-2 border-red-400 text-white ring-1 ring-white/60';
        } else if (match.type === 'paraphrase' || match.classification === 'paraphrase' || match.classification === 'near_match') {
          bgStyle = 'bg-amber-500/20 border-amber-500/50 text-white';
          selectedBgStyle = 'bg-amber-500/35 border-2 border-amber-400 text-white ring-1 ring-white/60';
        }
      }

      elements.push(
        <mark
          key={`match-${match.id}-${mIdx}`}
          ref={isSelected ? selectedRef : undefined}
          onClick={() => onSelectMatch(match)}
          style={{ filter: 'none', textShadow: 'none', opacity: 1 }}
          className={`relative inline hover:brightness-110 cursor-pointer rounded px-1.5 py-0.5 font-medium transition-colors duration-150 border my-0.5 select-text ${
            isSelected ? `${selectedBgStyle} font-semibold z-10 shadow-sm` : `${bgStyle} border`
          }`}
          title={`${match.type.toUpperCase()} (${match.similarityScore || match.score || 0}% sim): Click to inspect proof`}
        >
          <span className="relative z-10 text-white font-sans text-sm leading-relaxed" style={{ filter: 'none', textShadow: 'none', opacity: 1 }}>
            {matchText}
          </span>
        </mark>
      );

      lastIndex = Math.max(lastIndex, match.endIndex);
    });

    if (lastIndex < text.length) {
      elements.push(
        <span key={`text-end`} style={{ filter: 'none', opacity: 1 }}>
          {text.slice(lastIndex)}
        </span>
      );
    }

    return (
      <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed text-sm whitespace-pre-wrap select-text font-sans">
        {elements}
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-white/15 bg-neutral-950 p-6 md:p-8 max-h-[650px] overflow-y-auto shadow-2xl relative select-text">
      {/* Sticky Document Viewer Header Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 sticky top-0 bg-neutral-950/95 z-20 pt-1 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Extracted Document Content
          </span>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setViewMode('highlights')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                viewMode === 'highlights' ? 'bg-white/20 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Highlights
            </button>
            <button
              type="button"
              onClick={() => setViewMode('heatmap')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                viewMode === 'heatmap' ? 'bg-gradient-to-r from-amber-500/30 to-red-500/30 text-white border border-white/20 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Heatmap Mode
            </button>
          </div>

          {/* Search Toggle Button */}
          <button
            type="button"
            onClick={() => {
              setSearchOpen(!searchOpen);
              if (!searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
            }}
            className="p-1.5 rounded-lg border border-white/15 bg-white/5 text-slate-300 hover:text-white hover:border-white/30 transition-colors flex items-center gap-1.5 text-xs cursor-pointer"
            title="Search inside document (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search</span>
            <span className="text-[10px] text-slate-500 font-mono hidden md:inline">Ctrl+F</span>
          </button>
        </div>

        {/* Legend Indicators */}
        {viewMode === 'heatmap' ? (
          <div className="flex items-center gap-2 text-[10px] font-mono">
            <span className="text-slate-400">Concentration:</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Low</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Medium</span>
            <span className="px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-300 border border-orange-500/30">High</span>
            <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">Very High</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-red-500/60 border border-red-400" /> Exact
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/60 border border-amber-400" /> Paraphrase
            </span>
            <span className="flex items-center gap-1 text-slate-300">
              <span className="w-2.5 h-2.5 rounded bg-blue-500/60 border border-blue-400" /> Semantic
            </span>
          </div>
        )}
      </div>

      {/* Expandable Document Search Bar */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 p-3 rounded-2xl border border-cyan-500/40 bg-neutral-900 shadow-2xl flex items-center justify-between gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search document text..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setActiveSearchIndex(0);
                }}
                className="w-full bg-white/[0.04] border border-white/15 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
            </div>

            {searchQuery && (
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                  {searchOccurrences.length > 0
                    ? `${activeSearchIndex + 1} of ${searchOccurrences.length}`
                    : '0 matches'}
                </span>

                <button
                  type="button"
                  onClick={handlePrevSearch}
                  disabled={searchOccurrences.length === 0}
                  className="p-1 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white disabled:opacity-40"
                  title="Previous Search Result"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleNextSearch}
                  disabled={searchOccurrences.length === 0}
                  className="p-1 rounded-lg border border-white/10 bg-white/5 text-slate-300 hover:text-white disabled:opacity-40"
                  title="Next Search Result"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-slate-400 hover:text-white"
              title="Close search (Esc)"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="font-sans leading-relaxed tracking-normal select-text">
        {renderHighlightedParagraphs()}
      </div>
    </div>
  );
};
