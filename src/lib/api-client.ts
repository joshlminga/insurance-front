import axios from 'axios'
import { emitSessionExpired } from '@/stores/session-timeout-store'
import { EPREFIX, EROUTES } from '@/utils/enums'

const API_BASE_URL = import.meta.env.VITE_DEBUG ==='true'
    ? import.meta.env.VITE_LOCAL_URL
    : 'https://sandbox.acensure.acentriagroup.com/api/v1/'

const AUTH_STORAGE_KEY = 'auth-storage'
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
                const { token } = JSON.parse(authStorage)
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`
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
