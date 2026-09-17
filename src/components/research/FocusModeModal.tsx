import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Match, AnalysisResult } from '../../types/analysis';
import type { ClaimItem } from '../../types/claim';
import { X, ChevronLeft, ChevronRight, RefreshCw, FileText } from 'lucide-react';
import { WritingCoachToolbar } from './WritingCoachToolbar';

interface FocusModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult;
  claims?: ClaimItem[];
  onReanalyze?: () => void;
  onUpdateText?: (newText: string) => void;
}

export const FocusModeModal: React.FC<FocusModeModalProps> = ({
  isOpen,
  onClose,
  analysis,
  onReanalyze,
  onUpdateText,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [documentContent, setDocumentContent] = useState(analysis.originalText || '');
  const [isOutdated, setIsOutdated] = useState(false);

  const matches = analysis.matches || [];
  const currentMatch: Match | undefined = matches[activeIndex];

  // Global Keyboard Navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return; // Do not trigger shortcuts while typing
      }

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setActiveIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, matches.length, onClose]);

  if (!isOpen) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDocumentContent(val);
    setIsOutdated(true);
    if (onUpdateText) onUpdateText(val);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 dark:bg-black/95 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="w-full h-full max-w-7xl flex flex-col p-4 sm:p-6 space-y-4"
        >
          {/* Top Distraction-Free Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-slate-900 dark:text-white tracking-widest text-sm flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                <span>PLAGORA AI — FOCUS MODE</span>
              </span>
              {isOutdated && (
                <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center space-x-1 border border-amber-500/30">
                  <RefreshCw className="w-3 h-3" />
                  <span>Analysis Outdated</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {isOutdated && onReanalyze && (
                <button
                  onClick={onReanalyze}
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Re-analyze Document</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="px-3 py-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-700 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-xs font-medium transition-all flex items-center space-x-1 cursor-pointer"
              >
                <span>Exit (Esc)</span>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Workspace Area */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
            {/* Document Content Editor (2 Columns) */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0b0c10] border border-slate-200 dark:border-white/10 rounded-2xl p-6 flex flex-col space-y-3 shadow-xl">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 pb-2 border-b border-slate-200 dark:border-white/10">
                <span className="font-medium text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>{analysis.documentName}</span>
                </span>
                <span>{analysis.wordCount} Words</span>
              </div>

              {/* Crisp Text Editor */}
              <textarea
                value={documentContent}
                onChange={handleTextChange}
                className="w-full flex-1 bg-transparent text-slate-900 dark:text-gray-100 font-mono text-sm leading-relaxed focus:outline-none resize-none p-2 selection:bg-cyan-500/30 border-none"
                placeholder="Type or edit document content..."
              />
            </div>

            {/* Current Focus Issue Sidebar (1 Column) */}
            <div className="bg-slate-50 dark:bg-[#11131c] border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex flex-col space-y-4 justify-between overflow-y-auto shadow-xl">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Issue {activeIndex + 1} of {matches.length || 1}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => setActiveIndex((prev) => (prev > 0 ? prev - 1 : matches.length - 1))}
                      className="p-1 text-gray-400 hover:text-white bg-white/5 rounded"
                      title="Previous Issue (P)"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveIndex((prev) => (prev < matches.length - 1 ? prev + 1 : 0))}
                      className="p-1 text-gray-400 hover:text-white bg-white/5 rounded"
                      title="Next Issue (N)"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {currentMatch ? (
                  <div className="space-y-4 text-xs">
                    <div className="bg-black/50 p-3.5 rounded-xl border border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded">
                          {currentMatch.similarityScore || currentMatch.score}% Similarity
                        </span>
                        <span className="text-gray-400 font-medium capitalize">
                          Confidence: {currentMatch.confidence}
                        </span>
                      </div>
                      <p className="text-gray-200 font-mono text-[11px] leading-relaxed">
                        "{currentMatch.originalText}"
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-gray-400 font-medium block">Explanation Signal:</span>
                      <p className="text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 leading-relaxed">
                        {currentMatch.explanation}
                      </p>
                    </div>

                    {currentMatch.sources[0] && (
                      <div className="bg-cyan-950/30 border border-cyan-500/20 p-3 rounded-lg space-y-1">
                        <span className="text-cyan-400 font-semibold block">Matched Source:</span>
                        <div className="text-white font-medium truncate">{currentMatch.sources[0].title}</div>
                        {currentMatch.sources[0].url && (
                          <div className="text-gray-400 truncate">{currentMatch.sources[0].url}</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 text-xs">No active issue selected.</div>
                )}
              </div>

              {/* Quick AI Writing Actions */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <WritingCoachToolbar
                  selectedText={currentMatch?.originalText || ''}
                  onApplyRewrite={(newText) => {
                    if (currentMatch) {
                      const updated = documentContent.replace(currentMatch.originalText, newText);
                      setDocumentContent(updated);
                      setIsOutdated(true);
                      if (onUpdateText) onUpdateText(updated);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
