/**
 * Servicio para gestión de asesorías.
 * Conecta con endpoints del backend Spring Boot.
 */
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

/**
 * Crear una solicitud de asesoría
 */
export const createAdvisoryRequest = async (
    data: AdvisoryRequestInput
): Promise<Advisory> => {
    const response = await apiClient.post<Advisory>('/api/advisories', data)
    return response.data
}

/**
 * Obtener asesorías por programador
 */
export const getAdvisoriesByProgrammer = async (
    programmerId: string
): Promise<Advisory[]> => {
    // el backend retorna Page<Advisory>
    const response = await apiClient.get<any>(`/api/advisories/programmer/${programmerId}`)
    return response.data.content || response.data
}

/**
 * Obtener asesorías por email del solicitante
 */
export const getAdvisoriesByRequester = async (
    requesterEmail: string
): Promise<Advisory[]> => {
    const response = await apiClient.get<any>(`/api/advisories/requester/${requesterEmail}`)
    return response.data.content || response.data
}

/**
 * Actualizar estado de una asesoría
 */
export const updateAdvisoryStatus = async (
    id: string,
    status: 'pending' | 'approved' | 'rejected',
    responseMessage?: string
): Promise<Advisory> => {
    // el backend usa PATCH /api/advisories/{id}/status
    // el cuerpo espera "status"
    const response = await apiClient.patch<Advisory>(`/api/advisories/${id}/status`, {
        status: status.toUpperCase(), // convertir enum a mayúsculas para backend
        responseMessage,
    })
    return response.data
}
