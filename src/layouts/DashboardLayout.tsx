// Contenedor principal para las áreas de administración y perfiles de programadores

import { Outlet, Link } from 'react-router-dom'
import NavBar from '../components/NavBar'

const DashboardLayout = ({ role }: { role: 'ADMIN' | 'PROGRAMMER' }) => (
  <div className="min-h-screen bg-base-200 text-base-content">
    <NavBar />
    <div className="container mx-auto px-4 pt-20 pb-6">
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm text-base-content/70">Panel</p>
              <h1 className="text-2xl font-bold capitalize">{role}</h1>
            </div>
            <div className="flex gap-2">
              {role === 'ADMIN' && (
                <>
                  <Link className="btn btn-outline btn-sm" to="/admin">
                    Resumen
                  </Link>
                  <Link className="btn btn-primary btn-sm" to="/admin/programadores">
                    Programadores
                  </Link>
                  <Link className="btn btn-accent btn-sm" to="/admin/proyectos">
                    Proyectos
                  </Link>
                </>
              )}
              {role === 'PROGRAMMER' && (
                <>
                  <Link className="btn btn-primary btn-sm" to="/panel">
                    Mi dashboard
                  </Link>
                  <Link className="btn btn-outline btn-sm" to="/panel/proyectos">
                    Proyectos
                  </Link>
                  <Link className="btn btn-secondary btn-sm" to="/panel/asesorias">
                    Asesorías
                  </Link>
                </>
              )}
            </div>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  </div>
)

export default DashboardLayout
