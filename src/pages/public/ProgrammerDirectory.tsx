// Directorio de todos los programadores del sistema con opciones de búsqueda y filtrado

import { useEffect, useState } from 'react'
import { getProgrammers, type ProgrammerProfile } from '../../services/programmers'
import { Link } from 'react-router-dom'
import { FiGithub, FiInstagram, FiCode, FiUsers, FiRefreshCw, FiMail, FiEye, FiSearch } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import LocalImage from '../../components/LocalImage'

const ProgrammerDirectory = () => {
  const [programmers, setProgrammers] = useState<ProgrammerProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [reload, setReload] = useState(false)

  const { role, isAuthenticated, user } = useAuth()

  // Obtiene todos los perfiles de programadores registrados para el directorio
  useEffect(() => {
    const loadProgrammers = async () => {
      setLoading(true)
      try {
        const data = await getProgrammers()
        // mapear datos del backend a expectativas de UI si es necesario
        // también manejando el concepto "isStatic" si se mezclan datos estáticos/dinámicos
        // por ahora, asumiendo que el backend es la fuente de verdad
        const mapped = data.map(d => ({ ...d, isStatic: false }))
        setProgrammers(mapped)
      } catch (err) {
        console.error('Error loading programmers:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProgrammers()
  }, [reload])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 py-12 px-4">
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
            Nuestros <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Desarrolladores</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-base-content/70">
            Explora perfiles de programadores talentosos, revisa sus portafolios y agenda una asesoría personalizada
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="badge badge-lg badge-primary gap-2">
              <FiUsers className="h-4 w-4" />
              {programmers.length} Desarrolladores
            </div>
            <button
              onClick={() => setReload(!reload)}
              className="btn btn-outline btn-sm gap-2"
            >
              <FiRefreshCw className="h-4 w-4" />
              Recargar
            </button>
          </div>
        </motion.div>

        {/* Grid de programadores */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 justify-items-center max-w-7xl mx-auto">
          {programmers.map((dev, idx) => (
            <motion.div
              key={dev.id || dev.uid}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              whileHover={{ y: -12, scale: 1.02 }}
              className="group relative overflow-hidden rounded-[2rem] bg-base-100 border border-base-content/10 shadow-xl hover:shadow-2xl transition-all duration-300"
            >
              {/* Gradient background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative p-8 space-y-6">
                {/* Avatar centrado con efecto */}
                <div className="flex flex-col items-center text-center space-y-4">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="avatar"
                  >                  <div className="w-24 h-24 rounded-full ring-4 ring-primary/20 ring-offset-4 ring-offset-base-100 shadow-lg">
                      {(dev as any).isStatic && dev.photoURL ? (
                        <img src={dev.photoURL} alt={dev.displayName} className="object-cover" />
                      ) : !(dev as any).isStatic ? (
                        <LocalImage
                          uid={dev.id || dev.uid || ''}
                          type="photo"
                          fallback={dev.photoURL}
                          alt={dev.displayName}
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary via-secondary to-accent text-3xl font-bold text-white">
                          <span>{dev.displayName?.charAt(0) || '?'}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>

                  {/* Badge especialidad */}
                  <div className="badge badge-lg badge-primary gap-2 shadow-md">
                    <FiCode className="h-3 w-3" />
                    <span className="capitalize">{dev.specialty || 'Desarrollador'}</span>
                  </div>

                  {/* Badge disponibilidad */}
                  <div className={`badge badge-lg gap-2 shadow-md ${dev.available ? 'badge-success' : 'badge-error'}`}>
                    {dev.available ? 'Disponible' : 'No Disponible'}
                  </div>

                  {/* Horario */}
                  {dev.schedule && dev.schedule.length > 0 && (
                    <div className="text-xs text-base-content/70 mt-2">
                      <strong>Horarios disponibles:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dev.schedule.map((time: string, i: number) => (
                          <span key={i} className="badge badge-sm badge-outline">
                            {time}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Nombre */}
                <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {dev.displayName}
                </h2>

                {/* Bio */}
                <p className="text-sm text-base-content/70 leading-relaxed text-center min-h-[4.5rem]">
                  {dev.bio}
                </p>

                {/* Habilidades */}
                {dev.skills && dev.skills.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-center text-base-content/60 uppercase tracking-wider">
                      Habilidades
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {dev.skills.slice(0, 6).map((skill: string, i: number) => (
                        <span key={i} className="badge badge-sm badge-primary badge-outline">
                          {skill}
                        </span>
                      ))}
                      {dev.skills.length > 6 && (
                        <span className="badge badge-sm badge-ghost">
                          +{dev.skills.length - 6}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Email */}
                <div className="flex items-center justify-center gap-2 text-sm text-base-content/60 p-3 rounded-xl bg-base-200/50">
                  <FiMail className="h-4 w-4" />
                  <span className="font-medium">{dev.email}</span>
                </div>

                {/* Redes sociales */}
                {dev.socials && (
                  <div className="flex items-center justify-center gap-3">
                    {dev.socials.github && (
                      <a
                        href={dev.socials.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-circle btn-sm btn-ghost hover:btn-primary transition-all"
                        title="GitHub"
                      >
                        <FiGithub className="h-5 w-5" />
                      </a>
                    )}
                    {dev.socials.instagram && (
                      <a
                        href={dev.socials.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-circle btn-sm btn-ghost hover:btn-secondary transition-all"
                        title="Instagram"
                      >
                        <FiInstagram className="h-5 w-5" />
                      </a>
                    )}
                    {dev.socials.whatsapp && (
                      <a
                        href={dev.socials.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-circle btn-sm btn-ghost hover:btn-success transition-all"
                        title="WhatsApp"
                      >
                        <FaWhatsapp className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Acciones */}
                <div className="pt-2">
                  {isAuthenticated &&
                    ((role as any) === 'ROLE_PROGRAMMER' || (role as any) === 'PROGRAMMER') &&
                    user &&
                    (user.id === dev.id || user.id === dev.uid) &&
                    !(dev as any).isStatic ? (
                    <Link
                      className="btn btn-primary btn-block gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 rounded-xl"
                      to={`/portafolio/${dev.id || dev.uid}`}
                    >
                      <FiEye className="h-5 w-5" />
                      Ver Portafolio
                    </Link>
                  ) : (
                    <button
                      className="btn btn-primary btn-block gap-2 shadow-lg rounded-xl"
                      disabled
                    >
                      <FiUsers className="h-5 w-5" />
                      Miembro del Equipo
                    </button>
                  )}
                </div>
              </div>

              {/* Decorative gradient bottom */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </motion.div>
          ))}
        </div>

        {programmers.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl bg-base-200 p-12 text-center"
          >
            <div className="mb-4 text-6xl"><FiSearch /></div>
            <h3 className="mb-2 text-xl font-semibold">No hay desarrolladores aún</h3>
            <p className="text-base-content/70">Los desarrolladores aparecerán aquí una vez registrados</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ProgrammerDirectory
