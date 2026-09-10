import React from 'react';
import { Flame, ShieldAlert } from 'lucide-react';

export const DocumentHeatmapLegend: React.FC = () => {
  return (
    <div className="p-3.5 rounded-2xl border border-white/10 bg-black/60 space-y-2 select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white font-mono">SIMILARITY CONCENTRATION HEATMAP</span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">Empirical Spectrum</span>
      </div>

      <div className="grid grid-cols-4 gap-2 text-[11px] font-mono">
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300">
          <span className="w-2.5 h-2.5 rounded bg-blue-400" />
          <span>Low (&lt;40%)</span>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300">
          <span className="w-2.5 h-2.5 rounded bg-yellow-400" />
          <span>Medium (40-59%)</span>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <span className="w-2.5 h-2.5 rounded bg-amber-400" />
          <span>High (60-79%)</span>
        </div>

        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
          <span className="w-2.5 h-2.5 rounded bg-red-400" />
          <span>Very High (≥80%)</span>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[10px] text-slate-400 pt-1">
        <ShieldAlert className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span>Heatmap highlights detected textual similarity concentration. It does not constitute an automated verdict of plagiarism.</span>
      </div>
    </div>
  );
};
