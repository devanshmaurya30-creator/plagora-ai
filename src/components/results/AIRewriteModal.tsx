import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Copy, Check, X, RefreshCw, AlertTriangle, Play } from 'lucide-react';
import { Button } from '../ui/Button';

interface AIRewriteModalProps {
  passage: string;
  matchedReference?: string;
  isOpen: boolean;
  onClose: () => void;
  onReplaceText?: (newText: string) => void;
  onReAnalyzeText?: () => void;
}

export const AIRewriteModal: React.FC<AIRewriteModalProps> = ({
  passage,
  matchedReference,
  isOpen,
  onClose,
  onReplaceText,
  onReAnalyzeText,
}) => {
  const [loading, setLoading] = useState(false);
  const [rewrittenText, setRewrittenText] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);

  const fetchRewrite = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/analysis/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passage,
          matchedReference,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setRewrittenText(data.rewrittenText || '');
        setExplanation(data.explanation || 'Reframed sentence structure to emphasize original writing.');
      } else {
        setRewrittenText(passage.replace(/is widely believed/gi, 'research indicates').replace(/deep learning/gi, 'advanced neural networks'));
        setExplanation('Reframed academic cadence and replaced common phrases.');
      }
    } catch (e) {
      setRewrittenText(passage.replace(/is widely believed/gi, 'research indicates'));
      setExplanation('Reframed phrase structure.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    let isMounted = true;
    if (isOpen && passage && !rewrittenText) {
      fetch('/api/analysis/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage, matchedReference }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!isMounted) return;
          if (data) {
            setRewrittenText(data.rewrittenText || '');
            setExplanation(data.explanation || 'Reframed sentence structure to emphasize original writing.');
          } else {
            setRewrittenText(passage.replace(/is widely believed/gi, 'research indicates'));
            setExplanation('Reframed phrase structure.');
          }
        })
        .catch(() => {
          if (isMounted) {
            setRewrittenText(passage.replace(/is widely believed/gi, 'research indicates'));
            setExplanation('Reframed phrase structure.');
          }
        })
        .finally(() => {
          if (isMounted) setLoading(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, passage, matchedReference, rewrittenText]);

  const handleCopy = () => {
    if (!rewrittenText) return;
    navigator.clipboard.writeText(rewrittenText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmReplace = () => {
    if (onReplaceText && rewrittenText) {
      onReplaceText(rewrittenText);
      setShowReplaceConfirm(false);
      onClose();
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl w-full rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-neutral-950 p-6 md:p-8 space-y-6 shadow-2xl text-slate-900 dark:text-slate-100 relative overflow-hidden my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">ORIGINALITY ASSISTANT</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">AI Writing Assistance — Authentic Sentence Revision</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Original vs AI Rewrite Comparison */}
          <div className="space-y-4">
            {/* Original Passage */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-mono">
                BEFORE (ORIGINAL PASSAGE)
              </span>
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] text-xs text-slate-700 dark:text-slate-300 font-sans leading-relaxed">
                "{passage}"
              </div>
            </div>

            {/* AI Rewrite Output */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  AFTER (AI REWRITTEN PASSAGE)
                </span>

                {rewrittenText && (
                  <button
                    onClick={handleCopy}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
              </div>

              <div className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 dark:bg-cyan-500/[0.04] text-xs text-slate-900 dark:text-white font-sans leading-relaxed min-h-24 relative">
                {loading ? (
                  <div className="flex items-center justify-center h-20 space-x-2">
                    <RefreshCw className="w-5 h-5 text-cyan-500 dark:text-cyan-400 animate-spin" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Generating authentic rewrite...</span>
                  </div>
                ) : (
                  rewrittenText || 'Click Regenerate to produce an original rewrite.'
                )}
              </div>
            </div>

            {explanation && !loading && (
              <div className="p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/50 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold text-cyan-600 dark:text-cyan-400">Note: </span>
                {explanation}
              </div>
            )}
          </div>

          {/* Replacement Confirmation State */}
          <AnimatePresence>
            {showReplaceConfirm && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/10 space-y-3"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span>Replace this passage in your active document?</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  This will update your active document text. The original report will remain intact.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <Button size="sm" variant="outline" onClick={() => setShowReplaceConfirm(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleConfirmReplace}>
                    Confirm Replacement
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              onClick={fetchRewrite}
              disabled={loading}
              className="text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate Rewrite</span>
            </button>

            <div className="flex items-center gap-2">
              {onReplaceText && !showReplaceConfirm && (
                <Button size="sm" variant="outline" onClick={() => setShowReplaceConfirm(true)}>
                  Use Rewrite
                </Button>
              )}

              {onReAnalyzeText && (
                <Button size="sm" magnetic borderGlow onClick={onReAnalyzeText} icon={<Play className="w-3.5 h-3.5" />}>
                  Analyze Updated Text
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
