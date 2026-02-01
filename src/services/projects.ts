/**
 * Servicio para gestión de proyectos individuales.
 * Conecta con el CRUD de proyectos en el backend.
 */
import apiClient from './api'

export interface Project {
    id?: string
    ownerId: string
    title: string
    description?: string
    category: 'academico' | 'laboral'
    role: 'frontend' | 'backend' | 'fullstack' | 'db'
    techStack?: string[]
    repoUrl?: string
    demoUrl?: string
    imageUrl?: string
    createdAt?: Date
    updatedAt?: Date
}

/**
 * Obtiene todos los proyectos que pertenecen a un usuario específico.
 * @param ownerId UID del propietario del proyecto.
 */
export const getProjectsByOwner = async (ownerId: string): Promise<Project[]> => {
    // Realizar petición GET al endpoint filtrado por usuario
    // El objeto retornado por Spring Boot suele ser un Pageable, 
    // por lo que extraemos 'content' si viene paginado, o la data directa si es una lista simple.
    const response = await apiClient.get<any>(`/api/projects/user/${ownerId}`)
    return response.data.content || response.data
}

/**
 * Recupera la lista global de proyectos registrados en la plataforma.
 */
export const getAllProjects = async (): Promise<Project[]> => {
    const response = await apiClient.get<any>('/api/projects')
    // Manejo de respuesta paginada de Spring Data
    return response.data.content || response.data
}

/**
 * Busca los detalles de un proyecto único por su identificador numérico.
 */
export const getProject = async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/api/projects/${id}`)
    return response.data
}

/**
 * Envía los datos de un nuevo proyecto al servidor para su creación.
 */
export const createProject = async (data: Omit<Project, 'id'>): Promise<Project> => {
    const response = await apiClient.post<Project>('/api/projects', data)
    return response.data
}

/**
 * Actualiza parcialmente los datos de un proyecto existente.
 * Se usa PATCH para permitir el envío de solo los campos que cambiaron.
 */
export const updateProject = async (
    id: string,
    data: Partial<Project>
): Promise<Project> => {
    // La petición se dirige al ID específico del proyecto
    const response = await apiClient.patch<Project>(`/api/projects/${id}`, data)
    return response.data
}

/**
 * Elimina un proyecto de forma permanente.
 */
export const deleteProject = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`)
}
