import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { AnalysisResult, Source, Match } from '../../types/analysis';
import type { ClaimItem } from '../../types/claim';
import { claimVerificationEngine } from '../../lib/claimVerificationEngine';
import { citationCompletenessEngine } from '../../lib/citationCompletenessEngine';
import { writingCoachEngine } from '../../lib/writingCoachEngine';

import { SourceRelationshipMap } from './SourceRelationshipMap';
import { SourceComparisonModal } from './SourceComparisonModal';
import { WritingCoachToolbar } from './WritingCoachToolbar';
import { FocusModeModal } from './FocusModeModal';
import { OneClickReviewModal } from './OneClickReviewModal';
import { ResearchBoard } from './ResearchBoard';

import {
  FileText,
  Search,
  BookOpen,
  ShieldCheck,
  Sparkles,
  Layers,
  Scale,
  MessageSquare,
  CheckCircle,
  Send,
  RefreshCw,
  X,
  Layout,
  Maximize2,
} from 'lucide-react';

interface ResearchWorkspaceProps {
  analysis: AnalysisResult;
  onClose?: () => void;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({
  analysis,
  onClose,
}) => {
  // Main State & Synchronization
  const [activeTab, setActiveTab] = useState<'sources' | 'claims' | 'citations' | 'map' | 'board' | 'notes' | 'coach'>('sources');
  const [selectedPassage, setSelectedPassage] = useState<string | null>(null);
  const [selectedSource, setSelectedSource] = useState<Source | null>(analysis.sources[0] || null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(analysis.matches[0] || null);
  const [selectedClaim, setSelectedClaim] = useState<ClaimItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isFocusModeOpen, setIsFocusModeOpen] = useState(false);
  const [isReviewQueueOpen, setIsReviewQueueOpen] = useState(false);
  const [compareSourceB, setCompareSourceB] = useState<Source | null>(null);

  // Derived Engines
  const claims: ClaimItem[] = React.useMemo(
    () => claimVerificationEngine.extractClaimsFromDocument(analysis.id, 'v1', analysis),
    [analysis]
  );

  const citationAnalysis = React.useMemo(
    () => citationCompletenessEngine.analyzeCompleteness(analysis),
    [analysis]
  );

  const writingCoachData = React.useMemo(
    () => writingCoachEngine.analyzeDocumentWriting(analysis),
    [analysis]
  );

  // AI Assistant Chat State
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: `Hello! I am your Grounded AI Research Assistant. Ask me anything about your document, matches, claims, sources, or citations.`,
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Synchronize selection
  const handleSelectPassage = (passage: string) => {
    setSelectedPassage(passage);
    const m = analysis.matches.find((match) => match.originalText.includes(passage) || passage.includes(match.originalText));
    if (m) {
      setSelectedMatch(m);
      if (m.sources[0]) setSelectedSource(m.sources[0]);
    }
    const cl = claims.find((c) => c.text.includes(passage) || passage.includes(c.text));
    if (cl) setSelectedClaim(cl);
  };

  // Chat Submission to Gemini API
  const handleAskAssistant = async (question: string) => {
    if (!question.trim()) return;
    setChatMessages((prev) => [...prev, { sender: 'user', text: question }]);
    setInputQuestion('');
    setIsChatLoading(true);

    try {
      const res = await fetch('/api/analysis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuestion: question,
          analysisSummary: {
            documentName: analysis.documentName,
            wordCount: analysis.wordCount,
            similarityScore: analysis.similarityScore,
            selectedPassage: selectedPassage || analysis.matches[0]?.originalText || '',
            selectedSource: selectedSource?.title || '',
            claimCount: claims.length,
          },
        }),
      });

