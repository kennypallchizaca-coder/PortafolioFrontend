//este es un comentario ejemplo
import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { getProgrammers, upsertProgrammer, deleteProgrammer, type ProgrammerProfile } from '../../services/programmers'
import { uploadAvatar } from '../../services/upload'
import { FormUtils } from '../../utils/FormUtils'
import { FiPlus, FiTrash2, FiEdit2, FiGithub, FiInstagram } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'


import { DAYS, TIME_SLOTS } from '../../utils/schedule'

//este es un comentario ejemplo
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

const ProgrammersPage = () => {
  const [form, setForm] = useState(initialForm)
  const [programmers, setProgrammers] = useState<ProgrammerProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [editingId, setEditingId] = useState<string | null>(null)

  const [skills, setSkills] = useState<string[]>(['JavaScript', 'React'])
  const [newSkill, setNewSkill] = useState('')
  //este es un comentario ejemplo
  const [times, setTimes] = useState<string[]>([])
  const [selectedDay, setSelectedDay] = useState('Lunes')
  const [startTime, setStartTime] = useState('09:00')
  const [endTime, setEndTime] = useState('17:00')

  //este es un comentario ejemplo
  const validationRules = {
    displayName: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.minLength(val, 3)
    ],
    email: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.email(val)
    ],
    specialty: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.minLength(val, 3)
    ],
    bio: [
      (val: string) => FormUtils.minLength(val, 10)
    ],
    github: [
      (val: string) => val && FormUtils.url(val)
    ],
    instagram: [
      (val: string) => val && FormUtils.url(val)
    ],
    whatsapp: [
      (val: string) => val && FormUtils.url(val)
    ],
  }

  //este es un comentario ejemplo
  const loadProgrammers = async () => {
    try {
      const data = await getProgrammers()
      setProgrammers(data)
    } catch (err) {
      console.error('Error loading programmers:', err)
    }
  }

  useEffect(() => {
    loadProgrammers()
  }, [])

  const onAddSkill = () => {
    if (!newSkill.trim() || newSkill.length < 2) return
    setSkills([...skills, newSkill.trim()])
    setNewSkill('')
  }

  const onDeleteSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

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

    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as { [key: string]: boolean })
    setTouched(allTouched)

    const errors = FormUtils.validateForm(form, validationRules)
    setFormErrors(errors)

    if (skills.length < 2) {
      errors['skills'] = 'Debe tener al menos 2 habilidades'
    }

    if (form.available && times.length === 0) {
      errors['schedule'] = 'Debe especificar al menos un horario si está disponible'
    }

    if (FormUtils.hasErrors(errors)) {
      setError('Por favor corrige los errores en el formulario.')
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      const uid = editingId || `prog_${Date.now()}`
      let photoURL = ''

      if (photoFile) {
        const uploadResult = await uploadAvatar(photoFile, uid)
        photoURL = uploadResult.url
      }

      const socials: Record<string, string> = {}
      if (form.github) socials.github = form.github
      if (form.instagram) socials.instagram = form.instagram
      if (form.whatsapp) socials.whatsapp = form.whatsapp

      await upsertProgrammer(uid, {
        displayName: form.displayName,
        email: form.email,
        specialty: form.specialty,
        bio: form.bio,
        role: 'PROGRAMMER',
        photoURL,
        skills: skills,
        socials,
        available: form.available,
        schedule: times,
      })

      setMessage(editingId ? '✓ Programador actualizado correctamente.' : '✓ Programador guardado correctamente.')
      setForm(initialForm)
      setSkills(['JavaScript', 'React'])
      setNewSkill('')
      setTimes([])
      setSelectedDay('Lunes')
      setStartTime('09:00')
      setEndTime('17:00')
      setPhotoFile(null)
      setPhotoPreview('')
      setFormErrors({})
      setTouched({})
      setEditingId(null)
      await loadProgrammers()
    } catch (err: any) {
      console.error('Error al guardar programador:', err)
      setError(`Error al guardar: ${err.message || 'Error al conectar con el servidor'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (dev: ProgrammerProfile) => {
    setEditingId(dev.id!)
    setForm({
      displayName: dev.displayName || '',
      email: dev.email || '',
      specialty: dev.specialty || '',
      bio: dev.bio || '',
      github: dev.socials?.github || '',
      instagram: dev.socials?.instagram || '',
      whatsapp: dev.socials?.whatsapp || '',
      available: dev.available ?? false,
    })
    setTimes(dev.schedule || [])
    setSkills(dev.skills || ['JavaScript', 'React'])
    setPhotoPreview(dev.photoURL || '')
    setFormErrors({})
    setTouched({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (uid: string, displayName: string) => {
    if (!confirm(`¿Estás seguro de eliminar a ${displayName}?`)) return

    try {
      await deleteProgrammer(uid)
      setMessage(`✓ ${displayName} eliminado correctamente.`)
      await loadProgrammers()
    } catch (err) {
      setError('No se pudo eliminar el programador.')
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(initialForm)
    setSkills(['JavaScript', 'React'])
    setNewSkill('')
    setPhotoFile(null)
    setPhotoPreview('')
    setFormErrors({})
    setTouched({})
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Programadores</h1>
          <p className="text-base-content/70">
            Crea o edita perfiles y asigna el rol de programador.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-md">
          <div className="card-body space-y-3">
            <h2 className="card-title">{editingId ? 'Editar programador' : 'Nuevo programador'}</h2>
            {message && <div className="alert alert-success text-sm">{message}</div>}
            {error && <div className="alert alert-error text-sm">{error}</div>}

            <div className="form-control">
              <label className="label">
                <span className="label-text">Foto de perfil</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-base-300">
                        <span className="text-3xl">👤</span>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="file-input file-input-bordered file-input-sm w-full max-w-xs"
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Nombre *</span>
              </label>
              <input
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                onBlur={() => handleBlur('displayName')}
                className={`input input-bordered ${touched.displayName && formErrors.displayName ? 'input-error' : ''}`}
              />
              {touched.displayName && formErrors.displayName && (
                <label className="label">
                  <span className="label-text-alt text-error">{formErrors.displayName}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Correo *</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={() => handleBlur('email')}
                className={`input input-bordered ${touched.email && formErrors.email ? 'input-error' : ''}`}
              />
              {touched.email && formErrors.email && (
                <label className="label">
                  <span className="label-text-alt text-error">{formErrors.email}</span>
                </label>
              )}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Especialidad *</span>
              </label>
              <input
                name="specialty"
                value={form.specialty}
                onChange={handleChange}
                onBlur={() => handleBlur('specialty')}
                className={`input input-bordered ${touched.specialty && formErrors.specialty ? 'input-error' : ''}`}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Bio</span>
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                onBlur={() => handleBlur('bio')}
                className={`textarea textarea-bordered ${touched.bio && formErrors.bio ? 'textarea-error' : ''}`}
                rows={3}
              />
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Disponible para asesorías</span>
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={(e) => {
                    const isAvailable = e.target.checked
                    setForm((prev) => ({ ...prev, available: isAvailable }))
                    setTimes(isAvailable ? times : [])
                  }}
                  className="toggle toggle-primary"
                />
              </label>
            </div>

            {form.available && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Horarios de disponibilidad *</span>
                  <span className="label-text-alt">Ej: "Lunes 09:00 - 12:00"</span>
                </label>

                <div className="flex flex-wrap gap-2 mb-3">
                  {times.map((time, index) => (
                    <div key={index} className="badge badge-secondary gap-2 p-3">
                      {time}
                      <button
                        type="button"
                        onClick={() => setTimes(times.filter((_, i) => i !== index))}
                        className="btn btn-ghost btn-xs btn-circle text-white"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-end gap-2 bg-base-200 p-3 rounded-lg border border-base-300">
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
                        alert('La hora de fin debe ser posterior a la de inicio')
                        return
                      }
                      const newSlot = `${selectedDay} ${startTime} - ${endTime}`
                      if (!times.includes(newSlot)) {
                        setTimes([...times, newSlot])
                      }
                    }}
                    className="btn btn-accent btn-sm"
                  >
                    <FiPlus /> Agregar
                  </button>
                </div>
              </div>
            )}

            <div className="divider">Habilidades / Skills</div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Habilidades técnicas *</span>
              </label>
              <div className="join mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      onAddSkill()
                    }
                  }}
                  className="input input-bordered join-item flex-1"
                  placeholder="Agregar habilidad"
                />
                <button
                  type="button"
                  onClick={onAddSkill}
                  className="btn btn-primary join-item"
                >
                  <FiPlus /> Agregar
                </button>
              </div>
              <div className="space-y-2">
                {skills.map((skill, index) => (
                  <div key={index} className="join w-full">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...skills]
                        newSkills[index] = e.target.value
                        setSkills(newSkills)
                      }}
                      className="input input-bordered join-item flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => onDeleteSkill(index)}
                      className="btn btn-error join-item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
                {skills.length < 2 && (
                  <div className="alert alert-warning text-sm">
                    Debe agregar al menos 2 habilidades
                  </div>
                )}
              </div>
            </div>

            <div className="divider">Redes Sociales</div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">GitHub</span>
              </label>
              <input
                name="github"
                value={form.github}
                onChange={handleChange}
                onBlur={() => handleBlur('github')}
                className="input input-bordered"
                placeholder="https://github.com/usuario"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Instagram</span>
              </label>
              <input
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                onBlur={() => handleBlur('instagram')}
                className="input input-bordered"
                placeholder="https://instagram.com/usuario"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">WhatsApp</span>
              </label>
              <input
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                onBlur={() => handleBlur('whatsapp')}
                className="input input-bordered"
                placeholder="https://wa.me/593999999999"
              />
            </div>

            <div className="card-actions justify-end gap-2">
              {editingId && (
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={handleCancelEdit}
                >
                  Cancelar
                </button>
              )}
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading ? 'Guardando...' : editingId ? 'Actualizar' : 'Guardar programador'}
              </button>
            </div>
          </div>
        </form>

        <div className="card bg-base-100 shadow-md">
          <div className="card-body space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="card-title">Listado</h2>
              <span className="badge badge-secondary">{programmers.length}</span>
            </div>
            <div className="space-y-2">
              {programmers.map((dev) => (
                <div key={dev.id} className="flex flex-col rounded-lg border border-base-200 p-3">
                  <div className="flex items-start gap-3">
                    <div className="avatar">
                      <div className="w-12 rounded-full">
                        {dev.photoURL ? (
                          <img src={dev.photoURL} alt={dev.displayName} />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-base-300">
                            <span className="text-lg">👤</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">{dev.displayName}</p>
                        <span className="badge badge-outline capitalize">
                          {dev.specialty || 'Especialidad'}
                        </span>
                      </div>
                      <p className="text-xs text-base-content/60">{dev.email}</p>
                      <p className="text-sm text-base-content/70">{dev.bio}</p>

                      {/* este es un comentario ejemplo */}
                      {dev.socials && (
                        <div className="flex gap-2 mt-2">
                          {dev.socials.github && (
                            <a href={dev.socials.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-focus">
                              <FiGithub />
                            </a>
                          )}
                          {dev.socials.instagram && (
                            <a href={dev.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-secondary hover:text-secondary-focus">
                              <FiInstagram />
                            </a>
                          )}
                          {dev.socials.whatsapp && (
                            <a href={dev.socials.whatsapp} target="_blank" rel="noopener noreferrer" className="text-success hover:text-success-focus">
                              <FaWhatsapp />
                            </a>
                          )}
                        </div>
                      )}

                      {dev.skills && dev.skills.length > 0 && (
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {dev.skills.map((skill, idx) => (
                              <span key={idx} className="badge badge-primary badge-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(dev)}
                          className="btn btn-sm btn-primary gap-2"
                        >
                          <FiEdit2 className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(dev.id!, dev.displayName)}
                          className="btn btn-sm btn-error gap-2"
                        >
                          <FiTrash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!programmers.length && (
                <div className="alert alert-info text-sm">
                  Aún no hay programadores. Crea uno con el formulario.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgrammersPage
