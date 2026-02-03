/**
 * Panel de administración de proyectos con formularios dinámicos
 * Práctica: FormArray en React - agregar/eliminar tecnologías y miembros del equipo
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiGithub, FiImage, FiSave, FiX, FiDownload } from 'react-icons/fi'
import { getAllProjects, createProject, updateProject, deleteProject, downloadUserProjectsReport, type Project } from '../../services/projects'
import { uploadProjectImage } from '../../services/upload'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { FormUtils } from '../../utils/FormUtils'

const ProjectsAdmin = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  // Arrays dinámicos
  const [technologies, setTechnologies] = useState<string[]>(['React'])
  const [teamMembers, setTeamMembers] = useState<string[]>(['Team Member'])

  // Controles temporales para agregar nuevos elementos
  const [newTechnology, setNewTechnology] = useState('')
  const [newTeamMember, setNewTeamMember] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    githubUrl: '',
    demoUrl: '',
    category: 'academico' as 'academico' | 'laboral',
  })

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({})

  // Reglas de validación
  const validationRules = {
    title: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.minLength(val, 3)
    ],
    description: [
      (val: string) => FormUtils.required(val),
      (val: string) => FormUtils.minLength(val, 10)
    ],
    githubUrl: [
      (val: string) => val && FormUtils.url(val)
    ],
    demoUrl: [
      (val: string) => val && FormUtils.url(val)
    ],
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const projectsData = await getAllProjects()
      setProjects(projectsData.sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      ))
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  // Agregar tecnología dinámicamente
  const onAddTechnology = () => {
    if (!newTechnology.trim() || newTechnology.length < 2) return
    setTechnologies([...technologies, newTechnology.trim()])
    setNewTechnology('')
  }

  // Eliminar tecnología
  const onDeleteTechnology = (index: number) => {
    setTechnologies(technologies.filter((_, i) => i !== index))
  }

  // Agregar miembro del equipo dinámicamente
  const onAddTeamMember = () => {
    if (!newTeamMember.trim() || newTeamMember.length < 3) return
    setTeamMembers([...teamMembers, newTeamMember.trim()])
    setNewTeamMember('')
  }

  // Eliminar miembro del equipo
  const onDeleteTeamMember = (index: number) => {
    setTeamMembers(teamMembers.filter((_, i) => i !== index))
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))

    // Validar en tiempo real si ya fue tocado
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
      const error = FormUtils.validate(formData[fieldName as keyof typeof formData], fieldRules)
      setFormErrors(prev => ({ ...prev, [fieldName]: error || '' }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Marcar todos los campos como tocados
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as { [key: string]: boolean })
    setTouched(allTouched)

    // Validar formulario
    const errors = FormUtils.validateForm(formData, validationRules)
    setFormErrors(errors)

    // Validar arrays dinámicos
    if (technologies.length < 1) {
      errors['technologies'] = 'Debe tener al menos 1 tecnología'
    }
    if (teamMembers.length < 1) {
      errors['teamMembers'] = 'Debe tener al menos 1 miembro del equipo'
    }

    if (FormUtils.hasErrors(errors)) {
      alert('Por favor corrige los errores en el formulario.')
      return
    }

    setLoading(true)

    try {
      let imageUrl = formData.imageUrl

      // Subir imagen si hay una nueva
      if (imageFile) {
        const uploadResult = await uploadProjectImage(imageFile, editingId || 'temp')
        imageUrl = uploadResult.url
      }

      const projectData = {
        ownerId: user?.id || 'admin',
        title: formData.title,
        description: formData.description,
        imageUrl,
        repoUrl: formData.githubUrl,
        demoUrl: formData.demoUrl || undefined,
        techStack: technologies,
        category: formData.category,
        role: 'fullstack' as const,
      }

      if (editingId) {
        await updateProject(editingId, projectData)
      } else {
        await createProject(projectData)
      }

      alert('✓ Proyecto guardado correctamente.')
      resetForm()
      await fetchProjects()
    } catch (error: any) {
      console.error('❌ Error completo al guardar proyecto:', error)
      alert(`Error al guardar: ${error.message || 'Error al conectar con el servidor'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description || '',
      imageUrl: project.imageUrl || '',
      githubUrl: project.repoUrl || '',
      demoUrl: project.demoUrl || '',
      category: project.category || 'academico',
    })
    setTechnologies(project.techStack || [])
    setTeamMembers(['Team Member']) // No tenemos teamMembers en el modelo
    setEditingId(project.id!)
    setShowForm(true)
    setImagePreview(project.imageUrl || '')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return

    try {
      await deleteProject(id)
      fetchProjects()
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error al eliminar el proyecto')
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      githubUrl: '',
      demoUrl: '',
      category: 'academico',
    })
    setTechnologies(['React'])
    setTeamMembers(['Team Member'])
    setNewTechnology('')
    setNewTeamMember('')
    setImageFile(null)
    setImagePreview('')
    setEditingId(null)
    setShowForm(false)
    setFormErrors({})
    setTouched({})
  }

  const handleDownloadReport = async () => {
    if (!user?.id) return
    try {
      const blob = await downloadUserProjectsReport(user.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'mis_proyectos.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading report:', error)
      alert("Error al descargar el reporte.")
    }
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold">Administrar Proyectos</h1>
            <p className="text-base-content/70">Gestiona los proyectos del equipo</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadReport}
              className="btn btn-outline gap-2"
              title="Descargar Reporte PDF"
            >
              <FiDownload className="h-5 w-5" />
              Reporte
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary gap-2"
            >

              {showForm ? (
                <>
                  <FiX className="h-5 w-5" />
                  Cancelar
                </>
              ) : (
                <>
                  <FiPlus className="h-5 w-5" />
                  Nuevo Proyecto
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Formulario */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="card bg-base-100 shadow-xl mb-8"
          >
            <div className="card-body">
              <h2 className="card-title">
                {editingId ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Título *</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      onBlur={() => handleBlur('title')}
                      className="input input-bordered"
                      required
                    />
                    {formErrors.title && touched.title && (
                      <label className="label">
                        <span className="label-text-alt text-error">{formErrors.title}</span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">URL de GitHub *</span>
                    </label>
                    <div className="join w-full">
                      <span className="join-item btn btn-disabled">
                        <FiGithub className="h-5 w-5" />
                      </span>
                      <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleChange}
                        onBlur={() => handleBlur('githubUrl')}
                        className="input input-bordered join-item w-full"
                        placeholder="https://github.com/..."
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Descripción *</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    onBlur={() => handleBlur('description')}
                    className="textarea textarea-bordered h-24"
                    required
                  />
                </div>

                {/* Campo de categoría */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Categoría del Proyecto *</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as 'academico' | 'laboral' })}
                    className="select select-bordered"
                    required
                  >
                    <option value="academico">Académico</option>
                    <option value="laboral">Laboral</option>
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Imagen del Proyecto</span>
                    </label>
                    <div className="space-y-2">
                      {(imagePreview || formData.imageUrl) && (
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-base-300">
                          <img
                            src={imagePreview || formData.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="file-input file-input-bordered w-full"
                      />
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">URL Demo (opcional)</span>
                    </label>
                    <input
                      type="url"
                      name="demoUrl"
                      value={formData.demoUrl}
                      onChange={handleChange}
                      className="input input-bordered"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* FORMULARIOS DINÁMICOS - Tecnologías */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Tecnologías *</span>
                  </label>

                  {/* Input para agregar nueva tecnología */}
                  <div className="join mb-3">
                    <input
                      type="text"
                      value={newTechnology}
                      onChange={(e) => setNewTechnology(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          onAddTechnology()
                        }
                      }}
                      className="input input-bordered join-item flex-1"
                      placeholder="Agregar tecnología (ej: React, Node.js)"
                    />
                    <button
                      type="button"
                      onClick={onAddTechnology}
                      className="btn btn-primary join-item"
                    >
                      <FiPlus /> Agregar
                    </button>
                  </div>

                  {/* Lista dinámica de tecnologías */}
                  <div className="space-y-2">
                    {technologies.map((tech, index) => (
                      <div key={index} className="join w-full">
                        <input
                          type="text"
                          value={tech}
                          onChange={(e) => {
                            const newTechs = [...technologies]
                            newTechs[index] = e.target.value
                            setTechnologies(newTechs)
                          }}
                          className="input input-bordered join-item flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => onDeleteTechnology(index)}
                          className="btn btn-error join-item"
                        >
                          <FiTrash2 /> Eliminar
                        </button>
                      </div>
                    ))}
                    {technologies.length === 0 && (
                      <div className="alert alert-warning">
                        Debe agregar al menos 1 tecnología
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions justify-end">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn btn-ghost"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="loading loading-spinner"></span>
                    ) : (
                      <>
                        <FiSave className="h-5 w-5" />
                        {editingId ? 'Actualizar' : 'Guardar'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Lista de proyectos */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, idx) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="card bg-base-100 shadow-xl"
            >
              <figure className="h-48 bg-base-200">
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <FiImage className="h-16 w-16 text-base-content/30" />
                  </div>
                )}
              </figure>
              <div className="card-body">
                <h2 className="card-title">{project.title}</h2>
                <p className="text-sm text-base-content/70 line-clamp-2">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(project.techStack || []).slice(0, 3).map((tech, i) => (
                    <span key={i} className="badge badge-sm badge-primary badge-outline">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="card-actions justify-end mt-4">
                  <button
                    onClick={() => handleEdit(project)}
                    className="btn btn-sm btn-ghost gap-2"
                  >
                    <FiEdit2 className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(project.id!)}
                    className="btn btn-sm btn-error gap-2"
                  >
                    <FiTrash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-base-content/70">No hay proyectos todavía</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectsAdmin
