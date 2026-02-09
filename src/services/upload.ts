// Servicio para subida de archivos (imágenes, avatares)
import apiClient from './api'

export interface UploadResponse {
    url: string
    filename: string
}

// Helper interno para enviar archivos como FormData; retorna URL y nombre
const uploadFile = async (file: File, endpoint: string): Promise<UploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<UploadResponse>(endpoint, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    })

    return response.data
}

// Sube imagen de perfil de usuario; retorna respuesta de subida
export const uploadAvatar = async (file: File, userId?: string): Promise<UploadResponse> => {
    // Backend endpoint: /api/files/upload/profile
    return uploadFile(file, '/api/files/upload/profile')
}

// Sube imagen de portada de proyecto; retorna respuesta de subida
export const uploadProjectImage = async (
    file: File,
    projectId?: string
): Promise<UploadResponse> => {
    // Backend endpoint: /api/files/upload/project
    return uploadFile(file, '/api/files/upload/project')
}

