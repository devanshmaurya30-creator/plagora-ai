import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';
import { getSharedReport } from '../lib/shareStore';
import type { AnalysisResult, Match } from '../types/analysis';
import { MetricsOverview } from '../components/results/MetricsOverview';
import { DocumentViewer } from '../components/results/DocumentViewer';
import { SmartSourcePanel } from '../components/results/SmartSourcePanel';
import { SideBySideComparison } from '../components/results/SideBySideComparison';
import { DocumentInsightsSection } from '../components/results/DocumentInsightsSection';
import { Button } from '../components/ui/Button';

export const SharedReportPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [activeTab, setActiveTab] = useState<'Matches' | 'Insights'>('Matches');

  useEffect(() => {
    if (token) {
      const data = getSharedReport(token);
      if (data) {
        setAnalysis(data);
        if (data.matches.length > 0) {
          setSelectedMatch(data.matches[0]);
        }
      }
    }
  }, [token]);

  if (!analysis) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4 select-none">
        <div className="w-12 h-12 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto text-red-500 dark:text-red-400">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Report Unavailable</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          The requested share link is invalid, expired, or has been revoked by the owner.
        </p>
        <Button size="sm" onClick={() => navigate('/')}>
          Return to Plagora AI
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen select-none text-slate-900 dark:text-slate-100">
      {/* Top Banner: Read-Only Verification Badge */}
      <div className="p-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Verified Read-Only Public Report — Plagora AI Authenticated</span>
        </div>
        <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">ID: PLA-{analysis.id.slice(0, 8).toUpperCase()}</span>
      </div>

      {/* Report Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{analysis.documentName}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Scanned on {new Date(analysis.createdAt).toLocaleDateString()} • {analysis.wordCount.toLocaleString()} words
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('Matches')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'Matches' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Matches & Proof
          </button>
          <button
            onClick={() => setActiveTab('Insights')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'Insights' ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Deep Insights
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      <MetricsOverview analysis={analysis} />

      {activeTab === 'Insights' ? (
        <DocumentInsightsSection analysis={analysis} />
      ) : (
        /* Split Viewer */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <DocumentViewer
              text={analysis.originalText}
              matches={analysis.matches}
              selectedMatchId={selectedMatch?.id || null}
              onSelectMatch={(m) => setSelectedMatch(m)}
            />

            {selectedMatch && (
              <div className="rounded-3xl border border-slate-200 dark:border-white/20 bg-white dark:bg-neutral-950/90 p-6 space-y-4 shadow-xl">
                <SideBySideComparison match={selectedMatch} />
              </div>
            )}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <SmartSourcePanel
              sources={analysis.sources}
              matches={analysis.matches}
              selectedMatchId={selectedMatch?.id || null}
              onSelectMatch={(m) => setSelectedMatch(m)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
