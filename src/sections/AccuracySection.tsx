import React from 'react';
import { motion } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import { ScrollReveal } from '../components/ui/ScrollReveal';

export const AccuracySection: React.FC = () => {
  const comparison = [
    {
      feature: 'Exact String & N-Gram Matching',
      traditional: true,
      plagora: true,
    },
    {
      feature: 'Paraphrased Concept Recognition',
      traditional: false,
      plagora: true,
    },
    {
      feature: 'Deep Contextual Vector Semantics',
      traditional: false,
      plagora: true,
    },
    {
      feature: 'Intra-Document Repeated Phrase Auditing',
      traditional: true,
      plagora: true,
    },
    {
      feature: 'Client-Side Secure Text Extraction',
      traditional: false,
      plagora: true,
    },
    {
      feature: 'Interactive Passage-to-Source Mapping',
      traditional: false,
      plagora: true,
    },
  ];

  return (
    <section id="accuracy" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Benchmark Comparison
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            Traditional checkers vs <br />
            <span className="font-serif-italic text-slate-300">Plagora AI precision.</span>
          </p>
        </ScrollReveal>

        <ScrollReveal blur scale delay={0.1}>
          <div className="rounded-2xl border border-white/15 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-12 p-4 md:p-6 border-b border-white/10 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-white/[0.02]">
              <div className="col-span-6 md:col-span-7">Capability</div>
              <div className="col-span-3 md:col-span-2 text-center text-slate-500">Legacy Checker</div>
              <div className="col-span-3 font-bold text-center text-white flex items-center justify-center gap-1">
                <Zap className="w-3.5 h-3.5 text-blue-400" /> Plagora AI
              </div>
            </div>

            <div className="divide-y divide-white/5">
              {comparison.map((c, idx) => (
                <motion.div
                  key={c.feature}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  className="grid grid-cols-12 p-4 md:p-5 items-center text-sm hover:bg-white/[0.03] transition-colors"
                >
                  <div className="col-span-6 md:col-span-7 text-slate-200 font-medium">{c.feature}</div>
                  <div className="col-span-3 md:col-span-2 flex justify-center">
                    {c.traditional ? (
                      <Check className="w-4 h-4 text-slate-500" />
                    ) : (
                      <X className="w-4 h-4 text-slate-600 opacity-40" />
                    )}
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <div className="w-6 h-6 rounded-full border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
