import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, RefreshCw, Copy, Check, Bot, User, Trash2 } from 'lucide-react';
import type { AnalysisResult } from '../../types/analysis';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface AIAnalysisChatProps {
  analysis: AnalysisResult;
  isOpen: boolean;
  onClose: () => void;
}

export const AIAnalysisChat: React.FC<AIAnalysisChatProps> = ({ analysis, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello! I am your Plagora AI Document Assistant. Ask me anything about "${analysis.documentName}" or your ${analysis.similarityScore}% similarity score.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Contextual suggested question chips
  const suggestedQuestions = [
    'What should I fix first?',
    'Why was this passage flagged?',
    'Which source affects my score the most?',
    'Summarize originality issues',
  ];

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const summaryPayload = {
        documentName: analysis.documentName,
        similarityScore: analysis.similarityScore,
        exactMatchScore: analysis.exactMatchScore,
        paraphraseScore: analysis.paraphraseScore,
        semanticScore: analysis.semanticScore,
        matchCount: analysis.matches.length,
        sourcesCount: analysis.sources.length,
        topSources: analysis.sources.slice(0, 3).map((s) => ({ title: s.title, domain: s.domain, similarity: s.similarity })),
        confidence: analysis.confidence,
      };

      const res = await fetch('/api/analysis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisSummary: summaryPayload,
          history: messages.map((m) => ({ role: m.role, text: m.text })),
          userQuestion: textToSend.trim(),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: data.reply || 'I analyzed the evidence context but could not produce a response.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        const errJson = await res.json().catch(() => null);
        let userFacingError = 'AI Chat is temporarily unavailable. Please try again.';
        if (res.status === 429) {
          userFacingError = errJson?.error || 'AI analysis is temporarily rate-limited. Please wait a few minutes before asking another question.';
        } else if (res.status === 400) {
          userFacingError = errJson?.error || 'The submitted question or document summary was invalid.';
        } else if (errJson?.error) {
          userFacingError = errJson.error;
        }

        const aiMsg: Message = {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: userFacingError,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, aiMsg]);
      }
    } catch (e) {
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: 'Unable to reach Plagora AI server. Please verify your network connection and try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleCopyMessage = (msgId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 dark:bg-black/80 backdrop-blur-sm select-none">
        {/* Backdrop click */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        {/* Sliding AI Assistant Drawer */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 40 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg bg-white dark:bg-neutral-950 border-l border-slate-200 dark:border-white/15 h-[100dvh] max-h-[100dvh] overflow-hidden flex flex-col justify-between shadow-2xl z-10"
        >
          {/* Header */}
          <div className="p-4 md:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/90 dark:bg-black/90">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase">ASK PLAGORA AI</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Analysis Intelligence Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMessages([messages[0]])}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
                title="Clear chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 font-sans text-xs">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-xl border flex items-center justify-center shrink-0 ${isUser ? 'border-blue-500/40 bg-blue-500/10 text-blue-600 dark:text-blue-300' : 'border-cyan-500/40 bg-cyan-500/10 text-cyan-600 dark:text-cyan-300'}`}>
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`space-y-1.5 max-w-[85%] ${isUser ? 'text-right' : ''}`}>
                    <div
                      className={`p-3.5 rounded-2xl border leading-relaxed text-xs ${
                        isUser
                          ? 'border-blue-500/30 bg-blue-500/10 text-slate-900 dark:text-slate-100 rounded-tr-none'
                          : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] text-slate-800 dark:text-slate-200 rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div className={`flex items-center gap-2 text-[10px] text-slate-400 font-mono ${isUser ? 'justify-end' : ''}`}>
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopyMessage(msg.id, msg.text)}
                          className="hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === msg.id ? <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-xs py-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-500 dark:text-cyan-400" />
                <span>Plagora AI is analyzing evidence...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Contextual Suggested Prompt Chips */}
          <div className="px-4 py-2 border-t border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/40 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
              SUGGESTED QUESTIONS
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-xl text-[11px] font-medium bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-cyan-400/40 hover:bg-cyan-500/10 text-slate-700 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 shrink-0 transition-colors cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/90 flex items-center gap-2 pb-safe">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about this analysis..."
              className="flex-1 bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/15 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
            />

            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="p-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/20 dark:hover:bg-cyan-500/30 transition-colors disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
