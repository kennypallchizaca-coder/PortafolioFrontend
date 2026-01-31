/**
 * Página de login con email y contraseña.
 * Prácticas: Formularios (feedback de error), Auth con JWT.
 */
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { register, type RegisterInput } from '../../services/auth'
import { motion } from 'framer-motion'
import {
  FiLock,
  FiAlertCircle,
  FiInfo,
  FiArrowLeft,
  FiShield,
  FiCheckCircle,
  FiMail,
  FiUser
} from 'react-icons/fi'
import { HiLightningBolt } from 'react-icons/hi'

const LoginPage = () => {
  const { login, isAuthenticated, loading: authLoading, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isLogin, setIsLogin] = useState(true)

  // Login form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Register form
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [registerSuccess, setRegisterSuccess] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname || '/'
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, authLoading, user, navigate, location])

  // Mostrar loading mientras se verifica el estado de autenticación
  if (authLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content/70">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
    } catch (err: any) {
      console.error('Error en login:', err)
      setError(err.response?.data?.message || err.message || 'Credenciales incorrectas. Verifica tu email y contraseña.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setRegisterSuccess(false)

    if (registerPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const registerData: RegisterInput = {
        email: registerEmail,
        password: registerPassword,
        displayName,
      }

      await register(registerData)
      setRegisterSuccess(true)

      setTimeout(async () => {
        try {
          await login(registerEmail, registerPassword)
        } catch {
          setError('Usuario registrado. Por favor inicia sesión.')
          setIsLogin(true)
        }
      }, 1500)
    } catch (err: any) {
      console.error('Register error:', err)
      setError(err.response?.data?.message || err.message || 'Error al registrar. El email puede estar en uso.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body space-y-6">
            {/* Logo y título */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-3xl text-white shadow-lg">
                <FiLock className="h-8 w-8" />
              </div>
              <h2 className="text-3xl font-bold">{isLogin ? 'Bienvenido' : 'Crear Cuenta'}</h2>
              <p className="mt-2 text-base-content/70">
                {isLogin ? 'Inicia sesión para acceder a tu cuenta' : 'Regístrate para comenzar'}
              </p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-error"
              >
                <FiAlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </motion.div>
            )}

            {/* Mensaje de éxito */}
            {registerSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="alert alert-success"
              >
                <FiCheckCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm">¡Cuenta creada! Redirigiendo...</span>
              </motion.div>
            )}

            {/* Información */}
            <div className="rounded-lg bg-primary/10 p-4">
              <div className="flex items-start gap-3">
                <FiInfo className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div className="text-sm text-base-content/80">
                  {isLogin ? (
                    <>Usa tu <strong>email y contraseña</strong> para acceder. Si no tienes cuenta, puedes registrarte.</>
                  ) : (
                    <>Tu perfil se creará automáticamente. El <strong>rol será asignado por el administrador</strong>.</>
                  )}
                </div>
              </div>
            </div>

            {/* Formularios */}
            {isLogin ? (
              /* LOGIN FORM */
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Correo electrónico</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input input-bordered w-full pl-10"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Contraseña</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input input-bordered w-full pl-10"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  className="btn btn-primary btn-lg w-full gap-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Iniciando sesión...
                    </>
                  ) : (
                    <>
                      <HiLightningBolt className="h-5 w-5" />
                      Iniciar Sesión
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Nombre completo</span>
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="input input-bordered w-full pl-10"
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Correo electrónico</span>
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
                    <input
                      type="email"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      className="input input-bordered w-full pl-10"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Contraseña</span>
                  </label>
                  <div className="relative">
                    <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50" />
                    <input
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      className="input input-bordered w-full pl-10"
                      placeholder="Mínimo 6 caracteres"
                      required
                      minLength={6}
                    />
                  </div>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">Mínimo 6 caracteres</span>
                  </label>
                </div>

                <button
                  className="btn btn-primary btn-lg w-full gap-3 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="h-5 w-5" />
                      Crear Cuenta
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Toggle entre Login y Registro */}
            <div className="text-center">
              <button
                onClick={() => {
                  setIsLogin(!isLogin)
                  setError('')
                  setRegisterSuccess(false)
                }}
                className="link link-hover text-sm text-base-content/70"
                disabled={loading}
              >
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>

            {/* Enlace de regreso */}
            <div className="text-center">
              <Link
                to="/"
                className="link link-hover inline-flex items-center gap-2 text-sm text-base-content/70"
              >
                <FiArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 grid gap-4 text-center text-sm md:grid-cols-3">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
              <HiLightningBolt className="h-5 w-5 text-primary" />
            </div>
            <span className="text-base-content/70">Rápido y seguro</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/20">
              <FiShield className="h-5 w-5 text-secondary" />
            </div>
            <span className="text-base-content/70">Datos protegidos</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20">
              <FiCheckCircle className="h-5 w-5 text-accent" />
            </div>
            <span className="text-base-content/70">Autenticación JWT</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default LoginPage
