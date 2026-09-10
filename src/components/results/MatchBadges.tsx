import React from 'react';
import { motion } from 'framer-motion';
import type { MatchClassification, MatchType } from '../../types/analysis';

interface MatchBadgeProps {
  classification?: MatchClassification;
  type?: MatchType;
  webVerified?: boolean;
  className?: string;
}

export const MatchBadge: React.FC<MatchBadgeProps> = ({
  classification,
  type,
  webVerified = false,
  className = '',
}) => {
  const getBadgeDetails = () => {
    if (webVerified) {
      return {
        label: 'WEB VERIFIED',
        style: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      };
    }

    if (classification === 'exact_match' || type === 'exact') {
      return {
        label: 'EXACT MATCH',
        style: 'border-red-500/40 bg-red-500/10 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.2)]',
      };
    }

    if (classification === 'near_match' || type === 'repeated') {
      return {
        label: 'NEAR MATCH',
        style: 'border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      };
    }

    if (classification === 'paraphrase' || type === 'paraphrase') {
      return {
        label: 'PARAPHRASE',
        style: 'border-amber-400/40 bg-amber-400/10 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.2)]',
      };
    }

    if (classification === 'semantic_match' || type === 'semantic') {
      return {
        label: 'SEMANTIC',
        style: 'border-blue-500/40 bg-blue-500/10 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.2)]',
      };
    }

    return {
      label: 'POTENTIAL MATCH',
      style: 'border-slate-500/40 bg-slate-500/10 text-slate-300',
    };
  };

  const { label, style } = getBadgeDetails();

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider border select-none transition-colors ${style} ${className}`}
    >
      {label}
    </motion.span>
  );
};
