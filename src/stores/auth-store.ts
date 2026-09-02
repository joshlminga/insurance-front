import { create } from 'zustand'
import { useShallow } from 'zustand/react/shallow'
import {
  checkAuth,
  fetchAbilities,
  logoutOnServer,
  refreshSession,
  resolveOrganization,
} from '@/auth/auth-service'
import { AUTH_STORAGE_KEY, AUTH_LOGOUT_BROADCAST_KEY, TOKEN_REFRESH_BUFFER_SECONDS } from '@/auth/constants'
import { syncAccessToken } from '@/auth/access-token'
import { broadcastLogout, isTabSignedOut, markTabSignedOut, wipeStoredAuth } from '@/auth/session-wipe'
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

function persistTenantOnly(organizationLocationId: number | null): void {
  if (organizationLocationId == null) {
    writePersistedAuth(null)
    return
  }
  writePersistedAuth(JSON.stringify({ organizationLocationId }))
}

export function persistAuthState(): void {
  const state = useAuthStore.getState()

  if (suppressAuthPersist || isTabSignedOut()) {
    syncAccessToken(null)
    wipeStoredAuth()
    return
  }

  syncAccessToken(state.token)

  // Never leave a JWT / user / abilities blob in localStorage after the session is gone.
  if (!state.token || !state.user) {
    persistTenantOnly(state.organizationLocationId)
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
    persistTenantOnly(state.organizationLocationId)
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

/** Clear this tab's user in memory. Does not touch localStorage (other tabs stay logged in). */
function dropSession(): void {
  clearTokenRefreshTimer()
  suppressAuthPersist = true
  useAuthStore.setState({
    user: null,
    token: null,
    guest: null,
    isGeneral: null,
    abilities: null,
    expiresAt: null,
  })
  syncAccessToken(null)
  suppressAuthPersist = false
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
    // A late token-refresh must not recreate the session after Log out.
    if (isTabSignedOut()) return
    const expiresAt = Date.now() + payload.expires_in * 1000
    suppressAuthPersist = false
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
        dropSession()
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
    if (isTabSignedOut()) return false
    const { token, expiresAt } = get()
    if (!token) return false

    try {
      const data = await checkAuth(token)
      if (!data.is_logged || !data.user) {
        dropSession()
        return false
      }

      const isGeneral = data.is_general ?? data.user.is_general
      const remainingSeconds =
        expiresAt != null && expiresAt > Date.now()
          ? Math.max(1, Math.floor((expiresAt - Date.now()) / 1000))
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
      // Keep the stored session if check-auth cannot be reached (new tab / network).
      return Boolean(get().user && get().token)
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

    // Wipe the JWT from this browser immediately — do not wait on the API.
    markTabSignedOut()
    suppressAuthPersist = true
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
    wipeStoredAuth()

    const goToSignIn = () => {
      broadcastLogout()
      wipeStoredAuth()
      if (typeof window !== 'undefined') {
        window.location.replace(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`)
      }
    }

    if (!token) {
      goToSignIn()
      return
    }

    void logoutOnServer(token)
      .catch(() => {
        /* local wipe already happened */
      })
      .finally(() => {
        goToSignIn()
      })
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
      if (e.storageArea !== localStorage) return

      // Another tab clicked Log out.
      if (e.key === AUTH_LOGOUT_BROADCAST_KEY || (e.key === AUTH_STORAGE_KEY && e.newValue == null)) {
        suppressAuthPersist = true
        applyPersistedPayload(null)
        queryClient.clear()
        useSessionTimeoutStore.getState().close()
        window.location.replace(`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`)
        return
      }

      if (e.key !== AUTH_STORAGE_KEY) return
      // This tab signed out. Another tab's saved login must not log us in without a password.
      if (isTabSignedOut()) return
      applyPersistedPayload(e.newValue)
    })

    useAuthStore.subscribe(() => {
      persistAuthState()
    })
  }

  if (!useAuthStore.getState().hasHydrated) {
    try {
      const raw = readPersistedAuth()
      if (raw && !isTabSignedOut()) {
        applyPersistedPayload(raw)
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
