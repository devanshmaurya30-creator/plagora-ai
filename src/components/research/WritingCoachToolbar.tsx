import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Check, RefreshCw, AlertTriangle, X, HelpCircle } from 'lucide-react';

interface WritingCoachToolbarProps {
  selectedText: string;
  onApplyRewrite: (newText: string) => void;
  onClose?: () => void;
}

export const WritingCoachToolbar: React.FC<WritingCoachToolbarProps> = ({
  selectedText,
  onApplyRewrite,
  onClose,
}) => {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [suggestedText, setSuggestedText] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  if (!selectedText.trim()) return null;

  const containsClaim = /\d+%|\b(in\s+(?:19|20)\d{2}|demonstrated|found that|increased by)\b/i.test(selectedText);
  const containsCitation = /\[\d+\]|\([A-Z][a-z]+,\s*(?:19|20)\d{2}\)/.test(selectedText);

  const handleAction = async (action: string) => {
    setLoadingAction(action);
    setWarning(null);

    if (containsClaim) {
      setWarning('This rewrite may change the meaning of the original claim. Review before applying.');
    } else if (containsCitation) {
      setWarning('Citation context may need review after applying.');
    }

    try {
      const res = await fetch('/api/analysis/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passage: selectedText, context: action }),
      });

      if (!res.ok) throw new Error('Rewrite service error');
      const data = await res.json();

      setSuggestedText(data.rewrittenText || selectedText);
      setExplanation(data.explanation || `Applied authentic academic phrasing for ${action}.`);
    } catch {
      // Local fallback rewrite
      let fallback = selectedText;
      if (action === 'Improve Clarity') {
        fallback = selectedText.replace(/due to the fact that/gi, 'because').replace(/in order to/gi, 'to');
      } else if (action === 'Reduce Repetition') {
        fallback = selectedText.replace(/furthermore,/gi, 'in addition,');
      } else if (action === 'Academic Tone') {
        fallback = selectedText.replace(/^And\b/i, 'Furthermore,').replace(/^But\b/i, 'However,');
      } else {
        fallback = selectedText.replace(/a lot of/gi, 'numerous');
      }
      setSuggestedText(fallback);
      setExplanation(`Local rewrite applied for ${action}.`);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="bg-[#0f121d] border border-cyan-500/30 rounded-xl p-4 shadow-2xl space-y-3 text-xs w-full max-w-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-white">AI Writing Coach Assistant</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      {!suggestedText && (
        <div className="flex flex-wrap gap-2 pt-1">
          {['Improve Clarity', 'Reduce Repetition', 'Academic Tone', 'Shorten', 'Improve Flow'].map((act) => (
            <button
              key={act}
              onClick={() => handleAction(act)}
              disabled={Boolean(loadingAction)}
              className="px-3 py-1.5 bg-white/5 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-white/10 rounded-lg text-gray-200 hover:text-cyan-300 font-medium transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              {loadingAction === act ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{act}</span>
            </button>
          ))}
        </div>
      )}

      {/* Warning Notice if Factual Claim or Citation Present */}
      {warning && (
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center space-x-2 text-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{warning}</span>
        </div>
      )}

      {/* Suggested Rewrite Diff */}
      {suggestedText && (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-black/50 p-3 rounded-lg border border-red-500/20">
              <span className="text-[10px] uppercase font-bold text-red-400 block mb-1">Original Text</span>
              <p className="text-gray-300 font-mono text-[11px] leading-relaxed">"{selectedText}"</p>
            </div>
            <div className="bg-black/50 p-3 rounded-lg border border-emerald-500/20">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">Suggested Revision</span>
              <p className="text-emerald-200 font-mono text-[11px] leading-relaxed">"{suggestedText}"</p>
            </div>
          </div>

          {explanation && (
            <div className="text-gray-400 text-[11px] flex items-center space-x-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>{explanation}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-1">
            <button
              onClick={() => {
                setSuggestedText(null);
                setExplanation(null);
                setWarning(null);
              }}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onApplyRewrite(suggestedText);
                setSuggestedText(null);
              }}
              className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg transition-all flex items-center space-x-1.5 shadow-lg shadow-cyan-500/20"
            >
              <Check className="w-4 h-4" />
              <span>Apply Suggestion</span>
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
