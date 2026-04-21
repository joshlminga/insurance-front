import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'vite-ui-theme'

type ThemeState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(THEME_STORAGE_KEY, theme)
    }
    set({ theme })
  },
}))

export function initThemeStore() {
  if (typeof window === 'undefined') return
  let stored = sessionStorage.getItem(THEME_STORAGE_KEY) as Theme | null
  if (!stored) {
    const legacy = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null
    if (legacy === 'light' || legacy === 'dark' || legacy === 'system') {
      sessionStorage.setItem(THEME_STORAGE_KEY, legacy)
      localStorage.removeItem(THEME_STORAGE_KEY)
      stored = legacy
    }
  }
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    useThemeStore.setState({ theme: stored })
  }
}
