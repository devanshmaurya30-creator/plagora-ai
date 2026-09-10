import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, CheckCircle2, Cpu } from 'lucide-react';
import type { Match } from '../../types/analysis';
import { MatchBadge } from './MatchBadges';
import { ConfidenceMeter } from './ConfidenceMeter';
import { VerificationBadge } from './VerificationBadge';
import type { VerificationState } from './VerificationBadge';

interface MatchAIExplanationProps {
  match: Match;
  className?: string;
}

export const MatchAIExplanation: React.FC<MatchAIExplanationProps> = ({ match, className = '' }) => {
  const getVerificationState = (): VerificationState => {
    if (match.evidence?.webVerification?.verified || match.sources?.[0]?.verified) {
      return 'VERIFIED';
    }
    if (match.hasWebMatch || match.sources?.length > 0) {
      return 'PROBABLE';
    }
    return 'UNAVAILABLE';
  };

  const verificationState = getVerificationState();
  const primarySource = match.sources?.[0];

  // Derive factual factor list supported strictly by actual analysis data
  const getFactorList = () => {
    const factors: string[] = [];
    if (match.similarityScore >= 70 || match.type === 'exact') {
      factors.push('High textual similarity with reference content');
    }
    if (match.classification === 'exact_match' || match.classification === 'near_match') {
      factors.push('Matching n-gram phrase structure');
    }
    if (match.classification === 'paraphrase' || match.type === 'paraphrase') {
      factors.push('Paraphrased sentence structure and reworded concepts');
    }
    if (match.classification === 'semantic_match' || match.type === 'semantic') {
      factors.push('Deep contextual semantic vector alignment');
    }
    if (verificationState === 'VERIFIED') {
      factors.push('Verified web source overlap');
    } else if (verificationState === 'PROBABLE') {
      factors.push('Probable web source relationship');
    }
    return factors.length > 0 ? factors : ['Potential phrase overlap identified during scanning'];
  };

  const factors = getFactorList();

  return (
    <motion.div
      initial={{ opacity: 0, x: -15, scale: 0.97, filter: 'blur(8px)' }}
      animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, x: 15, scale: 0.97, filter: 'blur(4px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-3xl border border-white/20 bg-neutral-950/90 p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-2xl text-slate-100 select-none ${className}`}
    >
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl border border-blue-400/40 bg-blue-500/10 flex items-center justify-center text-blue-400 shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-tight">AI MATCH EXPLANATION</h3>
              <MatchBadge
                classification={match.classification}
                type={match.type}
                webVerified={verificationState === 'VERIFIED'}
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Why was this passage flagged as potentially similar content?
            </p>
          </div>
        </div>

        <ConfidenceMeter confidence={match.confidence} />
      </div>

      {/* Similarity & Verification Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-extrabold font-mono text-white">{match.similarityScore}%</div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Similarity Score</span>
            <span className="text-[11px] text-slate-400">Potentially similar content</span>
          </div>
        </div>

        <div className="flex items-center justify-start sm:justify-end">
          <VerificationBadge
            state={verificationState}
            domain={primarySource?.domain}
            url={primarySource?.url}
          />
        </div>
      </div>

      {/* Factual Explanation Box */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-blue-400" />
          Why This Was Flagged
        </h4>
        <div className="p-4 rounded-2xl border border-white/10 bg-black/40 text-xs leading-relaxed text-slate-200 font-sans">
          {match.explanation ||
            'Deep contextual analysis detected significant sentence structure overlap and semantic vector alignment.'}
        </div>
      </div>

      {/* Contributing Factors */}
      <div className="space-y-2">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
          Key Detected Factors:
        </h4>
        <div className="space-y-1.5">
          {factors.map((factor, idx) => (
            <motion.div
              key={factor}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex items-center gap-2 text-xs text-slate-300 bg-white/[0.015] px-3 py-1.5 rounded-xl border border-white/5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>{factor}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Evidence Breakdown */}
      {match.evidence && (
        <div className="pt-2 border-t border-white/10 space-y-2 text-xs">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Analysis Evidence:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {match.evidence.localMatch && (
              <div className="p-2.5 rounded-xl border border-white/10 bg-white/5">
                <span className="text-[10px] text-slate-500 block uppercase">Local Engine</span>
                <span className="font-mono font-bold text-white text-xs">
                  {match.evidence.localMatch.similarityScore}% match
                </span>
              </div>
            )}
            {match.evidence.geminiAnalysis && (
              <div className="p-2.5 rounded-xl border border-white/10 bg-white/5">
                <span className="text-[10px] text-slate-500 block uppercase">Gemini AI</span>
                <span className="font-mono font-bold text-blue-400 text-xs capitalize">
                  {match.evidence.geminiAnalysis.classification.replace('_', ' ')}
                </span>
              </div>
            )}
            {match.evidence.webVerification && (
              <div className="p-2.5 rounded-xl border border-white/10 bg-white/5">
                <span className="text-[10px] text-slate-500 block uppercase">Web Verification</span>
                <span className="font-mono font-bold text-emerald-400 text-xs">
                  {match.evidence.webVerification.verified ? 'Verified Source' : 'Unverified'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
