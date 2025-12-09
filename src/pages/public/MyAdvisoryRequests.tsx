/**
 * Bandeja de solicitudes de asesoría para usuarios externos.
 * Permite ver el estado de las solicitudes y crear nuevas.
 */
import { useState, FormEvent } from 'react'
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore'
import { db } from '../../services/firebase'
import { addAdvisoryRequest, listProgrammers } from '../../services/firestore'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const initialForm = {
  programmerId: '',
  requesterName: '',
  requesterEmail: '',
  date: '',
  time: '',
  note: '',
}

const MyAdvisoryRequests = () => {
  const [email, setEmail] = useState('')
  const [searchPerformed, setSearchPerformed] = useState(false)
  const [requests, setRequests] = useState<(DocumentData & { id: string })[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showNewRequestForm, setShowNewRequestForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [programmers, setProgrammers] = useState<(DocumentData & { id: string })[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    listProgrammers().then(setProgrammers)
  }, [])

  const searchRequests = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email.trim()) {
      setError('Ingresa tu correo electrónico.')
      return
    }

    setLoading(true)
    setError('')
    setSearchPerformed(true)
    
    try {
      const q = query(
        collection(db, 'advisories'),
        where('requesterEmail', '==', email.trim())
      )
      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setRequests(data)
      
      // Pre-llenar el formulario con el email
      setForm(prev => ({ ...prev, requesterEmail: email.trim() }))
    } catch (err) {
      console.error('Error al buscar solicitudes:', err)
      setError('No se pudieron cargar las solicitudes. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitNewRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.programmerId || !form.requesterName || !form.requesterEmail || !form.date || !form.time) {
      setError('Completa todos los campos obligatorios.')
      return
    }

    setSubmitting(true)
    setError('')
    setMessage('')

    try {
      await addAdvisoryRequest({
        programmerId: form.programmerId,
        requesterName: form.requesterName,
        requesterEmail: form.requesterEmail,
        slot: { date: form.date, time: form.time },
        note: form.note,
      })
      
      setMessage('¡Solicitud enviada exitosamente!')
      setForm({ ...initialForm, requesterEmail: email })
      setShowNewRequestForm(false)
      
      // Recargar solicitudes
      await searchRequests(e as any)
    } catch (err) {
      console.error('Error al enviar solicitud:', err)
      setError('No se pudo enviar la solicitud. Intenta nuevamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <span className="badge badge-warning">Pendiente</span>
      case 'aprobada':
        return <span className="badge badge-success">Aprobada</span>
      case 'rechazada':
        return <span className="badge badge-error">Rechazada</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  const getProgrammerName = (programmerId: string) => {
    const programmer = programmers.find(p => p.id === programmerId)
    return programmer?.displayName || 'Programador'
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mis Solicitudes de Asesoría</h1>
        <p className="text-base-content/70">
          Consulta el estado de tus solicitudes ingresando tu correo electrónico.
        </p>
      </div>

      {/* Formulario de búsqueda */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <form onSubmit={searchRequests} className="flex gap-4">
            <div className="form-control flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu-correo@ejemplo.com"
                className="input input-bordered"
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Buscando...' : 'Buscar Solicitudes'}
            </button>
          </form>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Resultados */}
      {searchPerformed && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {requests.length === 0 ? 'No se encontraron solicitudes' : `${requests.length} solicitud(es) encontrada(s)`}
            </h2>
            {requests.length > 0 && !showNewRequestForm && (
              <button 
                className="btn btn-primary btn-sm"
                onClick={() => setShowNewRequestForm(true)}
              >
                + Nueva Solicitud
              </button>
            )}
          </div>

          {/* Formulario de nueva solicitud */}
          {showNewRequestForm && (
            <div className="card bg-base-100 shadow-lg border-2 border-primary">
              <div className="card-body">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Nueva Solicitud</h3>
                  <button 
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowNewRequestForm(false)}
                  >
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmitNewRequest} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Programador *</span>
                    </label>
                    <select
                      name="programmerId"
                      value={form.programmerId}
                      onChange={handleFormChange}
                      className="select select-bordered"
                      required
                    >
                      <option value="">Selecciona un programador</option>
                      {programmers.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.displayName} · {p.specialty}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Tu nombre *</span>
                      </label>
                      <input
                        name="requesterName"
                        value={form.requesterName}
                        onChange={handleFormChange}
                        className="input input-bordered"
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Correo *</span>
                      </label>
                      <input
                        type="email"
                        name="requesterEmail"
                        value={form.requesterEmail}
                        onChange={handleFormChange}
                        className="input input-bordered"
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Fecha *</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={form.date}
                        onChange={handleFormChange}
                        className="input input-bordered"
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Hora *</span>
                      </label>
                      <input
                        type="time"
                        name="time"
                        value={form.time}
                        onChange={handleFormChange}
                        className="input input-bordered"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Motivo / nota</span>
                    </label>
                    <textarea
                      name="note"
                      value={form.note}
                      onChange={handleFormChange}
                      className="textarea textarea-bordered"
                      rows={3}
                      placeholder="Describe brevemente el motivo de tu solicitud..."
                    />
                  </div>

                  <div className="card-actions justify-end">
                    <button 
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setShowNewRequestForm(false)}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Lista de solicitudes */}
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests
                .sort((a, b) => {
                  const dateA = a.createdAt?.toMillis?.() || 0
                  const dateB = b.createdAt?.toMillis?.() || 0
                  return dateB - dateA
                })
                .map((request) => (
                  <div key={request.id} className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow">
                    <div className="card-body">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            Asesoría con {getProgrammerName(request.programmerId)}
                          </h3>
                          <p className="text-sm text-base-content/60">
                            {request.requesterName}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <span className="text-xs text-base-content/60">Fecha:</span>
                          <p className="font-medium">{request.slot?.date}</p>
                        </div>
                        <div>
                          <span className="text-xs text-base-content/60">Hora:</span>
                          <p className="font-medium">{request.slot?.time}</p>
                        </div>
                      </div>

                      {request.note && (
                        <div className="mt-2">
                          <span className="text-xs text-base-content/60">Tu nota:</span>
                          <p className="text-sm">{request.note}</p>
                        </div>
                      )}

                      {request.responseMessage && (
                        <div className={`alert ${request.status === 'aprobada' ? 'alert-success' : 'alert-error'} mt-3`}>
                          <div>
                            <span className="font-semibold">Respuesta del programador:</span>
                            <p>{request.responseMessage}</p>
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-base-content/50 mt-2">
                        Solicitada: {request.createdAt?.toDate?.().toLocaleDateString('es-ES') || 'Fecha no disponible'}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : searchPerformed && !loading && (
            <div className="card bg-base-100 shadow-md">
              <div className="card-body text-center py-12">
                <p className="text-base-content/60">
                  No tienes solicitudes registradas con este correo.
                </p>
                <p className="text-sm text-base-content/50 mt-2">
                  ¿Quieres solicitar una asesoría?
                </p>
                <div className="card-actions justify-center mt-4">
                  <Link to="/agendar-asesoria" className="btn btn-primary">
                    Agendar Asesoría
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MyAdvisoryRequests
