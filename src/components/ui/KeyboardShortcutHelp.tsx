import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Keyboard, X } from 'lucide-react';
import { modalBackdropVariants, modalContentVariants } from '../../lib/motion';

export const KeyboardShortcutHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement)?.isContentEditable;

      if (e.key === '?' && !isInput) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const shortcuts = [
    { key: 'N', desc: 'Jump to Next detected match' },
    { key: 'P', desc: 'Jump to Previous detected match' },
    { key: 'Ctrl + F', desc: 'Search inside document text' },
    { key: 'Esc', desc: 'Close match panel, modal, or document search' },
    { key: '?', desc: 'Toggle keyboard shortcuts guide' },
  ];

  return (
    <>
      {/* Floating Trigger Button in Bottom Left */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Keyboard Shortcuts"
        className="fixed bottom-6 left-6 z-40 p-2.5 rounded-full border border-white/15 bg-black/80 backdrop-blur-xl text-slate-400 hover:text-white hover:border-white/30 transition-all shadow-xl hidden md:flex items-center gap-2 group"
        title="Keyboard Shortcuts (?)"
      >
        <Keyboard className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
        <span className="text-[11px] font-mono font-medium hidden lg:inline">Shortcuts</span>
        <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono text-slate-300">?</span>
      </button>

      {/* Modal Guide */}
      <AnimatePresence>
        {isOpen && (
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
              className="max-w-md w-full rounded-3xl border border-white/20 bg-neutral-950 p-6 md:p-8 space-y-6 shadow-2xl text-slate-100 select-none relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl border border-blue-400/40 bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Keyboard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Keyboard Shortcuts</h3>
                    <p className="text-xs text-slate-400">Navigate matches and audit documents without a mouse.</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="space-y-3">
                {shortcuts.map((sc) => (
                  <div
                    key={sc.key}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/[0.02]"
                  >
                    <span className="text-xs text-slate-300 font-medium">{sc.desc}</span>
                    <kbd className="px-2.5 py-1 rounded-lg border border-white/20 bg-white/10 text-xs font-mono font-bold text-white shadow-inner">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="text-[11px] text-slate-500 text-center pt-2">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">Esc</kbd> anytime to close this modal.
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
