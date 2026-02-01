/**
 * Configuración central de Axios para peticiones al API.
 * Define la URL base, interceptores de seguridad y manejo global de errores.
 */
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

//este es un comentario ejemplo
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10)

console.log('🔌 Conectando a backend:', API_BASE_URL)
console.log('🌍 Modo:', import.meta.env.MODE)

/**
 * Instancia de Axios configurada con valores por defecto del entorno.
 */
export const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * Interceptor de peticiones (Request).
 * Adjunta el token JWT del localStorage a cada petición saliente.
 */
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

/**
 * Interceptor de respuestas (Response).
 * Maneja respuestas globales y errores comunes como el 401 (No autorizado).
 */
apiClient.interceptors.response.use(
    (response: any) => response,
    (error: any) => {
        // Lógica de manejo de errores globales
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')

            // Si ya estamos en la página de login, no redirigimos para que
            // no se pierda el estado del componente (errores, inputs, etc)
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }
        return Promise.reject(error)
    }
)

export default apiClient
