import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, GitCommit, Play, RotateCcw, Eye, Layers, X, Clock } from 'lucide-react';
import type { WorkspaceDocument, DocumentVersion } from '../../lib/workspaceStore';
import { restoreDocumentVersion } from '../../lib/workspaceStore';
import { Button } from '../ui/Button';

interface VersionHistoryPanelProps {
  document: WorkspaceDocument;
  currentVersionId: string;
  isOpen: boolean;
  onClose: () => void;
  onSelectVersion: (version: DocumentVersion) => void;
  onCompareVersions: (verA: DocumentVersion, verB: DocumentVersion) => void;
  onReAnalyzeVersion: (version: DocumentVersion) => void;
}

export const VersionHistoryPanel: React.FC<VersionHistoryPanelProps> = ({
  document,
  currentVersionId,
  isOpen,
  onClose,
  onSelectVersion,
  onCompareVersions,
  onReAnalyzeVersion,
}) => {
  const [restoreConfirmVer, setRestoreConfirmVer] = useState<DocumentVersion | null>(null);

  if (!isOpen) return null;

  const handleConfirmRestore = () => {
    if (!restoreConfirmVer) return;
    const result = restoreDocumentVersion(document.id, restoreConfirmVer.id);
    if (result) {
      onSelectVersion(result.version);
    }
    setRestoreConfirmVer(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleDateString()} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md h-full bg-neutral-950 border-l border-white/15 p-6 md:p-8 space-y-6 flex flex-col justify-between shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl border border-blue-400/40 bg-blue-500/10 flex items-center justify-center text-blue-400">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">VERSION HISTORY</h3>
                <p className="text-[11px] text-slate-400 truncate max-w-[220px]">{document.name}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Timeline List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4">
            {document.versions.map((ver) => {
              const isCurrent = ver.id === currentVersionId;

              return (
                <div
                  key={ver.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 relative ${
                    isCurrent
                      ? 'border-blue-400/50 bg-blue-500/10 shadow-lg'
                      : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                  }`}
                >
                  {/* Timeline Badge Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitCommit className={`w-4 h-4 ${isCurrent ? 'text-blue-400' : 'text-slate-400'}`} />
                      <span className="text-xs font-bold text-white font-mono">{ver.label}</span>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          Active Context
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-slate-400">{formatDate(ver.createdAt)}</span>
                  </div>

                  {/* Similarity Status */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[11px]">{ver.wordCount.toLocaleString()} words</span>
                      {ver.changeNote && <span className="text-slate-500 text-[10px] italic">• {ver.changeNote}</span>}
                    </div>

                    {ver.similarityScore !== undefined ? (
                      <span className="font-mono font-bold text-amber-400">{ver.similarityScore}% similarity</span>
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">Not analyzed</span>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => onSelectVersion(ver)}
                      className="text-[11px] font-semibold text-blue-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isCurrent ? 'Viewing' : 'Open Version'}</span>
                    </button>

                    {document.versions.length > 1 && !isCurrent && (
                      <button
                        onClick={() => {
                          const currentVer = document.versions.find((v) => v.id === currentVersionId);
                          if (currentVer) onCompareVersions(ver, currentVer);
                        }}
                        className="text-[11px] font-semibold text-purple-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Compare</span>
                      </button>
                    )}

                    {!isCurrent && (
                      <button
                        onClick={() => setRestoreConfirmVer(ver)}
                        className="text-[11px] font-semibold text-emerald-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Restore</span>
                      </button>
                    )}

                    {ver.analysisStatus !== 'completed' && (
                      <button
                        onClick={() => onReAnalyzeVersion(ver)}
                        className="text-[11px] font-semibold text-cyan-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Analyze</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Note */}
          <div className="pt-4 border-t border-white/10 text-[11px] text-slate-500 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Restoring a previous version creates a new current version safely without deleting history.</span>
          </div>

          {/* Restore Confirmation Modal */}
          {restoreConfirmVer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
              <div className="max-w-sm w-full rounded-2xl border border-white/20 bg-neutral-900 p-6 space-y-4 shadow-2xl text-center">
                <div className="w-10 h-10 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400">
                  <RotateCcw className="w-5 h-5" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Restore {restoreConfirmVer.label}?</h4>
                  <p className="text-xs text-slate-400">
                    A new version will be created from this version. Your current version will remain safely in history.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <Button variant="outline" size="sm" onClick={() => setRestoreConfirmVer(null)}>
                    Cancel
                  </Button>
                  <Button variant="glow" size="sm" onClick={handleConfirmRestore}>
                    Confirm Restore
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
