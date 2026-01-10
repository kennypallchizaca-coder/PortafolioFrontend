/**
 * Directorio público de programadores.
 * Prácticas: Consumo de Firestore + UX (cards, skeleton).
 */
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listProgrammers } from '../../services/firestore'
import { useAuth } from '../../context/AuthContext'
import type { DocumentData } from 'firebase/firestore'
import { motion } from 'framer-motion'
import { FiUsers, FiEye, FiMail, FiCode, FiGithub, FiInstagram, FiRefreshCw } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import LocalImage from '../../components/LocalImage'
import fotoAlexis from '../../img/fotoalexis.jpg'
import fotoDaniel from '../../img/fotoDaniel.jpg'

// Programadores estáticos del equipo
const staticTeam = [
  {
    id: 'alexis-static',
    displayName: 'Alexis',
    specialty: 'Full Stack Developer',
    bio: 'Desarrollador full-stack especializado en React, Node.js y Firebase. Apasionado por crear soluciones innovadoras y escalables.',
    email: 'aguamanp4@est.ups.edu.ec',
    photoURL: fotoAlexis,
    isStatic: true,
    available: true,
    schedule: ['09:00', '11:00', '14:00'],
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Firebase', 'MongoDB', 'Express'],
    socials: {
      github: 'https://github.com/kennypallchizaca-coder',
      instagram: 'https://www.instagram.com/its_alexis554/',
      whatsapp: 'https://wa.me/+593958940394'
    }
  },
  {
    id: 'daniel-static',
    displayName: 'Daniel',
    specialty: 'Frontend Developer',
    bio: 'Experto en desarrollo frontend con React y TypeScript. Enfocado en crear interfaces de usuario modernas y accesibles.',
    email: 'dguangag@est.ups.edu.ec',
    photoURL: fotoDaniel,
    isStatic: true,
    available: true,
    schedule: ['08:00', '10:00', '15:00'],
    skills: ['React', 'TypeScript', 'TailwindCSS', 'HTML5', 'CSS3', 'Responsive Design'],
    socials: {
      github: 'https://github.com/Pangust-code',
      instagram: 'https://www.instagram.com/pangust01?igsh=bXZ2dHo3cW54NjFr',
      whatsapp: 'https://wa.me/5930958867933'
    }
  }
]

const ProgrammerDirectory = () => {
  const { isAuthenticated, role, user } = useAuth()
  const [programmers, setProgrammers] = useState<(DocumentData & { id: string })[]>(staticTeam)
  const [loading, setLoading] = useState(false)
  const [reload, setReload] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await listProgrammers()
        // Combinar programadores estáticos con los de Firebase
        const allProgrammers = [...staticTeam, ...data]
        setProgrammers(allProgrammers)
      } catch (error) {
        console.error('❌ Error al cargar programadores:', error)
        // Si falla, mostrar solo los estáticos
        setProgrammers(staticTeam)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [reload])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-20 w-full"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton h-64 w-full"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
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
            key={dev.id}
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
                    {dev.isStatic && dev.photoURL ? (
                      <img src={dev.photoURL} alt={dev.displayName} className="object-cover" />
                    ) : !dev.isStatic ? (
                      <LocalImage
                        uid={dev.id}
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
                {dev.bio || 'Desarrollador profesional con experiencia en múltiples tecnologías.'}
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
                {isAuthenticated && role === 'programmer' && user && user.uid === dev.id && !dev.isStatic ? (
                  <Link
                    className="btn btn-primary btn-block gap-2 shadow-lg hover:shadow-xl transition-all hover:scale-105 rounded-xl"
                    to={`/portafolio/${dev.id}`}
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
          <div className="mb-4 text-6xl">🔍</div>
          <h3 className="mb-2 text-xl font-semibold">No hay desarrolladores aún</h3>
          <p className="text-base-content/70">Los programadores aparecerán aquí una vez registrados</p>
        </motion.div>
      )}
    </div>
  )
}

export default ProgrammerDirectory
