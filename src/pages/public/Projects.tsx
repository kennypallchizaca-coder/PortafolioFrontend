/**
 * Página pública de proyectos del equipo
 */
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiGithub, FiExternalLink, FiCode } from 'react-icons/fi'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../services/firebase'
import LocalImage from '../../components/LocalImage'
import projectImg1 from '../../img/project-img1.png'
import projectImg2 from '../../img/project-img2.png'
import projectImg3 from '../../img/project-img3.png'

interface Project {
  id: string
  title: string
  description: string
  imageUrl: string
  projectUrl?: string
  demoUrl?: string
  githubUrl?: string
  repoUrl?: string
  technologies?: string[]
  techStack?: string[]
  teamMembers?: string[]
  createdAt: Date
  isStatic?: boolean
  category?: 'academico' | 'laboral'
  programmerName?: string
}

// Proyectos estáticos del equipo
const staticProjects: Project[] = [
  {
    id: 'project-1',
    title: 'Sistema de Gestión',
    description: 'Plataforma completa para la gestión de recursos empresariales con módulos de inventario.',
    imageUrl: projectImg1,
    projectUrl: 'https://lexisware.com/demo1',
    githubUrl: 'https://github.com/lexisware/gestion-empresarial',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
    teamMembers: ['Alexis', 'Daniel'],
    createdAt: new Date('2024-01-15'),
    isStatic: true,
    category: 'laboral'
  },
  {
    id: 'project-2',
    title: 'E-Commerce Moderno',
    description: 'Tienda online con carrito de compras, pasarela de pagos integrada y panel de administración para gestión de productos.',
    imageUrl: projectImg2,
    projectUrl: 'https://lexisware.com/demo2',
    githubUrl: 'https://github.com/lexisware/ecommerce',
    technologies: ['Next.js', 'Stripe', 'MongoDB', 'TailwindCSS'],
    teamMembers: ['Alexis'],
    createdAt: new Date('2024-03-20'),
    isStatic: true,
    category: 'laboral'
  },
  {
    id: 'project-3',
    title: 'App de Gestión de Tareas',
    description: 'Aplicación web para la gestión de proyectos y tareas con tableros Kanban, colaboración en tiempo real y notificaciones.',
    imageUrl: projectImg3,
    projectUrl: 'https://lexisware.com/demo3',
    githubUrl: 'https://github.com/lexisware/task-manager',
    technologies: ['React', 'Firebase', 'Material-UI'],
    teamMembers: ['Daniel'],
    createdAt: new Date('2024-05-10'),
    isStatic: true,
    category: 'academico'
  },
  {
    id: 'project-4',
    title: 'Dashboard Analítico',
    description: 'Dashboard interactivo con visualización de datos, gráficos en tiempo real y exportación de reportes en múltiples formatos.',
    imageUrl: projectImg1,
    projectUrl: 'https://lexisware.com/demo4',
    githubUrl: 'https://github.com/lexisware/analytics-dashboard',
    technologies: ['Vue.js', 'Chart.js', 'Express', 'MySQL'],
    teamMembers: ['Alexis', 'Daniel'],
    createdAt: new Date('2024-06-15'),
    isStatic: true,
    category: 'academico'
  }
]

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>(staticProjects)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'todos' | 'academico' | 'laboral'>('todos')

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const querySnapshot = await getDocs(collection(db, 'projects'))
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Project[]
      
      // Combinar proyectos estáticos con los de Firebase
      const allProjects = [...staticProjects, ...projectsData]
      setProjects(allProjects.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
    } catch (error) {
      console.error('❌ Error al cargar proyectos:', error)
      // Si falla, mostrar solo los estáticos
      setProjects(staticProjects)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 px-8 py-20"
      >
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-2"
          >
            <FiCode className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">Nuestro Trabajo</span>
          </motion.div>
          
          <h1 className="mb-4 text-4xl font-bold md:text-6xl">
            Proyectos de <span className="text-gradient bg-gradient-to-r from-primary via-secondary to-accent">LEXISWARE</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-lg text-base-content/70">
            Explora los proyectos creados por Alexis y Daniel
          </p>
        </div>
      </motion.section>

      {/* Projects Grid */}
      <section className="container mx-auto px-4 py-16">
        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          <button
            onClick={() => setFilter('todos')}
            className={`btn ${filter === 'todos' ? 'btn-primary' : 'btn-outline'}`}
          >
            Todos los Proyectos
          </button>
          <button
            onClick={() => setFilter('academico')}
            className={`btn ${filter === 'academico' ? 'btn-secondary' : 'btn-outline'}`}
          >
            <FiCode className="mr-2" />
            Proyectos Académicos
          </button>
          <button
            onClick={() => setFilter('laboral')}
            className={`btn ${filter === 'laboral' ? 'btn-accent' : 'btn-outline'}`}
          >
            Proyectos Laborales
          </button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : projects.filter(p => filter === 'todos' || (p as any).category === filter).length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <FiCode className="mx-auto h-16 w-16 text-base-content/30 mb-4" />
            <h3 className="text-2xl font-bold mb-2">No hay proyectos en esta categoría</h3>
            <p className="text-base-content/70">Prueba con otro filtro</p>
          </motion.div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center max-w-7xl mx-auto">
            {projects.filter(p => filter === 'todos' || (p as any).category === filter).map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ y: -12, scale: 1.02 }}
                className="group relative overflow-hidden rounded-[2rem] bg-base-100 border border-base-content/10 shadow-xl hover:shadow-2xl transition-all duration-300 w-full max-w-sm"
              >
                {/* Gradient background decoration */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Imagen del proyecto */}
                <div className="relative h-52 overflow-hidden">
                  {project.isStatic ? (
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <LocalImage
                      uid={project.id}
                      type="project"
                      fallback={project.imageUrl || ''}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-base-100 via-transparent to-transparent opacity-60"></div>
                  
                  {/* Badge de categoría */}
                  {project.category && (
                    <div className="absolute top-4 right-4">
                      <span className={`badge ${project.category === 'academico' ? 'badge-secondary' : 'badge-accent'} badge-lg`}>
                        {project.category === 'academico' ? 'Académico' : 'Laboral'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="relative p-6 space-y-4">
                  <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {project.title}
                  </h2>
                  
                  <p className="text-sm text-base-content/70 leading-relaxed line-clamp-3 min-h-[4rem]">
                    {project.description}
                  </p>

                  {/* Tecnologías */}
                  <div className="flex flex-wrap gap-2">
                    {(project.technologies || project.techStack || []).slice(0, 3).map((tech, i) => (
                      <span key={i} className="badge badge-sm badge-primary badge-outline">
                        {tech}
                      </span>
                    ))}
                    {(project.technologies || project.techStack || []).length > 3 && (
                      <span className="badge badge-sm badge-ghost">
                        +{(project.technologies || project.techStack || []).length - 3}
                      </span>
                    )}
                  </div>

                  {/* Programador o team members */}
                  {project.programmerName && (
                    <div className="text-xs text-base-content/60 flex items-center gap-2">
                      <span className="font-semibold">Por:</span>
                      <span>{project.programmerName}</span>
                    </div>
                  )}
                  {project.teamMembers && project.teamMembers.length > 0 && !project.programmerName && (
                    <div className="text-xs text-base-content/60 flex items-center gap-2">
                      <span className="font-semibold">Por:</span>
                      <span>{project.teamMembers.join(', ')}</span>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-2 pt-2">
                    {(project.projectUrl || project.demoUrl || project.githubUrl || project.repoUrl) ? (
                      <a
                        href={project.projectUrl || project.demoUrl || project.githubUrl || project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary btn-sm flex-1 gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        <FiExternalLink className="h-4 w-4" />
                        Ver Proyecto
                      </a>
                    ) : (
                      <button
                        disabled
                        className="btn btn-primary btn-sm flex-1 gap-2 rounded-xl btn-disabled"
                      >
                        <FiExternalLink className="h-4 w-4" />
                        Ver Proyecto
                      </button>
                    )}
                    {(project.githubUrl || project.repoUrl) && (
                      <a
                        href={project.githubUrl || project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost btn-sm btn-circle"
                        title="GitHub"
                      >
                        <FiGithub className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Decorative gradient bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Projects
