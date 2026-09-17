import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { toastVariants } from '../../lib/motion';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/40 bg-emerald-500/10 dark:bg-emerald-500/[0.08]';
      case 'warning':
        return 'border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/[0.08]';
      case 'error':
        return 'border-red-500/40 bg-red-500/10 dark:bg-red-500/[0.08]';
      case 'info':
      default:
        return 'border-blue-500/40 bg-blue-500/10 dark:bg-blue-500/[0.08]';
    }
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-6 z-[60] flex flex-col gap-3 max-w-sm w-auto pointer-events-none select-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`pointer-events-auto p-4 rounded-2xl border backdrop-blur-2xl shadow-xl shadow-slate-900/10 dark:shadow-black/60 flex items-start gap-3 bg-white/95 dark:bg-neutral-900/95 text-slate-900 dark:text-slate-100 ${getBorderColor(
              toast.type
            )}`}
          >
            <div className="shrink-0 mt-0.5">{getIcon(toast.type)}</div>

            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">{toast.title}</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
