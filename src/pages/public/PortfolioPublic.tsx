// Página que muestra el portafolio consolidado de un programador específico

import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getProgrammer, getPortfolio, type ProgrammerProfile, type Portfolio } from '../../services/programmers'
import { getProjectsByOwner, type Project } from '../../services/projects'
import { FiGithub, FiExternalLink } from 'react-icons/fi'

const PortfolioPublic = () => {
  const { id } = useParams<{ id: string }>()
  const [programmer, setProgrammer] = useState<ProgrammerProfile | null>(null)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  // Obtiene perfil, portafolio y proyectos del programador en paralelo
  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        const [programmerData, portfolioData, projectsData] = await Promise.all([
          getProgrammer(id),
          getPortfolio(id).catch(() => null),
          getProjectsByOwner(id).catch(() => [])
        ])

        setProgrammer(programmerData)
        setPortfolio(portfolioData)
        setProjects(projectsData)
      } catch (err) {
        console.error('Error loading portfolio:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!programmer) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <span>Programador no encontrado</span>
        </div>
      </div>
    )
  }

  // Ensure we have displayable data even if explicit portfolio is missing
  // asegurar que tenemos datos para mostrar incluso si falta el portafolio explícito
  const displayPortfolio = {
    headline: portfolio?.title || programmer.displayName,
    about: portfolio?.description || programmer.bio || 'Sin biografía',
    skills: (portfolio?.skills && portfolio.skills.length > 0) ? portfolio.skills : (programmer.skills || []),
    tags: programmer.specialty ? [programmer.specialty] : [],
    theme: portfolio?.theme || 'light'
  }

  return (
    <div className="space-y-6 container mx-auto px-4 py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="badge badge-outline">{displayPortfolio.tags?.join(' · ')}</p>
          <h1 className="text-3xl font-bold mt-2">{displayPortfolio.headline}</h1>
          <p className="text-base-content/70 mt-1 max-w-2xl">{displayPortfolio.about}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {displayPortfolio.skills?.map((skill) => (
            <div key={skill} className="badge badge-primary">
              {skill}
            </div>
          ))}
        </div>
      </header>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Proyectos</h2>
          <div className="badge badge-secondary">
            {projects.length} proyectos
          </div>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {projects.map((project) => (
            <div key={project.id} className="card bg-base-100 shadow-md border border-base-200">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <h3 className="card-title text-lg">{project.title}</h3>
                  <div className="badge badge-outline capitalize">{project.category}</div>
                </div>
                <p className="text-sm text-base-content/70 mt-2 line-clamp-3 overflow-hidden">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {project.techStack?.map((tech: string) => (
                    <span key={tech} className="badge badge-ghost badge-sm">
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="card-actions justify-end mt-4 pt-2 border-t border-base-200">
                  {project.repoUrl && (
                    <a
                      className="btn btn-sm btn-outline gap-2"
                      href={project.repoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FiGithub /> Código
                    </a>
                  )}
                  {project.demoUrl && (
                    <a
                      className="btn btn-sm btn-primary gap-2"
                      href={project.demoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FiExternalLink /> Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {projects.length === 0 && (
          <div className="text-center py-12 bg-base-100 rounded-lg border border-base-content/10">
            <p className="text-base-content/50">No hay proyectos publicados aún.</p>
          </div>
        )}
      </section>
    </div>
  )
}

export default PortfolioPublic
