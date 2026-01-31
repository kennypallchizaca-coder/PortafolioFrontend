/**
 * Servicio para gestión de proyectos.
 * Conecta con endpoints del backend Spring Boot.
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
 * Obtener proyectos por propietario
 */
export const getProjectsByOwner = async (ownerId: string): Promise<Project[]> => {
    // endpoint del backend: /api/projects/user/{userId}
    // retorna una página Page<Project>, así que extraemos .content
    const response = await apiClient.get<any>(`/api/projects/user/${ownerId}`)
    return response.data.content || response.data
}

/**
 * Obtener todos los proyectos
 */
export const getAllProjects = async (): Promise<Project[]> => {
    const response = await apiClient.get<any>('/api/projects')
    return response.data.content || response.data
}

/**
 * Obtener un proyecto por ID
 */
export const getProject = async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/api/projects/${id}`)
    return response.data
}

/**
 * Crear un nuevo proyecto
 */
export const createProject = async (data: Omit<Project, 'id'>): Promise<Project> => {
    const response = await apiClient.post<Project>('/api/projects', data)
    return response.data
}

/**
 * Actualizar un proyecto existente
 */
export const updateProject = async (
    id: string,
    data: Partial<Project>
): Promise<Project> => {
    // el backend usa PATCH para actualizaciones parciales
    const response = await apiClient.patch<Project>(`/api/projects/${id}`, data)
    return response.data
}

/**
 * Eliminar un proyecto
 */
export const deleteProject = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`)
}
