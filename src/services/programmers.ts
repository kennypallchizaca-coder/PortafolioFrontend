/**
 * Servicio para gestión de programadores (CRUD).
 * Conecta con endpoints del backend Spring Boot.
 */
import apiClient from './api'
import { Role } from './auth'

export interface ProgrammerProfile {
    id?: string
    uid?: string // el backend usa uid
    displayName: string
    email: string
    specialty?: string
    bio?: string
    role: Role
    photoURL?: string
    skills?: string[]
    available?: boolean
    schedule?: string[]
    socials?: {
        github?: string
        instagram?: string
        whatsapp?: string
    }
}

/**
 * Obtener todos los programadores
 */
export const getProgrammers = async (): Promise<ProgrammerProfile[]> => {
    const response = await apiClient.get<any[]>('/api/users/programmers')
    // mapear campos del backend a formato frontend
    return response.data.map((user: any) => ({
        ...user,
        socials: {
            github: user.github,
            instagram: user.instagram,
            whatsapp: user.whatsapp
        }
    }))
}

/**
 * Obtener un programador por ID
 */
export const getProgrammer = async (id: string): Promise<ProgrammerProfile> => {
    const response = await apiClient.get<any>(`/api/users/${id}`)
    // mapear campos del backend a formato frontend
    return {
        ...response.data,
        socials: {
            github: response.data.github,
            instagram: response.data.instagram,
            whatsapp: response.data.whatsapp
        }
    }
}

/**
 * Crear o actualizar un programador
 */
export const upsertProgrammer = async (
    id: string,
    data: Partial<ProgrammerProfile>
): Promise<ProgrammerProfile> => {
    // el backend usa POST /api/users para crear o actualizar
    // fusionamos el ID en el objeto data
    const payload = { ...data, uid: id, id: id }
    const response = await apiClient.post<ProgrammerProfile>('/api/users', payload)
    return response.data
}

/**
 * Actualizar perfil de programador
 */
export const updateProgrammer = async (
    id: string,
    data: Partial<ProgrammerProfile>
): Promise<ProgrammerProfile> => {
    // aplanar objeto socials a campos individuales para el backend
    const payload: any = { ...data }
    if (data.socials) {
        payload.github = data.socials.github
        payload.instagram = data.socials.instagram
        payload.whatsapp = data.socials.whatsapp
        delete payload.socials // eliminar objeto anidado
    }

    // usar PATCH para actualizaciones parciales
    const response = await apiClient.patch<any>(`/api/users/${id}`, payload)

    // mapear respuesta al formato frontend
    return {
        ...response.data,
        socials: {
            github: response.data.github,
            instagram: response.data.instagram,
            whatsapp: response.data.whatsapp
        }
    }
}

/**
 * Eliminar un programador
 */
export const deleteProgrammer = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/users/${id}`)
}

/**
 * Obtener portafolio de un programador
 */
export interface Portfolio {
    id?: string
    userId?: string
    headline: string
    about?: string
    skills?: string[]
    tags?: string[]
    theme?: string
}

export const getPortfolio = async (ownerId: string): Promise<Portfolio | null> => {
    try {
        // endpoint del backend para buscar por ID del propietario
        const response = await apiClient.get<Portfolio>(`/api/portfolios/user/${ownerId}`)
        return response.data
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null
        }
        throw error
    }
}

/**
 * Actualizar portafolio de un programador
 */
export const upsertPortfolio = async (
    ownerId: string,
    data: Portfolio
): Promise<Portfolio> => {
    // lógica: intentar buscar portafolio existente para el usuario
    let existing: Portfolio | null = null;
    try {
        existing = await getPortfolio(ownerId);
    } catch (e) {
        // ignorar error
    }

    if (existing && existing.id) {
        // actualizar (PATCH)
        const response = await apiClient.patch<Portfolio>(`/api/portfolios/${existing.id}`, data)
        return response.data
    } else {
        // crear (POST)
        // asegurar que userId se establezca para la creación
        const payload = { ...data, userId: ownerId }
        const response = await apiClient.post<Portfolio>('/api/portfolios', payload)
        return response.data
    }
}
