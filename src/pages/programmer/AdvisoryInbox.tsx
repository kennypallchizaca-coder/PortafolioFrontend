// Bandeja de entrada para que los programadores gestionen sus solicitudes de asesoría

import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getAdvisoriesByProgrammer, updateAdvisoryStatus, clearAdvisoryHistory, type Advisory } from '../../services/advisories'


const AdvisoryInbox = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<Advisory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'todas' | 'pending' | 'approved' | 'rejected'>('pending')

  // Elimina todas las asesorías con estado aprobado o rechazado del historial
  const clearHistory = async () => {
    if (!confirm('¿Estás seguro de que deseas borrar el historial? Esto eliminará las asesorías aprobadas y rechazadas.')) return

    setLoading(true)
    try {
      await clearAdvisoryHistory()
      await load() // Recargar lista
    } catch (err) {
      setError('No se pudo limpiar el historial.')
    } finally {
      setLoading(false)
    }
  }

  // Obtiene las asesorías vinculadas al programador actual
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



  // Actualiza el estado de una asesoría (aprobar/rechazar) con una respuesta opcional
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
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div key={item.id} className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-lg">{item.requesterName}</h3>
                  <p className="text-sm text-base-content/60">{item.requesterEmail}</p>
                </div>
                <span className={`badge capitalize ${item.status === 'approved' ? 'badge-success' :
                  item.status === 'rejected' ? 'badge-error' : 'badge-warning'
                  }`}>
                  {item.status}
                </span>
              </div>

              <div className="my-2 p-2 bg-base-200 rounded-lg text-sm">
                <p><strong>Fecha:</strong> {item.date}</p>
                <p><strong>Hora:</strong> {item.time}</p>
              </div>

              <p className="text-sm text-base-content/80 italic">"{item.note}"</p>

              {/* Acciones */}
              <div className="card-actions justify-end mt-4 items-center gap-3">


                {item.status === 'pending' && (
                  <>
                    <button
                      className="btn btn-success btn-sm text-white"
                      onClick={() => updateStatus(item.id!, 'approved')}
                    >
                      Aprobar
                    </button>
                    <button
                      className="btn btn-error btn-sm text-white"
                      onClick={() => updateStatus(item.id!, 'rejected')}
                    >
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {!filteredItems.length && !loading && (
          <div className="alert alert-info text-sm">
            No hay solicitudes {filter === 'todas' ? '' : filter === 'pending' ? 'pendientes' : filter === 'approved' ? 'aprobadas' : 'rechazadas'}.
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvisoryInbox
