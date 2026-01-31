/**
 * Cliente HTTP base configurado con axios para comunicarse con el backend Spring Boot.
 * Maneja configuración global, interceptores y utilidades compartidas.
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10)

// Crear instancia de axios
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor para agregar token JWT a todas las peticiones
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

// Interceptor para manejar errores de respuesta
apiClient.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
        // Si el token expiró (401), limpiar sesión
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default apiClient
