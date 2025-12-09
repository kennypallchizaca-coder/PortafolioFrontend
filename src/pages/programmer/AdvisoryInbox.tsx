/**
 * Bandeja de asesorías del programador.
 * Prácticas: Consumo Firestore, manejo de estados, feedback.
 */
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { listAdvisoriesByProgrammer, updateAdvisoryStatus } from '../../services/firestore'
import type { DocumentData } from 'firebase/firestore'

const AdvisoryInbox = () => {
  const { user } = useAuth()
  const [items, setItems] = useState<(DocumentData & { id: string })[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'todas' | 'pendiente' | 'aprobada' | 'rechazada'>('pendiente')

  const load = async () => {
    if (!user?.uid) return
    setLoading(true)
    setError('')
    try {
      const data = await listAdvisoriesByProgrammer(user.uid)
      setItems(data)
    } catch (err) {
      setError('No se pudieron cargar las asesorías.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [user?.uid])

  const updateStatus = async (id: string, status: 'pendiente' | 'aprobada' | 'rechazada') => {
    try {
      await updateAdvisoryStatus(id, status, status === 'aprobada' ? 'Confirmada' : 'Rechazada')
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
        <button className="btn btn-outline btn-sm" onClick={load} disabled={loading}>
          Recargar
        </button>
      </div>
      
      <div className="flex gap-2">
        <button 
          className={`btn btn-sm ${filter === 'pendiente' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setFilter('pendiente')}
        >
          Pendientes
        </button>
        <button 
          className={`btn btn-sm ${filter === 'aprobada' ? 'btn-success' : 'btn-outline'}`}
          onClick={() => setFilter('aprobada')}
        >
          Aprobadas
        </button>
        <button 
          className={`btn btn-sm ${filter === 'rechazada' ? 'btn-error' : 'btn-outline'}`}
          onClick={() => setFilter('rechazada')}
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
                Fecha: {item.slot?.date} · Hora: {item.slot?.time}
              </p>
              <p className="text-sm text-base-content/70">{item.note}</p>
              {item.status === 'pendiente' && (
                <div className="card-actions justify-end">
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => updateStatus(item.id, 'aprobada')}
                  >
                    Aprobar
                  </button>
                  <button
                    className="btn btn-error btn-sm"
                    onClick={() => updateStatus(item.id, 'rechazada')}
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
            No hay solicitudes {filter === 'todas' ? '' : filter === 'pendiente' ? 'pendientes' : `${filter}s`}.
          </div>
        )}
      </div>
    </div>
  )
}

export default AdvisoryInbox
