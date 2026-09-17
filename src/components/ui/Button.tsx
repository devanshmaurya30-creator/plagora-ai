import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Magnetic } from './Magnetic';
import { ClickRipple } from './ClickRipple';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'liquid' | 'outline' | 'ghost' | 'danger' | 'glow';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  icon?: React.ReactNode;
  magnetic?: boolean;
  borderGlow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'liquid',
  size = 'md',
  children,
  icon,
  className,
  disabled,
  magnetic = false,
  borderGlow = false,
  onClick,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const baseStyles =
    'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden';

  const sizeStyles = {
    sm: 'h-8 px-3.5 text-xs gap-1.5 min-h-[32px]',
    md: 'h-10 px-5 text-sm gap-2 min-h-[40px]',
    lg: 'h-12 px-7 text-base gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    liquid:
      'liquid-metal-btn text-slate-950 dark:text-slate-950 font-bold shadow-sm hover:shadow-md',
    glow:
      'bg-slate-900 text-white dark:bg-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 shadow-sm hover:shadow-md',
    outline:
      'border border-slate-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 shadow-sm',
    ghost:
      'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5',
    danger:
      'border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 hover:border-red-500/50',
  };

  const buttonElement = (
    <ClickRipple disabled={disabled}>
      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={disabled ? undefined : { scale: 1.01, y: -1 }}
        whileTap={disabled ? undefined : { scale: 0.97, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {/* Animated Shine Sweep effect on hover */}
        {(variant === 'liquid' || variant === 'glow') && (
          <motion.span
            initial={{ x: '-120%', opacity: 0 }}
            animate={isHovered ? { x: '180%', opacity: [0, 0.4, 0] } : { x: '-120%', opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none z-10"
          />
        )}

        {/* Animated Border Light Highlight */}
        {(borderGlow || variant === 'glow') && (
          <span className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-r from-cyan-500/0 via-cyan-400/40 to-cyan-500/0 opacity-60 animate-pulse pointer-events-none" />
        )}

        {icon && <span className="relative z-10 shrink-0">{icon}</span>}
        <span className="relative z-10">{children}</span>
      </motion.button>
    </ClickRipple>
  );

  if (magnetic && !disabled) {
    return <Magnetic maxOffset={7}>{buttonElement}</Magnetic>;
  }

  return buttonElement;
};
