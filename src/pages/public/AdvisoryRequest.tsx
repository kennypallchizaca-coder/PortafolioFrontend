/**
 * Formulario público para solicitar asesoría.
 * Prácticas: Formularios controlados, validación básica y feedback de errores.
 */
import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { addAdvisoryRequest, listProgrammers } from '../../services/firestore'
import { sendProgrammerAdvisoryEmail } from '../../services/email'
import type { DocumentData } from 'firebase/firestore'
import fotoAlexis from '../../img/fotoalexis.jpg'

const initialForm = {
  programmerId: '',
  requesterName: '',
  requesterEmail: '',
  date: '',
  time: '',
  note: '',
}

// Programadores estáticos del equipo
const staticProgrammers = [
  {
    id: 'alexis-static',
    displayName: 'Alexis',
    specialty: 'Full Stack Developer',
    bio: 'Desarrollador full-stack especializado en React, Node.js y Firebase.',
    email: 'aguamanp4@est.ups.edu.ec',
    photoURL: fotoAlexis,
    isStatic: true,
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Firebase', 'MongoDB', 'Express']
  },
  {
    id: 'daniel-static',
    displayName: 'Daniel',
    specialty: 'Frontend Developer',
    bio: 'Experto en desarrollo frontend con React y TypeScript.',
    email: 'aguamanp4@est.ups.edu.ec',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Daniel',
    isStatic: true,
    skills: ['React', 'TypeScript', 'TailwindCSS', 'HTML5', 'CSS3', 'Responsive Design']
  }
]

const AdvisoryRequest = () => {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [programmers, setProgrammers] = useState<(DocumentData & { id: string })[]>(staticProgrammers)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedProgrammer, setSelectedProgrammer] = useState<DocumentData | null>(null)

  useEffect(() => {
    listProgrammers().then(firestoreProgrammers => {
      // Combinar programadores estáticos con los de Firestore
      setProgrammers([...staticProgrammers, ...firestoreProgrammers])
    })
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (name === 'programmerId') {
      const programmer = programmers.find(p => p.id === value)
      if (programmer) {
        setSelectedProgrammer(programmer)
        setAvailableTimes(programmer.schedule || [])
      }
      // Reset date and time when changing programmer
      setForm((prev) => ({ ...prev, date: '', time: '' }))
    }
  }

  const isValid = () => {
    if (!form.programmerId || !form.requesterName || !form.requesterEmail || !form.date || !form.time) {
      return false
    }
    const selectedDate = new Date(form.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return selectedDate >= today
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!isValid()) {
      setError('Completa los campos obligatorios.')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const selectedProgrammer = programmers.find(
        (p) => p.id === form.programmerId,
      )

      await addAdvisoryRequest({
        programmerId: form.programmerId,
        programmerEmail: selectedProgrammer?.email,
        programmerName: selectedProgrammer?.displayName,
        requesterName: form.requesterName,
        requesterEmail: form.requesterEmail,
        slot: { date: form.date, time: form.time },
        note: form.note,
      })

      // Enviar notificación por email al programador
      await sendProgrammerAdvisoryEmail({
        programmerEmail: selectedProgrammer?.email,
        programmerName: selectedProgrammer?.displayName,
        requesterName: form.requesterName,
        requesterEmail: form.requesterEmail,
        date: form.date,
        time: form.time,
        note: form.note,
      })

      setMessage(
        'Solicitud enviada. El programador recibira un correo y te avisaremos por email cuando responda.',
      )
      setForm(initialForm)
    } catch (err) {
      console.error('Error al enviar solicitud:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`No se pudo enviar la solicitud: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold">Agendar Asesoría</h1>
      <p className="text-base-content/70 mb-6">
        Selecciona programador, fecha y hora. El programador aprobará o rechazará tu solicitud.
      </p>
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-lg">
        <div className="card-body space-y-4">
          {message && <div className="alert alert-success text-sm">{message}</div>}
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Programador *</span>
            </label>
            <select
              name="programmerId"
              value={form.programmerId}
              onChange={handleChange}
              className="select select-bordered"
              required
            >
              <option value="">Selecciona</option>
              {programmers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} · {p.specialty}
                </option>
              ))}
            </select>
            <span className="label-text-alt text-base-content/60">
              Lista cargada desde Firestore (rol programmer).
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tu nombre *</span>
              </label>
              <input
                name="requesterName"
                value={form.requesterName}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="Nombre de quien solicita"
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
                onChange={handleChange}
                className="input input-bordered"
                placeholder="correo@ejemplo.com"
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
                onChange={handleChange}
                className="input input-bordered"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Hora disponible *</span>
              </label>
              <select
                name="time"
                value={form.time}
                onChange={handleChange}
                className="select select-bordered"
                required
                disabled={!form.programmerId}
              >
                <option value="">Selecciona hora</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {!form.programmerId && (
                <span className="label-text-alt text-base-content/60">
                  Selecciona un programador primero
                </span>
              )}
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Motivo / nota</span>
            </label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              className="textarea textarea-bordered"
              rows={3}
            />
          </div>
          <div className="card-actions justify-end">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdvisoryRequest
