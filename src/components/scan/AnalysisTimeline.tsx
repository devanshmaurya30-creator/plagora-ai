import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, RefreshCw, XCircle, AlertCircle, ChevronDown, ChevronUp, Layers } from 'lucide-react';

export type StageState = 'Pending' | 'Running' | 'Completed' | 'Failed' | 'Skipped';

export interface TimelineStage {
  id: string;
  name: string;
  description: string;
  state: StageState;
  details?: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface AnalysisTimelineProps {
  stages: TimelineStage[];
  onRetryStage?: (stageId: string) => void;
  className?: string;
}

export const AnalysisTimeline: React.FC<AnalysisTimelineProps> = ({
  stages,
  onRetryStage,
  className = '',
}) => {
  const [expandedStageId, setExpandedStageId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedStageId(expandedStageId === id ? null : id);
  };

  return (
    <div className={`rounded-3xl border border-white/20 bg-neutral-950/90 p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-2xl text-slate-100 select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl border border-blue-400/40 bg-blue-500/10 flex items-center justify-center text-blue-400">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight uppercase">REAL-TIME PIPELINE TIMELINE</h3>
            <p className="text-[11px] text-slate-400">Live Stage Execution & Diagnostics</p>
          </div>
        </div>
      </div>

      {/* Stages List */}
      <div className="space-y-3">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isExpanded = expandedStageId === stage.id;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04 }}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                stage.state === 'Running'
                  ? 'border-blue-400/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                  : stage.state === 'Completed'
                  ? 'border-white/10 bg-white/[0.02]'
                  : stage.state === 'Failed'
                  ? 'border-red-500/40 bg-red-500/10'
                  : 'border-white/5 bg-white/[0.01] opacity-60'
              }`}
            >
              {/* Row Banner */}
              <div
                onClick={() => stage.details && toggleExpand(stage.id)}
                className={`p-4 flex items-center justify-between gap-4 cursor-pointer select-none`}
              >
                <div className="flex items-center gap-3">
                  {/* Status Indicator Icon */}
                  <div className="shrink-0">
                    {stage.state === 'Completed' && (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/40">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                    {stage.state === 'Running' && (
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/40 animate-pulse">
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                    {stage.state === 'Failed' && (
                      <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center border border-red-400/40">
                        <XCircle className="w-4 h-4" />
                      </div>
                    )}
                    {stage.state === 'Skipped' && (
                      <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/40">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    )}
                    {stage.state === 'Pending' && (
                      <div className="w-7 h-7 rounded-full bg-white/10 text-slate-500 flex items-center justify-center border border-white/10">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-white">{stage.name}</h4>
                      <span
                        className={`text-[9px] font-mono font-semibold px-2 py-0.2 rounded-full uppercase ${
                          stage.state === 'Completed'
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : stage.state === 'Running'
                            ? 'text-blue-400 bg-blue-500/10'
                            : stage.state === 'Failed'
                            ? 'text-red-400 bg-red-500/10'
                            : stage.state === 'Skipped'
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-slate-500 bg-white/5'
                        }`}
                      >
                        {stage.state}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">{stage.description}</p>
                  </div>
                </div>

                {/* Expand / Retry Controls */}
                <div className="flex items-center gap-2">
                  {stage.state === 'Failed' && onRetryStage && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRetryStage(stage.id);
                      }}
                      className="px-2.5 py-1 rounded-lg border border-red-400/40 bg-red-500/20 text-[10px] font-semibold text-white hover:bg-red-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Retry
                    </button>
                  )}

                  {stage.details && (
                    <button className="text-slate-400 hover:text-white p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Diagnostics Drawer */}
              <AnimatePresence>
                {isExpanded && stage.details && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 pb-4 pt-1 border-t border-white/5 text-xs text-slate-300 font-mono leading-relaxed bg-black/40"
                  >
                    {stage.details}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
