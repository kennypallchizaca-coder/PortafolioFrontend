// Servicio para gestión de portafolios (CRUD e imágenes)
import { apiClient } from './api'

export interface Portfolio {
    id?: number
    userId: string
    title: string
    description: string
    theme: string
    isPublic: boolean
    skills?: string[]
}

// Obtiene el portafolio de un usuario específico; retorna datos o null si no existe
export const getPortfolio = async (userId: string): Promise<Portfolio | null> => {
    try {
        const response = await apiClient.get<Portfolio>(`/api/portfolios/user/${userId}`)
        return response.data
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null // Portfolio no existe aún
        }
        throw error
    }
}

// Crea o actualiza un portafolio existente (lógica Upsert); retorna el portafolio actualizado
export const upsertPortfolio = async (userId: string, data: Partial<Portfolio>): Promise<Portfolio> => {
    try {
        // Intentar obtener el portafolio existente
        const existing = await getPortfolio(userId)

        if (existing && existing.id) {
            // Si existe, actualizar con PATCH
            const payload = { ...data, userId }
            const response = await apiClient.patch<Portfolio>(`/api/portfolios/${existing.id}`, payload)
            return response.data
        }
    } catch (error) {
        // Si no existe (404) o error, continuar al POST
        // (getPortfolio maneja el 404 retornando null, pero por si acaso)
    }

    // Si no existe, crear con POST
    const payload = { ...data, userId }
    const response = await apiClient.post<Portfolio>('/api/portfolios', payload)
    return response.data
}

// Recupera todos los portafolios marcados como públicos; retorna lista
export const getAllPortfolios = async (): Promise<Portfolio[]> => {
    const response = await apiClient.get<Portfolio[]>('/api/portfolios/public')
    return response.data
}
