import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Eye,
  Search,
  Trash2,
  Download,
  AlertTriangle,
  PlusCircle,
  ShieldCheck,
  FileCheck,
  Zap,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { getAllAnalyses, deleteAnalysis } from '../lib/analysisStore';
import type { AnalysisResult } from '../types/analysis';
import { Button } from '../components/ui/Button';
import { generatePDFReport } from '../lib/pdfGenerator';
import { containerStaggerVariants, itemFadeUpVariants, modalBackdropVariants, modalContentVariants } from '../lib/motion';
import { MorphingIcon } from '../components/ui/MotionIcons';
import { MagneticIcon } from '../components/ui/MagneticIcon';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<AnalysisResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'High Risk' | 'Moderate' | 'Low Risk'>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // PDF Generation State & Animated Sequence (Requirement 41)
  const [pdfGeneratingId, setPdfGeneratingId] = useState<string | null>(null);
  const [pdfStep, setPdfStep] = useState<'Preparing' | 'Formatting' | 'Generating' | 'Finalizing' | 'Ready'>('Preparing');

  // Delete Confirmation Modal State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    setReports(getAllAnalyses());
  }, []);

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteAnalysis(deleteTargetId);
      setReports(getAllAnalyses());
      setDeleteTargetId(null);
    }
  };

  const handleCopyId = (idStr: string) => {
    const formatted = `PLA-${idStr.slice(0, 8).toUpperCase()}`;
    navigator.clipboard.writeText(formatted);
    setCopiedId(idStr);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadPDF = async (report: AnalysisResult) => {
    if (pdfGeneratingId) return;
    setPdfGeneratingId(report.id);
    setPdfStep('Preparing');

    setTimeout(() => setPdfStep('Formatting'), 250);
    setTimeout(() => setPdfStep('Generating'), 500);

    try {
      await generatePDFReport(report);
      setPdfStep('Finalizing');
      setTimeout(() => setPdfStep('Ready'), 200);
    } catch (e) {
      alert("Failed to generate PDF report.");
    } finally {
      setTimeout(() => {
        setPdfGeneratingId(null);
      }, 900);
    }
  };

  // Filter & Search Logic
  const filteredReports = reports.filter((r) => {
    const matchesSearch = r.documentName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'High Risk') return r.similarityScore > 25;
    if (activeFilter === 'Moderate') return r.similarityScore > 10 && r.similarityScore <= 25;
    if (activeFilter === 'Low Risk') return r.similarityScore <= 10;
    return true;
  });

  // Calculate Statistics
  const totalReportsCount = reports.length;
  const avgSimilarity =
    totalReportsCount > 0
      ? Math.round(reports.reduce((acc, r) => acc + r.similarityScore, 0) / totalReportsCount)
      : 0;
  const highRiskCount = reports.filter((r) => r.similarityScore > 25).length;
  const verifiedSourcesCount = reports.reduce((acc, r) => acc + (r.sources?.length || 0), 0);

  return (
    <motion.div
      variants={containerStaggerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen select-none"
    >
      {/* Header & Title Bar */}
      <motion.div variants={itemFadeUpVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">Report <span className="font-serif-italic font-normal text-slate-800 dark:text-slate-200">History.</span></h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Access past plagiarism audits, verified web sources, and downloadable enterprise PDF reports.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button size="sm" magnetic borderGlow onClick={() => navigate('/scan')} icon={<PlusCircle className="w-4 h-4" />}>
            New Scan
          </Button>
        </div>
      </motion.div>

      {/* Summary Statistics Bar */}
      {totalReportsCount > 0 && (
        <motion.div variants={itemFadeUpVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Reports</span>
            <div className="flex items-center gap-2 mt-1">
              <MagneticIcon maxOffset={2}><FileCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" /></MagneticIcon>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{totalReportsCount}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Avg. Similarity</span>
            <div className="flex items-center gap-2 mt-1">
              <MagneticIcon maxOffset={2}><Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" /></MagneticIcon>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{avgSimilarity}%</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">High Risk Scans</span>
            <div className="flex items-center gap-2 mt-1">
              <MagneticIcon maxOffset={2}><AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" /></MagneticIcon>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{highRiskCount}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] backdrop-blur-md">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Verified Web Sources</span>
            <div className="flex items-center gap-2 mt-1">
              <MagneticIcon maxOffset={2}><ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /></MagneticIcon>
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">{verifiedSourcesCount}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter Tabs & Search Controls */}
      <motion.div variants={itemFadeUpVariants} className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
          {(['All', 'High Risk', 'Moderate', 'Low Risk'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`relative px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {/* Shared Sliding Active Background Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeReportFilter"
                    className="absolute inset-0 rounded-full bg-slate-200 dark:bg-white/15 border border-slate-300 dark:border-white/25 shadow-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{filter}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar with Focus Glow */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search report titles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Main Reports Table / List Container */}
      <motion.div variants={itemFadeUpVariants} className="rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 uppercase font-semibold">
              <tr>
                <th className="p-4 pl-6">Document Name</th>
                <th className="p-4">Report ID</th>
                <th className="p-4">Scan Date</th>
                <th className="p-4">Similarity</th>
                <th className="p-4">Matches</th>
                <th className="p-4 pr-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              <AnimatePresence mode="popLayout">
                {filteredReports.length === 0 ? (
                  <tr key="empty-reports">
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <FileText className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">No document reports match your search criteria.</span>
                        <Button size="sm" variant="outline" onClick={() => navigate('/scan')}>
                          Start New Scan
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((item, idx) => {
                    const isGeneratingPdf = pdfGeneratingId === item.id;
                    const isCopied = copiedId === item.id;

                    return (
                      <motion.tr
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ delay: idx * 0.03, ease: [0.16, 1, 0.3, 1] }}
                        className="hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group"
                      >
                        {/* Document Name */}
                        <td className="p-4 pl-6 font-semibold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100 dark:bg-white/5 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 group-hover:scale-105 transition-transform">
                              <FileText className="w-4 h-4" />
                            </div>
                            <span className="truncate max-w-xs group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{item.documentName}</span>
                          </div>
                        </td>

                        {/* Report ID with Icon Morphing */}
                        <td className="p-4">
                          <button
                            onClick={() => handleCopyId(item.id)}
                            className="px-2 py-1 rounded text-[10px] uppercase font-mono bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
                            title="Click to copy Report ID"
                          >
                            <MorphingIcon activeState={isCopied} type="copy-check" size={12} />
                            <span>PLA-{item.id.slice(0, 8).toUpperCase()}</span>
                          </button>
                        </td>

                        {/* Date */}
                        <td className="p-4 text-slate-500 dark:text-slate-400 font-mono">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>

                        {/* Similarity Badge */}
                        <td className="p-4 font-mono font-bold">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs border ${
                              item.similarityScore <= 10
                                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : item.similarityScore <= 25
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400'
                                : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400'
                            }`}
                          >
                            {item.similarityScore}%
                          </span>
                        </td>

                        {/* Match Count */}
                        <td className="p-4 text-slate-500 dark:text-slate-400">{item.matches.length} matches</td>

                        {/* Action Buttons */}
                        <td className="p-4 pr-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => navigate(`/results/${item.id}`)}
                              icon={<Eye className="w-3.5 h-3.5" />}
                            >
                              View
                            </Button>

                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownloadPDF(item)}
                              disabled={isGeneratingPdf}
                              icon={<Download className="w-3.5 h-3.5" />}
                            >
                              {isGeneratingPdf ? 'PDF...' : 'PDF'}
                            </Button>

                            <button
                              type="button"
                              onClick={() => setDeleteTargetId(item.id)}
                              className="p-2 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                              title="Delete report"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* PDF Generation Sequence Modal */}
      <AnimatePresence>
        {pdfGeneratingId && (
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md"
          >
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-sm w-full rounded-3xl border border-slate-200 dark:border-white/20 bg-white dark:bg-neutral-950 p-8 space-y-6 shadow-2xl text-center select-none text-slate-900 dark:text-slate-100"
            >
              <div className="w-14 h-14 rounded-2xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 shadow-lg">
                {pdfStep === 'Ready' ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <Loader2 className="w-7 h-7 animate-spin" />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Generating PDF Audit Report</h3>
                <p className="text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-widest">{pdfStep}...</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetId && (
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md"
          >
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-md w-full rounded-3xl border border-slate-200 dark:border-white/20 bg-white dark:bg-neutral-950 p-8 space-y-6 shadow-2xl text-center select-none text-slate-900 dark:text-slate-100"
            >
              <div className="w-14 h-14 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto text-red-500 dark:text-red-400">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Delete Report?</h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  This plagiarism audit report will be permanently removed from your history. This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setDeleteTargetId(null)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                  Delete Permanently
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
