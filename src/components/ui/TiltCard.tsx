import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxRotate?: number; // max rotate in degrees (default 2)
  liftY?: number; // lift distance in px (default -5)
  enableTilt?: boolean;
  onClick?: () => void;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxRotate = 2,
  liftY = -5,
  enableTilt = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.matchMedia('(pointer: fine)').matches && window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop || !enableTilt || !cardRef.current) return;

    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const px = (e.clientX - left) / width;
    const py = (e.clientY - top) / height;

    // Calculate rotation (-maxRotate to maxRotate)
    const rY = (px - 0.5) * (maxRotate * 2);
    const rX = (0.5 - py) * (maxRotate * 2);

    setRotateX(rX);
    setRotateY(rY);

    // Light moves opposite to mouse (card tilt lighting effect)
    setGlarePos({
      x: (1 - px) * 100,
      y: (1 - py) * 100,
      opacity: 0.18,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX: isDesktop && enableTilt ? rotateX : 0,
        rotateY: isDesktop && enableTilt ? rotateY : 0,
        y: isHovered ? liftY : 0,
        scale: isHovered ? 1.008 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 350,
        damping: 25,
      }}
      style={{
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      className={`relative rounded-2xl glass-panel glass-panel-hover transition-all duration-200 cursor-pointer overflow-hidden ${className}`}
    >
      {/* Dynamic Simulated Light Glare Layer (Opposite mouse position) */}
      {isDesktop && enableTilt && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10 hidden dark:block"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.02) 45%, transparent 75%)`,
            opacity: glarePos.opacity,
          }}
        />
      )}

      {/* Subtle Ambient Hover Glow Shadow */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 -z-10 rounded-2xl bg-cyan-500/5 dark:bg-white/[0.03] blur-lg pointer-events-none"
        />
      )}

      {children}
    </motion.div>
  );
};
