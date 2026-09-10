import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, ShieldAlert, X, Trash2, Link as LinkIcon } from 'lucide-react';
import type { AnalysisResult } from '../../types/analysis';
import { createShareToken, getShareRecordForReport, revokeShareToken } from '../../lib/shareStore';
import { Button } from '../ui/Button';

interface ShareReportModalProps {
  analysis: AnalysisResult;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareReportModal: React.FC<ShareReportModalProps> = ({ analysis, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shareRecord, setShareRecord] = useState(getShareRecordForReport(analysis.id));

  useEffect(() => {
    if (isOpen) {
      setShareRecord(getShareRecordForReport(analysis.id));
    }
  }, [isOpen, analysis.id]);

  if (!isOpen) return null;

  const handleGenerateLink = () => {
    const record = createShareToken(analysis.id);
    setShareRecord(record);
  };

  const handleRevokeLink = () => {
    revokeShareToken(analysis.id);
    setShareRecord(null);
  };

  const shareUrl = shareRecord
    ? `${window.location.origin}/shared/report/${shareRecord.token}`
    : '';

  const handleCopy = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-md w-full rounded-3xl border border-white/20 bg-neutral-950 p-6 md:p-8 space-y-6 shadow-2xl text-slate-100 relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl border border-blue-400/40 bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight uppercase">SHARE REPORT</h3>
                <p className="text-[11px] text-slate-400">Secure Read-Only Access Link</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!shareRecord ? (
            /* Create Link State */
            <div className="space-y-4 text-center py-2">
              <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] text-xs text-slate-300 space-y-2 text-left">
                <div className="flex items-center gap-2 font-bold text-white">
                  <ShieldAlert className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Read-Only Privacy Protection</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Creating a share link generates a unique, unguessable access key allowing external viewers to inspect the analysis scores, detected matches, and source breakdown in read-only mode.
                </p>
              </div>

              <Button size="sm" magnetic borderGlow onClick={handleGenerateLink} icon={<LinkIcon className="w-4 h-4" />}>
                Create Secure Share Link
              </Button>
            </div>
          ) : (
            /* Active Share Link State */
            <div className="space-y-4">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  PUBLIC READ-ONLY LINK
                </span>
                <div className="flex items-center gap-2 p-2.5 rounded-xl border border-white/15 bg-white/5 text-xs text-slate-200 font-mono overflow-x-auto">
                  <span className="truncate flex-1">{shareUrl}</span>
                  <button
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300 hover:text-white transition-colors shrink-0"
                    title="Copy Share URL"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-[11px] text-emerald-300 flex items-center justify-between">
                <span>Link Active & Ready to Share</span>
                <span className="font-mono text-[10px] text-slate-400">Created: {new Date(shareRecord.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <button
                  onClick={handleRevokeLink}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Revoke Link</span>
                </button>

                <Button size="sm" variant="outline" onClick={handleCopy}>
                  {copied ? 'Copied Link' : 'Copy Link'}
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
