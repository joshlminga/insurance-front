import axios from 'axios'
import { isBypassUser } from '@/auth/can'
import { AUTH_STORAGE_KEY, ORG_LOCATION_HEADER } from '@/auth/constants'
import type { Abilities } from '@/auth/types'
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

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

apiClient.interceptors.request.use(
    (config) => {
        const authStorage = localStorage.getItem(AUTH_STORAGE_KEY)
        if (authStorage) {
            try {
                const parsed = JSON.parse(authStorage) as PersistedAuth
                if (parsed.token) {
                    config.headers.Authorization = `Bearer ${parsed.token}`
                }

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
        const isLoginRequest = typeof requestUrl === 'string' && requestUrl.includes('auth/login')

        // Login After 401 Error
        const loginPath = `${EPREFIX.AUTH}${EROUTES.SIGNIN}`
        const isOnLoginPage = window.location.pathname === loginPath
        if (status === 401 && !isLoginRequest && !isOnLoginPage) {
            emitSessionExpired()
        }
        return Promise.reject(error)
    }
)

export default apiClient
