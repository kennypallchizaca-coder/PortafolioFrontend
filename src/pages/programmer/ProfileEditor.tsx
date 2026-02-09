/**
 * Editor de perfil del programador (foto, nombre, bio, especialidad).
 * Heurísticas aplicadas: #5 Prevención de errores, #2 Feedback inmediato, #9 Mensajes claros
 */
import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getProgrammer, updateProgrammer, type ProgrammerProfile } from '../../services/programmers'
import { uploadAvatar } from '../../services/upload'
import { FormUtils } from '../../utils/FormUtils'
import { validationMessages, crudMessages, getErrorMessage } from '../../utils/errorMessages'
import FormInput from '../../components/FormInput'
import FormTextarea from '../../components/FormTextarea'
import { FiCamera, FiSave, FiPlus, FiTrash2 } from 'react-icons/fi'
import { DAYS, TIME_SLOTS } from '../../utils/schedule'


const initialForm = {
  displayName: '',
  email: '',
  specialty: '',
  bio: '',
  github: '',
  instagram: '',
  whatsapp: '',
  available: false,
}

const ProfileEditor = () => {
  const { user, loading: authLoading } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [skills, setSkills] = useState<string[]>(['JavaScript', 'React'])
  const [newSkill, setNewSkill] = useState('')
  const [schedule, setSchedule] = useState<string[]>([])

  // Estado para nuevo horario
  const [selectedDay, setSelectedDay] = useState('Lunes')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  // Reglas de validación
  const validationRules = {
    displayName: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.minLength(val, 3),
      (val: string) => FormUtils.maxLength(val, 100),
    ],
    // email: NO validar - es un campo deshabilitado de solo lectura
    specialty: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.minLength(val, 3),
    ],
    bio: [
      (val: string) => val && FormUtils.minLength(val, 10),
      (val: string) => val && FormUtils.maxLength(val, 500),
    ],
    github: [(val: string) => val && FormUtils.url(val)],
    instagram: [(val: string) => val && FormUtils.url(val)],
    whatsapp: [(val: string) => val && FormUtils.url(val)],
  }

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return
      try {
        const data = await getProgrammer(user.id)
        setForm({
          displayName: data.displayName || '',
          email: user.email || data.email || '', // Priorizar email de autenticación
          specialty: data.specialty || '',
          bio: data.bio || '',
          github: data.socials?.github || '',
          instagram: data.socials?.instagram || '',
          whatsapp: data.socials?.whatsapp || '',
          available: data.available || false,
        })
        setSkills(data.skills || ['JavaScript', 'React'])
        setSchedule(data.schedule || [])
        setPhotoPreview(data.photoURL || '')

        // Limpiar errores y touched al cargar datos del backend
        setFormErrors({})
        setTouched({})
      } catch (err) {
        console.error('Error cargando perfil:', err)
      }
    }
    loadProfile()
  }, [user?.id])

  // manejadores de eventos
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (touched[name]) {
      const fieldRules = validationRules[name as keyof typeof validationRules]
      if (fieldRules) {
        const error = FormUtils.validate(value, fieldRules)
        setFormErrors(prev => ({ ...prev, [name]: error || '' }))
      }
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

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user?.id) {
      console.error('Debug: User object missing ID', user)
      setError(`No hay usuario autenticado o ID faltante. (Datos: ${JSON.stringify(user || 'null')})`)
      return
    }

    // Marcar todos como tocados
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as { [key: string]: boolean })
    setTouched(allTouched)

    // Validar formulario
    const errors = FormUtils.validateForm(form, validationRules)
    setFormErrors(errors)

    // Validar skills
    if (skills.length < 2) {
      errors['skills'] = 'Debe tener al menos 2 habilidades'
    }

    if (FormUtils.hasErrors(errors)) {
      setError(validationMessages.formHasErrors)
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      // Construir payload base (siempre se envían estos campos)
      const socials: Record<string, string> = {}
      if (form.github) socials.github = form.github
      if (form.instagram) socials.instagram = form.instagram
      if (form.whatsapp) socials.whatsapp = form.whatsapp

      const payload: any = {
        displayName: form.displayName,
        email: form.email,
        specialty: form.specialty,
        bio: form.bio,
        skills: skills,
        schedule: schedule,
        socials,
        available: form.available,
      }

      // Solo incluir photoURL si se subió una NUEVA foto
      if (photoFile) {
        try {
          const uploadResult = await uploadAvatar(photoFile, user.id)
          payload.photoURL = uploadResult.url
        } catch (uploadError) {
          console.error('Error subiendo foto:', uploadError)
          setError(crudMessages.imageUploadError)
          // No bloquear el guardado del resto del formulario
        }
      }

      await updateProgrammer(user.id, payload)

      setMessage(crudMessages.profileUpdated)
      setPhotoFile(null)
    } catch (err: any) {
      console.error('❌ Error completo:', err)
      setError(getErrorMessage(err, 'profile'))
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return <div className="p-8 text-center"><span className="loading loading-spinner loading-lg"></span></div>
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Editar mi perfil</h1>
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-md">
        <div className="card-body space-y-4">
          {message && <div className="alert alert-success text-sm">{message}</div>}
          {error && <div className="alert alert-error text-sm">{error}</div>}

          {/* Foto de perfil */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Foto de perfil</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={photoPreview || '/default-avatar.png'} alt="Preview" />
                </div>
              </div>
              <label className="btn btn-outline gap-2">
                <FiCamera />
                Cambiar foto
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
          </div>

          {/* Campos básicos */}
          <div className="grid gap-4 md:grid-cols-2">
            <FormInput
              label="Nombre completo"
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              onBlur={() => handleBlur('displayName')}
              error={formErrors.displayName}
              touched={touched.displayName}
              required
              placeholder="Tu nombre"
              maxLength={100}
            />

            <FormInput
              label="Correo"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              error={formErrors.email}
              touched={touched.email}
              placeholder={user?.email || "correo@ejemplo.com"}
              autoComplete="email"
              disabled
              helpText="El email no se puede modificar"
            />
          </div>

          <FormInput
            label="Especialidad"
            name="specialty"
            value={form.specialty}
            onChange={handleChange}
            onBlur={() => handleBlur('specialty')}
            error={formErrors.specialty}
            touched={touched.specialty}
            required
            placeholder="Ej: Full Stack Developer"
            maxLength={100}
          />


          {/* Disponibilidad */}
          <div className="form-control bg-base-200/50 p-4 rounded-lg">
            <label className="label cursor-pointer justify-start gap-4">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm((prev) => ({ ...prev, available: e.target.checked }))}
                className="toggle toggle-primary"
              />
              <span className="label-text text-lg font-medium">Disponible para asesorías</span>
            </label>

            {/* Horarios de Disponibilidad */}
            <div className={`mt-4 transition-all ${!form.available ? 'opacity-50 pointer-events-none' : ''}`}>
              <label className="label">
                <span className="label-text font-semibold">Horarios de Disponibilidad</span>
                <span className="label-text-alt">Ej: "Lunes 09:00 - 12:00"</span>
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {schedule.map((item, idx) => (
                  <div key={idx} className="badge badge-secondary gap-2 p-3">
                    {item}
                    <button
                      type="button"
                      onClick={() => setSchedule(schedule.filter((_, i) => i !== idx))}
                      className="btn btn-ghost btn-xs btn-circle text-white"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-2 bg-base-100 p-3 rounded-lg border border-base-300">
                <div className="form-control flex-1 min-w-[120px]">
                  <label className="label-text text-xs mb-1">Día</label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                  >
                    {DAYS.map(day => <option key={day} value={day}>{day}</option>)}
                  </select>
                </div>

                <div className="form-control w-[100px]">
                  <label className="label-text text-xs mb-1">Desde</label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    {TIME_SLOTS.map(time => <option key={time} value={time}>{time}</option>)}
                  </select>
                </div>

                <div className="form-control w-[100px]">
                  <label className="label-text text-xs mb-1">Hasta</label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    {TIME_SLOTS.map(time => <option key={time} value={time}>{time}</option>)}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (startTime >= endTime) {
                      setError('La hora de fin debe ser posterior a la de inicio')
                      setTimeout(() => setError(''), 3000)
                      return
                    }
                    const newSlot = `${selectedDay} ${startTime} - ${endTime}`
                    if (!schedule.includes(newSlot)) {
                      setSchedule([...schedule, newSlot])
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <FiPlus /> Agregar
                </button>
              </div>
            </div>
          </div>

          <FormTextarea
            label="Biografía"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            onBlur={() => handleBlur('bio')}
            error={formErrors.bio}
            touched={touched.bio}
            placeholder="Cuéntanos sobre ti, tu experiencia y tus intereses..."
            rows={4}
            minLength={10}
            maxLength={500}
          />

          {/* Habilidades */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Habilidades (mínimo 2)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, idx) => (
                <div key={idx} className="badge badge-primary gap-2">
                  {skill}
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                    className="btn btn-ghost btn-xs"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="input input-bordered flex-1"
                placeholder="Ej: TypeScript"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                      setSkills([...skills, newSkill.trim()])
                      setNewSkill('')
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                    setSkills([...skills, newSkill.trim()])
                    setNewSkill('')
                  }
                }}
                className="btn btn-secondary"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="divider">Redes Sociales (opcional)</div>

          <FormInput
            label="GitHub"
            name="github"
            type="url"
            value={form.github}
            onChange={handleChange}
            onBlur={() => handleBlur('github')}
            error={formErrors.github}
            touched={touched.github}
            placeholder="https://github.com/tu-usuario"
            helpText="URL completa de tu perfil"
          />

          <FormInput
            label="Instagram"
            name="instagram"
            type="url"
            value={form.instagram}
            onChange={handleChange}
            onBlur={() => handleBlur('instagram')}
            error={formErrors.instagram}
            touched={touched.instagram}
            placeholder="https://instagram.com/tu-usuario"
          />

          <FormInput
            label="WhatsApp"
            name="whatsapp"
            type="url"
            value={form.whatsapp}
            onChange={handleChange}
            onBlur={() => handleBlur('whatsapp')}
            error={formErrors.whatsapp}
            touched={touched.whatsapp}
            placeholder="https://wa.me/593999999999"
            helpText="Link directo de WhatsApp"
          />

          <div className="card-actions justify-end pt-2">
            <button className="btn btn-primary gap-2" type="submit" disabled={loading}>
              <FiSave />
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProfileEditor
