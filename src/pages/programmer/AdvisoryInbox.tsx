/**
 * Bandeja de asesorías del programador.
 * Prácticas: REST API, manejo de estados, feedback.
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAdvisoriesByProgrammer, updateAdvisoryStatus, type Advisory } from '../../services/advisories'

const AdvisoryInbox = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<Advisory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'todas' | 'pending' | 'approved' | 'rejected'>('pending')

  const clearHistory = () => {
    setItems([])
  }

  const load = async () => {
    if (!user?.id) return
    setLoading(true)
    setError('')
    try {
      const data = await getAdvisoriesByProgrammer(user.id)
      setItems(data)
    } catch (err) {
      setError('No se pudieron cargar las asesorías.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user?.id])

  const updateStatus = async (id: string, status: 'pending' | 'approved' | 'rejected', response?: string) => {
    try {
      await updateAdvisoryStatus(id, status, response || (status === 'approved' ? 'Confirmada' : 'Rechazada'))
      await load()
    } catch (err) {
      setError('No se pudo actualizar el estado.')
    }
  }

  const filteredItems = filter === 'todas'
    ? items
    : items.filter(item => item.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Asesorías</h1>
          <p className="text-base-content/70">
            Revisa solicitudes y aprueba o rechaza con feedback.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
            Recargar
          </button>
          <button className="btn btn-outline btn-sm" onClick={clearHistory} disabled={loading}>
            Limpiar Historial
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('pending')}
        >
          Pendientes
        </button>
        <button
          className={`btn btn-sm ${filter === 'approved' ? 'btn-success' : 'btn-outline'}`}
          onClick={() => setFilter('approved')}
        >
          Aprobadas
        </button>
        <button
          className={`btn btn-sm ${filter === 'rejected' ? 'btn-error' : 'btn-outline'}`}
          onClick={() => setFilter('rejected')}
        >
          Rechazadas
        </button>
        <button
          className={`btn btn-sm ${filter === 'todas' ? 'btn-accent' : 'btn-outline'}`}
          onClick={() => setFilter('todas')}
        >
          Todas
        </button>
      </div>

      {error && <div className="alert alert-error text-sm">{error}</div>}
      {loading && <div className="skeleton h-20 w-full" />}
      <div className="space-y-2">
        {filteredItems.map((item) => (
          <div key={item.id} className="card bg-base-100 shadow-sm">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold">{item.requesterName}</h3>
                  <p className="text-xs text-base-content/60">{item.requesterEmail}</p>
                </div>
                <span className="badge badge-outline capitalize">{item.status}</span>
              </div>
              <p className="text-sm">
                Fecha: {item.date} · Hora: {item.time}
              </p>
              <p className="text-sm text-base-content/70">{item.note}</p>
              {item.status === 'pending' && (
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => updateStatus(item.id!, 'approved')}
                  >
                    Aprobar
                  </button>
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => updateStatus(item.id!, 'rejected')}
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {!filteredItems.length && !loading && (
          <div className="alert alert-info text-sm">
            No hay solicitudes {filter === 'todas' ? '' : filter === 'pending' ? 'pendientes' : `${filter}s`}.
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvisoryInbox
