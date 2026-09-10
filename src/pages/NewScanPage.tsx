import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, CheckSquare, Square } from 'lucide-react';
import { Dropzone } from '../components/upload/Dropzone';
import { LiveAnalysisActivityPanel } from '../components/scan/LiveAnalysisActivityPanel';
import { Button } from '../components/ui/Button';
import type { ParsedDocument } from '../types/document';
import type { DetectionOptions, ProgressState } from '../types/analysis';
import { analyzeDocument } from '../lib/plagiarismService';

export const NewScanPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [document, setDocument] = useState<ParsedDocument | null>(
    (location.state as any)?.preloadedDoc || null
  );

  const [detectionDepth, setDetectionDepth] = useState<'quick' | 'standard' | 'deep'>('deep');

  const [options, setOptions] = useState<Omit<DetectionOptions, 'depth'>>({
    exactMatch: true,
    semanticSimilarity: true,
    paraphraseDetection: true,
    repeatedContent: true,
  });

  const [isScanning, setIsScanning] = useState(false);
  const [failedStageId, setFailedStageId] = useState<string | null>(null);
  const [failureReason, setFailureReason] = useState<string | null>(null);

  const [progressState, setProgressState] = useState<ProgressState>({
    stepIndex: 0,
    currentStep: 'Uploading Document',
    progressPercentage: 0,
    completedSteps: [],
    totalSteps: 9,
  });

  const handleDocumentReady = (doc: ParsedDocument) => {
    setDocument(doc);
  };

  const toggleOption = (key: keyof Omit<DetectionOptions, 'depth'>) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartAnalysis = async () => {
    if (!document) return;

    setIsScanning(true);
    setFailedStageId(null);
    setFailureReason(null);

    const fullOptions: DetectionOptions = {
      ...options,
      depth: detectionDepth,
    };

    try {
      const result = await analyzeDocument(document, fullOptions, (progress) => {
        setProgressState(progress);
      });

      // Small pause after 100% completion before navigating
      setTimeout(() => {
        navigate(`/results/${result.id}`);
      }, 500);
    } catch (err: any) {
      setFailedStageId('semantic');
      setFailureReason('Analysis engine encountered a temporary timeout. You can retry.');
    }
  };

  const estimatedScanTime = document
    ? Math.max(2, Math.ceil(document.wordCount / 1500))
    : 3;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(6px)' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 min-h-screen select-none"
    >
      <AnimatePresence mode="wait">
        {isScanning && document ? (
          <motion.div
            key="scanning-progress"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pt-6"
          >
            <LiveAnalysisActivityPanel
              progressState={progressState}
              fileName={document.fileName}
              failedStageId={failedStageId}
              failureReason={failureReason}
              onRetry={handleStartAnalysis}
            />
          </motion.div>
        ) : (
          <motion.div key="scan-setup" className="space-y-8">
            <div className="border-b border-white/10 pb-6">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">New Scan</h1>
              <p className="text-sm text-slate-400 mt-1">
                Configure your document analysis depth and detection preferences.
              </p>
            </div>

            {/* Dropzone */}
            <Dropzone onDocumentReady={handleDocumentReady} />

            {/* Document Configuration Options (Shown when doc ready) */}
            {document && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 space-y-8 shadow-2xl"
              >
                {/* Stats Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-white/10 bg-black/40 text-xs">
                  <div>
                    <span className="text-slate-500 block">Filename</span>
                    <span className="font-semibold text-white truncate block">{document.fileName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">File Size</span>
                    <span className="font-semibold text-white">
                      {(document.fileSize / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Word Count</span>
                    <span className="font-semibold text-white font-mono">
                      {document.wordCount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Est. Scan Time</span>
                    <span className="font-semibold text-blue-400">~{estimatedScanTime} sec</span>
                  </div>
                </div>

                {/* Detection Depth Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Detection Depth
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['quick', 'standard', 'deep'] as const).map((depth) => (
                      <button
                        key={depth}
                        type="button"
                        onClick={() => setDetectionDepth(depth)}
                        className={`p-3.5 rounded-xl border text-left transition-all duration-200 ${
                          detectionDepth === depth
                            ? 'border-white/40 bg-white/10 text-white shadow-lg'
                            : 'border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20'
                        }`}
                      >
                        <span className="text-sm font-semibold capitalize block">{depth}</span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {depth === 'quick'
                            ? 'Fast exact checks'
                            : depth === 'standard'
                            ? 'Balanced AI audit'
                            : 'Full semantic search'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Detection Checkboxes */}
                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                    Analysis Modules
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      {
                        key: 'exactMatch',
                        label: 'Exact phrase matching',
                        desc: 'Detects literal sentence copy-pasting',
                      },
                      {
                        key: 'semanticSimilarity',
                        label: 'Semantic similarity',
                        desc: 'Identifies deep AI-generated concept overlap',
                      },
                      {
                        key: 'paraphraseDetection',
                        label: 'Paraphrase detection',
                        desc: 'Catches structural rewording and ideas',
                      },
                      {
                        key: 'repeatedContent',
                        label: 'Repeated content detection',
                        desc: 'Audits internal passage repetition',
                      },
                    ].map((item) => {
                      const isChecked = options[item.key as keyof Omit<DetectionOptions, 'depth'>];
                      return (
                        <div
                          key={item.key}
                          onClick={() => toggleOption(item.key as any)}
                          className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer flex items-start gap-3 ${
                            isChecked
                              ? 'border-white/25 bg-white/[0.05] text-white'
                              : 'border-white/10 bg-white/[0.01] text-slate-400 hover:border-white/20'
                          }`}
                        >
                          <div className="mt-0.5 text-blue-400">
                            {isChecked ? (
                              <CheckSquare className="w-4 h-4 text-white" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-600" />
                            )}
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-white block">{item.label}</span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {item.desc}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Primary Button */}
                <div className="pt-4 flex justify-end">
                  <Button
                    size="lg"
                    magnetic
                    borderGlow
                    onClick={handleStartAnalysis}
                    className="w-full md:w-auto"
                    icon={<ArrowRight className="w-5 h-5" />}
                  >
                    Start Analysis
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
