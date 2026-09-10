import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/[0.08] bg-black py-12 px-4 sm:px-6 lg:px-8 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-white tracking-tight">Plagora AI</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">AI-Powered Plagiarism Detection Platform</span>
        </div>

        <div className="flex items-center gap-6 text-slate-400">
          <Link to="/privacy" className="hover:text-white transition-colors flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-500" />
            <span>Privacy Policy</span>
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link to="/settings" className="hover:text-white transition-colors">
            Security & Compliance
          </Link>
        </div>

        <div className="text-slate-500">
          &copy; 2026 Devansh Maurya Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
