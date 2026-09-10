import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  PlusCircle,
  FileEdit,
  Layers,
  LayoutDashboard,
  FileText,
  Settings as SettingsIcon,
  Sun,
  Moon,
  HelpCircle,
  X,
  ArrowRight,
  Command,
} from 'lucide-react';
import { getStoredTheme, applyTheme } from '../../lib/themeStore';
import { getAllAnalyses } from '../../lib/analysisStore';

export interface CommandItem {
  id: string;
  label: string;
  category: 'Navigation' | 'Analysis' | 'Documents' | 'Reports' | 'Appearance' | 'Help';
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle Command Palette with Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const recentAnalyses = getAllAnalyses();
  const latestAnalysis = recentAnalyses.length > 0 ? recentAnalyses[0] : null;

  // Build real dynamic command list based on app context
  const commands: CommandItem[] = [
    {
      id: 'cmd-dashboard',
      label: 'Open Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard'),
    },
    {
      id: 'cmd-scan',
      label: 'Upload Document / Start Scan',
      category: 'Analysis',
      icon: PlusCircle,
      action: () => navigate('/scan'),
      shortcut: 'U',
    },
    {
      id: 'cmd-editor',
      label: 'Open Originality Editor',
      category: 'Documents',
      icon: FileEdit,
      action: () => navigate('/editor'),
    },
    {
      id: 'cmd-compare',
      label: 'Compare Two Documents',
      category: 'Analysis',
      icon: Layers,
      action: () => navigate('/compare'),
    },
    {
      id: 'cmd-reports',
      label: 'Open Reports History',
      category: 'Reports',
      icon: FileText,
      action: () => navigate('/reports'),
    },
    ...(latestAnalysis
      ? [
          {
            id: 'cmd-latest-report',
            label: `Open Latest Report (${latestAnalysis.documentName})`,
            category: 'Reports' as const,
            icon: FileText,
            action: () => navigate(`/results/${latestAnalysis.id}`),
          },
        ]
      : []),
    {
      id: 'cmd-theme',
      label: 'Toggle Dark / Light Theme',
      category: 'Appearance',
      icon: getStoredTheme() === 'dark' ? Sun : Moon,
      action: () => {
        const nextTheme = getStoredTheme() === 'dark' ? 'light' : 'dark';
        applyTheme(nextTheme);
      },
    },
    {
      id: 'cmd-settings',
      label: 'Open Settings & Privacy',
      category: 'Navigation',
      icon: SettingsIcon,
      action: () => navigate('/settings'),
    },
    {
      id: 'cmd-shortcuts',
      label: 'Show Keyboard Shortcuts Guide',
      category: 'Help',
      icon: HelpCircle,
      action: () => {
        const event = new KeyboardEvent('keydown', { key: '?' });
        window.dispatchEvent(event);
      },
      shortcut: '?',
    },
  ];

  // Filter commands by query
  const filteredCommands = commands.filter(
    (c) =>
      c.label.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleExecute = (cmd: CommandItem) => {
    setIsOpen(false);
    cmd.action();
  };

  // Keyboard navigation inside palette
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        handleExecute(filteredCommands[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4 bg-black/80 backdrop-blur-md select-none">
        {/* Backdrop click to close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0"
        />

        {/* Command Palette Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -15, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, scale: 0.96, y: -10, filter: 'blur(4px)' }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-xl rounded-3xl border border-white/20 bg-neutral-950 p-4 space-y-4 shadow-2xl text-slate-100 overflow-hidden"
        >
          {/* Input Header */}
          <div className="flex items-center gap-3 px-3 py-2 border-b border-white/10">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Search commands, navigate or run actions... (Esc to close)"
              className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none font-sans"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Commands List */}
          <div className="max-h-80 overflow-y-auto space-y-1 px-1">
            {filteredCommands.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching commands found. Press Esc to exit.
              </div>
            ) : (
              filteredCommands.map((cmd, idx) => {
                const Icon = cmd.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => handleExecute(cmd)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-white/15 text-white border border-white/25 shadow-md'
                        : 'text-slate-300 hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-xl border ${isSelected ? 'border-white/30 bg-white/20' : 'border-white/10 bg-white/5 text-slate-400'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="font-semibold block">{cmd.label}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-mono">{cmd.category}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {cmd.shortcut && (
                        <span className="px-1.5 py-0.5 rounded bg-white/10 text-[10px] font-mono border border-white/10 text-slate-300">
                          {cmd.shortcut}
                        </span>
                      )}
                      <ArrowRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'translate-x-1 text-white' : 'opacity-0'}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer keyboard hints */}
          <div className="flex items-center justify-between px-3 pt-2 border-t border-white/10 text-[10px] text-slate-500 font-mono">
            <div className="flex items-center gap-3">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>ESC Close</span>
            </div>
            <div className="flex items-center gap-1">
              <Command className="w-3 h-3 text-slate-400" />
              <span>Plagora AI Command Palette</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
