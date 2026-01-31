/**
 * Guard de rol para restringir vistas a admin/programmer.
 * Práctica: Roles y permisos en routing.
 */
import { Navigate } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import { Role } from '../services/auth'

const RoleGuard = ({
  allowedRoles,
  children,
}: {
  allowedRoles: Role[]
  children: ReactNode
}) => {
  const { role, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  // Lógica robusta de comparación de roles
  const hasPermission = (() => {
    if (!role) return false

    const normalize = (r: string) => r.toLowerCase().replace(/^role_/, '')
    const userRoleNormalized = normalize(role)

    return allowedRoles.some(allowed => normalize(allowed) === userRoleNormalized)
  })()

  if (!hasPermission) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RoleGuard
