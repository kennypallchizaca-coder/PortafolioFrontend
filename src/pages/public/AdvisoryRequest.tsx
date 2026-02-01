/**
 * Formulario público para solicitar asesoría.
 * Prácticas: FormUtils para validación, REST API.
 */
import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { createAdvisoryRequest } from '../../services/advisories'
import { getProgrammers, type ProgrammerProfile } from '../../services/programmers'
import { FormUtils } from '../../utils/FormUtils'
import { useAuth } from '../../context/AuthContext'
import FormInput from '../../components/FormInput'
import FormTextarea from '../../components/FormTextarea'
import FormSelect from '../../components/FormSelect'
import {
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
  FiClock,
  FiMessageSquare,
  FiUser
} from 'react-icons/fi'
import { DAYS_MAP, parseProgrammerSchedule } from '../../utils/schedule'

const initialForm = {
  programmerId: '',
  requesterName: '',
  requesterEmail: '',
  date: '',
  time: '',
  note: '',
}

const AdvisoryRequest = () => {
  const { user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [programmers, setProgrammers] = useState<ProgrammerProfile[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [selectedProgrammer, setSelectedProgrammer] = useState<ProgrammerProfile | null>(null)
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  // llenar formulario automáticamente si el usuario está conectado
  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        requesterName: user.displayName || prev.requesterName,
        requesterEmail: user.email || prev.requesterEmail
      }))
    }
  }, [user])

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

  const [scheduleMap, setScheduleMap] = useState<{ [key: string]: string[] }>({})
  const [availableDays, setAvailableDays] = useState<string[]>([])

  // cargar programadores disponibles
  useEffect(() => {
    getProgrammers().then(data => {
      setProgrammers(data.filter(p => p.available))
    })
  }, [])

  // procesar horarios cuando cambia el experto
  useEffect(() => {
    if (!selectedProgrammer || !selectedProgrammer.schedule) {
      setScheduleMap({})
      setAvailableDays([])
      setAvailableTimes([])
      return
    }

    const { map, daysFound } = parseProgrammerSchedule(selectedProgrammer.schedule)
    setScheduleMap(map)
    setAvailableDays(daysFound)
  }, [selectedProgrammer])

  // actualizar horas disponibles cuando cambia la fecha
  useEffect(() => {
    if (!form.date) {
      setAvailableTimes([])
      return
    }

    const [y, m, d] = form.date.split('-').map(Number)
    const date = new Date(y, m - 1, d)
    const dayName = DAYS_MAP[date.getDay()]

    // obtener slots del día seleccionado (o vacio si no hay)
    // nota: parseProgrammerSchedule ya separa genericos en map['Generic'] si hiciera falta,
    // pero aqui asumimos que el usuario selecciona un día valido.
    // Si quisieramos soportar horarios genericos siempre, los concatenariamos aqui.
    const specificMoves = scheduleMap[dayName] || []
    const all = Array.from(new Set(specificMoves)).sort()

    setAvailableTimes(all)
  }, [form.date, scheduleMap])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    if (touched[name]) {
      const fieldRules = validationRules[name as keyof typeof validationRules]
      if (fieldRules) {
        const error = FormUtils.validate(value, fieldRules)
        setFormErrors(prev => ({ ...prev, [name]: error || '' }))
      }
    }

    if (name === 'programmerId') {
      const programmer = programmers.find(p => p.id === value)
      setSelectedProgrammer(programmer || null)
      // resetear fecha y hora al cambiar experto
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

    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as { [key: string]: boolean })
    setTouched(allTouched)

    const errors = FormUtils.validateForm(form, validationRules)
    setFormErrors(errors)

    if (FormUtils.hasErrors(errors)) {
      setError('Por favor corrige los errores en el formulario.')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')

    const sanitizedNote = form.note ? FormUtils.sanitizeHTML(form.note) : ''
    try {
      await createAdvisoryRequest({
        programmerId: form.programmerId,
        programmerEmail: selectedProgrammer?.email || '',
        programmerName: selectedProgrammer?.displayName || '',
        requesterName: form.requesterName.trim(),
        requesterEmail: form.requesterEmail.trim().toLowerCase(),
        date: form.date,
        time: form.time,
        note: sanitizedNote,
      })

      setMessage(
        'Solicitud enviada exitosamente. El programador recibirá una notificación y te avisaremos cuando responda.',
      )
      setForm(prev => ({
        ...initialForm,
        requesterName: user?.displayName || '',
        requesterEmail: user?.email || ''
      }))
      setFormErrors({})
      setTouched({})
      setAvailableTimes([])
      setSelectedProgrammer(null)
      // scheduleMap se resetea por el useEffect de selectedProgrammer null
    } catch (err) {
      console.error('Error al enviar solicitud:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`No se pudo enviar la solicitud: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <FiCalendar className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold">Agendar Asesoría</h1>
      </div>
      <p className="text-base-content/70 mb-8 pl-14">
        Selecciona un experto y reserva tu espacio. Recibirás respuesta en breve.
      </p>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl border border-base-content/5">
        <div className="card-body gap-6">
          {message && (
            <div className="alert alert-success shadow-sm">
              <FiCheckCircle className="w-5 h-5" />
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="alert alert-error shadow-sm">
              <FiAlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          <div className="form-control">
            <label className="label font-medium pb-1">
              <span className="label-text flex items-center gap-2">
                <FiUser /> Selecciona un Experto
              </span>
            </label>
            <FormSelect
              label=""
              name="programmerId"
              value={form.programmerId}
              onChange={handleChange}
              onBlur={() => handleBlur('programmerId')}
              error={formErrors.programmerId}
              touched={touched.programmerId}
              required
              helpText="Expertos disponibles para asesoría"
            >
              <option value="">-- Seleccionar Programador --</option>
              {programmers.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.displayName} · {p.specialty}
                </option>
              ))}
            </FormSelect>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <FormInput
              label="Tu nombre"
              name="requesterName"
              value={form.requesterName}
              onChange={handleChange}
              onBlur={() => handleBlur('requesterName')}
              error={formErrors.requesterName}
              touched={touched.requesterName}
              required
              placeholder="Nombre completo"
              maxLength={100}
              readOnly={!!user?.displayName}
            />

            <FormInput
              label="Correo electrónico"
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
              readOnly={!!user?.email}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="form-control">
              <label className="label font-medium pb-1">
                <span className="label-text flex items-center gap-2">
                  <FiCalendar /> Fecha Preferida
                </span>
                {availableDays.length > 0 && (
                  <span className="label-text-alt text-primary font-semibold">
                    Atiende: {availableDays.join(', ')}
                  </span>
                )}
              </label>
              <FormInput
                label=""
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
                onBlur={() => handleBlur('date')}
                error={formErrors.date}
                touched={touched.date}
                required
                disabled={!form.programmerId}
                helpText={form.date && availableTimes.length === 0 && selectedProgrammer ? 'El experto no tiene horarios para este día.' : undefined}
              />
            </div>

            <div className="form-control">
              <label className="label font-medium pb-1">
                <span className="label-text flex items-center gap-2">
                  <FiClock /> Hora Disponible
                </span>
              </label>
              <FormSelect
                label=""
                name="time"
                value={form.time}
                onChange={handleChange}
                onBlur={() => handleBlur('time')}
                error={formErrors.time}
                touched={touched.time}
                required
                disabled={!form.programmerId || availableTimes.length === 0}
                helpText={!form.programmerId ? 'Primero selecciona un programador' : undefined}
              >
                <option value="">-- Seleccionar Hora --</option>
                {availableTimes.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </FormSelect>
            </div>
          </div>

          <div className="form-control">
            <label className="label font-medium pb-1">
              <span className="label-text flex items-center gap-2">
                <FiMessageSquare /> Mensaje o Motivo
              </span>
            </label>
            <FormTextarea
              label=""
              name="note"
              value={form.note}
              onChange={handleChange}
              onBlur={() => handleBlur('note')}
              error={formErrors.note}
              touched={touched.note}
              placeholder="Describe brevemente el tema de la asesoría..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="card-actions justify-end mt-4">
            <button
              className="btn btn-primary btn-lg shadow-lg gap-3"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Enviando...
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  Enviar Solicitud
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default AdvisoryRequest
