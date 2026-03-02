import axios from 'axios'
import { EPREFIX, EROUTES } from '@/utils/enums'

const API_BASE_URL = 'http://localhost:8002/api/v1'

// const API_BASE_URL = 'https://sandbox.acensure.acentriagroup.com:8005/api/v1/'


const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

apiClient.interceptors.request.use(
    (config) => {
        const authStorage = localStorage.getItem('auth-storage')
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
        const loginPath = `/${EPREFIX.AUTH}${EROUTES.SIGNIN}`
        const isOnLoginPage = window.location.pathname === loginPath

        if (status === 401 && !isLoginRequest && !isOnLoginPage) {
            window.location.replace(loginPath)
        }

        return Promise.reject(error)
    }
)

export default apiClient
