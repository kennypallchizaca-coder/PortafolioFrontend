// Servicio de gestión de programadores (CRUD)
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

// Obtiene la lista completa de programadores y formatea sus datos; retorna array
export const getProgrammers = async (): Promise<ProgrammerProfile[]> => {
    const response = await apiClient.get<any[]>('/api/users/programmers')
    // mapear campos del backend a formato frontend
    return response.data.map((user: any) => ({
        ...user,
        id: user.uid || user.id, // asegurar que id esté disponible
        socials: {
            github: user.github,
            instagram: user.instagram,
            whatsapp: user.whatsapp
        }
    }))
}

// Busca un programador por ID y formatea la respuesta; retorna perfil del programador
export const getProgrammer = async (id: string): Promise<ProgrammerProfile> => {
    const response = await apiClient.get<any>(`/api/users/${id}`)
    // mapear campos del backend a formato frontend
    return {
        ...response.data,
        id: response.data.uid || response.data.id, // asegurar que id esté disponible
        socials: {
            github: response.data.github,
            instagram: response.data.instagram,
            whatsapp: response.data.whatsapp
        }
    }
}

// Crea o actualiza programador, aplanando objeto 'socials' para el backend; retorna perfil actualizado
export const upsertProgrammer = async (
    id: string,
    data: Partial<ProgrammerProfile>
): Promise<ProgrammerProfile> => {
    // Preparar el payload aplanando los campos sociales
    const payload: any = { ...data, uid: id, id: id }

    // El backend espera campos planos (github, instagram, etc)
    if (data.socials) {
        payload.github = data.socials.github
        payload.instagram = data.socials.instagram
        payload.whatsapp = data.socials.whatsapp
        delete payload.socials
    }

    const response = await apiClient.post<any>('/api/users', payload)

    // Re-mapear la respuesta a la estructura de la aplicación (con objeto socials)
    return {
        ...response.data,
        id: response.data.uid || response.data.id,
        socials: {
            github: response.data.github,
            instagram: response.data.instagram,
            whatsapp: response.data.whatsapp
        }
    }
}

// Actualiza parcialmente perfil de programador (PATCH); retorna perfil actualizado
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

// Elimina un programador del sistema por ID
export const deleteProgrammer = async (id: string): Promise<void> => {
    await apiClient.delete(`/api/users/${id}`)
}

/**
 * Obtener portafolio de un programador
 */
export interface Portfolio {
    id?: string
    userId?: string
    title: string
    description?: string
    skills?: string[]
    theme?: string
    headline?: string // for mapping
    about?: string   // for mapping
}

// Busca el portafolio asociado a un programador; retorna portafolio o null
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

// Crea o actualiza el portafolio de un programador; retorna portafolio
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
