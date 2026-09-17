import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, LayoutDashboard, FileText, Settings as SettingsIcon, User, FileEdit, Layers, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../ui/Button';
import { ClickRipple } from '../ui/ClickRipple';
import { MagneticIcon } from '../ui/MagneticIcon';
import { MorphingIcon } from '../ui/MotionIcons';
import { useTheme } from '../../lib/themeStore';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
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

  const cycleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-200 dark:border-white/15 bg-white/95 dark:bg-black/85 backdrop-blur-xl shadow-sm dark:shadow-[0_10px_30px_rgba(0,0,0,0.8)] py-3'
          : 'border-b border-slate-200/80 dark:border-white/[0.08] bg-white/90 dark:bg-black/50 backdrop-blur-lg py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo Interaction */}
        <Link to="/" className="flex items-center gap-3 group select-none">
          <ClickRipple className="rounded-2xl p-1">
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              className="relative flex items-center justify-center shrink-0 p-1"
            >
              <motion.span
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 blur-md pointer-events-none"
              />
              <img
                src="/logo.png"
                alt="Plagora AI Logo"
                className="h-9 md:h-10 w-auto object-contain pointer-events-none"
              />
            </motion.div>
          </ClickRipple>
          <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 font-sans">
              Plagora <span className="text-xs px-1.5 py-0.5 rounded border border-slate-300 dark:border-white/20 bg-slate-200/60 dark:bg-white/10 text-slate-700 dark:text-slate-300 font-mono">AI</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 dark:border-white/10 bg-slate-100/80 dark:bg-white/[0.03] backdrop-blur-md">
          {isLandingPage
            ? landingNavItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.href)}
                  onMouseEnter={() => setHoveredNav(item.label)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className="relative px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-full transition-all duration-200"
                >
                  {hoveredNav === item.label && (
                    <motion.div
                      layoutId="hoverPill"
                      className="absolute inset-0 rounded-full bg-slate-200/80 dark:bg-white/5 border border-slate-300 dark:border-white/10"
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
                      isActive
                        ? 'text-slate-900 dark:text-white font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNavPill"
                        className="absolute inset-0 rounded-full bg-white dark:bg-white/12 border border-slate-300 dark:border-white/25 shadow-sm dark:shadow-[0_0_15px_rgba(255,255,255,0.08)]"
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      />
                    )}

                    {!isActive && hoveredNav === item.label && (
                      <motion.div
                        layoutId="hoverNavPill"
                        className="absolute inset-0 rounded-full bg-slate-200/70 dark:bg-white/5 border border-slate-300 dark:border-white/10"
                        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      />
                    )}

                    <MagneticIcon maxOffset={2}>
                      <Icon className={`w-3.5 h-3.5 relative z-10 transition-transform duration-200 ${hoveredNav === item.label ? '-translate-y-0.5 scale-110 text-slate-900 dark:text-white' : ''}`} />
                    </MagneticIcon>
                    <span className={`relative z-10 transition-transform duration-200 ${hoveredNav === item.label ? 'translate-x-0.5' : ''}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
        </nav>

        {/* Desktop Right CTA + Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={cycleTheme}
            aria-label="Toggle visual theme"
            className="p-2 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-white/30 transition-all cursor-pointer flex items-center justify-center"
            title={`Theme: ${theme.toUpperCase()} (Click to toggle)`}
          >
            {theme === 'light' ? (
              <Sun className="w-4 h-4 text-amber-500" />
            ) : theme === 'dark' ? (
              <Moon className="w-4 h-4 text-cyan-400" />
            ) : (
              <Monitor className="w-4 h-4 text-purple-400" />
            )}
          </button>

          {isLandingPage ? (
            <>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer px-2"
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
                className="w-9 h-9 rounded-full border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:border-slate-400 dark:hover:border-white/40 cursor-pointer transition-colors shadow-sm"
              >
                <User className="w-4 h-4" />
              </motion.div>
            </div>
          )}
        </div>

        {/* Mobile Hamburger + Theme Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={cycleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300"
          >
            {theme === 'light' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:outline-none"
          >
            <MorphingIcon activeState={mobileMenuOpen} type="menu-close" size={22} />
          </motion.button>
        </div>
      </div>

      {/* Mobile Animated Dropdown Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden border-b border-slate-200 dark:border-white/15 bg-white/95 dark:bg-black/95 backdrop-blur-xl px-6 py-6 overflow-hidden shadow-xl"
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
                    hidden: { opacity: 0, x: -12 },
                    visible: { opacity: 1, x: 0 },
                  }}
                >
                  <button
                    onClick={() => handleNavClick(item.href)}
                    className="w-full text-left py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white border-b border-slate-100 dark:border-white/5 flex items-center justify-between"
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
