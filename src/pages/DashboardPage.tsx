import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Eye, Trash2, PlusCircle, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react';
import { Dropzone } from '../components/upload/Dropzone';
import { Button } from '../components/ui/Button';
import { getAllAnalyses, deleteAnalysis } from '../lib/analysisStore';
import type { AnalysisResult } from '../types/analysis';
import type { ParsedDocument } from '../types/document';
import { MagneticIcon } from '../components/ui/MagneticIcon';
import { TiltCard } from '../components/ui/TiltCard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    setScans(getAllAnalyses());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteAnalysis(id);
    setScans(getAllAnalyses());
  };

  const handleStartScanWithDocument = (doc: ParsedDocument) => {
    navigate('/scan', { state: { preloadedDoc: doc } });
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `Today (${diffHours}h ago)`;
    if (diffHours < 48) return 'Yesterday';
    return `${Math.floor(diffHours / 24)} days ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 sm:space-y-10 min-h-screen select-none text-slate-900 dark:text-slate-100"
    >
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Good <span className="font-serif-italic font-normal text-slate-800 dark:text-slate-200">evening.</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">Check your next document for AI plagiarism.</p>
        </div>

        <Button size="md" magnetic borderGlow onClick={() => navigate('/scan')} icon={<PlusCircle className="w-4 h-4" />}>
          New Document Scan
        </Button>
      </div>

      {/* Main Upload Dropzone */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">
          Quick Upload & Audit
        </h2>
        <Dropzone onStartAnalysis={handleStartScanWithDocument} />
      </div>

      {/* Recent Scans Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MagneticIcon maxOffset={2}>
              <Clock className="w-4 h-4 text-cyan-600 dark:text-blue-400" />
            </MagneticIcon>
            <span>Recent Scans</span>
          </h2>
          <button
            onClick={() => navigate('/reports')}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-white flex items-center gap-1 transition-colors group cursor-pointer"
          >
            <span>View All Reports</span>
            <MagneticIcon maxOffset={3}>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform text-cyan-600 dark:text-slate-300" />
            </MagneticIcon>
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-sm dark:shadow-2xl">
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            <AnimatePresence mode="popLayout">
              {scans.length === 0 ? (
                <div key="no-scans" className="p-8 text-center text-xs text-slate-500">No scans completed yet.</div>
              ) : (
                scans.map((scan, idx) => (
                  <motion.div
                    key={scan.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ delay: idx * 0.04, duration: 0.3 }}
                  >
                    <TiltCard
                      maxRotate={1.5}
                      liftY={-3}
                      onClick={() => navigate(`/results/${scan.id}`)}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-0 rounded-none bg-transparent hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-cyan-600 dark:text-blue-400 shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                            {scan.documentName}
                          </h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>{formatTimeAgo(scan.createdAt)}</span>
                            <span>•</span>
                            <span className="font-mono">{scan.wordCount.toLocaleString()} words</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                        {/* Score Badge */}
                        <div className="text-right">
                          <span
                            className={`text-xs font-bold font-mono px-2.5 py-1 rounded-full border ${
                              scan.similarityScore <= 10
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : scan.similarityScore <= 25
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
                            }`}
                          >
                            {scan.similarityScore}% similarity
                          </span>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 justify-end">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Completed
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/results/${scan.id}`);
                            }}
                            icon={<Eye className="w-4 h-4" />}
                          >
                            View Report
                          </Button>
                          <button
                            onClick={(e) => handleDelete(scan.id, e)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/10 transition-colors rounded-lg cursor-pointer"
                            title="Delete scan record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </TiltCard>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
