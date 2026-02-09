/**
 * Servicio para gestión de portafolios.
 * Permite obtener, crear y actualizar portafolios de usuario e imagenes.
 */
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

/**
 * Obtener portafolio de un usuario
 */
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

/**
 * Crear o actualizar portafolio
 * El backend maneja la lógica de upsert
 */
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

/**
 * Obtener todos los portafolios públicos
 */
export const getAllPortfolios = async (): Promise<Portfolio[]> => {
    const response = await apiClient.get<Portfolio[]>('/api/portfolios/public')
    return response.data
}
