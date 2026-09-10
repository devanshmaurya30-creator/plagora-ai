export type Theme = 'dark' | 'light' | 'system';

const THEME_KEY = 'plagora_theme_v1';

export function getStoredTheme(): Theme {
  try {
    const val = localStorage.getItem(THEME_KEY);
    if (val === 'light' || val === 'dark' || val === 'system') {
      return val;
    }
  } catch (e) {
    // fallback
  }
  return 'dark';
}

export function applyTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);

    let effectiveTheme = theme;
    if (theme === 'system' && typeof window !== 'undefined') {
      effectiveTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    }

    if (typeof document !== 'undefined') {
      if (effectiveTheme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    }
  } catch (e) {
    // fallback
  }
}
