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
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none overflow-hidden';

  const sizeStyles = {
    sm: 'px-3.5 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  const variantStyles = {
    liquid: 'liquid-metal-btn text-white font-semibold',
    glow: 'bg-white text-black hover:bg-slate-100 font-semibold shadow-[0_0_25px_rgba(255,255,255,0.25)]',
    outline:
      'border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30 text-white shadow-sm hover:shadow-white/5',
    ghost: 'text-slate-300 hover:text-white hover:bg-white/5',
    danger:
      'border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:border-red-500/50',
  };

  const buttonElement = (
    <ClickRipple disabled={disabled}>
      <motion.button
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={disabled ? undefined : { scale: 1.02, y: -1 }}
        whileTap={disabled ? undefined : { scale: 0.96, y: 0 }}
        transition={{ type: 'spring', stiffness: 450, damping: 25 }}
        className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}
        disabled={disabled}
        onClick={onClick}
        {...props}
      >
        {/* Animated Shine Sweep effect on hover (Requirement 21) */}
        {(variant === 'liquid' || variant === 'glow') && (
          <motion.span
            initial={{ x: '-120%', opacity: 0 }}
            animate={isHovered ? { x: '180%', opacity: [0, 0.4, 0] } : { x: '-120%', opacity: 0 }}
            transition={{ duration: 0.85, ease: 'easeInOut' }}
            className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -skew-x-12 pointer-events-none z-10"
          />
        )}

        {/* Animated Border Light Highlight (Requirement 22) */}
        {(borderGlow || variant === 'glow') && (
          <span className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-r from-white/0 via-white/50 to-white/0 opacity-60 animate-pulse pointer-events-none" />
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
