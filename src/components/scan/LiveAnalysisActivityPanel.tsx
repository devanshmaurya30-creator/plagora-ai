import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileUp,
  FileText,
  Filter,
  Search,
  Copy,
  Sparkles,
  Cpu,
  Globe,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Clock,
  Activity,
} from 'lucide-react';
import type { ProgressState } from '../../types/analysis';

export interface StageInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const PIPELINE_STAGES: StageInfo[] = [
  {
    id: 'upload',
    name: 'Uploading Document',
    description: 'Validating file format, size, and document structure...',
    icon: FileUp,
  },
  {
    id: 'extract',
    name: 'Extracting Text',
    description: 'Parsing text nodes, headings, and paragraph layout...',
    icon: FileText,
  },
  {
    id: 'normalize',
    name: 'Normalizing Content',
    description: 'Cleaning punctuation, whitespace, and contextual passages...',
    icon: Filter,
  },
  {
    id: 'exact',
    name: 'Finding Exact Matches',
    description: 'Checking literal n-gram sentence overlaps against indexed database...',
    icon: Search,
  },
  {
    id: 'near',
    name: 'Finding Near Matches',
    description: 'Evaluating structural phrase similarities and repeated content...',
    icon: Copy,
  },
  {
    id: 'paraphrase',
    name: 'Analyzing Paraphrases',
    description: 'Checking contextual rewording and sentence structure variations...',
    icon: Sparkles,
  },
  {
    id: 'semantic',
    name: 'Semantic Similarity Analysis',
    description: 'Comparing deep contextual meaning and vector embeddings...',
    icon: Cpu,
  },
  {
    id: 'web',
    name: 'Web Verification',
    description: 'Querying search indexes for live web reference verification...',
    icon: Globe,
  },
  {
    id: 'report',
    name: 'Building Report',
    description: 'Aggregating similarity scores, source links, and audit evidence...',
    icon: FileCheck,
  },
];

interface LiveAnalysisActivityPanelProps {
  progressState: ProgressState;
  fileName: string;
  onRetry?: () => void;
  failedStageId?: string | null;
  failureReason?: string | null;
}

export const LiveAnalysisActivityPanel: React.FC<LiveAnalysisActivityPanelProps> = ({
  progressState,
  fileName,
  onRetry,
  failedStageId = null,
  failureReason = null,
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Map progressStep index to PIPELINE_STAGES
  const activeStepIdx = Math.min(progressState.stepIndex, PIPELINE_STAGES.length - 1);
  const currentStage = PIPELINE_STAGES[activeStepIdx];

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl border border-white/20 bg-neutral-950/90 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl space-y-8 select-none relative overflow-hidden">
      {/* Background Ambient Glow */}
      <motion.div
        animate={{
          opacity: [0.15, 0.35, 0.15],
          scale: [0.95, 1.05, 0.95],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-tr from-blue-600/20 via-purple-500/20 to-transparent blur-3xl pointer-events-none -z-10"
      />

      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center text-blue-400 shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight truncate max-w-xs sm:max-w-md">
              {fileName}
            </h3>
            <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span>Live Analysis Pipeline</span>
            </p>
          </div>
        </div>

        {/* Live Metrics: Elapsed Time, Progress, Completed Steps */}
        <div className="flex items-center gap-4 text-right justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" /> Elapsed
            </span>
            <span className="text-sm font-bold font-mono text-slate-200">{elapsedSeconds}s</span>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block flex items-center gap-1">
              <Activity className="w-3 h-3 text-blue-400" /> Completed
            </span>
            <span className="text-sm font-bold font-mono text-slate-200">
              {Math.min(progressState.stepIndex, PIPELINE_STAGES.length)} / {PIPELINE_STAGES.length}
            </span>
          </div>

          <div className="text-right pl-2 border-l border-white/10">
            <span className="text-2xl font-extrabold font-mono text-white">
              {progressState.progressPercentage}%
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Progress</span>
          </div>
        </div>
      </div>

      {/* Progress Bar with Data-Flow Animation Line */}
      <div className="relative w-full bg-white/10 h-2.5 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-emerald-400 rounded-full shadow-[0_0_18px_rgba(59,130,246,0.7)]"
          initial={{ width: '0%' }}
          animate={{ width: `${progressState.progressPercentage}%` }}
          transition={{ ease: 'easeOut', duration: 0.35 }}
        />
      </div>

      {/* Current Active Contextual Message */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStage.id}
          initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
          transition={{ duration: 0.3 }}
          className="p-4 rounded-2xl border border-blue-500/30 bg-blue-500/10 text-white flex items-center gap-3.5 shadow-lg"
        >
          <div className="w-8 h-8 rounded-xl border border-blue-400/40 bg-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <currentStage.icon className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-tight text-white flex items-center gap-2">
              <span>{currentStage.name}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-400/20 text-blue-300 border border-blue-400/30 animate-pulse">
                ACTIVE STAGE
              </span>
            </h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{currentStage.description}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 9 Stage Pipeline Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
        {PIPELINE_STAGES.map((stage, idx) => {
          const isFailed = failedStageId === stage.id;
          const isCompleted = idx < progressState.stepIndex && !isFailed;
          const isActive = idx === progressState.stepIndex && !isFailed;
          const Icon = stage.icon;

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.35 }}
              className={`p-3.5 rounded-2xl border transition-all duration-300 flex items-start gap-3 relative overflow-hidden ${
                isFailed
                  ? 'border-red-500/40 bg-red-500/10 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                  : isCompleted
                  ? 'border-emerald-500/30 bg-emerald-500/[0.06] text-slate-200'
                  : isActive
                  ? 'border-blue-400/60 bg-blue-500/15 text-white shadow-[0_0_20px_rgba(59,130,246,0.25)] ring-1 ring-blue-400/30'
                  : 'border-white/5 bg-white/[0.015] text-slate-500'
              }`}
            >
              {/* Stage Icon Status */}
              <div className="shrink-0 mt-0.5">
                {isFailed ? (
                  <div className="w-6 h-6 rounded-full border border-red-500/40 bg-red-500/20 flex items-center justify-center text-red-400">
                    <AlertCircle className="w-3.5 h-3.5" />
                  </div>
                ) : isCompleted ? (
                  <motion.div
                    initial={{ scale: 0.7 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full border border-emerald-500/40 bg-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </motion.div>
                ) : isActive ? (
                  <motion.div
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="w-6 h-6 rounded-full border border-blue-400 bg-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.5)]"
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </motion.div>
                ) : (
                  <div className="w-6 h-6 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-600">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {/* Stage Name & Status Badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`text-xs font-semibold truncate ${isActive ? 'text-white' : isCompleted ? 'text-slate-200' : isFailed ? 'text-red-300' : 'text-slate-500'}`}>
                    {stage.name}
                  </span>
                </div>

                <p className={`text-[10px] leading-tight mt-0.5 line-clamp-1 ${isActive ? 'text-blue-200' : isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>
                  {isFailed ? failureReason || 'Stage execution failed' : stage.description}
                </p>

                {/* State Tag */}
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span
                    className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${
                      isFailed
                        ? 'border-red-500/40 bg-red-500/20 text-red-300'
                        : isCompleted
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : isActive
                        ? 'border-blue-400/40 bg-blue-500/20 text-blue-300 font-bold'
                        : 'border-white/10 bg-white/5 text-slate-600'
                    }`}
                  >
                    {isFailed ? 'FAILED' : isCompleted ? 'COMPLETED' : isActive ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>
              </div>

              {/* Retry Button on Failed Stage */}
              {isFailed && onRetry && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="shrink-0 p-1.5 rounded-lg border border-red-500/40 bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors flex items-center gap-1 text-[10px] font-semibold"
                >
                  <RotateCcw className="w-3 h-3" /> Retry
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
