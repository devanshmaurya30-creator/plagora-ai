import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, FileText, AlertCircle, X, Loader2, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { ClickRipple } from '../ui/ClickRipple';
import { MagneticIcon } from '../ui/MagneticIcon';
import type { ParsedDocument, FileState } from '../../types/document';
import { parseDocument, DocumentParseError } from '../../lib/documentParser';

interface DropzoneProps {
  onDocumentReady?: (doc: ParsedDocument) => void;
  onStartAnalysis?: (doc: ParsedDocument) => void;
  className?: string;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onDocumentReady,
  onStartAnalysis,
  className = '',
}) => {
  const [fileState, setFileState] = useState<FileState>('EMPTY');
  const [isDragging, setIsDragging] = useState(false);
  const [parsedDoc, setParsedDoc] = useState<ParsedDocument | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleFileSelect = async (file: File) => {
    setErrorMessage(null);
    setFileState('READING');

    try {
      setFileState('EXTRACTING');
      const doc = await parseDocument(file);
      setParsedDoc(doc);
      setFileState('READY');
      if (onDocumentReady) onDocumentReady(doc);
    } catch (err: any) {
      setFileState('ERROR');
      if (err instanceof DocumentParseError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage(err.message || 'An unexpected error occurred while parsing document.');
      }
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setParsedDoc(null);
    setFileState('EMPTY');
    setErrorMessage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={onInputChange}
        accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
        className="hidden"
      />

      <AnimatePresence mode="wait">
        {/* EMPTY or DRAGGING STATE (Requirements 28) */}
        {(fileState === 'EMPTY' || fileState === 'ERROR') && (
          <ClickRipple key="empty-ripple" disabled={isDragging}>
            <motion.div
              key="empty-dropzone"
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.96, filter: 'blur(4px)' }}
              onMouseMove={handleMouseMove}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative group cursor-pointer rounded-3xl border-2 border-dashed p-8 md:p-14 text-center transition-all duration-300 select-none overflow-hidden ${
                isDragging
                  ? 'border-white/70 bg-white/10 shadow-[0_0_50px_rgba(255,255,255,0.2)] scale-[1.01]'
                  : fileState === 'ERROR'
                  ? 'border-red-500/40 bg-red-500/[0.03]'
                  : 'border-white/15 bg-white/[0.02] hover:border-white/35 hover:bg-white/[0.04]'
              }`}
            >
              {/* Idle Slow Breathing Glow (Requirement 28) */}
              <motion.div
                animate={{ opacity: [0.2, 0.45, 0.2] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-indigo-500/10 blur-xl pointer-events-none -z-10"
              />

              {/* Desktop Cursor Spotlight Background */}
              <div
                className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-50 hidden md:block"
                style={{
                  background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.08), transparent 40%)`,
                }}
              />

              {/* Active Drag Ambient Floating Light Dots */}
              {isDragging && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute top-10 left-1/4 w-2 h-2 rounded-full bg-blue-400 blur-sm"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.4, 0.9, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity, delay: 0.2 }}
                    className="absolute bottom-12 right-1/4 w-2.5 h-2.5 rounded-full bg-indigo-400 blur-sm"
                  />
                </div>
              )}

              <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                {/* Animated Floating Upload Icon with Magnetic Response */}
                <motion.div
                  animate={
                    isDragging
                      ? { scale: 1.18, y: -8 }
                      : { y: [0, -5, 0] }
                  }
                  transition={
                    isDragging
                      ? { type: 'spring', stiffness: 400, damping: 25 }
                      : { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                  }
                  className="w-16 h-16 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center shadow-lg group-hover:border-white/40 group-hover:bg-white/15 transition-colors"
                >
                  <MagneticIcon maxOffset={3}>
                    <FileUp className="w-8 h-8 text-white" />
                  </MagneticIcon>
                </motion.div>

                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white tracking-tight">
                    {isDragging ? 'Release to upload document' : 'Drop your document here'}
                  </h3>
                  <p className="text-xs text-slate-400">PDF • DOCX • TXT</p>
                </div>

                {isDragging && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-slate-200 border border-white/20 shadow-md">
                    Release to analyze
                  </span>
                )}

                <div className="pt-2 flex items-center justify-center gap-3">
                  <Button size="sm" type="button" magnetic>
                    Choose File
                  </Button>
                </div>

                <p className="text-[11px] text-slate-500 pt-2">Maximum file size: 20 MB</p>

                {/* Error state alert (Requirement 43) */}
                {fileState === 'ERROR' && errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-4 p-3.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs flex items-center gap-2.5 max-w-md mx-auto"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </ClickRipple>
        )}

        {/* READING / EXTRACTING STATE */}
        {(fileState === 'READING' || fileState === 'EXTRACTING') && (
          <motion.div
            key="extracting-state"
            initial={{ opacity: 0, scale: 0.96, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="rounded-3xl border border-white/20 bg-white/[0.04] p-10 md:p-12 text-center flex flex-col items-center justify-center gap-4 backdrop-blur-2xl"
          >
            <div className="w-14 h-14 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center shadow-lg">
              <Loader2 className="w-7 h-7 text-white animate-spin" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-semibold text-white">
                {fileState === 'READING' ? 'Reading document...' : 'Extracting document text...'}
              </h4>
              <p className="text-xs text-slate-400">Parsing paragraphs and structure for analysis</p>
            </div>
          </motion.div>
        )}

        {/* READY / SELECTED FILE CARD TRANSITION (Requirement 29) */}
        {(fileState === 'READY' || fileState === 'SELECTED') && parsedDoc && (
          <motion.div
            key="ready-state"
            initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-3xl border border-white/25 bg-white/[0.05] p-6 md:p-8 shadow-2xl backdrop-blur-xl hover:border-white/35 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl border border-white/20 bg-white/10 flex items-center justify-center text-white shrink-0 shadow-lg">
                  <MagneticIcon maxOffset={2}>
                    <FileText className="w-6 h-6 text-blue-400" />
                  </MagneticIcon>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-white truncate max-w-xs sm:max-w-md">
                      {parsedDoc.fileName}
                    </h4>
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-sm"
                    >
                      <CheckCircle2 className="w-3 h-3" /> Ready
                    </motion.span>
                  </div>

                  {/* Sequential Metadata Stagger Reveal (Requirement 29) */}
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 text-xs text-slate-400"
                  >
                    <span>{formatFileSize(parsedDoc.fileSize)}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-300">{parsedDoc.wordCount.toLocaleString()} words</span>
                    <span>•</span>
                    <span className="uppercase text-[10px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 font-mono">
                      {parsedDoc.fileType}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-white/10">
                <button
                  type="button"
                  onClick={handleRemove}
                  className="text-xs font-medium text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/5"
                >
                  <X className="w-3.5 h-3.5" />
                  Remove
                </button>

                {onStartAnalysis && (
                  <Button
                    size="sm"
                    magnetic
                    borderGlow
                    onClick={() => onStartAnalysis(parsedDoc)}
                    icon={
                      <MagneticIcon maxOffset={2}>
                        <ArrowRight className="w-4 h-4" />
                      </MagneticIcon>
                    }
                  >
                    Start Analysis
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy note */}
      <div className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
        <span>Your document is processed securely client-side.</span>
      </div>
    </div>
  );
};
