// Servicio de envío de correos usando EmailJS
import emailjs from '@emailjs/browser'

const serviceId = "service_ut10vml"
const templateRequester = "template_vn2lufl"
const templateProgrammer = "template_lo7pcvp"
const publicKey = "ESq6kz1urCyDp34G8"

const isConfigured = (templateId?: string) =>
  Boolean(serviceId && publicKey && templateId)

// Envía correo genérico validando configuración
const sendEmail = async (
  templateId: string | undefined,
  params: Record<string, unknown>,
) => {
  if (!isConfigured(templateId)) {
    console.warn('EmailJS no esta configurado; se omite el envio.')
    return
  }

  try {
    await emailjs.send(serviceId as string, templateId as string, params, {
      publicKey,
    })
  } catch (error) {
    console.error('Error al enviar correo:', error)
  }
}

export interface ProgrammerAdvisoryEmailInput {
  programmerEmail?: string
  programmerName?: string
  requesterName: string
  requesterEmail: string
  date: string
  time: string
  note?: string
}

// Notifica al programador sobre una nueva solicitud de asesoría
export const sendProgrammerAdvisoryEmail = async (
  payload: ProgrammerAdvisoryEmailInput,
) => {
  if (!payload.programmerEmail) {
    console.warn('No se envio correo: falta correo del programador.')
    return
  }

  await sendEmail(templateProgrammer, {
    to_email: payload.programmerEmail,
    programmer_name: payload.programmerName || 'Programador',
    requester_name: payload.requesterName,
    requester_email: payload.requesterEmail,
    date: payload.date,
    time: payload.time,
    note: payload.note || 'Sin comentarios adicionales.',
  })
}

export interface RequesterStatusEmailInput {
  requesterEmail?: string
  requesterName?: string
  programmerName?: string
  status: 'pendiente' | 'aprobada' | 'rechazada'
  date?: string
  time?: string
  responseMessage?: string
}

// Notifica al solicitante sobre cambios de estado (aprobada/rechazada)
export const sendRequesterStatusEmail = async (
  payload: RequesterStatusEmailInput,
) => {
  if (!payload.requesterEmail) {
    console.warn('No se envio correo: falta correo del solicitante.')
    return
  }

  await sendEmail(templateRequester, {
    to_email: payload.requesterEmail,
    requester_name: payload.requesterName || 'Cliente',
    programmer_name: payload.programmerName || 'Programador',
    status: payload.status,
    date: payload.date || 'Fecha por confirmar',
    time: payload.time || 'Hora por confirmar',
    response_message:
      payload.responseMessage ||
      (payload.status === 'aprobada'
        ? 'Tu solicitud fue aprobada.'
        : 'Tu solicitud fue rechazada.'),
  })
}
