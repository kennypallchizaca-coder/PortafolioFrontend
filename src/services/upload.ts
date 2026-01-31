/**
 * Servicio para subida de archivos al backend Spring Boot.
 * Maneja imágenes de perfil, proyectos y otros recursos.
 * @module services/upload
 */
import apiClient from './api'

export interface UploadResponse {
    url: string
    filename: string
}

/**
 * Subir una imagen (Generic helper - not exported)
 */
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

/**
 * Subir avatar de usuario
 */
export const uploadAvatar = async (file: File, userId?: string): Promise<UploadResponse> => {
    // Backend endpoint: /api/files/upload/profile
    return uploadFile(file, '/api/files/upload/profile')
}

/**
 * Subir imagen de proyecto
 */
export const uploadProjectImage = async (
    file: File,
    projectId?: string
): Promise<UploadResponse> => {
    // Backend endpoint: /api/files/upload/project
    return uploadFile(file, '/api/files/upload/project')
}

