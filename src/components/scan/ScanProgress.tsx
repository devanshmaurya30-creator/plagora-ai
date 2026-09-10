import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, FileText, Cpu, Search, Sparkles, Globe, FileCheck } from 'lucide-react';
import type { ProgressState } from '../../types/analysis';

interface ScanProgressProps {
  progressState: ProgressState;
  fileName: string;
}

export const ScanProgress: React.FC<ScanProgressProps> = ({ progressState, fileName }) => {
  // Main Analysis Pipeline Nodes (Requirement 31)
  const mainNodes = [
    { label: 'Text Extraction', icon: FileText, stepMatch: [0, 1] },
    { label: 'Exact Matching', icon: Search, stepMatch: [2, 3] },
    { label: 'Semantic Analysis', icon: Cpu, stepMatch: [4] },
    { label: 'Paraphrase Analysis', icon: Sparkles, stepMatch: [5] },
    { label: 'Web Verification', icon: Globe, stepMatch: [6] },
    { label: 'Report Generation', icon: FileCheck, stepMatch: [7, 8] },
  ];

  const steps = [
    'Reading document',
    'Extracting text',
    'Preparing passages',
    'Checking exact matches',
    'Checking semantic similarity',
    'Detecting paraphrases',
    'Matching sources',
    'Calculating score',
    'Preparing report',
  ];

  return (
    <div className="w-full max-w-3xl mx-auto rounded-3xl border border-white/20 bg-white/[0.04] p-8 md:p-10 backdrop-blur-2xl shadow-2xl space-y-8 select-none">
      {/* Top Document Preview with Scanning Laser Sweep (Requirement 30) */}
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/70 p-6 flex items-center justify-between shadow-inner">
        {/* Moving ambient spotlight inside header */}
        <motion.div
          animate={{ x: ['0%', '100%', '0%'] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-transparent blur-xl pointer-events-none"
        />

        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center text-blue-400 shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white truncate max-w-xs">{fileName}</h4>
            <p className="text-xs text-slate-400 mt-0.5">Deep AI-level analysis in progress...</p>
          </div>
        </div>

        <div className="relative z-10 text-right">
          <span className="text-2xl font-bold font-mono text-white">
            {progressState.progressPercentage}%
          </span>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider">Progress</p>
        </div>

        {/* Animated Scanning Laser Sweep */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent animate-scan opacity-80 pointer-events-none shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
      </div>

      {/* Main Pipeline Nodes & Data Flow Animation (Requirements 31 & 32) */}
      <div className="py-2 px-1">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 relative">
          {/* Animated Connecting Data Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/10 -translate-y-1/2 hidden sm:block pointer-events-none z-0" />
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-400 -translate-y-1/2 hidden sm:block pointer-events-none z-0"
            initial={{ width: '0%' }}
            animate={{ width: `${(progressState.stepIndex / (steps.length - 1)) * 100}%` }}
            transition={{ ease: 'easeOut', duration: 0.3 }}
          />

          {mainNodes.map((node) => {
            const isCompleted = node.stepMatch.every((s) => s < progressState.stepIndex);
            const isActive = node.stepMatch.includes(progressState.stepIndex);
            const Icon = node.icon;

            return (
              <div key={node.label} className="relative z-10 flex flex-col items-center text-center">
                <motion.div
                  animate={
                    isActive
                      ? { scale: [1, 1.1, 1], boxShadow: ['0 0 10px rgba(59,130,246,0.3)', '0 0 25px rgba(59,130,246,0.6)', '0 0 10px rgba(59,130,246,0.3)'] }
                      : { scale: 1 }
                  }
                  transition={isActive ? { duration: 1.5, repeat: Infinity } : { duration: 0.2 }}
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-300 ${
                    isCompleted
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                      : isActive
                      ? 'border-blue-400 bg-blue-500/20 text-white font-bold'
                      : 'border-white/10 bg-white/[0.02] text-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </motion.div>
                <span className={`text-[10px] mt-2 font-medium ${isActive ? 'text-white' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                  {node.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-400 to-white rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"
          initial={{ width: '0%' }}
          animate={{ width: `${progressState.progressPercentage}%` }}
          transition={{ ease: 'easeOut', duration: 0.3 }}
        />
      </div>

      {/* Sequential Analysis Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {steps.map((step, idx) => {
          const isDone = idx < progressState.stepIndex;
          const isCurrent = idx === progressState.stepIndex;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={`p-3 rounded-xl border transition-all duration-300 flex items-center gap-3 ${
                isDone
                  ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-300'
                  : isCurrent
                  ? 'border-blue-500/50 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                  : 'border-white/5 bg-white/[0.01] text-slate-500'
              }`}
            >
              <div className="shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20" />
                )}
              </div>
              <span className="text-xs font-medium">{step}</span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
