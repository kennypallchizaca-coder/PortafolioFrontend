/**
 * Servicio de autenticación para el backend Spring Boot.
 * Maneja login, logout, y gestión de sesión con JWT tokens.
 */
import apiClient from './api'

export type Role = 'ROLE_ADMIN' | 'ROLE_PROGRAMMER' | 'ROLE_EXTERNAL'

export interface UserProfile {
  id: string
  displayName: string | null
  email: string | null
  photoURL?: string | null
  role: Role
  specialty?: string
  bio?: string
  socials?: Record<string, string>
  skills?: string[]
  available?: boolean
  schedule?: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  user: UserProfile
}

/**
 * Normalizar datos de usuario para asegurar que existe el campo id
 */
const normalizeUser = (user: any): UserProfile => {
  if (!user) return user

  // asegurar que existe id (mapear de _id, userId, o uid si es necesario)
  const id = user.id || user._id || user.userId || user.uid

  return {
    ...user,
    id: id ? String(id) : '',
  }
}

/**
 * Login de usuario
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    })

    // guardar token y usuario en localStorage
    if (response.data.token) {
      const normalizedUser = normalizeUser(response.data.user)
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(normalizedUser))

      return {
        ...response.data,
        user: normalizedUser
      }
    }

    return response.data
  } catch (error: any) {
    console.error('Error en login:', error.response?.data || error.message)
    throw error
  }
}

export interface RegisterInput {
  email: string
  password: string
  displayName: string
}

/**
 * Registro de nuevo usuario
 */
export const register = async (data: RegisterInput): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/api/auth/register', data)

    // Guardar token y usuario en localStorage
    if (response.data.token) {
      const normalizedUser = normalizeUser(response.data.user)
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(normalizedUser))

      return {
        ...response.data,
        user: normalizedUser
      }
    }

    return response.data
  } catch (error: any) {
    console.error('Error en registro:', error.response?.data || error.message)
    throw error
  }
}

/**
 * Cerrar sesión
 */
export const logout = async (): Promise<void> => {
  try {
    // opcionalmente notificar al backend (si tiene endpoint de logout)
    await apiClient.post('/api/auth/logout').catch(() => {
      // ignorar errores del backend en logout
    })
  } finally {
    // limpiar datos locales
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }
}

/**
 * Obtener usuario actual desde localStorage
 */
export const getCurrentUser = (): UserProfile | null => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  try {
    const parsed = JSON.parse(userStr)
    return normalizeUser(parsed)
  } catch {
    return null
  }
}

/**
 * Verificar si el token es válido
 */
export const verifyToken = async (): Promise<UserProfile | null> => {
  const token = localStorage.getItem('auth_token')
  if (!token) return null

  try {
    const response = await apiClient.get<UserProfile>('/api/auth/me')
    const user = normalizeUser(response.data)

    // actualizar datos del usuario en localStorage
    localStorage.setItem('user', JSON.stringify(user))

    return user
  } catch (error) {
    // token inválido o expirado
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    return null
  }
}

/**
 * Obtener el rol del usuario actual
 */
export const getUserRole = (): Role | null => {
  const user = getCurrentUser()
  return user?.role || null
}

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token')
}
