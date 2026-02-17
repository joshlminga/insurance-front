import axios from 'axios'

const API_BASE_URL = 'http://localhost:8002/api/v1'

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

export default apiClient