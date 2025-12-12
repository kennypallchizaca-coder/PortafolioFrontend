# INFORME DEL PROYECTO – PORTAFOLIO ADMINISTRATIVO

## 1. Logo de la Carrera y del Proyecto
*Incluir referencia o imagen del logo institucional y del equipo/proyecto en la carpeta `public/` o un enlace externo accesible.*

## 2. Integrantes
- **Alex Guaaman** – [https://github.com/kennypallchizaca-coder](https://github.com/kennypallchizaca-coder)
- **Daniel Guanga** – Desarrollo colaborativo
- **Repositorio principal:** [LEXISWARE - Portafolio Profesional](https://github.com/kennypallchizaca-coder/PORTAFOLIO)

## 3. Tecnologías Utilizadas
![React](https://img.shields.io/badge/React-19.0.0-blue.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg) ![Vite](https://img.shields.io/badge/Vite-7.2.0-646CFF.svg) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg) ![Firebase](https://img.shields.io/badge/Firebase-10.x-orange.svg) ![EmailJS](https://img.shields.io/badge/EmailJS-automatizado-success.svg)

- **Frontend:** React 19 + TypeScript, Vite, React Router v6, TailwindCSS con DaisyUI, Framer Motion.
- **Backend serverless:** Firebase Authentication, Cloud Firestore, Firebase Hosting.
- **Notificaciones:** EmailJS para envío automático de correos.
- **Tooling:** pnpm, ESLint, PostCSS, TypeScript.

## 4. Descripción del Proyecto
LEXISWARE es una plataforma web académica para gestionar portafolios profesionales y solicitudes de asesoría con control de acceso por roles. Ofrece una landing pública para explorar programadores y proyectos, paneles protegidos para administración y programación, y notificaciones por correo cuando se crean o actualizan solicitudes.

## 5. Roles y Funcionalidades
### Administrador
- Gestión de usuarios y roles (creación, actualización y eliminación).
- Revisión y aprobación/rechazo de solicitudes de asesoría.
- Administración de proyectos globales y métricas internas.
- Acceso completo al panel administrativo.
- Edición de módulos internos según políticas académicas.

### Programador
- Edición de perfil profesional, portafolio y proyectos académicos/laborales.
- Mantenimiento de su bandeja de asesorías (aprobar, rechazar, responder).
- Actualizaciones técnicas y gestión de datos propios.
- Acceso a funcionalidades autorizadas del dashboard de programador.

### Usuario General
- Creación de solicitudes de asesoría sin registro previo.
- Visualización de portafolios y proyectos públicos.
- Seguimiento del estado de sus solicitudes.
- Recepción de notificaciones por correo con las respuestas.

## 6. Módulos y Pantallas del Sistema
- **Landing / Página pública:** Vista principal con hero, navegación y acceso a portafolios y proyectos.
- **Login:** Autenticación con Google mediante Firebase Auth.
- **Dashboard Admin:** Panel con navegación lateral para métricas, usuarios, roles y solicitudes.
- **Gestión de usuarios/roles:** Listados y formularios para alta, edición o eliminación de usuarios y roles.
- **Gestión de proyectos:** Administración de proyectos académicos/laborales y categorías asociadas.
- **Panel del programador:** Dashboard específico para perfil, portafolio, proyectos y asesorías.
- **Perfil de usuario:** Edición de datos personales y enlaces de contacto del programador.
- **Solicitudes:** Bandeja de asesorías (programador) y formulario público para crear nuevas solicitudes.
- **Visualización pública de portafolios:** Directorio de programadores y detalle de sus proyectos.

## 7. Flujos Principales del Usuario
1. **Ingreso público:** El visitante accede a la landing y navega por el directorio de programadores y proyectos sin autenticarse.
2. **Autenticación y enrutamiento:** Un usuario inicia sesión con Google; el guard de rutas valida el rol y redirige al panel correspondiente (admin o programador).【F:src/App.tsx†L15-L84】
3. **Creación de solicitud:** Un usuario general completa el formulario de asesoría; la solicitud se registra en Firestore con estado inicial `pending` y se notifica al programador por correo.【F:src/services/firestore.ts†L125-L172】【F:src/services/email.ts†L9-L71】
4. **Atención de solicitud (programador):** El programador revisa su bandeja, actualiza el estado (aprobada/rechazada) y el solicitante recibe un correo con la respuesta detallada.【F:src/services/firestore.ts†L174-L217】【F:src/services/email.ts†L73-L106】
5. **Administración:** El administrador gestiona roles, usuarios y proyectos desde el dashboard, manteniendo la información publicada y las solicitudes validadas.【F:src/App.tsx†L48-L71】

## 8. Fragmentos Técnicos Importantes
### Envío de correo con EmailJS
```ts
await emailjs.send(serviceId as string, templateId as string, params, {
  publicKey,
})
```
*Ubicación:* `src/services/email.ts` – envía notificaciones a programadores o solicitantes validando previamente la configuración.【F:src/services/email.ts†L21-L48】

### Registro de asesorías en Firebase
```ts
const payload = {
  ...data,
  programmerEmail: contact.programmerEmail,
  programmerName: contact.programmerName,
  status: 'pending',
  response: '',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
}

const docRef = await addDoc(collection(db, collections.advisories), payload)
```
*Ubicación:* `src/services/firestore.ts` – persiste la solicitud y agrega metadata temporal para trazabilidad.【F:src/services/firestore.ts†L142-L172】

### Notificación de respuesta al solicitante
```ts
await updateDoc(ref, {
  status,
  responseMessage,
  updatedAt: serverTimestamp(),
})

await sendRequesterStatusEmail({
  requesterEmail: advisoryData.requesterEmail as string | undefined,
  requesterName: advisoryData.requesterName as string | undefined,
  programmerName: contact.programmerName,
  status,
  date: advisoryData.slot?.date as string | undefined,
  time: advisoryData.slot?.time as string | undefined,
  responseMessage,
})
```
*Ubicación:* `src/services/firestore.ts` – actualiza el estado de la asesoría y envía la notificación correspondiente.【F:src/services/firestore.ts†L188-L217】

## 9. Conclusiones
LEXISWARE integra React + Firebase + EmailJS para ofrecer una SPA de portafolios y asesorías con control de roles, persistencia en tiempo real y notificaciones automáticas. El proyecto consolida módulos públicos y privados bien delimitados; las mejoras futuras incluyen migrar almacenamiento multimedia a Firebase Storage, ampliar pruebas automatizadas e integrar calendarios o APIs adicionales para optimizar la coordinación de asesorías.
