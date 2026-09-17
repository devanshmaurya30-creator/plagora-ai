import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, Plus, Trash2, X, Bookmark, ExternalLink } from 'lucide-react';
import {
  getSavedEvidenceItems,
  removeEvidenceItem,
  getEvidenceCollections,
  createEvidenceCollection,
  type EvidenceLockerItem,
} from '../../lib/evidenceLockerStore';
import { Button } from '../ui/Button';
import { sanitizeUrl } from '../../lib/urlSanitizer';

interface EvidenceLockerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EvidenceLockerModal: React.FC<EvidenceLockerModalProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<EvidenceLockerItem[]>(getSavedEvidenceItems());
  const [collections, setCollections] = useState(getEvidenceCollections());
  const [newColName, setNewColName] = useState('');
  const [showAddCol, setShowAddCol] = useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRemoveItem = (id: string) => {
    removeEvidenceItem(id);
    setItems(getSavedEvidenceItems());
  };

  const handleCreateCol = () => {
    if (!newColName.trim()) return;
    createEvidenceCollection(newColName.trim());
    setCollections(getEvidenceCollections());
    setNewColName('');
    setShowAddCol(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 dark:bg-black/80 backdrop-blur-md select-none overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl w-full max-h-[85vh] rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-neutral-950 p-6 md:p-8 space-y-6 shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col justify-between relative my-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl border border-purple-500/30 bg-purple-500/10 flex items-center justify-center text-purple-600 dark:text-purple-400">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">EVIDENCE LOCKER & COLLECTIONS</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Persisted Evidence Vault & Research Records</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Collections Pill Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto py-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">COLLECTIONS:</span>
              {collections.map((col) => (
                <span
                  key={col.id}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-400/30 flex items-center gap-1"
                >
                  <Bookmark className="w-3 h-3 text-purple-500 dark:text-purple-400" />
                  {col.name}
                </span>
              ))}
            </div>

            <button
              onClick={() => setShowAddCol(!showAddCol)}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Collection</span>
            </button>
          </div>

          {showAddCol && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-white/10">
              <input
                type="text"
                placeholder="Collection name..."
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                className="bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none flex-1 px-2"
              />
              <Button size="sm" onClick={handleCreateCol}>
                Create
              </Button>
            </div>
          )}

          {/* Saved Evidence Items List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[380px]">
            {items.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-slate-200 dark:border-white/10 rounded-2xl bg-slate-50 dark:bg-white/[0.01]">
                No evidence items saved in locker yet. Click "Save Evidence" on any match to store it here.
              </div>
            ) : (
              items.map((item) => {
                const safeUrl = sanitizeUrl(item.sourceUrl);
                return (
                  <div key={item.id} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02] space-y-2 relative">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-bold text-slate-900 dark:text-white">{item.sourceTitle}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-600 dark:text-amber-400 font-bold">{item.similarity}% similarity</span>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"
                          title="Remove evidence"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 italic bg-white dark:bg-black/40 p-2.5 rounded-xl border border-slate-200 dark:border-white/5 line-clamp-2">
                      "{item.originalText}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1">
                      <span>Saved on {new Date(item.savedAt).toLocaleDateString()}</span>
                      {safeUrl && (
                        <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
                          <span>Source URL</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
