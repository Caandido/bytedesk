import { create } from 'zustand';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'devflow-theme';

function readSaved(): Theme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* localStorage indisponível */
  }
  return 'dark';
}

/** Aplica o tema ao <html> (classe + color-scheme) e persiste. */
function apply(theme: Theme, animate = false) {
  const root = document.documentElement;
  if (animate) {
    root.classList.add('theme-transition');
    window.setTimeout(() => root.classList.remove('theme-transition'), 320);
  }
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#ffffff');
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const initial = readSaved();
// Garante consistência com o script inline do index.html (evita flash).
apply(initial);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initial,
  toggle: () => {
    const next: Theme = get().theme === 'dark' ? 'light' : 'dark';
    apply(next, true);
    set({ theme: next });
  },
  setTheme: (theme) => {
    apply(theme, true);
    set({ theme });
  },
}));
