// Contexto para gestionar el estado de autenticación y datos del usuario de forma global

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as authService from '../services/auth'

export type Role = authService.Role
export type UserProfile = authService.UserProfile

interface AuthContextValue {
  user: UserProfile | null
  role: Role | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true)

      const token = localStorage.getItem('auth_token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const verifiedUser = await authService.verifyToken()
        if (verifiedUser) {
          console.log('DEBUG: Auth initialized. Role from server:', verifiedUser.role);
          setUser(verifiedUser)
          setRole(verifiedUser.role)
        } else {
          console.log('DEBUG: No verified user found.');
          setUser(null)
          setRole(null)
        }
      } catch (error) {
        console.error('Error verificando token:', error)
        setUser(null)
        setRole(null)
      }

      setLoading(false)
    }

    // Inicializa la sesión verificando la validez del token almacenado localmente
    initAuth()
  }, [])

  // Login con email y contraseña
  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const response = await authService.login(email, password)
      setUser(response.user)
      setRole(response.user.role)
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.logout()
      setUser(null)
      setRole(null)
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      setLoading(false)
    }
  }

  const isAuthenticated = !!user

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}
