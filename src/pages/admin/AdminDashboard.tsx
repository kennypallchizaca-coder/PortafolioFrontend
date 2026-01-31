/**
 * Dashboard del Administrador (resumen).
 * Prácticas: UX con tarjetas, acceso rápido a CRUD de programadores.
 */
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getProgrammers } from '../../services/programmers'


const AdminDashboard = () => {
  const [programmersCount, setProgrammersCount] = useState<number>(0)
  const [pendingAdvisories, setPendingAdvisories] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Contar programadores usando REST API
        const programmers = await getProgrammers()
        setProgrammersCount(programmers.length)

        // Contar asesorías pendientes
        // TODO: Implementar endpoint en backend para contar asesorías pendientes
        // Por ahora lo dejamos en 0 o simulamos
        setPendingAdvisories(0)

      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="space-y-4">
      <div className="stats shadow w-full">
        <div className="stat">
          <div className="stat-title">Programadores</div>
          <div className="stat-value">{loading ? '...' : programmersCount}</div>
          <div className="stat-desc">Total registrados</div>
        </div>
        <div className="stat">
          <div className="stat-title">Asesorías pendientes</div>
          <div className="stat-value">{loading ? '...' : pendingAdvisories}</div>
          <div className="stat-desc">Requieren aprobación</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Gestionar programadores</h2>
            <p className="text-sm text-base-content/70">
              Crear/editar perfiles, asignar rol de programador y datos de
              contacto.
            </p>
            <div className="card-actions justify-end">
              <Link className="btn btn-primary" to="/admin/programadores">
                Abrir gestión
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Información del Sistema</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Backend:</strong> Spring Boot REST API</p>
              <p><strong>Frontend:</strong> React + TypeScript</p>
              <p><strong>Autenticación:</strong> JWT</p>
              <p><strong>Estado:</strong> <span className="badge badge-success">Operativo</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
