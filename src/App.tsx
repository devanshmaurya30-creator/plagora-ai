import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CursorSpotlight } from './components/ui/CursorSpotlight';
import { KeyboardShortcutHelp } from './components/ui/KeyboardShortcutHelp';
import { CommandPalette } from './components/ui/CommandPalette';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';

const NewScanPage = lazy(() => import('./pages/NewScanPage').then((m) => ({ default: m.NewScanPage })));
const ResultsPage = lazy(() => import('./pages/ResultsPage').then((m) => ({ default: m.ResultsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((m) => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const EditorPage = lazy(() => import('./pages/EditorPage').then((m) => ({ default: m.EditorPage })));
const DocumentComparisonPage = lazy(() => import('./pages/DocumentComparisonPage').then((m) => ({ default: m.DocumentComparisonPage })));
const SharedReportPage = lazy(() => import('./pages/SharedReportPage').then((m) => ({ default: m.SharedReportPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const PageFallback: React.FC = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3 text-xs text-slate-400">
    <div className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
    <span>Loading workspace module...</span>
  </div>
);

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageFallback />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/scan" element={<NewScanPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/compare" element={<DocumentComparisonPage />} />
          <Route path="/results/:id" element={<ResultsPage />} />
          <Route path="/shared/report/:token" element={<SharedReportPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

export function App() {
  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)] font-sans selection:bg-cyan-500/20 selection:text-cyan-200 flex flex-col justify-between relative overflow-x-hidden transition-colors duration-250">
          <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(1000px_circle_at_50%_0%,rgba(8,145,178,0.03),transparent_70%)] dark:bg-[radial-gradient(1000px_circle_at_50%_0%,rgba(6,182,212,0.04),transparent_70%)]" />
          <CursorSpotlight />
          <CommandPalette />
          <KeyboardShortcutHelp />
          <div className="relative z-10">
            <Navbar />
            <main className="min-h-[calc(100vh-12rem)] pb-12">
              <AnimatedRoutes />
            </main>
          </div>
          <Footer />
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
