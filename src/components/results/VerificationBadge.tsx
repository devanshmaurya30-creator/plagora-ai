import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, GlobeOff, ExternalLink } from 'lucide-react';
import { sanitizeUrl } from '../../lib/urlSanitizer';
import { MagneticIcon } from '../ui/MagneticIcon';

export type VerificationState = 'VERIFIED' | 'PROBABLE' | 'UNAVAILABLE';

interface VerificationBadgeProps {
  state: VerificationState;
  domain?: string;
  url?: string;
  className?: string;
  showDetails?: boolean;
  explanation?: string;
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  state,
  domain,
  url,
  className = '',
  showDetails = false,
  explanation,
}) => {
  const safeUrl = sanitizeUrl(url || '');

  const getConfig = () => {
    switch (state) {
      case 'VERIFIED':
        return {
          label: 'VERIFIED WEB MATCH',
          icon: CheckCircle2,
          style: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
          iconColor: 'text-emerald-400',
          desc: explanation || 'Sufficient evidence verifies this passage against indexed web content.',
        };
      case 'PROBABLE':
        return {
          label: 'PROBABLE MATCH',
          icon: AlertTriangle,
          style: 'border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
          iconColor: 'text-amber-400',
          desc: explanation || 'This source appears relevant, but the available evidence is insufficient to classify the relationship as verified.',
        };
      case 'UNAVAILABLE':
      default:
        return {
          label: 'WEB VERIFICATION UNAVAILABLE',
          icon: GlobeOff,
          style: 'border-slate-500/30 bg-slate-500/10 text-slate-400',
          iconColor: 'text-slate-400',
          desc: explanation || 'Web search or live verification was unavailable during this scan step.',
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold font-mono tracking-wider border select-none transition-colors ${config.style}`}
      >
        <Icon className={`w-3.5 h-3.5 ${config.iconColor}`} />
        <span>{config.label}</span>
      </motion.div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-slate-400 bg-black/40 p-3 rounded-xl border border-white/10 space-y-2"
        >
          <p className="text-[11px] leading-relaxed italic">{config.desc}</p>
          {(domain || safeUrl) && (
            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
              {domain && <span className="font-mono text-slate-300">{domain}</span>}
              {safeUrl && (
                <a
                  href={safeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-white font-medium transition-colors"
                >
                  <span>Visit Source</span>
                  <MagneticIcon maxOffset={2}>
                    <ExternalLink className="w-3 h-3" />
                  </MagneticIcon>
                </a>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
