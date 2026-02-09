// Wrapper para rutas que requieren autenticación; redirige al login si no hay sesión

import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children
}

export default ProtectedRoute
