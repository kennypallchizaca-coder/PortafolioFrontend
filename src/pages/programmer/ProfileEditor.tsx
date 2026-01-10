/**
 * Editor de perfil del programador (foto, nombre, bio, especialidad).
 */
import { useEffect, useState, ChangeEvent, FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../../services/firebase'
import { FiCamera, FiSave } from 'react-icons/fi'

const initialForm = {
  displayName: '',
  email: '',
  specialty: '',
  bio: '',
  github: '',
  instagram: '',
  whatsapp: '',
  available: false,
}

const ProfileEditor = () => {
  const { user } = useAuth()
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState('')
  const [skills, setSkills] = useState<string[]>(['JavaScript', 'React'])
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.uid) return
      try {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          const data = docSnap.data()
          setForm({
            displayName: data.displayName || '',
            email: data.email || '',
            specialty: data.specialty || '',
            bio: data.bio || '',
            github: data.socials?.github || '',
            instagram: data.socials?.instagram || '',
            whatsapp: data.socials?.whatsapp || '',
            available: data.available || false,
          })
          setSkills(data.skills || ['JavaScript', 'React'])
          // Cargar foto desde localStorage
          const savedPhoto = localStorage.getItem(`photo_${user.uid}`)
          setPhotoPreview(savedPhoto || data.photoURL || '')
        }
      } catch (err) {
        console.error('Error cargando perfil:', err)
      }
    }
    loadProfile()
  }, [user?.uid])

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadPhoto = async (uid: string, file: File): Promise<string> => {
    try {
      const storageRef = ref(storage, `programmers/${uid}/profile.jpg`)
      const snapshot = await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      return url
    } catch (error: any) {
      console.error('❌ Error al subir foto:', error)
      console.error('Código de error:', error.code)
      console.error('Mensaje:', error.message)

      if (error.code === 'storage/unauthorized') {
        throw new Error('⚠️ REGLAS DE STORAGE NO APLICADAS. Ve a Firebase Console > Storage > Rules.')
      }
      throw error
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user?.uid) {
      setError('Usuario no autenticado')
      return
    }

    setLoading(true)
    setMessage('')
    setError('')

    try {
      let photoURL = user.photoURL

      // Guardar foto en localStorage si hay una nueva
      if (photoFile) {
        const reader = new FileReader()
        photoURL = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const base64 = reader.result as string
            localStorage.setItem(`photo_${user.uid}`, base64)
            resolve(base64)
          }
          reader.readAsDataURL(photoFile)
        })
      }

      // Construir objeto socials sin undefined
      const socials: Record<string, string> = {}
      if (form.github) socials.github = form.github
      if (form.instagram) socials.instagram = form.instagram
      if (form.whatsapp) socials.whatsapp = form.whatsapp

      // Actualizar documento en Firestore (sin photoURL)
      const docRef = doc(db, 'users', user.uid)

      await updateDoc(docRef, {
        displayName: form.displayName,
        email: form.email,
        specialty: form.specialty,
        bio: form.bio,
        skills: skills,
        socials,
        available: form.available,
        updatedAt: serverTimestamp(),
      })

      setMessage('✓ Perfil actualizado correctamente.')
      setPhotoFile(null)
    } catch (err: any) {
      console.error('❌ Error completo:', err)
      console.error('Código:', err.code)
      console.error('Mensaje:', err.message)
      setError(`Error: ${err.message || 'No se pudo actualizar'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Editar mi perfil</h1>
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-md">
        <div className="card-body space-y-4">
          {message && <div className="alert alert-success text-sm">{message}</div>}
          {error && <div className="alert alert-error text-sm">{error}</div>}

          {/* Foto de perfil */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Foto de perfil</span>
            </label>
            <div className="flex items-center gap-4">
              <div className="avatar">
                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src={photoPreview || '/default-avatar.png'} alt="Preview" />
                </div>
              </div>
              <label className="btn btn-outline gap-2">
                <FiCamera />
                Cambiar foto
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </label>
            </div>
          </div>

          {/* Nombre */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Nombre completo *</span>
            </label>
            <input
              name="displayName"
              value={form.displayName}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          {/* Email */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Email *</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="input input-bordered"
              required
            />
          </div>

          {/* Especialidad */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Especialidad</span>
            </label>
            <input
              name="specialty"
              value={form.specialty}
              onChange={handleChange}
              className="input input-bordered"
              placeholder="Ej: Frontend Developer"
            />
          </div>

          {/* Disponibilidad */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Disponible para asesorías</span>
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm((prev) => ({ ...prev, available: e.target.checked }))}
                className="toggle toggle-primary"
              />
            </label>
          </div>

          {/* Biografía */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Biografía</span>
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              className="textarea textarea-bordered"
              rows={4}
              placeholder="Cuéntanos sobre ti..."
            />
          </div>

          {/* Habilidades */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Habilidades (mínimo 2)</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {skills.map((skill, idx) => (
                <div key={idx} className="badge badge-primary gap-2">
                  {skill}
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((_, i) => i !== idx))}
                    className="btn btn-ghost btn-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="input input-bordered flex-1"
                placeholder="Ej: TypeScript"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                      setSkills([...skills, newSkill.trim()])
                      setNewSkill('')
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  if (newSkill.trim() && !skills.includes(newSkill.trim())) {
                    setSkills([...skills, newSkill.trim()])
                    setNewSkill('')
                  }
                }}
                className="btn btn-secondary"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Redes sociales */}
          <div className="divider">Redes Sociales</div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text">GitHub</span>
              </label>
              <input
                name="github"
                value={form.github}
                onChange={handleChange}
                className="input input-bordered input-sm"
                placeholder="https://github.com/..."
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Instagram</span>
              </label>
              <input
                name="instagram"
                value={form.instagram}
                onChange={handleChange}
                className="input input-bordered input-sm"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">WhatsApp</span>
              </label>
              <input
                name="whatsapp"
                value={form.whatsapp}
                onChange={handleChange}
                className="input input-bordered input-sm"
                placeholder="https://wa.me/..."
              />
            </div>
          </div>

          <div className="card-actions justify-end pt-2">
            <button className="btn btn-primary gap-2" type="submit" disabled={loading}>
              <FiSave />
              {loading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProfileEditor
