// Estructura base para las páginas públicas, incluyendo barra de navegación y pie de página

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
