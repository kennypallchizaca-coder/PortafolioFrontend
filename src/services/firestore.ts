/**
 * Servicio de Firestore para CRUD de usuarios, portafolios, proyectos y asesorías.
 * Práctica: Consumo de APIs + separación de responsabilidades.
 */
import {
  collection,
  addDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  updateDoc,
  setDoc,
  deleteDoc,
  DocumentData,
} from 'firebase/firestore'
import { db } from './firebase'
import { Role } from './auth'

export const collections = {
  users: 'users',
  portfolios: 'portfolios',
  projects: 'projects',
  schedules: 'schedules',
  advisories: 'advisories',
} as const

export interface ProgrammerProfile {
  displayName: string
  email: string
  specialty?: string
  bio?: string
  role: Role
  photoURL?: string
  skills?: string[]
  socials?: {
    github?: string
    instagram?: string
    whatsapp?: string
  }
}

export interface Portfolio {
  headline: string
  about?: string
  skills?: string[]
  tags?: string[]
  theme?: string
}

export interface Project {
  title: string
  description?: string
  category: 'academico' | 'laboral'
  role: 'frontend' | 'backend' | 'fullstack' | 'db'
  techStack?: string[]
  repoUrl?: string
  demoUrl?: string
}

export interface AdvisoryRequestInput {
  programmerId: string
  requesterName: string
  requesterEmail: string
  slot: { date: string; time: string }
  note?: string
}

export interface ScheduleSlot {
  day: string
  from: string
  to: string
  available: boolean
}

// Guarda/actualiza perfil de programador (Admin)
export const upsertProgrammer = async (uid: string, data: ProgrammerProfile) => {
  await setDoc(doc(db, collections.users, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export const listProgrammers = async () => {
  const q = query(
    collection(db, collections.users),
    where('role', '==', 'programmer'),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) }))
}

export const deleteProgrammer = async (uid: string) => {
  await deleteDoc(doc(db, collections.users, uid))
}

// Portafolios
export const getPortfolio = async (ownerId: string) => {
  const ref = doc(db, collections.portfolios, ownerId)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as Portfolio & DocumentData) : null
}

export const upsertPortfolio = async (ownerId: string, payload: Portfolio) => {
  await setDoc(doc(db, collections.portfolios, ownerId), {
    ...payload,
    ownerId,
    updatedAt: serverTimestamp(),
  })
}

// Proyectos
export const listProjectsByOwner = async (ownerId: string) => {
  const q = query(
    collection(db, collections.projects),
    where('ownerId', '==', ownerId),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) }))
}

export const addProject = async (ownerId: string, data: Project) => {
  return addDoc(collection(db, collections.projects), {
    ...data,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export const updateProject = async (projectId: string, data: Partial<Project>) =>
  updateDoc(doc(db, collections.projects, projectId), {
    ...data,
    updatedAt: serverTimestamp(),
  })

// Asesorías
export const addAdvisoryRequest = async (data: AdvisoryRequestInput) =>
  addDoc(collection(db, collections.advisories), {
    ...data,
    status: 'pendiente',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

export const listAdvisoriesByProgrammer = async (programmerId: string) => {
  const q = query(
    collection(db, collections.advisories),
    where('programmerId', '==', programmerId),
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as DocumentData) }))
}

export const updateAdvisoryStatus = async (
  advisoryId: string,
  status: 'pendiente' | 'aprobada' | 'rechazada',
  responseMessage?: string,
) =>
  updateDoc(doc(db, collections.advisories, advisoryId), {
    status,
    responseMessage,
    updatedAt: serverTimestamp(),
  })

// Horarios
export const upsertSchedule = async (programmerId: string, slots: ScheduleSlot[]) => {
  await setDoc(doc(db, collections.schedules, programmerId), {
    programmerId,
    slots,
    updatedAt: serverTimestamp(),
  })
}

export const getScheduleByProgrammer = async (programmerId: string) => {
  const ref = doc(db, collections.schedules, programmerId)
  const snap = await getDoc(ref)
  return snap.exists() ? (snap.data() as DocumentData) : null
}
