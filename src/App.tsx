/**
 * Enrutador principal de la aplicación con React Router v6.
 * 
 * Define rutas públicas (/, /proyectos, /programadores, /login) y protegidas
 * (/admin/*, /panel/*) con guards de autenticación y rol.
 * 
 * @module App
 * @author LEXISWARE - Proyecto Académico PPW
 * @description Layouts: PublicLayout (navbar+footer) y DashboardLayout (sidebar)
 */
import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RoleGuard from './components/RoleGuard'

const PublicLayout = lazy(() => import('./layouts/PublicLayout'))
const DashboardLayout = lazy(() => import('./layouts/DashboardLayout'))
const Home = lazy(() => import('./pages/public/Home'))
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const Projects = lazy(() => import('./pages/public/Projects'))
const PortfolioPublic = lazy(() => import('./pages/public/PortfolioPublic'))
const ProgrammerDirectory = lazy(
  () => import('./pages/public/ProgrammerDirectory'),
)
const AdvisoryRequest = lazy(() => import('./pages/public/AdvisoryRequest'))
const MyAdvisoryRequests = lazy(() => import('./pages/public/MyAdvisoryRequests'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const ProjectsAdmin = lazy(() => import('./pages/admin/ProjectsAdmin'))
const ProgrammerDashboard = lazy(
  () => import('./pages/programmer/ProgrammerDashboard'),
)
const ProgrammersPage = lazy(() => import('./pages/admin/ProgrammersPage'))
const ScheduleManager = lazy(() => import('./pages/admin/ScheduleManager'))
const PortfolioEditor = lazy(
  () => import('./pages/programmer/PortfolioEditor'),
)
const ProfileEditor = lazy(
  () => import('./pages/programmer/ProfileEditor'),
)
const ProjectsPage = lazy(() => import('./pages/programmer/ProjectsPage'))
const AdvisoryInbox = lazy(() => import('./pages/programmer/AdvisoryInbox'))

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center">
    <span className="loading loading-spinner loading-lg text-primary" />
  </div>
)

function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Practica: Rutas publicas con layout publico */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/proyectos" element={<Projects />} />
          <Route path="/portafolio/:id" element={<PortfolioPublic />} />
          <Route path="/programadores" element={<ProgrammerDirectory />} />
          <Route path="/agendar-asesoria" element={<AdvisoryRequest />} />
          <Route path="/mis-solicitudes" element={<MyAdvisoryRequests />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Practica: Rutas protegidas + guard de rol */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['admin']}>
                <DashboardLayout role="admin" />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="programadores" element={<ProgrammersPage />} />
          <Route path="proyectos" element={<ProjectsAdmin />} />
          <Route path="horarios" element={<ScheduleManager />} />
        </Route>

        <Route
          path="/panel"
          element={
            <ProtectedRoute>
              <RoleGuard allowedRoles={['programmer']}>
                <DashboardLayout role="programmer" />
              </RoleGuard>
            </ProtectedRoute>
          }
        >
          <Route index element={<ProgrammerDashboard />} />
          <Route path="perfil" element={<ProfileEditor />} />
          <Route path="portafolio" element={<PortfolioEditor />} />
          <Route path="proyectos" element={<ProjectsPage />} />
          <Route path="asesorias" element={<AdvisoryInbox />} />
        </Route>

        {/* Redireccion fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
