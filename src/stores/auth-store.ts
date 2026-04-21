import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { AuthProviderState, AuthState, Guest, Tuser } from '@/types/types'

const AUTH_STORAGE_KEY = 'auth-storage'



export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  guest: null,
  isGeneral: null,
  hasHydrated: false,
  country: 'Kenya',
  lang: 'eng',
  alpha: 'KE',
  login: (user, token, isGeneral) => set({ user, token, isGeneral }),
  logout: () =>
    set({
      user: null,
      token: null,
      guest: null,
      isGeneral: null,
    }),
  updateUser: (updates) => {
    const u = get().user
    if (u) set({ user: { ...u, ...updates } })
  },
  setGuest: (guest) => set({ guest }),
  setLocale: (country, lang, alpha) => set({ country, lang, alpha }),
}))

let authListenerAttached = false

export function initAuthStore() {
  if (typeof window === 'undefined') return

  if (!useAuthStore.getState().hasHydrated) {
    try {
      let raw = sessionStorage.getItem(AUTH_STORAGE_KEY)
      if (!raw && typeof localStorage !== 'undefined') {
        const legacy = localStorage.getItem(AUTH_STORAGE_KEY)
        if (legacy) {
          sessionStorage.setItem(AUTH_STORAGE_KEY, legacy)
          localStorage.removeItem(AUTH_STORAGE_KEY)
          raw = legacy
        }
      }
      if (raw) {
        const parsed = JSON.parse(raw) as {
          user?: Tuser | null
          token?: string | null
          guest?: Guest | null
          isGeneral?: boolean | null
        }
        useAuthStore.setState({
          user: parsed.user ?? null,
          token: parsed.token ?? null,
          guest: parsed.guest ?? null,
          isGeneral: parsed.isGeneral ?? null,
        })
      }
    } catch {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    }
    useAuthStore.setState({ hasHydrated: true })
  }

  if (authListenerAttached) return
  authListenerAttached = true
  useAuthStore.subscribe((state) => {
    if (state.user || state.token || state.guest) {
      sessionStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({
          user: state.user,
          token: state.token,
          guest: state.guest,
          isGeneral: state.isGeneral,
        })
      )
    } else {
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    }
  })
}

export function UseAuth(): AuthProviderState {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      token: s.token,
      guest: s.guest,
      isGeneral: s.isGeneral,
      isAuthenticated: !!s.user && !!s.token,
      isLoading: !s.hasHydrated,
      country: s.country,
      lang: s.lang,
      alpha: s.alpha,
      login: s.login,
      logout: s.logout,
      updateUser: s.updateUser,
      setGuest: s.setGuest,
      setLocale: s.setLocale,
    }))
  )
}
