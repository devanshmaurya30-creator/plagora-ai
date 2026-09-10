import React from 'react';
import { Upload, Cpu, Layers, FileCheck } from 'lucide-react';
import { TiltCard } from '../components/ui/TiltCard';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { MagneticIcon } from '../components/ui/MagneticIcon';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: Upload,
      step: '01',
      title: 'Upload Document',
      description:
        'Drop your PDF, DOCX, or TXT document up to 20MB. Your text is safely parsed and processed directly in real-time.',
    },
    {
      icon: Cpu,
      step: '02',
      title: 'Contextual Chunking',
      description:
        'Text is normalized, cleaned, and split into intelligent contextual passages while preserving paragraph metadata for precise highlighting.',
    },
    {
      icon: Layers,
      step: '03',
      title: 'Multi-Layered Detection',
      description:
        'Our engine evaluates exact sentence matches, structural paraphrasing, and deep semantic similarity across indexed databases.',
    },
    {
      icon: FileCheck,
      step: '04',
      title: 'Interactive Results',
      description:
        'Explore your transparent Similarity Score with highlighted suspicious passages and verified matching sources.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-white/[0.08] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-xs font-semibold tracking-widest text-slate-400 uppercase">
            Architecture & Workflow
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            How Plagora AI delivers <br />
            <span className="font-serif-italic text-slate-300">unmatched detection depth.</span>
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <ScrollReveal key={s.step} delay={idx * 0.08} scale>
                <TiltCard maxRotate={2} liftY={-6} className="p-6 h-full flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-10 h-10 rounded-xl border border-white/15 bg-white/5 flex items-center justify-center text-white">
                        <MagneticIcon maxOffset={3}>
                          <Icon className="w-5 h-5 text-blue-400" />
                        </MagneticIcon>
                      </div>
                      <span className="text-2xl font-bold font-mono text-white/20">
                        {s.step}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2">{s.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{s.description}</p>
                  </div>
                </TiltCard>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
