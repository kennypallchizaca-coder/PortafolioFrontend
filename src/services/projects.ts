// Servicio para gestión de proyectos (CRUD)
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

// Obtiene proyectos de un usuario específico; retorna lista de proyectos
export const getProjectsByOwner = async (ownerId: string): Promise<Project[]> => {
    // Realizar petición GET al endpoint filtrado por usuario
    // El objeto retornado por Spring Boot suele ser un Pageable, 
    // por lo que extraemos 'content' si viene paginado, o la data directa si es una lista simple.
    const response = await apiClient.get<any>(`/api/projects/user/${ownerId}`)
    return response.data.content || response.data
}

// Obtiene todos los proyectos registrados en la plataforma; retorna lista
export const getAllProjects = async (): Promise<Project[]> => {
    // Request a larger page size to fetch all projects (temporary fix until pagination is implemented in UI)
    const response = await apiClient.get<any>('/api/projects', {
        params: { size: 100 }
    })
    // Manejo de respuesta paginada de Spring Data
    return response.data.content || response.data
}

// Busca un proyecto por su ID único; retorna el proyecto
export const getProject = async (id: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/api/projects/${id}`)
    return response.data
}

// Crea un nuevo proyecto en la base de datos; retorna el proyecto creado
export const createProject = async (data: Omit<Project, 'id'>): Promise<Project> => {
    const response = await apiClient.post<Project>('/api/projects', data)
    return response.data
}

// Actualiza parcialmente un proyecto existente; retorna el proyecto actualizado
export const updateProject = async (
    id: string,
    data: Partial<Project>
): Promise<Project> => {
    // La petición se dirige al ID específico del proyecto
    const response = await apiClient.patch<Project>(`/api/projects/${id}`, data)
    return response.data
}

// Elimina permanentemente un proyecto por ID
export const deleteProject = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${id}`)
}

// Descarga reporte PDF de proyectos de un usuario; retorna Blob del archivo
export const downloadUserProjectsReport = async (uid: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`/api/reports/projects/${uid}/pdf`, {
        responseType: 'blob'
    })
    return response.data
}

