/**
 * Pie de página con info básica.
 * Práctica: Consistencia visual y navegación secundaria.
 */
import { Link } from 'react-router-dom'
import Logo from './Logo'
import footerBg from '../img/footer-bg.png'
import { FiHeart } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'

const Footer = () => {
  const { role, isAuthenticated } = useAuth()

  const handleAdvisoryClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isAuthenticated) {
      e.preventDefault()
      alert('Necesitas iniciar sesión para solicitar una asesoría.')
    }
  }

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-base-300 bg-base-200/50">
      <img
        src={footerBg}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-5"
      />
      <div className="container relative z-10 mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <div className="mb-4 flex items-center gap-3">
              <Logo className="text-primary" size={45} />
              <span className="text-lg font-bold">LEXISWARE</span>
            </div>
            <p className="text-sm text-base-content/70">
              Plataforma de portafolifolios by alexis
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="mb-4 font-semibold">Enlaces</h3>
            <ul className="space-y-2 text-sm text-base-content/70">
              <li>
                <Link to="/" className="hover:text-primary transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link to="/programadores" className="hover:text-primary transition-colors">
                  Desarrolladores
                </Link>
              </li>
              {/* Solo visible para no autenticados o externos, oculto para programmers/admins */}
              {(!isAuthenticated || ['role_external', 'external', 'role_user', 'user'].includes((role as string)?.toLowerCase() || '')) && (
                <li>
                  <Link
                    to="/agendar-asesoria"
                    className="hover:text-primary transition-colors"
                    onClick={handleAdvisoryClick}
                  >
                    Agendar Asesoría
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Tecnologías */}
          <div>
            <h3 className="mb-4 font-semibold">Tecnologías</h3>
            <div className="flex flex-wrap gap-2">
              <span className="badge badge-outline">React</span>
              <span className="badge badge-outline">TypeScript</span>
              <span className="badge badge-outline">Tailwind</span>
              <span className="badge badge-outline">DaisyUI</span>
            </div>
          </div>

          {/* Info del proyecto */}
          <div>
            <h3 className="mb-4 font-semibold">Proyecto Académico</h3>
            <p className="text-sm text-base-content/70">
              Programación y Plataformas Web<br />
              Carrera de Computación<br />
              2025
            </p>
          </div>
        </div>

        <div className="divider"></div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-base-content/60">
          <p>© 2025 LEXISWARE. Proyecto académico PPW.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
