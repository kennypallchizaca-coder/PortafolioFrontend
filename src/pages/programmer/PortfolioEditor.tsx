/**
 * Editor de portafolio del programador.
 * Prácticas: Formularios controlados, validación mínima, feedback DaisyUI.
 */
import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getPortfolio, upsertPortfolio } from '../../services/portfolios'

const initial = {
  title: '',
  description: '',
  theme: 'light',
  isPublic: true,
}

const PortfolioEditor = () => {
  const { user } = useAuth()
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return
      const data = await getPortfolio(user.id)
      if (data) {
        setForm({
          title: data.title || '',
          description: data.description || '',
          theme: data.theme || 'light',
          isPublic: data.isPublic ?? true,
        })
      }
    }
    load()
  }, [user?.id])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user?.id) {
      setError('Usuario no autenticado')
      return
    }
    setLoading(true)
    setMessage('')
    setError('')
    try {
      await upsertPortfolio(user.id, {
        title: form.title,
        description: form.description,
        theme: form.theme,
        isPublic: form.isPublic,
      })
      setMessage('✓ Portafolio guardado correctamente.')
    } catch (err: any) {
      console.error('Error saving portfolio:', err)
      setError(err.response?.data?.message || 'No se pudo guardar. Revisa tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Mi portafolio</h1>
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-md">
        <div className="card-body space-y-3">
          {message && <div className="alert alert-success text-sm">{message}</div>}
          {error && <div className="alert alert-error text-sm">{error}</div>}

          <div className="form-control">
            <label className="label">
              <span className="label-text">Título del Portafolio *</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="Ej: Desarrollador Full Stack React + Node.js"
              required
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Descripción</span>
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="textarea textarea-bordered"
              rows={5}
              placeholder="Cuéntanos sobre tus proyectos, experiencia y habilidades..."
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text">Tema DaisyUI</span>
            </label>
            <select
              name="theme"
              value={form.theme}
              onChange={handleChange}
              className="select select-bordered"
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="emerald">Emerald</option>
              <option value="forest">Forest</option>
              <option value="aqua">Aqua</option>
            </select>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Portafolio público (visible para todos)</span>
              <input
                type="checkbox"
                name="isPublic"
                checked={form.isPublic}
                onChange={handleChange}
                className="toggle toggle-primary"
              />
            </label>
          </div>

          <div className="card-actions justify-end">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar portafolio'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default PortfolioEditor
