import { useState, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'system';

const THEME_KEY = 'plagora_theme_v1';

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const val = localStorage.getItem(THEME_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') {
      return val;
    }
  } catch (e) {
    // fallback
  }
  return 'system';
}

export function getEffectiveTheme(theme: Theme): 'dark' | 'light' {
  if (theme === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  return theme === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme: Theme) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_KEY, theme);
    }
    const effective = getEffectiveTheme(theme);

    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (effective === 'light') {
        root.classList.add('light');
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      } else {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      }
    }
  } catch (e) {
    // fallback
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => getStoredTheme());
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>(() => getEffectiveTheme(theme));

  useEffect(() => {
    applyTheme(theme);
    setEffectiveTheme(getEffectiveTheme(theme));
  }, [theme]);

  useEffect(() => {
    if (theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: light)');
    const handleChange = () => {
      applyTheme('system');
      setEffectiveTheme(getEffectiveTheme('system'));
    };
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    setEffectiveTheme(getEffectiveTheme(newTheme));
  };

  const toggleTheme = () => {
    const nextTheme: Theme = effectiveTheme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return { theme, effectiveTheme, setTheme, toggleTheme };
}
