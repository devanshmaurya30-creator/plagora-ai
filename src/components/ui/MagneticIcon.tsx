import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface MagneticIconProps {
  children: React.ReactNode;
  maxOffset?: number; // default 3px
  className?: string;
}

export const MagneticIcon: React.FC<MagneticIconProps> = ({
  children,
  maxOffset = 3,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia('(pointer: fine)').matches);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop || !ref.current) return;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;

    setPosition({
      x: (distanceX / (width / 2)) * maxOffset,
      y: (distanceY / (height / 2)) * maxOffset,
    });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  if (!isDesktop) {
    return <span className={`inline-flex items-center justify-center ${className}`}>{children}</span>;
  }

  return (
    <motion.span
      ref={ref}
      className={`inline-flex items-center justify-center relative cursor-pointer ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        x: position.x,
        y: position.y,
      }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 18,
      }}
    >
      {children}
    </motion.span>
  );
};
