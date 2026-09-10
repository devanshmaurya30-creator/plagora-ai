import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { MagneticIcon } from '../components/ui/MagneticIcon';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 text-center select-none"
    >
      <div className="space-y-6 max-w-md mx-auto">
        {/* Holographic Logo Badge */}
        <div className="flex justify-center">
          <div className="relative p-3 rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-2xl shadow-2xl">
            <img
              src="/logo.png"
              alt="Plagora AI Logo"
              className="h-16 w-auto object-contain drop-shadow-[0_0_25px_rgba(59,130,246,0.5)] pointer-events-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-6xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-300 to-white block">
            404
          </span>
          <h1 className="text-2xl font-bold text-white tracking-tight">Page Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The analysis report, page, or resource you are looking for doesn't exist or may have been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            icon={
              <MagneticIcon maxOffset={2}>
                <ArrowLeft className="w-4 h-4" />
              </MagneticIcon>
            }
          >
            Go Back
          </Button>

          <Button
            size="sm"
            magnetic
            borderGlow
            onClick={() => navigate('/dashboard')}
            icon={
              <MagneticIcon maxOffset={2}>
                <Home className="w-4 h-4" />
              </MagneticIcon>
            }
          >
            Return to Dashboard
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
