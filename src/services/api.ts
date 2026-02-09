// Configuración de Axios para llamadas al API
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// Variables de entorno para URL base y timeout

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10)

console.log('🔌 Conectando a backend:', API_BASE_URL)
console.log('🌍 Modo:', import.meta.env.MODE)

// Instancia de Axios con URL base y headers por defecto
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor: Inyecta el token de autorización en cada petición si existe
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('auth_token')
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error: any) => {
        return Promise.reject(error)
    }
)

// Interceptor: Maneja respuestas y token expirado (401)
apiClient.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
        // Si el token es inválido, limpia sesión y redirige al login
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')

            // Evita redirección cíclica si ya está en login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default apiClient
