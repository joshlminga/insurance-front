import axios from 'axios'
import { isBypassUser } from '@/auth/can'
import { AUTH_STORAGE_KEY, ORG_LOCATION_HEADER } from '@/auth/constants'
import { isAuthWiped } from '@/auth/session-wipe'
import type { Abilities } from '@/auth/types'
import { buildRequestContextHeaders } from '@/lib/request-context-headers'
import { getAccessToken } from '@/auth/access-token'
import { emitSessionExpired } from '@/stores/session-timeout-store'
import { EPREFIX, EROUTES } from '@/utils/enums'

const API_BASE_URL = import.meta.env.VITE_DEBUG ==='true'
    ? import.meta.env.VITE_LOCAL_URL
    : 'https://sandbox.acensure.acentriagroup.com/api/v1/'

type PersistedAuth = {
  token?: string | null
  abilities?: Abilities | null
  organizationLocationId?: number | null
}

function readStoredToken(): string | null {
    if (typeof window === 'undefined') return null
    if (isAuthWiped()) return null
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw) as PersistedAuth
        return parsed.token ?? null
    } catch {
        return null
    }
}

function bearerTokenFromHeader(header: unknown): string | null {
    const value = String(header ?? '')
    if (!value.toLowerCase().startsWith('bearer ')) return null
    return value.slice(7) || null
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

apiClient.interceptors.request.use(
    (config) => {
        const requestUrl = String(config.url ?? '')
        // Login must not send the old JWT — the API would treat it as an expired session.
        const isLoginRequest = requestUrl.includes('auth/login')

        const authStorage = localStorage.getItem(AUTH_STORAGE_KEY)
        const storedToken = (() => {
            if (!authStorage) return null
            try {
                return (JSON.parse(authStorage) as PersistedAuth).token ?? null
            } catch {
                return null
            }
        })()
        const liveToken = getAccessToken(storedToken)

        if (liveToken && !isLoginRequest) {
            config.headers.Authorization = `Bearer ${liveToken}`
        }

        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage) as PersistedAuth

                const locationId = parsed.organizationLocationId
                const abilities = parsed.abilities
                const isBypass = isBypassUser(abilities)

                if (!isBypass && locationId != null) {
                    config.headers[ORG_LOCATION_HEADER] = String(locationId)
                }
            } catch (error) {
                console.error('Error parsing auth-storage:', error)
            }
        }

        // Attach dynamic headers from localStorage (e.g. X-Location-Code: KE)
        Object.assign(config.headers, buildRequestContextHeaders())

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status
        const requestUrl = error?.config?.url ?? ''
        const url = typeof requestUrl === 'string' ? requestUrl : ''
        const isLoginRequest = url.includes('auth/login')
        const isLogoutRequest = url.includes('auth/logout')
        const isRefreshRequest = url.includes('auth/refresh')

        // Login After 401 Error
        const loginPath = `/${EPREFIX.AUTH}${EROUTES.SIGNIN}`
        const pathname = window.location.pathname
        const isOnAuthPage = pathname === loginPath || pathname.startsWith(`/${EPREFIX.AUTH}/`)

        const currentToken = getAccessToken(readStoredToken())
        const requestToken = bearerTokenFromHeader(error?.config?.headers?.Authorization)
        const isLoggedOut = !currentToken
        // In-flight calls still carry the old JWT after a new login; ignore those 401s.
        const isStaleRequest = Boolean(currentToken && requestToken && currentToken !== requestToken)

        const shouldEmit =
            status === 401 &&
            !isLoginRequest &&
            !isLogoutRequest &&
            !isRefreshRequest &&
            !isOnAuthPage &&
            !isLoggedOut &&
            !isStaleRequest

        if (shouldEmit) {
            emitSessionExpired()
        }
        return Promise.reject(error)
    }
)

export default apiClient
