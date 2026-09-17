import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  ArrowLeft,
  ShieldAlert,
  Copy,
  Check,
  Filter,
  Trash2,
  AlertTriangle,
  Layers,
  Share2,
  Sparkles,
  HelpCircle,
  MessageSquare,
  History,
  BookOpen,
} from 'lucide-react';
import { getAnalysis, deleteAnalysis } from '../lib/analysisStore';
import { getWorkspaceDocument, type WorkspaceDocument } from '../lib/workspaceStore';
import type { AnalysisResult, Match } from '../types/analysis';
import { MetricsOverview } from '../components/results/MetricsOverview';
import { DocumentViewer } from '../components/results/DocumentViewer';
import { SmartSourcePanel } from '../components/results/SmartSourcePanel';
import { MatchNavigator } from '../components/results/MatchNavigator';
import { MatchAIExplanation } from '../components/results/MatchAIExplanation';
import { SideBySideComparison } from '../components/results/SideBySideComparison';
import { DocumentInsightsSection } from '../components/results/DocumentInsightsSection';
import { ImprovementCenterSection } from '../components/results/ImprovementCenterSection';
import { WhyFlaggedPanel } from '../components/results/WhyFlaggedPanel';
import { AIRewriteModal } from '../components/results/AIRewriteModal';
import { ShareReportModal } from '../components/results/ShareReportModal';
import { AIAnalysisChat } from '../components/results/AIAnalysisChat';
import { VersionHistoryPanel } from '../components/results/VersionHistoryPanel';
import { ResearchWorkspace } from '../components/research/ResearchWorkspace';
import { Button } from '../components/ui/Button';
import { generatePDFReport } from '../lib/pdfGenerator';
import { containerStaggerVariants, itemFadeUpVariants, modalBackdropVariants, modalContentVariants } from '../lib/motion';

export const ResultsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'Matches' | 'Insights' | 'Improvement'>('Matches');

  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Modals & Panels
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfStatusMsg, setPdfStatusMsg] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showWhyFlagged, setShowWhyFlagged] = useState(false);
  const [showRewrite, setShowRewrite] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showResearchWorkspace, setShowResearchWorkspace] = useState(false);
  const [workspaceDoc, setWorkspaceDoc] = useState<WorkspaceDocument | null>(null);

  useEffect(() => {
    if (id) {
      const data = getAnalysis(id);
      if (data) {
        setAnalysis(data);
        if (data.matches.length > 0) {
          setSelectedMatch(data.matches[0]);
        }
        const doc = getWorkspaceDocument(data.id);
        if (doc) setWorkspaceDoc(doc);
      }
    }
  }, [id]);

  const filterCounts = useMemo(() => {
    if (!analysis) return { all: 0, exact: 0, near: 0, paraphrase: 0, semantic: 0, web: 0 };
    const matches = analysis.matches;
    return {
      all: matches.length,
      exact: matches.filter((m) => m.classification === 'exact_match' || m.type === 'exact').length,
      near: matches.filter((m) => m.classification === 'near_match' || m.type === 'repeated').length,
      paraphrase: matches.filter((m) => m.classification === 'paraphrase' || m.type === 'paraphrase').length,
      semantic: matches.filter((m) => m.classification === 'semantic_match' || m.type === 'semantic').length,
      web: matches.filter((m) => m.evidence?.webVerification?.verified || m.hasWebMatch).length,
    };
  }, [analysis]);

  if (!analysis) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4 select-none">
        <h2 className="text-xl font-bold text-white">Report Not Found</h2>
        <p className="text-sm text-slate-400">The requested plagiarism analysis report could not be found.</p>
        <Button size="sm" onClick={() => navigate('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const filteredMatches = analysis.matches.filter((m) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Exact') return m.classification === 'exact_match' || m.type === 'exact';
    if (activeFilter === 'Near Match') return m.classification === 'near_match' || m.type === 'repeated';
    if (activeFilter === 'Paraphrase') return m.classification === 'paraphrase' || m.type === 'paraphrase';
    if (activeFilter === 'Semantic') return m.classification === 'semantic_match' || m.type === 'semantic';
    if (activeFilter === 'Web Verified') return m.evidence?.webVerification?.verified === true || m.hasWebMatch;
    return true;
  });

  const handleDownloadPDF = async () => {
    if (pdfGenerating) return;
    setPdfGenerating(true);
    try {
      await generatePDFReport(analysis, (msg) => setPdfStatusMsg(msg));
    } catch (e) {
      alert("Couldn't generate the PDF report. Please try again.");
    } finally {
      setTimeout(() => {
        setPdfGenerating(false);
        setPdfStatusMsg('');
      }, 800);
    }
  };

  const handleCopySummary = () => {
    const summaryText = `Plagora AI Analysis Report
Document: ${analysis.documentName}
Similarity Score: ${analysis.similarityScore}%
Matches Detected: ${analysis.matches.length}
Sources: ${analysis.sources.length}
AI Confidence: ${analysis.confidence.toUpperCase()}
Report ID: PLA-${analysis.id.slice(0, 8).toUpperCase()}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(`PLA-${analysis.id.slice(0, 8).toUpperCase()}`);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleDeleteConfirm = () => {
    deleteAnalysis(analysis.id);
    navigate('/reports');
  };

  return (
    <motion.div
      variants={containerStaggerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen select-none"
    >
      {/* Top Header & Quick Actions */}
      <motion.div variants={itemFadeUpVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/20 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{analysis.documentName}</h1>
              <button
                onClick={handleCopyId}
                className="px-2 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 transition-colors flex items-center gap-1 cursor-pointer"
                title="Click to copy Report ID"
              >
                {copiedId ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>PLA-{analysis.id.slice(0, 8).toUpperCase()}</span>
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Scanned on {new Date(analysis.createdAt).toLocaleDateString()} • {analysis.wordCount.toLocaleString()} words
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResearchWorkspace(true)}
            icon={<BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
          >
            Research Workspace
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAIChat(true)}
            icon={<MessageSquare className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
          >
            Ask Plagora AI
          </Button>

          {workspaceDoc && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVersionHistory(true)}
              icon={<History className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            >
              Versions
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={handleCopySummary} icon={copiedSummary ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}>
            {copiedSummary ? 'Copied' : 'Copy Summary'}
          </Button>

          <Button variant="outline" size="sm" onClick={() => setShowShareModal(true)} icon={<Share2 className="w-4 h-4" />}>
            Share
          </Button>

          <Button variant="outline" size="sm" onClick={() => navigate('/compare')} icon={<Layers className="w-4 h-4" />}>
            Compare
          </Button>

          <Button
            size="sm"
            magnetic
            borderGlow
            onClick={handleDownloadPDF}
            disabled={pdfGenerating}
            icon={<Download className="w-4 h-4" />}
          >
            {pdfGenerating ? pdfStatusMsg || 'Generating PDF...' : 'Download PDF Report'}
          </Button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            title="Delete report"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Dynamic Factual Summary Banner */}
      <motion.div variants={itemFadeUpVariants} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.015] text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-4 flex-wrap shadow-sm">
        <span>
          <strong className="text-slate-900 dark:text-white">Analysis Summary: </strong>
          {analysis.matches.length > 0
            ? `${analysis.matches.length} potential matches detected across ${analysis.sources.length} verified web sources with ${analysis.similarityScore}% overall similarity.`
            : 'No significant similarity matches detected above scanning confidence thresholds.'}
        </span>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('Matches')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'Matches' ? 'bg-slate-900 text-white dark:bg-white/20 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Matches & Proof
          </button>
          <button
            onClick={() => setActiveTab('Insights')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'Insights' ? 'bg-slate-900 text-white dark:bg-white/20 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Deep Insights
          </button>
          <button
            onClick={() => setActiveTab('Improvement')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'Improvement' ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Improvement Loop
          </button>
        </div>
      </motion.div>

      {/* Metrics Overview */}
      <MetricsOverview analysis={analysis} />

      {activeTab === 'Insights' ? (
        <DocumentInsightsSection
          analysis={analysis}
          onSelectMatch={(m) => {
            setActiveTab('Matches');
            setSelectedMatch(m);
          }}
          onSelectFilter={(f) => {
            setActiveTab('Matches');
            setActiveFilter(f);
          }}
        />
      ) : activeTab === 'Improvement' ? (
        <ImprovementCenterSection
          analysis={analysis}
          selectedMatch={selectedMatch}
          onSelectMatch={(m) => setSelectedMatch(m)}
          onOpenWhyFlagged={(m) => {
            setSelectedMatch(m);
            setShowWhyFlagged(true);
          }}
          onOpenAIRewrite={(m) => {
            setSelectedMatch(m);
            setShowRewrite(true);
          }}
        />
      ) : (
        <>
          {/* Sticky Match Navigation & Filter Bar */}
          <motion.div variants={itemFadeUpVariants} className="sticky top-20 z-30 space-y-3">
            <MatchNavigator
              matches={filteredMatches}
              selectedMatch={selectedMatch}
              onSelectMatch={(m) => setSelectedMatch(m)}
            />

            {/* Dynamic Filter Pills */}
            <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 dark:border-white/10 pb-3 bg-white/90 dark:bg-black/85 backdrop-blur-xl p-3 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
              <div className="flex items-center gap-2 overflow-x-auto py-1 w-full sm:w-auto">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </span>
                {[
                  { id: 'All', label: 'All', count: filterCounts.all },
                  { id: 'Exact', label: 'Exact', count: filterCounts.exact },
                  { id: 'Near Match', label: 'Near', count: filterCounts.near },
                  { id: 'Paraphrase', label: 'Paraphrase', count: filterCounts.paraphrase },
                  { id: 'Semantic', label: 'Semantic', count: filterCounts.semantic },
                  { id: 'Web Verified', label: 'Web Verified', count: filterCounts.web },
                ].map((cat) => {
                  const isActive = activeFilter === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveFilter(cat.id)}
                      className={`relative px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                        isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeMatchFilter"
                          className="absolute inset-0 rounded-full bg-slate-200/80 dark:bg-white/15 border border-slate-300 dark:border-white/25 shadow-sm"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}
                      <span className="relative z-10">{cat.label}</span>
                      <span className="relative z-10 px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-white/10 text-[10px] font-mono text-slate-700 dark:text-slate-300">
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Showing {filteredMatches.length} of {analysis.matches.length} matches
              </span>
            </div>
          </motion.div>

          {/* Main Split Viewer: Left Document Viewer, Right Smart Ranked Source Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Document Viewer */}
            <div className="lg:col-span-8 space-y-4">
              <DocumentViewer
                text={analysis.originalText}
                matches={filteredMatches}
                selectedMatchId={selectedMatch?.id || null}
                onSelectMatch={(m) => setSelectedMatch(m)}
              />
            </div>

            {/* Right Smart Source Panel */}
            <div className="lg:col-span-4 space-y-4">
              <SmartSourcePanel
                sources={analysis.sources}
                matches={filteredMatches}
                selectedMatchId={selectedMatch?.id || null}
                onSelectMatch={(m) => setSelectedMatch(m)}
              />
            </div>
          </div>

          {/* Unified Match Details: Side-by-Side Word Diff & Why Flagged */}
          <AnimatePresence>
            {selectedMatch && (
              <motion.div
                key={selectedMatch.id}
                initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8 pt-4 border-t border-white/10"
              >
                {/* Side-by-Side Comparison */}
                <div className="rounded-3xl border border-white/20 bg-neutral-950/90 p-6 md:p-8 space-y-4 shadow-2xl backdrop-blur-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <Layers className="w-4 h-4 text-blue-400" />
                      <span>EVIDENCE WORD-LEVEL DIFF & PROOF</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowWhyFlagged(true)}
                        className="px-3 py-1.5 rounded-xl border border-blue-400/40 bg-blue-500/10 text-blue-300 text-xs font-medium hover:bg-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Why Flagged?</span>
                      </button>

                      <button
                        onClick={() => setShowRewrite(true)}
                        className="px-3 py-1.5 rounded-xl border border-cyan-400/40 bg-cyan-500/10 text-cyan-300 text-xs font-medium hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Rewrite AI</span>
                      </button>
                    </div>
                  </div>

                  <SideBySideComparison match={selectedMatch} />
                </div>

                {/* AI Explanation Box */}
                <MatchAIExplanation match={selectedMatch} />
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Accuracy Disclaimer Banner */}
      <div className="p-4 rounded-xl border border-white/10 bg-white/[0.01] text-xs text-slate-400 flex items-center gap-3">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
        <span>
          {analysis.disclaimer ||
            'Similarity results are automated indicators and should be reviewed by a human. A similarity match does not by itself establish plagiarism.'}
        </span>
      </div>

      {/* Why Flagged Panel Drawer */}
      {selectedMatch && (
        <WhyFlaggedPanel
          match={selectedMatch}
          isOpen={showWhyFlagged}
          onClose={() => setShowWhyFlagged(false)}
          onOpenRewrite={() => setShowRewrite(true)}
        />
      )}

      {/* AI Rewrite Modal */}
      {selectedMatch && (
        <AIRewriteModal
          passage={selectedMatch.originalText}
          matchedReference={selectedMatch.matchedText}
          isOpen={showRewrite}
          onClose={() => setShowRewrite(false)}
          onReAnalyzeText={() => navigate('/editor')}
        />
      )}

      {/* Share Report Modal */}
      <ShareReportModal
        analysis={analysis}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            variants={modalBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-w-md w-full rounded-2xl border border-white/20 bg-neutral-900 p-6 space-y-6 shadow-2xl text-center"
            >
              <div className="w-12 h-12 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Delete this report?</h3>
                <p className="text-xs text-slate-400">This report will be permanently removed from your report history.</p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                  Delete Report
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* AI Analysis Chat Drawer */}
      <AIAnalysisChat
        analysis={analysis}
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
      />

      {/* Version History Drawer */}
      {workspaceDoc && (
        <VersionHistoryPanel
          document={workspaceDoc}
          currentVersionId={workspaceDoc.currentVersionId}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onSelectVersion={() => setShowVersionHistory(false)}
          onCompareVersions={() => {
            setShowVersionHistory(false);
            navigate('/compare');
          }}
          onReAnalyzeVersion={() => {
            setShowVersionHistory(false);
            navigate('/editor');
          }}
        />
      )}

      {/* Research Workspace Full-Screen Overlay */}
      {showResearchWorkspace && analysis && (
        <div className="fixed inset-0 z-50 bg-black">
          <ResearchWorkspace
            analysis={analysis}
            onClose={() => setShowResearchWorkspace(false)}
          />
        </div>
      )}
    </motion.div>
  );
};
