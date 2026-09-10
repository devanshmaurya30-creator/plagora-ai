import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ProgressRingProps {
  score: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  score,
  size = 160,
  strokeWidth = 10,
  label = 'Similarity Score',
  sublabel,
}) => {
  const [currentScore, setCurrentScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentScore / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const duration = 1200; // ms
    const stepTime = 16;
    const steps = duration / stepTime;
    const increment = score / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setCurrentScore(score);
        setIsFinished(true);
        clearInterval(timer);
      } else {
        setCurrentScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Color mapping based on similarity percentage
  const getColor = (s: number) => {
    if (s <= 10) return { stroke: '#10b981', glow: 'rgba(16, 185, 129, 0.4)', text: 'text-emerald-400' };
    if (s <= 25) return { stroke: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)', text: 'text-amber-400' };
    return { stroke: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)', text: 'text-red-400' };
  };

  const colors = getColor(score);

  return (
    <div className="relative inline-flex flex-col items-center justify-center select-none">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.08)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Animated Progress Circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            filter: `drop-shadow(0 0 12px ${colors.glow})`,
            transition: 'stroke-dashoffset 0.1s linear',
          }}
        />
      </svg>

      {/* Center Label with Settle Glow (Requirement 33) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: isFinished ? [1, 1.06, 1] : 1 }}
          transition={{ duration: 0.35 }}
          className={`text-4xl font-extrabold tracking-tight ${colors.text}`}
        >
          {currentScore}%
        </motion.span>
        {label && (
          <motion.span
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-[11px] font-medium uppercase tracking-wider text-slate-400 mt-1"
          >
            {label}
          </motion.span>
        )}
        {sublabel && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-[10px] text-slate-500"
          >
            {sublabel}
          </motion.span>
        )}
      </div>
    </div>
  );
};
