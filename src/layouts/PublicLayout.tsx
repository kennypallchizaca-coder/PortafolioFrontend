/**
 * Layout para vistas públicas.
 * Prácticas: Routing y UX (diferenciar público vs dashboard).
 */
import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Footer from '../components/Footer'

const PublicLayout = () => (
  <div className="min-h-screen bg-base-100 text-base-content">
    <NavBar />
    <main className="pt-16">
      <Outlet />
    </main>
    <Footer />
  </div>
)

export default PublicLayout
