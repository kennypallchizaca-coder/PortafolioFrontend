/**
 * Página de gestión de proyectos del programador.
 * Heurísticas aplicadas: #5 Prevención de errores, #9 Mensajes claros
 */
import { useEffect, useState, useCallback, ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getProjectsByOwner,
  createProject,
  updateProject,
  type Project,
} from '../../services/projects'
import { uploadProjectImage } from '../../services/upload'
import { FormUtils } from '../../utils/FormUtils'
import { validationMessages, crudMessages, getErrorMessage } from '../../utils/errorMessages'
import FormInput from '../../components/FormInput'
import FormTextarea from '../../components/FormTextarea'
import { FiImage } from 'react-icons/fi'

const emptyProject = {
  title: '',
  description: '',
  category: 'academico' as 'academico' | 'laboral',
  role: 'frontend' as 'frontend' | 'backend' | 'fullstack' | 'db',
  techStack: '',
  repoUrl: '',
  demoUrl: '',
  imageUrl: '',
}

const ProjectsPage = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [form, setForm] = useState(emptyProject)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  // Reglas de validación
  const validationRules = {
    title: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.minLength(val, 3),
      (val: string) => FormUtils.maxLength(val, 100),
    ],
    description: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.minLength(val, 10),
      (val: string) => FormUtils.maxLength(val, 500),
    ],
    repoUrl: [(val: string) => val && FormUtils.url(val)],
    demoUrl: [(val: string) => val && FormUtils.url(val)],
  }

  const loadProjects = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await getProjectsByOwner(user.id)
      setProjects(data)
    } catch (error) {
      console.error('Error al cargar proyectos:', error)
      setError(crudMessages.projectLoadError)
      setProjects([])
    }
  }, [user?.id])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Validar en tiempo real si ya fue tocado
    if (touched[name]) {
      const fieldRules = validationRules[name as keyof typeof validationRules]
      if (fieldRules) {
        const error = FormUtils.validate(value, fieldRules)
        setFormErrors((prev) => ({ ...prev, [name]: error || '' }))
      }
    }
  }

  const handleBlur = (fieldName: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))

    const fieldRules = validationRules[fieldName as keyof typeof validationRules]
    if (fieldRules) {
      const error = FormUtils.validate(
        form[fieldName as keyof typeof form],
        fieldRules
      )
      setFormErrors((prev) => ({ ...prev, [fieldName]: error || '' }))
    }
  }

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')
    if (!user?.id) return

    // Marcar todos como tocados
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as { [key: string]: boolean })
    setTouched(allTouched)

    // Validar formulario
    const errors = FormUtils.validateForm(form, validationRules)
    setFormErrors(errors)

    if (FormUtils.hasErrors(errors)) {
      setError(validationMessages.formHasErrors)
      setLoading(false)
      return
    }

    try {
      if (!user?.id) throw new Error('Usuario no autenticado')

      let imageUrl = form.imageUrl

      // Subir imagen si hay una seleccionada
      if (imageFile) {
        const uploadResult = await uploadProjectImage(
          imageFile,
          editingId || 'temp'
        )
        imageUrl = uploadResult.url
      }

      const payload = {
        ownerId: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        role: form.role,
        techStack: form.techStack
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        repoUrl: form.repoUrl || undefined,
        demoUrl: form.demoUrl || undefined,
        imageUrl,
      }

      if (editingId) {
        // Actualizar proyecto existente
        await updateProject(editingId, payload)
        setMessage(crudMessages.projectUpdated)
      } else {
        // Crear nuevo proyecto
        await createProject(payload)
        setMessage(crudMessages.projectCreated)
      }

      setForm(emptyProject)
      setEditingId(null)
      setImageFile(null)
      setImagePreview('')
      setFormErrors({})
      setTouched({})
      await loadProjects()
    } catch (err) {
      console.error('Error al guardar proyecto:', err)
      setError(crudMessages.projectSaveError)
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (p: Project) => {
    setEditingId(p.id!)
    setForm({
      title: p.title,
      description: p.description || '',
      category: p.category,
      role: p.role,
      techStack: p.techStack?.join(', ') || '',
      repoUrl: p.repoUrl || '',
      demoUrl: p.demoUrl || '',
      imageUrl: p.imageUrl || '',
    })
    setImagePreview(p.imageUrl || '')
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Proyectos</h1>
      <div className="grid gap-4 lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="card bg-base-100 shadow-md">
          <div className="card-body space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="card-title">
                {editingId ? 'Editar proyecto' : 'Nuevo proyecto'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-ghost btn-xs"
                  onClick={() => {
                    setEditingId(null)
                    setForm(emptyProject)
                    setImagePreview('')
                    setImageFile(null)
                    setFormErrors({})
                    setTouched({})
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
            {message && <div className="alert alert-success text-sm">{message}</div>}
            {error && <div className="alert alert-error text-sm">{error}</div>}
            <FormInput
              label="Título del proyecto"
              name="title"
              value={form.title}
              onChange={handleChange}
              onBlur={() => handleBlur('title')}
              error={formErrors.title}
              touched={touched.title}
              required
              placeholder="Nombre del proyecto"
              maxLength={100}
            />

            <FormTextarea
              label="Descripción"
              name="description"
              value={form.description}
              onChange={handleChange}
              onBlur={() => handleBlur('description')}
              error={formErrors.description}
              touched={touched.description}
              required
              placeholder="Describe el proyecto, qué hace, tecnologías usadas, tu rol..."
              rows={4}
              minLength={10}
              maxLength={500}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Categoría</span>
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="select select-bordered"
                >
                  <option value="academico">Académico</option>
                  <option value="laboral">Laboral</option>
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Rol</span>
                </label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="select select-bordered"
                >
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="fullstack">Fullstack</option>
                  <option value="db">Base de datos</option>
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Tecnologías (separadas por coma)</span>
              </label>
              <input
                name="techStack"
                value={form.techStack}
                onChange={handleChange}
                className="input input-bordered"
                placeholder="React, Node.js, MongoDB"
              />
            </div>

            {/* Imagen del proyecto */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Imagen del proyecto</span>
              </label>
              <div className="flex flex-col gap-2">
                {imagePreview && (
                  <div className="avatar">
                    <div className="w-32 rounded">
                      <img src={imagePreview} alt="Preview" />
                    </div>
                  </div>
                )}
                <label className="btn btn-outline btn-sm gap-2 w-fit">
                  <FiImage />
                  Seleccionar imagen
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="GitHub Repository"
                name="repoUrl"
                type="url"
                value={form.repoUrl}
                onChange={handleChange}
                onBlur={() => handleBlur('repoUrl')}
                error={formErrors.repoUrl}
                touched={touched.repoUrl}
                placeholder="https://github.com/..."
                helpText="URL del repositorio (opcional)"
              />

              <FormInput
                label="Demo/Live URL"
                name="demoUrl"
                type="url"
                value={form.demoUrl}
                onChange={handleChange}
                onBlur={() => handleBlur('demoUrl')}
                error={formErrors.demoUrl}
                touched={touched.demoUrl}
                placeholder="https://..."
                helpText="URL del proyecto desplegado (opcional)"
              />
            </div>
            <div className="card-actions justify-end">
              <button className="btn btn-primary" type="submit" disabled={loading}>
                {loading
                  ? 'Guardando...'
                  : editingId
                    ? 'Actualizar proyecto'
                    : 'Crear proyecto'}
              </button>
            </div>
          </div>
        </form>

        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="card bg-base-100 shadow-sm">
              <div className="card-body space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-xs text-base-content/60">
                      {p.category} · {p.role}
                    </p>
                  </div>
                  <button className="btn btn-ghost btn-xs" onClick={() => startEdit(p)}>
                    Editar
                  </button>
                </div>
                <p className="text-sm text-base-content/70">{p.description}</p>
                <div className="flex flex-wrap gap-2">
                  {p.techStack?.map((t: string) => (
                    <span key={t} className="badge badge-ghost">
                      {t}
                    </span>
                  ))}
                </div>
                <div className="card-actions justify-end">
                  {p.repoUrl && (
                    <a
                      className="btn btn-outline btn-xs"
                      href={p.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Código
                    </a>
                  )}
                  {p.demoUrl && (
                    <a
                      className="btn btn-primary btn-xs"
                      href={p.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {!projects.length && (
            <div className="alert alert-info text-sm">Aún no hay proyectos.</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectsPage
