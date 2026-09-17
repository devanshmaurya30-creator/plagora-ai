import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 text-slate-500 dark:text-slate-400 text-xs transition-colors duration-250">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-4 h-4 text-slate-900 dark:text-white" />
          </div>
          <span className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">Plagora AI</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-slate-600 dark:text-slate-400 font-medium">Research Originality & Evidence Platform</span>
        </div>

        <div className="flex items-center gap-6 text-slate-600 dark:text-slate-400 font-medium">
          <Link to="/settings" className="hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Security & Compliance</span>
          </Link>
          <Link to="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Workspace
          </Link>
          <Link to="/scan" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            New Scan
          </Link>
        </div>

        <div className="text-slate-500 dark:text-slate-500 font-mono">
          &copy; 2026 Devansh Maurya Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
