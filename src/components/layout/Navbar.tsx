import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, LayoutDashboard, FileText, Settings as SettingsIcon, User, FileEdit, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { ClickRipple } from '../ui/ClickRipple';
import { MagneticIcon } from '../ui/MagneticIcon';
import { MorphingIcon } from '../ui/MotionIcons';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const landingNavItems = [
    { label: 'Product', href: '#product' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Accuracy', href: '#accuracy' },
  ];

  const appNavItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'New Scan', href: '/scan', icon: PlusCircle },
    { label: 'Editor', href: '/editor', icon: FileEdit },
    { label: 'Compare', href: '/compare', icon: Layers },
    { label: 'Reports', href: '/reports', icon: FileText },
    { label: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  const handleNavClick = (href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        navigate('/' + href);
      } else {
        const elem = document.querySelector(href);
        if (elem) elem.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(href);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/15 bg-black/85 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3'
          : 'border-b border-white/[0.06] bg-black/40 backdrop-blur-md py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo Interaction (Requirement 15) */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <ClickRipple className="rounded-2xl p-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, filter: 'blur(8px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="relative flex items-center justify-center shrink-0 p-1"
            >
              {/* Holographic light sweep on hover */}
              <motion.span
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-md pointer-events-none"
              />
              <img
                src="/logo.png"
                alt="Plagora AI Logo"
                className="h-9 md:h-10 w-auto object-contain drop-shadow-[0_0_18px_rgba(59,130,246,0.45)] group-hover:brightness-125 transition-all duration-300 pointer-events-none"
              />
            </motion.div>
          </ClickRipple>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5 font-sans">
              Plagora <span className="text-xs px-1.5 py-0.5 rounded border border-white/20 bg-white/10 text-slate-300 font-mono">AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Tabs (Requirements 13 & 14) */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md">
          {isLandingPage
            ? landingNavItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  onMouseEnter={() => setHoveredNav(item.label)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className="relative px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white rounded-full transition-all duration-200"
                >
                  {hoveredNav === item.label && (
                    <motion.div
                      layoutId="hoverPill"
                      className="absolute inset-0 rounded-full bg-white/5 border border-white/10"
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    />
                  )}
                  <span className="relative z-10">{item.label}</span>
                </button>
              ))
            : appNavItems.map((item) => {
                const isActive = location.pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onMouseEnter={() => setHoveredNav(item.label)}
                    onMouseLeave={() => setHoveredNav(null)}
                    className={`relative px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-200 flex items-center gap-2 ${
                      isActive ? 'text-white font-semibold' : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    {/* Active Route Sliding Physics Indicator (Requirement 13) */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 rounded-full bg-white/12 border border-white/25 shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      />
                    )}

                    {/* Navigation Hover Background Preview (Requirement 14) */}
                    {!isActive && hoveredNav === item.label && (
                      <motion.div
                        layoutId="hoverNavPill"
                        className="absolute inset-0 rounded-full bg-white/5 border border-white/10"
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      />
                    )}

                    <MagneticIcon maxOffset={2}>
                      <Icon className={`w-3.5 h-3.5 relative z-10 transition-transform duration-200 ${hoveredNav === item.label ? '-translate-y-0.5 scale-110 text-white' : ''}`} />
                    </MagneticIcon>
                    <span className={`relative z-10 transition-transform duration-200 ${hoveredNav === item.label ? 'translate-x-0.5' : ''}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
        </nav>

        {/* Desktop Right CTA */}
        <div className="hidden md:flex items-center gap-4">
          {isLandingPage ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </button>
              <Button size="sm" magnetic borderGlow onClick={() => navigate('/scan')}>
                Start Analysis
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Button size="sm" magnetic borderGlow onClick={() => navigate('/scan')} icon={<PlusCircle className="w-4 h-4" />}>
                New Scan
              </Button>
              <motion.div
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className="w-9 h-9 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-slate-200 hover:border-white/40 cursor-pointer transition-colors"
              >
                <User className="w-4 h-4" />
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button with Icon Morphing (Requirement 23 & 24) */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
          className="md:hidden p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white focus:outline-none"
        >
          <MorphingIcon activeState={mobileMenuOpen} type="menu-close" size={22} />
        </motion.button>
      </div>

      {/* Mobile Animated Dropdown Overlay (Requirement 24) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, height: 'auto', backdropFilter: 'blur(20px)' }}
            exit={{ opacity: 0, height: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-b border-white/15 bg-black/95 px-6 py-6 overflow-hidden"
          >
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.06, delayChildren: 0.04 },
                },
              }}
              className="flex flex-col gap-4"
            >
              {(isLandingPage ? landingNavItems : appNavItems).map((item) => (
                <motion.div
                  key={item.label}
                  variants={{
                    hidden: { opacity: 0, x: -12, filter: 'blur(4px)' },
                    visible: { opacity: 1, x: 0, filter: 'blur(0px)' },
                  }}
                >
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="w-full text-left py-2.5 text-sm font-medium text-slate-200 hover:text-white border-b border-white/5 flex items-center justify-between"
                  >
                    <span>{item.label}</span>
                  </button>
                </motion.div>
              ))}
              <div className="pt-2 flex flex-col gap-3">
                <Button className="w-full" onClick={() => { setMobileMenuOpen(false); navigate('/scan'); }}>
                  Start Analysis
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
