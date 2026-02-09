// Cliente Axios configurado
import apiClient from './api'

export interface AdvisoryRequestInput {
    programmerId: string
    programmerName: string
    programmerEmail: string
    requesterName: string
    requesterEmail: string
    date: string
    time: string
    note?: string
}

export interface Advisory {
    id?: string
    programmerId: string
    programmerName: string
    programmerEmail: string
    requesterName: string
    requesterEmail: string
    date: string
    time: string
    note?: string
    status: 'pending' | 'approved' | 'rejected'
    responseMessage?: string
    createdAt?: string
    updatedAt?: Date
}

// Envía una solicitud de asesoría al backend; retorna la asesoría creada
export const createAdvisoryRequest = async (
    data: AdvisoryRequestInput
): Promise<Advisory> => {
    const response = await apiClient.post<Advisory>('/api/advisories', data)
    return response.data
}

// Obtiene las asesorías asignadas a un programador; retorna una lista de asesorías
export const getAdvisoriesByProgrammer = async (
    programmerId: string
): Promise<Advisory[]> => {
    // El backend retorna Page<Advisory>, extraemos el contenido
    const response = await apiClient.get<any>(`/api/advisories/programmer/${programmerId}`)
    return response.data.content || response.data
}

// Busca asesorías solicitadas por un email específico; retorna la lista encontrada
export const getAdvisoriesByRequester = async (
    requesterEmail: string
): Promise<Advisory[]> => {
    const response = await apiClient.get<any>(`/api/advisories/requester/${requesterEmail}`)
    return response.data.content || response.data
}

// Actualiza el estado (pending/approved/rejected) de una asesoría; retorna la asesoría actualizada
export const updateAdvisoryStatus = async (
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    responseMessage?: string
): Promise<Advisory> => {
    // Se envía el nuevo estado al endpoint PATCH
    const response = await apiClient.patch<Advisory>(`/api/advisories/${id}/status`, {
        status,
        responseMessage,
    })
    return response.data
}
// Elimina todo el historial de asesorías
export const clearAdvisoryHistory = async (): Promise<void> => {
    await apiClient.delete('/api/advisories/history')
}

// Elimina el historial de asesorías de un solicitante específico
export const clearRequesterHistory = async (email: string): Promise<void> => {
    await apiClient.delete(`/api/advisories/requester/${email}`)
}
