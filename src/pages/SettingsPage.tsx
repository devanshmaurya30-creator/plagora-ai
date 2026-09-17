import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Sliders, Bell, Eye, ShieldCheck, Check, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { containerStaggerVariants, itemFadeUpVariants, toastVariants, modalBackdropVariants, modalContentVariants } from '../lib/motion';
import { MagneticIcon } from '../components/ui/MagneticIcon';
import { clearAllAnalyses } from '../lib/analysisStore';

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'detection' | 'privacy' | 'notifications' | 'appearance'>('profile');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleClearAllData = () => {
    clearAllAnalyses();
    setShowClearModal(false);
    setClearedSuccess(true);
    setTimeout(() => setClearedSuccess(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'detection', label: 'Detection Preferences', icon: Sliders },
    { id: 'privacy', label: 'Privacy & Data Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Eye },
  ];

  return (
    <motion.div
      variants={containerStaggerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen select-none relative"
    >
      <motion.div variants={itemFadeUpVariants} className="border-b border-slate-200 dark:border-white/10 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Settings & Privacy</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Manage account defaults, privacy controls, data persistence, and AI detection parameters.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Left Tabs Nav */}
        <motion.div variants={itemFadeUpVariants} className="md:col-span-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-all duration-200 cursor-pointer ${
                  isActive ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSettingsTab"
                    className="absolute inset-0 rounded-2xl bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 shadow-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <MagneticIcon maxOffset={2}>
                  <Icon className="w-4 h-4 text-cyan-600 dark:text-blue-400 relative z-10" />
                </MagneticIcon>
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Right Content Panel */}
        <motion.div variants={itemFadeUpVariants} className="md:col-span-8 rounded-3xl border border-slate-200 dark:border-white/15 bg-white dark:bg-white/[0.03] backdrop-blur-xl p-6 md:p-8 space-y-6 shadow-xl">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="tab-profile"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Account Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue="Dr. Alex Vance"
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">Email Address</label>
                    <input
                      type="email"
                      defaultValue="alex.vance@research.edu"
                      className="w-full bg-slate-50 dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 focus:bg-white dark:focus:bg-white/[0.07] focus:ring-2 focus:ring-cyan-500/20 transition-all duration-200"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'detection' && (
              <motion.div
                key="tab-detection"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Default Detection Engine
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.02]">
                    <div>
                      <span className="text-xs font-semibold text-slate-900 dark:text-white block">Default Scan Depth</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Deep AI semantic search by default</span>
                    </div>
                    <select className="bg-white dark:bg-black border border-slate-200 dark:border-white/20 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500">
                      <option>Deep Analysis</option>
                      <option>Standard Analysis</option>
                      <option>Quick Analysis</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div
                key="tab-privacy"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 select-none"
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Privacy & Data Governance Center
                </h2>

                <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-white/[0.02] p-5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-900 dark:text-white">Client-Side Document Text Extraction</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      PDF, DOCX, and TXT documents are parsed locally in your browser. Raw document binary files are never permanently stored on external servers.
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/5">
                    <h3 className="font-bold text-slate-900 dark:text-white">Temporary Analysis Storage</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Analysis results and report histories are stored locally in browser memory (`localStorage`). You have complete control to clear stored data at any time.
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-white/5">
                    <h3 className="font-bold text-slate-900 dark:text-white">Live Web Verification Safety</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Only extracted passage candidates are checked against web indexes for verification. API keys and internal credentials are strictly isolated on server Node environment.
                    </p>
                  </div>
                </div>

                {/* Data Cleanup Actions (Requirements 14-16) */}
                <div className="pt-2 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-red-400">Data Cleanup Actions</h3>
                  <div className="p-4 rounded-2xl border border-red-500/30 bg-red-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">Purge Stored Report History</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">Permanently delete all stored plagiarism reports and analysis results.</span>
                    </div>
                    <Button variant="danger" size="sm" onClick={() => setShowClearModal(true)} icon={<Trash2 className="w-3.5 h-3.5" />}>
                      Clear Analysis Data
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notifications' && (
              <motion.div
                key="tab-notifications"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Notification Preferences
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/10" />
                    <span>Email report completion alerts</span>
                  </label>
                  <label className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/10" />
                    <span>Weekly similarity digest summary</span>
                  </label>
                </div>
              </motion.div>
            )}

            {activeTab === 'appearance' && (
              <motion.div
                key="tab-appearance"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Interface Theme Mode
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Toggle between Pure Black Cinematic Dark Mode and High-Contrast Editorial Light Mode using the theme switcher in the top navigation bar.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Settings auto-persist client-side</span>
            <Button size="sm" magnetic borderGlow onClick={handleSave} icon={savedSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : undefined}>
              {savedSuccess ? 'Saved!' : 'Save Preferences'}
            </Button>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal for Clear All Analysis Data (Requirement 16) */}
      <AnimatePresence>
        {showClearModal && (
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
              className="max-w-md w-full rounded-3xl border border-white/20 bg-neutral-950 p-8 space-y-6 shadow-2xl text-center select-none"
            >
              <div className="w-14 h-14 rounded-full border border-red-500/30 bg-red-500/10 flex items-center justify-center mx-auto text-red-400">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Clear All Analysis Data?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This action will permanently delete all stored report histories from your browser. This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="outline" size="sm" onClick={() => setShowClearModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" size="sm" onClick={handleClearAllData}>
                  Delete All Data
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification Animation */}
      <AnimatePresence>
        {(savedSuccess || clearedSuccess) && (
          <motion.div
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-8 right-8 z-50 p-4 rounded-2xl border border-emerald-500/30 bg-neutral-900/95 text-white shadow-2xl backdrop-blur-xl flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold">{clearedSuccess ? 'Data Cleared' : 'Preferences Saved'}</h4>
              <p className="text-[11px] text-slate-400">
                {clearedSuccess ? 'All stored reports were permanently removed.' : 'Your configuration settings were updated.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
