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
