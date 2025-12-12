/**
 * Dashboard del Administrador (resumen).
 * Prácticas: UX con tarjetas, acceso rápido a CRUD de programadores.
 */
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '../../services/firebase'

const AdminDashboard = () => {
  const [programmersCount, setProgrammersCount] = useState<number>(0)
  const [pendingAdvisories, setPendingAdvisories] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Contar programadores
        const programmersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'programmer')
        )
        const programmersSnap = await getDocs(programmersQuery)
        setProgrammersCount(programmersSnap.size)

        // Contar asesorías pendientes
        const advisoriesQuery = query(
          collection(db, 'advisories'),
          where('status', '==', 'pendiente')
        )
        const advisoriesSnap = await getDocs(advisoriesQuery)
        setPendingAdvisories(advisoriesSnap.size)
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
      <div className="stats shadow">
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
      </div>
    </div>
  )
}

export default AdminDashboard
