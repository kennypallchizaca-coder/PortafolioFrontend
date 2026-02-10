// Galería pública de proyectos con filtrado por categoría
import { useEffect, useState } from 'react'
import { getAllProjects, type Project } from '../../services/projects'
import { FiGithub, FiExternalLink } from 'react-icons/fi'
import Pagination from '../../components/Pagination'

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'academico' | 'laboral'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 9

  // Recupera todos los proyectos disponibles desde el servicio
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await getAllProjects()
        setProjects(data)
      } catch (err) {
        console.error('Error loading projects:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  const filteredProjects = filter === 'all'
    ? projects
    : projects.filter(p => p.category === filter)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Proyectos</h1>
          <p className="text-lg text-base-content/70">
            Explora los proyectos desarrollados por nuestro equipo
          </p>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setFilter('all')
              setCurrentPage(1)
            }}
          >
            Todos
          </button>
          <button
            className={`btn btn-sm ${filter === 'academico' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setFilter('academico')
              setCurrentPage(1)
            }}
          >
            Académicos
          </button>
          <button
            className={`btn btn-sm ${filter === 'laboral' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => {
              setFilter('laboral')
              setCurrentPage(1)
            }}
          >
            Laborales
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects
            .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
            .map((project) => (
              <div key={project.id} className="card bg-base-100 shadow-xl">
                {project.imageUrl && (
                  <figure className="h-48">
                    <img
                      src={project.imageUrl}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </figure>
                )}
                <div className="card-body">
                  <h2 className="card-title">{project.title}</h2>
                  <p className="text-sm text-base-content/70 line-clamp-3 overflow-hidden">{project.description}</p>

                  {project.techStack && project.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.techStack.map((tech, idx) => (
                        <span key={idx} className="badge badge-sm badge-primary badge-outline">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="card-actions justify-end mt-4">
                    {project.repoUrl && (
                      <a
                        href={project.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-ghost gap-2"
                      >
                        <FiGithub />
                        Código
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-primary gap-2"
                      >
                        <FiExternalLink />
                        Demo
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(filteredProjects.length / ITEMS_PER_PAGE)}
          onPageChange={setCurrentPage}
        />

        {filteredProjects.length === 0 && (
          <div className="text-center py-20">
            <p className="text-base-content/70">
              No hay proyectos {filter !== 'all' ? `de tipo ${filter}` : ''} disponibles.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Projects
