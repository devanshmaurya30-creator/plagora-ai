import type { Variants, Transition } from 'framer-motion';

/**
 * Plagora AI Global Motion System
 * Master animation presets, spring physics curves, and staggered variants.
 */

// Premium Spring & Easing Physics
export const fastSpringTransition: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 25,
  mass: 0.5,
};

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

export const gentleSpringTransition: Transition = {
  type: 'spring',
  stiffness: 250,
  damping: 20,
  mass: 1,
};

export const smoothEaseTransition: Transition = {
  duration: 0.5,
  ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier for liquid smooth motion
};

export const slowAmbientTransition: Transition = {
  duration: 8,
  ease: 'easeInOut',
  repeat: Infinity,
  repeatType: 'mirror',
};

// Page Transition Presets (<400ms GPU-accelerated feel)
export const pageTransitionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
    scale: 0.99,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.98,
    transition: {
      duration: 0.22,
      ease: 'easeIn',
    },
  },
};

// Page & Container Entrance Staggers
export const containerStaggerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
};

// Item Entrance Variants
export const itemFadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: smoothEaseTransition,
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
};

export const itemScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: smoothEaseTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// Card Hover & Lift Variants
export const cardHoverVariants: Variants = {
  initial: { y: 0, scale: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  hover: {
    y: -5,
    scale: 1.01,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    boxShadow: '0 16px 36px -12px rgba(0, 0, 0, 0.85), 0 0 25px rgba(255, 255, 255, 0.06)',
    transition: springTransition,
  },
  tap: {
    scale: 0.97,
    y: -1,
    transition: fastSpringTransition,
  },
};

// Button Physics & Click Presets
export const buttonMotionVariants: Variants = {
  initial: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -1,
    boxShadow: '0 0 25px rgba(255, 255, 255, 0.15)',
    transition: fastSpringTransition,
  },
  tap: {
    scale: 0.96,
    y: 0,
    transition: fastSpringTransition,
  },
};

// Modal Backdrop & Content Variants
export const modalBackdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25 },
  },
};

export const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 15 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// Dropdown Variants
export const dropdownVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -6 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: fastSpringTransition,
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: { duration: 0.15 },
  },
};

// Notification Toast Variants
export const toastVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springTransition,
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
