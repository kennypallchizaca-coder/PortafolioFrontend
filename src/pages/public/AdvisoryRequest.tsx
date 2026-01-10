/**
 * Formulario público para solicitar asesor ía.
 * Prácticas: FormUtils para validación, componentes reutilizables, feedback en tiempo real.
 * Heurísticas aplicadas: #5 Prevención de errores, #9 Mensajes de error claros
 */
import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { addAdvisoryRequest, listProgrammers } from '../../services/firestore'
import { sendProgrammerAdvisoryEmail } from '../../services/email'
import type { DocumentData } from 'firebase/firestore'
import { FormUtils } from '../../utils/FormUtils'
import FormInput from '../../components/FormInput'
import FormTextarea from '../../components/FormTextarea'
import FormSelect from '../../components/FormSelect'
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
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  // Reglas de validación
  const validationRules = {
    programmerId: [(val: string) => FormUtils.required(val)],
    requesterName: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.minLength(val, 3),
    ],
    requesterEmail: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.email(val),
    ],
    date: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.futureDate(val),
    ],
    time: [(val: string) => FormUtils.required(val)],
    note: [(val: string) => val && FormUtils.maxLength(val, 500)],
  }

  useEffect(() => {
    listProgrammers().then(firestoreProgrammers => {
      // Combinar programadores estáticos con los de Firestore
      setProgrammers([...staticProgrammers, ...firestoreProgrammers])
    })
  }, [])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Validar en tiempo real si el campo ya fue tocado
    if (touched[name]) {
      const fieldRules = validationRules[name as keyof typeof validationRules]
      if (fieldRules) {
        const error = FormUtils.validate(value, fieldRules)
        setFormErrors(prev => ({ ...prev, [name]: error || '' }))
      }
    }

    if (name === 'programmerId') {
      const programmer = programmers.find(p => p.id === value)
      if (programmer) {
        setSelectedProgrammer(programmer)
        setAvailableTimes(programmer.schedule || [])
      }
      // Reset date and time when changing programmer
      setForm((prev) => ({ ...prev, date: '', time: '' }))
      setTouched(prev => ({ ...prev, date: false, time: false }))
      setFormErrors(prev => ({ ...prev, date: '', time: '' }))
    }
  }

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))

    const fieldRules = validationRules[fieldName as keyof typeof validationRules]
    if (fieldRules) {
      const error = FormUtils.validate(form[fieldName as keyof typeof form], fieldRules)
      setFormErrors(prev => ({ ...prev, [fieldName]: error || '' }))
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Marcar todos los campos como tocados
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as { [key: string]: boolean })
    setTouched(allTouched)

    // Validar todo el formulario
    const errors = FormUtils.validateForm(form, validationRules)
    setFormErrors(errors)

    if (FormUtils.hasErrors(errors)) {
      setError('Por favor corrige los errores en el formulario.')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')

    // Sanitizar nota para prevenir XSS
    const sanitizedNote = form.note ? FormUtils.sanitizeHTML(form.note) : ''
    try {
      const selectedProgrammer = programmers.find(
        (p) => p.id === form.programmerId,
      )

      await addAdvisoryRequest({
        programmerId: form.programmerId,
        programmerEmail: selectedProgrammer?.email,
        programmerName: selectedProgrammer?.displayName,
        requesterName: form.requesterName.trim(),
        requesterEmail: form.requesterEmail.trim().toLowerCase(),
        slot: { date: form.date, time: form.time },
        note: sanitizedNote,
      })

      // Enviar notificación por email al programador
      await sendProgrammerAdvisoryEmail({
        programmerEmail: selectedProgrammer?.email,
        programmerName: selectedProgrammer?.displayName,
        requesterName: form.requesterName,
        requesterEmail: form.requesterEmail.trim().toLowerCase(),
        date: form.date,
        time: form.time,
        note: sanitizedNote,
      })

      setMessage(
        '✅ Solicitud enviada exitosamente. El programador recibirá un correo y te avisaremos cuando responda.',
      )
      setForm(initialForm)
      setFormErrors({})
      setTouched({})
      setAvailableTimes([])
      setSelectedProgrammer(null)
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

          <FormSelect
            label="Programador"
            name="programmerId"
            value={form.programmerId}
            onChange={handleChange}
            onBlur={() => handleBlur('programmerId')}
            error={formErrors.programmerId}
            touched={touched.programmerId}
            required
            helpText="Lista cargada desde Firestore (rol programmer)"
          >
            <option value="">Selecciona un programador</option>
            {programmers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.displayName} · {p.specialty}
              </option>
            ))}
          </FormSelect>

          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              label="Tu nombre"
              name="requesterName"
              value={form.requesterName}
              onChange={handleChange}
              onBlur={() => handleBlur('requesterName')}
              error={formErrors.requesterName}
              touched={touched.requesterName}
              required
              placeholder="Nombre de quien solicita"
              maxLength={100}
            />

            <FormInput
              label="Correo"
              name="requesterEmail"
              type="email"
              value={form.requesterEmail}
              onChange={handleChange}
              onBlur={() => handleBlur('requesterEmail')}
              error={formErrors.requesterEmail}
              touched={touched.requesterEmail}
              required
              placeholder="correo@ejemplo.com"
              autoComplete="email"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              label="Fecha"
              name="date"
              type="date"
              value={form.date}
              onChange={handleChange}
              onBlur={() => handleBlur('date')}
              error={formErrors.date}
              touched={touched.date}
              required
              helpText="Selecciona una fecha futura"
              disabled={!form.programmerId}
            />

            <FormSelect
              label="Hora disponible"
              name="time"
              value={form.time}
              onChange={handleChange}
              onBlur={() => handleBlur('time')}
              error={formErrors.time}
              touched={touched.time}
              required
              disabled={!form.programmerId || availableTimes.length === 0}
              helpText={!form.programmerId ? 'Selecciona un programador primero' : undefined}
            >
              <option value="">Selecciona hora</option>
              {availableTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </FormSelect>
          </div>

          <FormTextarea
            label="Motivo / nota"
            name="note"
            value={form.note}
            onChange={handleChange}
            onBlur={() => handleBlur('note')}
            error={formErrors.note}
            touched={touched.note}
            placeholder="Describe brevemente el tema de la asesoría (opcional)"
            rows={3}
            maxLength={500}
          />

          <div className="card-actions justify-end">
            <button
              className="btn btn-primary"
              type="submit"
              disabled={loading || FormUtils.hasErrors(formErrors)}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Enviando...
                </>
              ) : (
                '📧 Enviar solicitud'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdvisoryRequest
