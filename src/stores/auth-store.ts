import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import type { AuthProviderState, AuthState, Guest, Tuser } from '@/types/types'

const AUTH_STORAGE_KEY = 'auth-storage'

function readPersistedAuth(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const fromLocal = localStorage.getItem(AUTH_STORAGE_KEY)
    if (fromLocal) return fromLocal
    const fromSession = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (fromSession) {
      localStorage.setItem(AUTH_STORAGE_KEY, fromSession)
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    }
    return fromSession
  } catch {
    return null
  }
}

function writePersistedAuth(payload: string | null) {
  if (typeof window === 'undefined') return
  try {
    if (payload == null) {
      localStorage.removeItem(AUTH_STORAGE_KEY)
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    } else {
      localStorage.setItem(AUTH_STORAGE_KEY, payload)
      sessionStorage.removeItem(AUTH_STORAGE_KEY)
    }
  } catch {
    /* ignore quota / private mode */
  }
}

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
      const raw = readPersistedAuth()
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
      writePersistedAuth(null)
    }
    useAuthStore.setState({ hasHydrated: true })
  }

  if (authListenerAttached) return
  authListenerAttached = true

  const applyPersistedPayload = (raw: string | null) => {
    if (raw == null) {
      useAuthStore.setState({
        user: null,
        token: null,
        guest: null,
        isGeneral: null,
      })
      return
    }
    try {
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
    } catch {
      writePersistedAuth(null)
    }
  }

  window.addEventListener('storage', (e) => {
    if (e.key !== AUTH_STORAGE_KEY || e.storageArea !== localStorage) return
    applyPersistedPayload(e.newValue)
  })

  useAuthStore.subscribe((state) => {
    if (state.user || state.token || state.guest) {
      const next = JSON.stringify({
        user: state.user,
        token: state.token,
        guest: state.guest,
        isGeneral: state.isGeneral,
      })
      try {
        if (localStorage.getItem(AUTH_STORAGE_KEY) !== next) {
          writePersistedAuth(next)
        }
      } catch {
        writePersistedAuth(next)
      }
    } else {
      try {
        if (localStorage.getItem(AUTH_STORAGE_KEY) != null) {
          writePersistedAuth(null)
        }
      } catch {
        writePersistedAuth(null)
      }
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
