import React, { useEffect, useRef } from 'react';

export const CursorSpotlight: React.FC = () => {
  const spotlightRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: -500, y: -500, vx: 0, vy: 0 });
  const targetRef = useRef({ x: -500, y: -500, lastX: -500, lastY: -500, lastTime: performance.now() });

  useEffect(() => {
    // Check if touch device / mobile
    const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    let animFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = Math.max(1, now - targetRef.current.lastTime);
      const dx = e.clientX - targetRef.current.lastX;
      const dy = e.clientY - targetRef.current.lastY;
      const velocity = Math.sqrt(dx * dx + dy * dy) / dt; // px per ms

      targetRef.current.x = e.clientX;
      targetRef.current.y = e.clientY;
      targetRef.current.lastX = e.clientX;
      targetRef.current.lastY = e.clientY;
      targetRef.current.lastTime = now;

      // Update cursor velocity state smoothly
      posRef.current.vx = posRef.current.vx * 0.7 + velocity * 0.3;
    };

    const updatePosition = () => {
      // Smooth lerp for liquid inertia
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.12;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.12;

      const currentX = posRef.current.x;
      const currentY = posRef.current.y;
      const velocity = Math.min(posRef.current.vx, 3); // cap velocity factor

      // Dynamic opacity and radius based on velocity
      const glowOpacity = 0.15 + velocity * 0.08;
      const glowRadius = 450 + velocity * 80;

      // Set global CSS custom properties for hover magnetic glow in elements
      document.documentElement.style.setProperty('--mouse-x', `${currentX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${currentY}px`);

      if (spotlightRef.current) {
        spotlightRef.current.style.transform = `translate3d(${currentX - glowRadius / 2}px, ${currentY - glowRadius / 2}px, 0)`;
        spotlightRef.current.style.width = `${glowRadius}px`;
        spotlightRef.current.style.height = `${glowRadius}px`;
        spotlightRef.current.style.opacity = `${glowOpacity}`;
      }

      animFrameId = requestAnimationFrame(updatePosition);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    animFrameId = requestAnimationFrame(updatePosition);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  return (
    <div
      ref={spotlightRef}
      className="fixed top-0 left-0 rounded-full pointer-events-none z-30 transition-opacity duration-300 hidden md:block"
      style={{
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.14) 0%, rgba(139, 92, 246, 0.06) 45%, transparent 70%)',
        willChange: 'transform, opacity, width, height',
      }}
    />
  );
};
