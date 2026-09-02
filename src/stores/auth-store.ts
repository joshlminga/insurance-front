import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import {
  checkAuth,
  fetchAbilities,
  logoutOnServer,
  refreshSession,
  resolveOrganization,
} from '@/auth/auth-service'
import { AUTH_STORAGE_KEY, TOKEN_REFRESH_BUFFER_SECONDS } from '@/auth/constants'
import { syncAccessToken } from '@/auth/access-token'
import {
  clearAuthWiped,
  isAuthWiped,
  markAuthWiped,
  wipeStoredAuth,
} from '@/auth/session-wipe'
import { useSessionTimeoutStore } from '@/stores/session-timeout-store'
import { queryClient } from '@/utils/providers'
import { EPREFIX, EROUTES } from '@/utils/enums'
import type { Abilities, AuthSessionPayload } from '@/auth/types'
import {
  getRequestContext,
  setRequestContextValue,
} from '@/lib/request-context-headers'
import { isTenantSubdomain } from '@/lib/tenant-from-host'
import type { AuthProviderState, AuthState, Guest, Tuser } from '@/types/types'
import axios from 'axios'

/** Default country alpha2 when nothing is stored yet */
const DEFAULT_LOCATION_CODE = 'KE'

let tokenRefreshTimer: ReturnType<typeof setTimeout> | null = null

function clearTokenRefreshTimer() {
  if (tokenRefreshTimer != null) {
    clearTimeout(tokenRefreshTimer)
    tokenRefreshTimer = null
  }
}

function emptyAbilities(isGeneral: boolean): Abilities {
  return {
    is_general: isGeneral,
    roles: [],
    permissions: [],
    modules: [],
    scopes: [],
  }
}

function scheduleTokenRefresh(expiresAt: number | null, refreshFn: () => Promise<void>) {
  clearTokenRefreshTimer()
  if (!expiresAt) return

  const refreshInMs = Math.max(
    0,
    expiresAt - Date.now() - TOKEN_REFRESH_BUFFER_SECONDS * 1000,
  )

  tokenRefreshTimer = setTimeout(() => {
    void refreshFn()
  }, refreshInMs)
}

type PersistedAuth = {
  user?: Tuser | null
  token?: string | null
  guest?: Guest | null
  isGeneral?: boolean | null
  abilities?: Abilities | null
  expiresAt?: number | null
  organizationLocationId?: number | null
}

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

let suppressAuthPersist = false

function persistAuthState(): void {
  const state = useAuthStore.getState()

  // Logout asked this tab to start clean — never write a JWT back.
  if (suppressAuthPersist || isAuthWiped()) {
    syncAccessToken(state.token)
    if (!state.token) {
      wipeStoredAuth()
    }
    return
  }

  syncAccessToken(state.token)

  if (!(state.user || state.token || state.guest || state.organizationLocationId != null)) {
    writePersistedAuth(null)
    return
  }

  try {
    const next = JSON.stringify({
      user: state.user,
      token: state.token,
      guest: state.guest,
      isGeneral: state.isGeneral,
      abilities: state.abilities,
      expiresAt: state.expiresAt,
      organizationLocationId: state.organizationLocationId,
    })
    if (localStorage.getItem(AUTH_STORAGE_KEY) !== next) {
      writePersistedAuth(next)
    }
  } catch {
    writePersistedAuth(JSON.stringify({
      user: state.user
        ? {
            id: state.user.id,
            name: state.user.name,
            email: state.user.email,
            username: state.user.username ?? null,
            is_general: state.user.is_general,
            is_active: state.user.is_active,
          }
        : null,
      token: state.token,
      guest: state.guest,
      isGeneral: state.isGeneral,
      abilities: state.abilities,
      expiresAt: state.expiresAt,
      organizationLocationId: state.organizationLocationId,
    }))
  }
}

