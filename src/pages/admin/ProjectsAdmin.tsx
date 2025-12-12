/**
 * Panel de administración de proyectos con formularios dinámicos
 * Práctica: FormArray en React - agregar/eliminar tecnologías y miembros del equipo
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiEdit2, FiTrash2, FiGithub, FiImage, FiSave, FiX, FiUpload } from 'react-icons/fi'
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import { Navigate } from 'react-router-dom'
import { FormUtils } from '../../utils/FormUtils'

interface Project {
  id: string
  title: string
  description: string
  imageUrl: string
  githubUrl: string
  demoUrl?: string
  technologies: string[]
  teamMembers: string[]
  category: 'academico' | 'laboral'
  createdAt: Date
}

const ProjectsAdmin = () => {
  const { user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')

  // Arrays dinámicos
  const [technologies, setTechnologies] = useState<string[]>(['React', 'Firebase'])
  const [teamMembers, setTeamMembers] = useState<string[]>(['Alexis'])
  
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
      const querySnapshot = await getDocs(collection(db, 'projects'))
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Project[]
      setProjects(projectsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
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

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const timestamp = Date.now()
      const storageRef = ref(storage, `projects/${timestamp}_${file.name}`)
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      return url
    } catch (error: any) {
      console.error('❌ Error al subir imagen:', error)
      console.error('Código de error:', error.code)
      console.error('Mensaje:', error.message)
      
      if (error.code === 'storage/unauthorized') {
        throw new Error('⚠️ REGLAS DE STORAGE NO APLICADAS. Ve a Firebase Console > Storage > Rules y aplica las reglas.')
      }
      throw new Error(`No se pudo subir la imagen: ${error.message}`)
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

      // Guardar imagen en localStorage si hay una nueva
      if (imageFile) {
        const reader = new FileReader()
        imageUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = reader.result as string
            const imageId = editingId || `proj_${Date.now()}`
            localStorage.setItem(`project_img_${imageId}`, base64)
            resolve(base64)
          }
          reader.readAsDataURL(imageFile)
        })
      }

      const projectData: any = {
        title: formData.title,
        description: formData.description,
        imageUrl,
        githubUrl: formData.githubUrl,
        technologies: technologies,
        teamMembers: teamMembers,
        category: formData.category,
        createdAt: Timestamp.now()
      }

      // Solo agregar demoUrl si tiene valor
      if (formData.demoUrl && formData.demoUrl.trim() !== '') {
        projectData.demoUrl = formData.demoUrl
      }

      if (editingId) {
        console.log('Actualizando proyecto:', editingId, projectData)
        await updateDoc(doc(db, 'projects', editingId), projectData)
        console.log('✓ Proyecto actualizado exitosamente')
      } else {
        console.log('Creando nuevo proyecto:', projectData)
        const docRef = await addDoc(collection(db, 'projects'), projectData)
        console.log('✓ Proyecto creado con ID:', docRef.id)
      }

      alert('✓ Proyecto guardado correctamente.')
      resetForm()
      await fetchProjects()
    } catch (error: any) {
      console.error('❌ Error completo al guardar proyecto:', error)
      alert(`Error al guardar: ${error.message || 'Verifica permisos de Firebase'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (project: Project) => {
    setFormData({
      title: project.title,
      description: project.description,
      imageUrl: project.imageUrl,
      githubUrl: project.githubUrl,
      demoUrl: project.demoUrl || '',
      category: project.category || 'academico',
    })
    setTechnologies(project.technologies || [])
    setTeamMembers(project.teamMembers || [])
    setEditingId(project.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proyecto?')) return

    try {
      await deleteDoc(doc(db, 'projects', id))
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
    setTechnologies(['React', 'Firebase'])
    setTeamMembers(['Alexis'])
    setNewTechnology('')
    setNewTeamMember('')
    setImageFile(null)
    setImagePreview('')
    setEditingId(null)
    setShowForm(false)
    setFormErrors({})
    setTouched({})
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
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input input-bordered"
                      required
                    />
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
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
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
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                      <span className="label-text">Imagen del Proyecto *</span>
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
                      <div className="divider text-xs">O</div>
                      <div className="join w-full">
                        <span className="join-item btn btn-disabled">
                          <FiImage className="h-5 w-5" />
                        </span>
                        <input
                          type="url"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="input input-bordered join-item w-full"
                          placeholder="O pega una URL de imagen"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">URL Demo (opcional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.demoUrl}
                      onChange={(e) => setFormData({ ...formData, demoUrl: e.target.value })}
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
                    {(technologies || []).map((tech, index) => (
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

                {/* FORMULARIOS DINÁMICOS - Miembros del equipo */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Miembros del Equipo *</span>
                  </label>
                  
                  {/* Input para agregar nuevo miembro */}
                  <div className="join mb-3">
                    <input
                      type="text"
                      value={newTeamMember}
                      onChange={(e) => setNewTeamMember(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          onAddTeamMember()
                        }
                      }}
                      className="input input-bordered join-item flex-1"
                      placeholder="Agregar miembro del equipo"
                    />
                    <button
                      type="button"
                      onClick={onAddTeamMember}
                      className="btn btn-primary join-item"
                    >
                      <FiPlus /> Agregar
                    </button>
                  </div>

                  {/* Lista dinámica de miembros */}
                  <div className="space-y-2">
                    {(teamMembers || []).map((member, index) => (
                      <div key={index} className="join w-full">
                        <input
                          type="text"
                          value={member}
                          onChange={(e) => {
                            const newMembers = [...teamMembers]
                            newMembers[index] = e.target.value
                            setTeamMembers(newMembers)
                          }}
                          className="input input-bordered join-item flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => onDeleteTeamMember(index)}
                          className="btn btn-error join-item"
                        >
                          <FiTrash2 /> Eliminar
                        </button>
                      </div>
                    ))}
                    {teamMembers.length === 0 && (
                      <div className="alert alert-warning">
                        Debe agregar al menos 1 miembro del equipo
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
                  {(project.technologies || []).slice(0, 3).map((tech, i) => (
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
                    onClick={() => handleDelete(project.id)}
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