      if (!res.ok) throw new Error('Chat service error');
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: data.reply }]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: "I don't have enough evidence to answer this confidently based on the current analysis data.",
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-white dark:bg-[#050608] text-slate-900 dark:text-gray-100 font-sans overflow-hidden">
      {/* Workspace Top Header Bar */}
      <div className="h-14 px-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#0b0c10] flex items-center justify-between z-20">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse" />
            <h1 className="font-bold text-slate-900 dark:text-white tracking-wide text-sm">PLAGORA AI — RESEARCH WORKSPACE</h1>
          </div>
          <span className="text-xs text-slate-500 font-mono">| {analysis.documentName} (v1)</span>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center space-x-3 text-xs">
          <button
            onClick={() => setIsReviewQueueOpen(true)}
            className="px-3 py-1.5 bg-cyan-500/10 dark:bg-cyan-500/20 hover:bg-cyan-500/20 dark:hover:bg-cyan-500/30 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 dark:border-cyan-500/40 rounded-xl font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Review My Document</span>
          </button>
          <button
            onClick={() => setIsFocusModeOpen(true)}
            className="px-3 py-1.5 bg-slate-200/80 dark:bg-white/10 hover:bg-slate-300/80 dark:hover:bg-white/20 text-slate-900 dark:text-white rounded-xl font-medium transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <Maximize2 className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Focus Mode</span>
          </button>
          {onClose && (
            <button onClick={onClose} className="p-1.5 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3-PANEL WORKSPACE CONTAINER */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
        {/* ================================================== */}
        {/* LEFT PANEL: Document Sections & Claims (Cols 1-3) */}
        {/* ================================================== */}
        <div className="lg:col-span-3 bg-slate-50/80 dark:bg-[#08090d] border-r border-slate-200 dark:border-white/10 flex flex-col h-full overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-white/10 space-y-3">
            <h2 className="text-xs font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>Document Navigation</span>
            </h2>

            {/* Quick Section Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sections or claims..."
                className="w-full bg-white dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-cyan-500/40"
              />
            </div>
          </div>

          {/* Sections List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-2">
              Document Sections ({citationAnalysis.sections.length})
            </div>

            {citationAnalysis.sections.map((sec) => (
              <div
                key={sec.sectionId}
                onClick={() => handleSelectPassage(sec.title)}
                className={`p-3 rounded-xl border transition-all cursor-pointer text-xs space-y-1.5 ${
                  selectedPassage && sec.title.includes(selectedPassage)
                    ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                    : 'bg-white/5 border-white/5 hover:border-white/20 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between font-medium">
                  <span className="truncate max-w-[170px]">{sec.title}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      sec.coverageStatus === 'High'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : sec.coverageStatus === 'Needs Review'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {sec.coverageStatus}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500">
                  <span>{sec.totalPassages} Passages</span>
                  <span>{sec.claimsCount} Claims</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ================================================== */}
        {/* CENTER PANEL: Document Content & Passages (Cols 4-8) */}
        {/* ================================================== */}
        <div className="lg:col-span-5 bg-[#0b0c10] flex flex-col h-full overflow-hidden border-r border-white/10">
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/30">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span className="font-semibold text-white text-xs">Document Content Reader</span>
            </div>
            <span className="text-[11px] text-gray-400">{analysis.wordCount} Words</span>
          </div>

          {/* Crisp Document Content Rendering (NO BLUR) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 font-mono text-sm leading-relaxed text-gray-200 selection:bg-cyan-500/30">
            {analysis.originalText?.split(/\n\s*\n/).map((paragraph, idx) => (
              <p
                key={idx}
                onClick={() => handleSelectPassage(paragraph.slice(0, 50))}
                className={`p-3 rounded-xl transition-all cursor-pointer border ${
                  selectedPassage && paragraph.includes(selectedPassage)
                    ? 'bg-cyan-950/40 border-cyan-500/40 text-white'
                    : 'bg-transparent border-transparent hover:bg-white/5'
                }`}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Contextual Floating Selection Toolbar */}
          {selectedPassage && (
            <div className="p-4 border-t border-white/10 bg-black/60">
              <WritingCoachToolbar
                selectedText={selectedPassage}
                onApplyRewrite={() => {
                  alert('Rewrite applied to editor state!');
                }}
              />
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* RIGHT PANEL: Intelligence Hub (Cols 9-12) */}
        {/* ================================================== */}
        <div className="lg:col-span-4 bg-[#0d0e14] flex flex-col h-full overflow-hidden">
          {/* Intelligence Tabs */}
          <div className="p-2 border-b border-white/10 bg-black/40 flex items-center space-x-1 text-xs overflow-x-auto">
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 font-medium ${
                activeTab === 'sources' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Sources</span>
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 font-medium ${
                activeTab === 'claims' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Claims</span>
            </button>
            <button
              onClick={() => setActiveTab('map')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 font-medium ${
                activeTab === 'map' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Source Map</span>
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 font-medium ${
                activeTab === 'board' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setActiveTab('coach')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1 font-medium ${
                activeTab === 'coach' ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Coach</span>
            </button>
          </div>

          {/* Active Tab Panel Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'coach' && (
              <div className="space-y-4 text-xs">
                <div className="font-semibold text-white">AI Writing Coach Signals</div>
                <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-xl border border-white/10 text-gray-300">
                  <div>Readability: <strong className="text-white">{writingCoachData.metrics.readabilityGrade}</strong></div>
                  <div>Avg Sentence: <strong className="text-white">{writingCoachData.metrics.averageSentenceLength} words</strong></div>
                  <div>Clarity Score: <strong className="text-cyan-400">{writingCoachData.metrics.clarityScore}/100</strong></div>
                  <div>Academic Tone: <strong className="text-emerald-400">{writingCoachData.metrics.academicToneScore}/100</strong></div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="font-semibold text-gray-400">Suggestions ({writingCoachData.suggestions.length})</span>
                  {writingCoachData.suggestions.map((s) => (
                    <div key={s.id} className="bg-black/50 border border-white/10 p-3 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-cyan-400 uppercase">{s.category}</span>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.5 rounded">{s.priority}</span>
                      </div>
                      <p className="text-gray-200 font-mono text-[11px]">"{s.originalText}"</p>
                      <p className="text-gray-400 text-[10px]">{s.explanation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'sources' && (
              <div className="space-y-4 text-xs">
                <div className="font-semibold text-white flex items-center justify-between">
                  <span>Verified Sources ({analysis.sources.length})</span>
                  {selectedMatch && (
                    <span className="text-[10px] text-cyan-400 font-mono">
                      Match: {selectedMatch.similarityScore}%
                    </span>
                  )}
                </div>
                {analysis.sources.map((src) => (
                  <div
                    key={src.id}
                    onClick={() => setSelectedSource(src)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer space-y-2 ${
                      selectedSource?.id === src.id
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-white'
                        : 'bg-black/40 border-white/10 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold truncate max-w-[180px]">{src.title || src.domain}</span>
                      <span className="bg-cyan-500/20 text-cyan-300 font-mono font-bold px-2 py-0.5 rounded">
                        {src.similarity}%
                      </span>
                    </div>

                    <div className="text-[11px] text-gray-400 font-mono truncate">
                      {src.url || 'Metadata unavailable'}
                    </div>

                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className={src.verified ? 'text-emerald-400' : 'text-amber-400'}>
                        {src.verified ? 'Web Verified' : 'Unverified'}
                      </span>
                      {analysis.sources.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const other = analysis.sources.find((s) => s.id !== src.id);
                            if (other) setCompareSourceB(other);
                          }}
                          className="text-cyan-400 hover:underline flex items-center space-x-1"
                        >
                          <Scale className="w-3 h-3" />
                          <span>Compare</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'claims' && (
              <div className="space-y-4 text-xs">
                <div className="font-semibold text-white">Extracted Factual Claims ({claims.length})</div>
                {claims.map((claim) => (
                  <div
                    key={claim.claimId}
                    onClick={() => {
                      setSelectedClaim(claim);
                      if (analysis.matches[0]) setSelectedMatch(analysis.matches[0]);
                    }}
                    className={`border rounded-xl p-3 space-y-2 cursor-pointer transition-all ${
                      selectedClaim?.claimId === claim.claimId
                        ? 'bg-cyan-500/20 border-cyan-500/40 text-white'
                        : 'bg-black/40 border-white/10 hover:border-white/20 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-mono font-bold rounded uppercase text-[10px]">
                        {claim.claimType}
                      </span>
                      <span
                        className={`font-semibold text-[10px] ${
                          claim.verificationStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {claim.verificationStatus}
                      </span>
                    </div>
                    <p className="font-mono text-gray-200 leading-relaxed">"{claim.text}"</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'map' && (
              <SourceRelationshipMap
                documentTitle={analysis.documentName}
                sources={analysis.sources}
                matches={analysis.matches}
                claims={claims}
                onSelectSource={(s) => setSelectedSource(s)}
                onSelectMatch={(m) => setSelectedMatch(m)}
              />
            )}

            {activeTab === 'board' && (
              <ResearchBoard
                documentId={analysis.id}
                versionId="v1"
                analysisId={analysis.id}
                documentTitle={analysis.documentName}
              />
            )}
          </div>
        </div>
      </div>

      {/* ================================================== */}
      {/* FLOATING GROUNDED AI RESEARCH ASSISTANT */}
      {/* ================================================== */}
      <div className="fixed bottom-4 right-4 z-40">
        {!isAssistantOpen ? (
          <button
            onClick={() => setIsAssistantOpen(true)}
            className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded-full shadow-2xl flex items-center space-x-2 transition-all shadow-cyan-500/30"
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Research Assistant</span>
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0b0c10] border border-cyan-500/30 rounded-2xl w-96 h-[450px] shadow-2xl flex flex-col overflow-hidden"
          >
            <div className="p-3 bg-black/60 border-b border-white/10 flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Grounded AI Research Assistant</span>
              </span>
              <button onClick={() => setIsAssistantOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500/20 text-cyan-200 ml-auto border border-cyan-500/30'
                      : 'bg-white/5 text-gray-200 border border-white/10'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              {isChatLoading && (
                <div className="text-gray-500 text-[11px] flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>Evaluating evidence grounds...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="p-2 border-t border-white/10 bg-black/40 flex items-center space-x-1.5 overflow-x-auto text-[10px]">
              <button
                onClick={() => handleAskAssistant('What evidence supports this section?')}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded whitespace-nowrap"
              >
                Supporting Evidence?
              </button>
              <button
                onClick={() => handleAskAssistant('Which sources are most relevant here?')}
                className="px-2 py-1 bg-white/5 hover:bg-white/10 text-gray-300 rounded whitespace-nowrap"
              >
                Top Sources?
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-2.5 bg-black/60 border-t border-white/10 flex items-center space-x-2">
              <input
                type="text"
                value={inputQuestion}
                onChange={(e) => setInputQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskAssistant(inputQuestion)}
                placeholder="Ask grounded research question..."
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/40"
              />
              <button
                onClick={() => handleAskAssistant(inputQuestion)}
                className="p-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded-xl transition-all"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <FocusModeModal
        isOpen={isFocusModeOpen}
        onClose={() => setIsFocusModeOpen(false)}
        analysis={analysis}
        claims={claims}
      />

      <OneClickReviewModal
        isOpen={isReviewQueueOpen}
        onClose={() => setIsReviewQueueOpen(false)}
        analysis={analysis}
        claims={claims}
        onOpenFocusMode={() => setIsFocusModeOpen(true)}
      />

      {selectedSource && compareSourceB && (
        <SourceComparisonModal
          isOpen={Boolean(compareSourceB)}
          onClose={() => setCompareSourceB(null)}
          sourceA={selectedSource}
          sourceB={compareSourceB}
        />
      )}
    </div>
  );
};
