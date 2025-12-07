/**
 * Gestión de programadores (Admin).
 * Prácticas: Formularios controlados con validación completa y arrays dinámicos, consumo Firestore, feedback DaisyUI.
 */
import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { listProgrammers, upsertProgrammer, deleteProgrammer } from '../../services/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '../../services/firebase'
import type { DocumentData } from 'firebase/firestore'
import { FormUtils } from '../../utils/FormUtils'
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi'

// Datos base para el formulario de alta/edición
const initialForm = {
  displayName: '',
  email: '',
  specialty: '',
  bio: '',
  role: 'programmer',
  photoURL: '',
  github: '',
  instagram: '',
  whatsapp: '',
}

const ProgrammersPage = () => {
  const [form, setForm] = useState(initialForm)
  const [programmers, setProgrammers] = useState<(DocumentData & { id: string })[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})
  const [editingId, setEditingId] = useState<string | null>(null)

  // Arrays dinámicos para habilidades
  const [skills, setSkills] = useState<string[]>(['JavaScript', 'React'])
  const [newSkill, setNewSkill] = useState('')

  // Reglas de validación
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

  const loadProgrammers = async () => {
    const data = await listProgrammers()
    setProgrammers(data)
  }
  useEffect(() => {
    loadProgrammers()
  }, [])

  // Agregar habilidad dinámicamente
  const onAddSkill = () => {
    if (!newSkill.trim() || newSkill.length < 2) return
    setSkills([...skills, newSkill.trim()])
    setNewSkill('')
  }

  // Eliminar habilidad
  const onDeleteSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index))
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    
    // Validar el campo en tiempo real si ya fue tocado
    if (touched[name]) {
      const fieldRules = validationRules[name as keyof typeof validationRules]
      if (fieldRules) {
        const error = FormUtils.validate(value, fieldRules)
        setFormErrors(prev => ({
          ...prev,
          [name]: error || ''
        }))
      }
    }
  }

  const handleBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    
    // Validar al perder el foco
    const fieldRules = validationRules[fieldName as keyof typeof validationRules]
    if (fieldRules) {
      const error = FormUtils.validate(form[fieldName as keyof typeof form], fieldRules)
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: error || ''
      }))
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

  const uploadPhoto = async (uid: string, file: File): Promise<string> => {
    const storageRef = ref(storage, `programmers/${uid}/profile.jpg`)
    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
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
    
    // Validar arrays dinámicos
    if (skills.length < 2) {
      errors['skills'] = 'Debe tener al menos 2 habilidades'
    }
    
    // Si hay errores, no enviar
    if (FormUtils.hasErrors(errors)) {
      setError('Por favor corrige los errores en el formulario.')
      return
    }
    
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      // Generar UID automático si es nuevo, o usar el existente si es edición
      const uid = editingId || `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      let photoURL = form.photoURL

      // Si hay una nueva foto, subirla a Firebase Storage
      if (photoFile) {
        photoURL = await uploadPhoto(uid, photoFile)
      }

      await upsertProgrammer(uid, {
        displayName: form.displayName,
        email: form.email,
        specialty: form.specialty,
        bio: form.bio,
        role: 'programmer',
        photoURL,
        skills: skills,
        socials: {
          github: form.github || undefined,
          instagram: form.instagram || undefined,
          whatsapp: form.whatsapp || undefined,
        },
      })
      setMessage(editingId ? '✓ Programador actualizado correctamente.' : '✓ Programador guardado correctamente.')
      setForm(initialForm)
      setSkills(['JavaScript', 'React'])
      setNewSkill('')
      setPhotoFile(null)
      setPhotoPreview('')
      setFormErrors({})
      setTouched({})
      setEditingId(null)
      await loadProgrammers()
    } catch (err) {
      setError('No se pudo guardar. Verifica permisos y conexión.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (dev: DocumentData & { id: string }) => {
    setEditingId(dev.id)
    setForm({
      displayName: dev.displayName || '',
      email: dev.email || '',
      specialty: dev.specialty || '',
      bio: dev.bio || '',
      role: 'programmer',
      photoURL: dev.photoURL || '',
      github: dev.socials?.github || '',
      instagram: dev.socials?.instagram || '',
      whatsapp: dev.socials?.whatsapp || '',
    })
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
                    {photoPreview || form.photoURL ? (
                      <img src={photoPreview || form.photoURL} alt="Preview" />
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
              {touched.specialty && formErrors.specialty && (
                <label className="label">
                  <span className="label-text-alt text-error">{formErrors.specialty}</span>
                </label>
              )}
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
              {touched.bio && formErrors.bio && (
                <label className="label">
                  <span className="label-text-alt text-error">{formErrors.bio}</span>
                </label>
              )}
            </div>

            {/* FORMULARIOS DINÁMICOS - Habilidades */}
            <div className="divider">Habilidades / Skills</div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Habilidades técnicas *</span>
              </label>
              
              {/* Input para agregar nueva habilidad */}
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
                  placeholder="Agregar habilidad (ej: TypeScript, Node.js)"
                />
                <button
                  type="button"
                  onClick={onAddSkill}
                  className="btn btn-primary join-item"
                >
                  <FiPlus /> Agregar
                </button>
              </div>

              {/* Lista dinámica de habilidades */}
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
                      <FiTrash2 /> Eliminar
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
                className={`input input-bordered ${touched.github && formErrors.github ? 'input-error' : ''}`}
                placeholder="https://github.com/usuario"
              />
              {touched.github && formErrors.github && (
                <label className="label">
                  <span className="label-text-alt text-error">{formErrors.github}</span>
                </label>
              )}
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
                className={`input input-bordered ${touched.instagram && formErrors.instagram ? 'input-error' : ''}`}
                placeholder="https://instagram.com/usuario"
              />
              {touched.instagram && formErrors.instagram && (
                <label className="label">
                  <span className="label-text-alt text-error">{formErrors.instagram}</span>
                </label>
              )}
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
                className={`input input-bordered ${touched.whatsapp && formErrors.whatsapp ? 'input-error' : ''}`}
                placeholder="https://wa.me/593988888888"
              />
              {touched.whatsapp && formErrors.whatsapp && (
                <label className="label">
                  <span className="label-text-alt text-error">{formErrors.whatsapp}</span>
                </label>
              )}
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
                      
                      {/* Habilidades */}
                      {dev.skills && dev.skills.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs font-semibold text-base-content/70 mb-1">Habilidades:</p>
                          <div className="flex flex-wrap gap-1">
                            {dev.skills.map((skill: string, idx: number) => (
                              <span key={idx} className="badge badge-primary badge-sm">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {dev.socials && (
                        <div className="mt-2 flex gap-2">
                          {dev.socials.github && (
                            <a 
                              href={dev.socials.github} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="badge badge-ghost badge-sm"
                            >
                              GitHub
                            </a>
                          )}
                          {dev.socials.instagram && (
                            <a 
                              href={dev.socials.instagram} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="badge badge-ghost badge-sm"
                            >
                              Instagram
                            </a>
                          )}
                          {dev.socials.whatsapp && (
                            <a 
                              href={dev.socials.whatsapp} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="badge badge-ghost badge-sm"
                            >
                              WhatsApp
                            </a>
                          )}
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleEdit(dev)}
                          className="btn btn-sm btn-primary gap-2"
                        >
                          <FiEdit2 className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(dev.id, dev.displayName)}
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
