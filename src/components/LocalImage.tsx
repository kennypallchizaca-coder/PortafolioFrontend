// Componente que carga imágenes desde localStorage (base64) para evadir límites de plan gratuito

import { useEffect, useState } from 'react'

interface LocalImageProps {
  uid: string
  type: 'photo' | 'project'
  fallback?: string
  alt?: string
  className?: string
}

const LocalImage = ({ uid, type, fallback, alt = '', className = '' }: LocalImageProps) => {
  const [src, setSrc] = useState(fallback || '')

  // Intenta leer la imagen del almacenamiento local usando una clave basada en UID y tipo
  useEffect(() => {
    const key = type === 'photo' ? `photo_${uid}` : `project_img_${uid}`
    const saved = localStorage.getItem(key)
    if (saved) {
      setSrc(saved)
    } else if (fallback) {
      setSrc(fallback)
    }
  }, [uid, type, fallback])

  return <img src={src || '/default-avatar.png'} alt={alt} className={className} />
}

export default LocalImage
