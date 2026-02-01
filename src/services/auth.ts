/**
 * Servicio de Autenticación.
 * Maneja el inicio de sesión, registro, gestión de sesiones y tokens JWT.
 */
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

// Función para asegurar que el objeto usuario tenga un ID consistente, 
// manejando posibles variaciones en los nombres de campos que devuelve la base de datos
const normalizeUser = (user: any): UserProfile => {
  if (!user) return user

  // Intentar obtener el ID de diferentes propiedades comunes (_id para Mongo, id para SQL/DTOs)
  const id = user.id || user._id || user.userId || user.uid

  return {
    ...user,
    id: id ? String(id) : '',
  }
}

/**
 * Realiza la petición de inicio de sesión al servidor.
 * Si es exitosa, guarda el token y los datos del usuario en el almacenamiento local (localStorage).
 */
export const login = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    // Enviar credenciales al endpoint de login
    const response = await apiClient.post<LoginResponse>('/api/auth/login', {
      email,
      password,
    })

    // Si el servidor responde con un token, procedemos a persistir la sesión
    if (response.data.token) {
      const normalizedUser = normalizeUser(response.data.user)
      // Guardar el JWT para ser usado en futuras peticiones (adjunto automáticamente por el interceptor de apiClient)
      localStorage.setItem('auth_token', response.data.token)
      // Guardar info básica del usuario para mostrar en la UI sin esperar a otra petición
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

/**
 * Registra un nuevo usuario en el sistema.
 */
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

/**
 * Cierra la sesión del usuario actual, notificando al servidor y limpiando los datos locales.
 */
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

/**
 * Recupera el usuario guardado localmente en el navegador.
 */
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

/**
 * Verifica si el token actual sigue siendo válido contra el servidor.
 * Se usa normalmente al recargar la página para asegurar que la sesión no haya expirado.
 */
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

// Retorna el rol del usuario actual si está autenticado
export const getUserRole = (): Role | null => {
  const user = getCurrentUser()
  return user?.role || null
}

// Verificación rápida de si existe un token guardado
export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('auth_token')
}
