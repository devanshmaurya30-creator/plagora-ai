import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, ShieldCheck, Zap, Award } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { TiltCard } from '../components/ui/TiltCard';
import { MagneticIcon } from '../components/ui/MagneticIcon';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = topOffset(rect.top, rect.height);
    const dx = (e.clientX - centerX) / (rect.width / 2);
    const dy = (e.clientY - centerY) / (rect.height / 2);

    setParallaxOffset({
      x: dx * 6,
      y: dy * 6,
    });
  };

  const topOffset = (top: number, height: number) => top + height / 2;

  const handleScrollToHowItWorks = () => {
    const elem = document.querySelector('#how-it-works');
    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 25, filter: 'blur(8px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative pt-24 pb-20 md:pt-36 md:pb-32 overflow-hidden select-none"
    >
      {/* Hero Decorative Layer Mouse Parallax */}
      <motion.div
        animate={{ x: parallaxOffset.x * -1.2, y: parallaxOffset.y * -1.2 }}
        transition={{ type: 'spring', stiffness: 150, damping: 25 }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-600/10 via-purple-500/10 to-transparent blur-[140px] rounded-full pointer-events-none"
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Eyebrow Badge */}
          <motion.div variants={itemVariants} className="flex justify-center">
            <Badge>AI-POWERED ORIGINALITY INTELLIGENCE</Badge>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            Detect plagiarism with <br />
            <span className="font-serif-italic text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">
              AI-level precision.
            </span>
          </motion.h1>

          {/* Supporting Subtitle */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 dark:text-slate-400 font-normal leading-relaxed"
          >
            Analyze documents for exact, paraphrased, and semantically similar content with
            evidence-grounded AI intelligence.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2"
          >
            <Button
              size="lg"
              magnetic
              borderGlow
              onClick={() => navigate('/scan')}
              icon={
                <MagneticIcon maxOffset={3}>
                  <ArrowRight className="w-5 h-5" />
                </MagneticIcon>
              }
            >
              Start Analysis
            </Button>
            <Button
              size="lg"
              variant="outline"
              magnetic
              onClick={handleScrollToHowItWorks}
              icon={
                <MagneticIcon maxOffset={3}>
                  <Play className="w-4 h-4 fill-current" />
                </MagneticIcon>
              }
            >
              See How It Works
            </Button>
          </motion.div>

          {/* Bottom Statistics Cards */}
          <motion.div
            variants={itemVariants}
            className="pt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto border-t border-white/[0.08]"
          >
            <TiltCard maxRotate={2.5} liftY={-6} className="p-6 text-center bg-white/[0.03] dark:bg-white/[0.02] border-white/10 dark:border-white/10">
              <div className="flex items-center justify-center gap-2 text-white font-extrabold text-2xl">
                <MagneticIcon maxOffset={3}>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </MagneticIcon>
                <span>99%+</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">semantic detection coverage</p>
            </TiltCard>

            <TiltCard maxRotate={2.5} liftY={-6} className="p-6 text-center bg-white/[0.03] dark:bg-white/[0.02] border-white/10 dark:border-white/10">
              <div className="flex items-center justify-center gap-2 text-white font-extrabold text-2xl">
                <MagneticIcon maxOffset={3}>
                  <Zap className="w-5 h-5 text-cyan-400" />
                </MagneticIcon>
                <span>Millions</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">of passages analyzed</p>
            </TiltCard>

            <TiltCard maxRotate={2.5} liftY={-6} className="p-6 text-center bg-white/[0.03] dark:bg-white/[0.02] border-white/10 dark:border-white/10">
              <div className="flex items-center justify-center gap-2 text-white font-extrabold text-2xl">
                <MagneticIcon maxOffset={3}>
                  <Award className="w-5 h-5 text-amber-400" />
                </MagneticIcon>
                <span>Trusted</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">by writers & researchers</p>
            </TiltCard>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
