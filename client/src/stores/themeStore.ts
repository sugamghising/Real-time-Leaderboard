import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'system' | 'light' | 'dark';

interface ThemeState {
  mode: ThemeMode;
  effective: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
  init: () => () => void;
}

const getSystemPreference = (): 'light' | 'dark' =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyTheme = (effective: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', effective === 'dark');
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      effective: 'light',

      setMode: (mode) => {
        const effective = mode === 'system' ? getSystemPreference() : mode;
        applyTheme(effective);
        set({ mode, effective });
      },

      toggle: () => {
        const next = get().effective === 'light' ? 'dark' : 'light';
        applyTheme(next);
        set({ mode: next, effective: next });
      },

      init: () => {
        const state = get();
        const effective = state.mode === 'system' ? getSystemPreference() : state.mode;
        applyTheme(effective);
        set({ effective });

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => {
          const s = get();
          if (s.mode === 'system') {
            const next = e.matches ? 'dark' : 'light';
            applyTheme(next);
            set({ effective: next });
          }
        };
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ mode: state.mode }),
    }
  )
);