function applyPersistedPayload(raw: string | null) {
  if (raw == null) {
    useAuthStore.setState({
      user: null,
      token: null,
      guest: null,
      isGeneral: null,
      abilities: null,
      expiresAt: null,
      organizationLocationId: null,
      resolvedOrganization: null,
      orgResolveStatus: 'idle',
    })
    syncAccessToken(null)
    return
  }
  try {
    const parsed = JSON.parse(raw) as PersistedAuth
    useAuthStore.setState({
      user: parsed.user ?? null,
      token: parsed.token ?? null,
      guest: parsed.guest ?? null,
      isGeneral: parsed.isGeneral ?? null,
      abilities: parsed.abilities ?? null,
      expiresAt: parsed.expiresAt ?? null,
      organizationLocationId: parsed.organizationLocationId ?? null,
      resolvedOrganization: null,
      orgResolveStatus: 'idle',
    })
    syncAccessToken(parsed.token ?? null)
  } catch {
    writePersistedAuth(null)
    syncAccessToken(null)
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  guest: null,
  isGeneral: null,
  abilities: null,
  expiresAt: null,
  organizationLocationId: null,
  resolvedOrganization: null,
  orgResolveStatus: 'idle',
  hasHydrated: false,
  country: 'Kenya',
  lang: 'eng',
  alpha: 'KE',

  setSession: (payload: AuthSessionPayload) => {
    const expiresAt = Date.now() + payload.expires_in * 1000
    suppressAuthPersist = false
    clearAuthWiped()
    set({
      user: payload.user,
      token: payload.access_token,
      isGeneral: payload.is_general,
      abilities: payload.abilities,
      expiresAt,
    })
    persistAuthState()
    scheduleTokenRefresh(expiresAt, async () => {
      const { token, organizationLocationId } = get()
      if (!token) return
      try {
        const refreshed = await refreshSession(token, organizationLocationId)
        get().setSession(refreshed)
      } catch {
        get().logout()
      }
    })
  },

  setAbilities: (abilities: Abilities) => {
    set({ abilities })
  },

  setOrganizationLocationId: async (id: number | null) => {
    set({ organizationLocationId: id })
    const { token } = get()
    if (!token || id == null) return
    try {
      const abilities = await fetchAbilities(token, id)
      set({ abilities })
    } catch (error) {
      console.error('Failed to refresh abilities for organization location:', error)
    }
  },

  restoreSession: async () => {
    const { token, expiresAt } = get()
    if (!token) return false

    if (expiresAt != null && expiresAt < Date.now()) {
      get().logout()
      return false
    }

    try {
      const data = await checkAuth(token)
      if (!data.is_logged || !data.user) {
        get().logout()
        return false
      }

      const isGeneral = data.is_general ?? data.user.is_general
      const remainingSeconds =
        expiresAt != null
          ? Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
          : 3600

      get().setSession({
        access_token: token,
        token_type: 'bearer',
        expires_in: remainingSeconds,
        user: data.user,
        is_general: isGeneral,
        abilities: data.abilities ?? emptyAbilities(isGeneral),
      })
      return true
    } catch {
      get().logout()
      return false
    }
  },

  login: (user, token, isGeneral) => {
    set({
      user,
      token,
      isGeneral,
      abilities: emptyAbilities(isGeneral),
    })
  },

  logout: () => {
    clearTokenRefreshTimer()
    const { token } = get()
    if (token) {
      void logoutOnServer(token).catch(() => {
        /* best-effort server logout */
      })
    }
    // Stop this tab from picking the old JWT back up from cache or another tab.
    suppressAuthPersist = true
    markAuthWiped()
    syncAccessToken(null)
    wipeStoredAuth()
    queryClient.clear()
    useSessionTimeoutStore.getState().close()
    set({
      user: null,
      token: null,
      guest: null,
      isGeneral: null,
      abilities: null,
      expiresAt: null,
    })
    if (typeof window !== 'undefined') {
      window.location.replace(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`)
    }
  },

  updateUser: (updates) => {
    const u = get().user
    if (u) set({ user: { ...u, ...updates } })
  },

  setGuest: (guest) => set({ guest }),

  // Also persist alpha2 so api-client can send X-Location-Code on every request
  setLocale: (country, lang, alpha) => {
    set({ country, lang, alpha })
    if (alpha) {
      setRequestContextValue('locationCode', alpha)
    }
  },
}))

let authListenerAttached = false

export async function initAuthStore() {
  if (typeof window === 'undefined') return

  // Attach persistence before hydrate/resolve so org id is written to localStorage
  if (!authListenerAttached) {
    authListenerAttached = true

    window.addEventListener('storage', (e) => {
      if (e.key !== AUTH_STORAGE_KEY || e.storageArea !== localStorage) return
      if (isAuthWiped()) return
      const current = useAuthStore.getState()
      if (e.newValue && current.token) {
        try {
          const incoming = JSON.parse(e.newValue) as PersistedAuth
          // Another tab still has the expired JWT — do not overwrite this tab's new login.
          if (
            incoming.token &&
            incoming.token !== current.token &&
            (current.expiresAt ?? 0) >= (incoming.expiresAt ?? 0)
          ) {
            return
          }
        } catch {
          /* fall through and apply */
        }
      }
      applyPersistedPayload(e.newValue)
    })

    useAuthStore.subscribe(() => {
      persistAuthState()
    })
  }

  if (!useAuthStore.getState().hasHydrated) {
    try {
      if (isAuthWiped()) {
        wipeStoredAuth()
        syncAccessToken(null)
      } else {
        const raw = readPersistedAuth()
        if (raw) {
          applyPersistedPayload(raw)
        }
      }
    } catch {
      writePersistedAuth(null)
    }

    // Resolve tenant + branding from browser Origin (logo URLs expire, so always refresh)
    try {
      const org = await resolveOrganization()
      useAuthStore.setState({ resolvedOrganization: org })
      if (org.organization_location_id != null) {
        useAuthStore.setState({
          organizationLocationId: org.organization_location_id,
          orgResolveStatus: 'resolved',
        })
      } else if (isTenantSubdomain()) {
        useAuthStore.setState({ orgResolveStatus: 'not_found' })
      } else {
        useAuthStore.setState({ orgResolveStatus: 'idle' })
      }
      if (org.location_code) {
        setRequestContextValue('locationCode', org.location_code)
        useAuthStore.setState({ alpha: org.location_code })
      }
    } catch (error) {
      console.error('Failed to resolve organization from Origin:', error)
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        useAuthStore.setState({
          orgResolveStatus: 'not_found',
          resolvedOrganization: null,
        })
      } else if (isTenantSubdomain()) {
        useAuthStore.setState({
          orgResolveStatus: 'failed',
          resolvedOrganization: null,
        })
      } else {
        useAuthStore.setState({ orgResolveStatus: 'idle' })
      }
    }

    // Restore country alpha2 from request-context (or seed default KE only as fallback)
    const storedLocationCode = getRequestContext().locationCode
    if (storedLocationCode) {
      useAuthStore.setState({ alpha: storedLocationCode })
    } else {
      setRequestContextValue('locationCode', DEFAULT_LOCATION_CODE)
      useAuthStore.setState({ alpha: DEFAULT_LOCATION_CODE })
    }

    const { token } = useAuthStore.getState()
    if (token) {
      await useAuthStore.getState().restoreSession()
    }

    useAuthStore.setState({ hasHydrated: true })
  }
}

export function UseAuth(): AuthProviderState {
  return useAuthStore(
    useShallow((s) => ({
      user: s.user,
      token: s.token,
      guest: s.guest,
      isGeneral: s.isGeneral,
      abilities: s.abilities,
      expiresAt: s.expiresAt,
      organizationLocationId: s.organizationLocationId,
      resolvedOrganization: s.resolvedOrganization,
      orgResolveStatus: s.orgResolveStatus,
      isOrgTenant: s.resolvedOrganization?.organization_location_id != null,
      isAuthenticated: !!s.user && !!s.token,
      isLoading: !s.hasHydrated,
      country: s.country,
      lang: s.lang,
      alpha: s.alpha,
      setSession: s.setSession,
      setAbilities: s.setAbilities,
      setOrganizationLocationId: s.setOrganizationLocationId,
      restoreSession: s.restoreSession,
      login: s.login,
      logout: s.logout,
      updateUser: s.updateUser,
      setGuest: s.setGuest,
      setLocale: s.setLocale,
    })),
  )
}
