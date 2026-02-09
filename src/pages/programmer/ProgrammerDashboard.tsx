// Panel principal del programador con accesos directos a la gestión de perfil y contenido

import { Link } from 'react-router-dom'

const ProgrammerDashboard = () => {
  return (
    <div className="space-y-4">
      <div className="alert alert-info">
        <div>
          <span className="font-semibold">Bienvenido.</span> Completa tu
          portafolio y publica proyectos para que sean visibles en la página
          pública.
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Mi Perfil</h2>
            <p className="text-sm text-base-content/70">
              Edita tu foto, nombre, bio y especialidad.
            </p>
            <div className="card-actions justify-end">
              <Link className="btn btn-primary btn-sm" to="/panel/perfil">
                Editar
              </Link>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Mi portafolio</h2>
            <p className="text-sm text-base-content/70">
              Edita headline, skills y sobre mí.
            </p>
            <div className="card-actions justify-end">
              <Link className="btn btn-secondary btn-sm" to="/panel/portafolio">
                Editar
              </Link>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Proyectos</h2>
            <p className="text-sm text-base-content/70">
              Crea proyectos académicos y laborales.
            </p>
            <div className="card-actions justify-end">
              <Link className="btn btn-accent btn-sm" to="/panel/proyectos">
                Gestionar
              </Link>
            </div>
          </div>
        </div>
        <div className="card bg-base-100 shadow-md">
          <div className="card-body">
            <h2 className="card-title">Asesorías</h2>
            <p className="text-sm text-base-content/70">
              Revisa y responde solicitudes de usuarios.
            </p>
            <div className="card-actions justify-end">
              <Link className="btn btn-info btn-sm" to="/panel/asesorias">
                Abrir bandeja
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgrammerDashboard
