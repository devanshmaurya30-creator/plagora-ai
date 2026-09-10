import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, ShieldCheck } from 'lucide-react';

interface ConfidenceMeterProps {
  confidence: 'low' | 'medium' | 'high';
  className?: string;
  showTooltip?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  confidence,
  className = '',
  showTooltip = true,
}) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  const getConfidenceLevel = () => {
    switch (confidence) {
      case 'high':
        return { activeBars: 3, label: 'HIGH', color: 'bg-blue-400 text-blue-300 border-blue-400/40' };
      case 'medium':
        return { activeBars: 2, label: 'MEDIUM', color: 'bg-amber-400 text-amber-300 border-amber-400/40' };
      case 'low':
      default:
        return { activeBars: 1, label: 'LOW', color: 'bg-slate-400 text-slate-300 border-slate-400/40' };
    }
  };

  const level = getConfidenceLevel();

  return (
    <div className={`relative inline-flex items-center gap-2.5 select-none ${className}`}>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            AI Confidence:
          </span>
          <span className={`text-[11px] font-bold font-mono px-2 py-0.2 rounded border ${level.color}`}>
            {level.label}
          </span>
        </div>

        {/* 3-Segmented Visual Meter */}
        <div className="flex items-center gap-1 mt-1.5">
          {[1, 2, 3].map((bar) => {
            const isActive = bar <= level.activeBars;
            return (
              <motion.div
                key={bar}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: bar * 0.08, duration: 0.3 }}
                className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                  isActive
                    ? level.activeBars === 3
                      ? 'bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                      : level.activeBars === 2
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-slate-400'
                    : 'bg-white/10'
                }`}
                style={{ width: 24 }}
              />
            );
          })}
        </div>
      </div>

      {/* Interactive Tooltip Info Icon */}
      {showTooltip && (
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setIsTooltipOpen(true)}
            onMouseLeave={() => setIsTooltipOpen(false)}
            onClick={() => setIsTooltipOpen(!isTooltipOpen)}
            className="p-1 text-slate-500 hover:text-slate-200 transition-colors rounded-full focus:outline-none"
            aria-label="What does confidence mean?"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          <AnimatePresence>
            {isTooltipOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-2xl border border-white/20 bg-neutral-900/95 text-slate-200 text-xs shadow-2xl backdrop-blur-xl z-30 pointer-events-none"
              >
                <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  What does confidence mean?
                </h4>
                <p className="text-[11px] leading-relaxed text-slate-400">
                  Confidence represents how strongly the available evidence supports the detected similarity.
                  It is visually and conceptually separate from the similarity percentage.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
