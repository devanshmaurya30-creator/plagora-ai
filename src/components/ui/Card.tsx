import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'subtle' | 'elevated' | 'glass';
  hoverEffect?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  hoverEffect = false,
  children,
  className,
  ...props
}) => {
  const baseStyles = 'rounded-2xl transition-all duration-200 border';

  const variantStyles = {
    default:
      'bg-white/80 dark:bg-neutral-900/90 border-slate-200 dark:border-white/10 text-slate-900 dark:text-slate-100 shadow-sm',
    subtle:
      'bg-slate-50 dark:bg-white/[0.02] border-slate-200/80 dark:border-white/5 text-slate-800 dark:text-slate-200',
    elevated:
      'bg-white dark:bg-neutral-900 border-slate-200/90 dark:border-white/15 text-slate-900 dark:text-slate-100 shadow-xl shadow-slate-900/5 dark:shadow-black/60',
    glass:
      'glass-panel text-slate-900 dark:text-slate-100',
  };

  const hoverStyles = hoverEffect
    ? 'hover:border-slate-300 dark:hover:border-white/20 hover:shadow-md hover:-translate-y-0.5'
    : '';

  return (
    <motion.div
      className={twMerge(clsx(baseStyles, variantStyles[variant], hoverStyles, className))}
      {...props}
    >
      {children}
    </motion.div>
  );
};
