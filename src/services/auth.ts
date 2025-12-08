/**
 * Servicio de autenticación y roles (TypeScript).
 * Práctica: Consumo de APIs Firebase + manejo de roles en Firestore.
 */
import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Unsubscribe,
} from 'firebase/auth'
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  DocumentData,
} from 'firebase/firestore'
import { auth, db, googleProvider } from './firebase'

export type Role = 'admin' | 'programmer' | 'external'

export interface UserProfile {
  displayName: string | null
  email: string | null
  photoURL?: string | null
  role: Role
  specialty?: string
  bio?: string
  socials?: Record<string, string>
}

const USERS_COLLECTION = 'users'

// Login con Google y creación del usuario en Firestore
export const loginWithGoogle = async () => {
  try {
    console.log('🔑 Iniciando login con Google...')
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    console.log(' Login exitoso:', user.email)
    
    // Crear o actualizar usuario en Firestore
    const userRef = doc(db, USERS_COLLECTION, user.uid)
    const userDoc = await getDoc(userRef)
    
    if (!userDoc.exists()) {
      console.log('Creando usuario en Firestore...')
      await setDoc(userRef, {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: 'external' as Role,
        createdAt: serverTimestamp(),
      })
      console.log('Usuario creado en Firestore')
    } else {
      console.log('Usuario ya existe en Firestore')
    }
    
    return user
  } catch (error: any) {
    console.error('Error en login:', error.code, error.message)
    throw error
  }
}



export const logout = () => firebaseSignOut(auth)

// Escucha de sesión para el AuthContext
export const subscribeToAuthChanges = (
  callback: (user: FirebaseUser | null) => void,
): Unsubscribe => onAuthStateChanged(auth, callback)

// Consulta del rol y perfil en Firestore
export const fetchUserProfile = async (
  uid: string,
): Promise<(UserProfile & DocumentData) | null> => {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid))
  return snap.exists() ? (snap.data() as UserProfile & DocumentData) : null
}
