import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface ClickRippleProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  color?: string;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const ClickRipple: React.FC<ClickRippleProps> = ({
  children,
  className = '',
  disabled = false,
  color = 'rgba(255, 255, 255, 0.25)',
  onClick,
}) => {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handlePointerDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newRipple = { id: Date.now() + Math.random(), x, y };

      setRipples((prev) => [...prev.slice(-3), newRipple]); // max 4 active ripples
    },
    [disabled]
  );

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseDown={handlePointerDown}
      onClick={onClick}
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.6, filter: 'blur(2px)' }}
            animate={{ scale: 2.2, opacity: 0, filter: 'blur(8px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            onAnimationComplete={() => removeRipple(ripple.id)}
            style={{
              position: 'absolute',
              top: ripple.y - 40,
              left: ripple.x - 40,
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              pointerEvents: 'none',
              zIndex: 30,
            }}
          />
        ))}
      </AnimatePresence>
      {children}
    </div>
  );
};
