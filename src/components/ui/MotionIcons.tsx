import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Upload, FileText, Download, Check, Copy, Menu } from 'lucide-react';

interface MorphingIconProps {
  activeState: boolean; // true = alternate state, false = default state
  type: 'plus-close' | 'upload-file' | 'download-check' | 'copy-check' | 'menu-close';
  className?: string;
  size?: number;
}

export const MorphingIcon: React.FC<MorphingIconProps> = ({
  activeState,
  type,
  className = 'w-5 h-5',
  size = 20,
}) => {
  const getIcons = () => {
    switch (type) {
      case 'plus-close':
        return { Primary: Plus, Secondary: X };
      case 'upload-file':
        return { Primary: Upload, Secondary: FileText };
      case 'download-check':
        return { Primary: Download, Secondary: Check };
      case 'copy-check':
        return { Primary: Copy, Secondary: Check };
      case 'menu-close':
        return { Primary: Menu, Secondary: X };
    }
  };

  const { Primary, Secondary } = getIcons();
  const IconComponent = activeState ? Secondary : Primary;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeState ? 'active' : 'inactive'}
          initial={{ opacity: 0, scale: 0.6, rotate: activeState ? -90 : 90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.6, rotate: activeState ? 90 : -90 }}
          transition={{ type: 'spring', stiffness: 450, damping: 25 }}
          className="inline-flex items-center justify-center"
        >
          <IconComponent size={size} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
