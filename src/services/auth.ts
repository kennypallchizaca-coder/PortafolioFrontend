// Servicio de autenticación (Login, Registro, Sesión)
import apiClient from './api'

export type Role = 'ADMIN' | 'PROGRAMMER' | 'EXTERNAL'

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

// Normaliza el objeto usuario asegurando que tenga un campo 'id' consistente
const normalizeUser = (user: any): UserProfile => {
  if (!user) return user

  // Busca el ID en propiedades comunes (_id, userId, uid)
  const id = user.id || user._id || user.userId || user.uid

  return {
    ...user,
    id: id ? String(id) : '',
  }
}

// Autentica al usuario con email/password; retorna token y perfil usuario
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // Enviar credenciales al endpoint de login
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    })

    // Si hay token, persiste sesión y normaliza usuario
    if (response.data.token) {
      const normalizedUser = normalizeUser(response.data.user)
      // Guarda token para interceptor
      localStorage.setItem('auth_token', response.data.token)
      // Cachea usuario para UI inmediata
      localStorage.setItem('user', JSON.stringify(normalizedUser))

      return {
        ...response.data,
        user: normalizedUser
      }
    }

    return response.data
  } catch (error: any) {
    console.error('Error durante el proceso de login:', error.response?.data || error.message)
    throw error
  }
}

export interface RegisterInput {
  email: string
  password: string
  displayName: string
}

// Registra usuario nuevo y devuelve sesión iniciada
export const register = async (data: RegisterInput): Promise<LoginResponse> => {
  try {
    const response = await apiClient.post<LoginResponse>('/api/auth/register', data)

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
    console.error('Error durante el registro de usuario:', error.response?.data || error.message)
    throw error
  }
}

// Cierra sesión: limpia localStorage y notifica al servidor
export const logout = async (): Promise<void> => {
  try {
    // Intentar avisar al servidor sobre el cierre de sesión (opcional para JWT pero buena práctica)
    await apiClient.post('/api/auth/logout').catch(() => {
      // Ignoramos errores aquí ya que lo primordial es limpiar el almacenamiento local
    })
  } finally {
    // Eliminar obligatoriamente los datos de sesión del navegador
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }
}

// Obtiene usuario actual desde localStorage (sin llamada a API)
export const getCurrentUser = (): UserProfile | null => {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null

  try {
    // Parsear la cadena JSON guardada de nuevo a un objeto de TypeScript
    const parsed = JSON.parse(userStr)
    return normalizeUser(parsed)
  } catch {
    // Si los datos están corruptos o el formato cambió, devolvemos null
    return null
  }
}

// Valida token con backend y actualiza datos de usuario; retorna null si falla
export const verifyToken = async (): Promise<UserProfile | null> => {
  const token = localStorage.getItem('auth_token')
  if (!token) return null

  try {
    // Petición al endpoint 'me' que devuelve los datos del dueño del token
    const response = await apiClient.get<UserProfile>('/api/auth/me')
    const user = normalizeUser(response.data)

    // Aprovechamos para actualizar la información del usuario en local
    localStorage.setItem('user', JSON.stringify(user))

    return user
  } catch (error) {
    // Si el token falló (401 u otro error), forzamos el cierre de sesión local
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    return null
  }
}

// Retorna el rol del usuario actual (ADMIN/PROGRAMMER/EXTERNAL) o null
export const getUserRole = (): Role | null => {
  const user = getCurrentUser()
  return user?.role || null
}

// Verifica existencia de token en almacenamiento local
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token')
}
