# LEXISWARE - Portafolio Profesional

> Plataforma web para gestión de portafolios administrable multiusuario con sistema de asesorías

[![React](https://img.shields.io/badge/React-19.0.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.x-orange.svg)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2.0-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Academic-green.svg)]()

## Descripción

Aplicación web desarrollada como proyecto integrador para la asignatura **Programación y Plataformas Web** de la carrera de Computación. Implementa un sistema completo de gestión de portafolios con tres roles diferenciados: Administrador, Programador y Usuario Externo.

### Características Principales

- Autenticación con Google (Firebase Auth)
- Sistema de Roles: Admin, Programmer, External
- Gestión de Proyectos: Académicos y Laborales
- Sistema de Asesorías: Solicitud y aprobación con notificaciones por email
- Diseño Responsive: Mobile-first con TailwindCSS
- Múltiples Temas: Dark/Light con DaisyUI
- Gestión de Imágenes: localStorage sin backend adicional
- Notificaciones Email: EmailJS para comunicaciones automáticas

## Tecnologías

### Frontend
- **React 19** con TypeScript
- **Vite 7.2** - Build tool ultrarrápido
- **React Router v6** - Navegación SPA
- **TailwindCSS + DaisyUI** - Estilos y componentes
- **Framer Motion** - Animaciones suaves

### Backend
- **Firebase Authentication** - Login con Google OAuth
- **Cloud Firestore** - Base de datos NoSQL
- **Firebase Hosting** - Despliegue estático
- **EmailJS** - Servicio de envío de correos

### Herramientas de Desarrollo
- **pnpm** - Gestor de paquetes eficiente
- **ESLint** - Linting y formateo de código
- **PostCSS** - Procesamiento de CSS
- **TypeScript** - Tipado estático

## Instalación y Configuración

### Prerrequisitos
- Node.js >= 18.x
- pnpm >= 8.x
- Cuenta de Firebase
- Cuenta de EmailJS (opcional, para notificaciones)

### Pasos de Instalación

```bash
# Clonar repositorio
git clone https://github.com/kennypallchizaca-coder/PORTAFOLIO.git
cd PORTAFOLIO

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123:web:abc123

# EmailJS Configuration (Opcional)
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
VITE_EMAILJS_TEMPLATE_PROGRAMMER=template_vn2lufl
VITE_EMAILJS_TEMPLATE_REQUESTER=template_lo7pcvp
```

### Ejecutar el Proyecto

```bash
# Modo desarrollo
pnpm run dev

# Build para producción
pnpm run build

# Preview del build local
pnpm run preview

# Linting
pnpm run lint
```

## Arquitectura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── Footer.tsx       # Pie de página
│   ├── LocalImage.tsx   # Gestión de imágenes locales
│   ├── Logo.tsx         # Logo de la aplicación
│   ├── NavBar.tsx       # Barra de navegación
│   └── ...
├── context/             # Contextos de React
│   ├── AuthContext.tsx  # Gestión de autenticación
│   └── ThemeContext.tsx # Gestión de temas
├── layouts/             # Layouts principales
│   ├── DashboardLayout.tsx # Layout para usuarios autenticados
│   └── PublicLayout.tsx    # Layout para páginas públicas
├── pages/               # Páginas de la aplicación
│   ├── admin/           # Panel de administración
│   ├── programmer/      # Panel del programador
│   ├── public/          # Páginas públicas
│   └── auth/            # Autenticación
├── services/            # Servicios externos
│   ├── auth.ts          # Firebase Auth
│   ├── firestore.ts     # Operaciones de base de datos
│   ├── firebase.ts      # Configuración Firebase
│   └── email.ts         # Servicio de correos EmailJS
├── utils/               # Utilidades
│   └── FormUtils.ts     # Validaciones de formularios
├── assets/              # Recursos estáticos
├── img/                 # Imágenes del proyecto
└── App.tsx              # Componente raíz y enrutador
```

## Roles y Funcionalidades

### Administrador
- Gestión de Usuarios: CRUD completo de programadores
- Proyectos Globales: Administración de proyectos destacados
- Horarios: Configuración de disponibilidad de asesorías
- Dashboard: Estadísticas y métricas del sistema

### Programador
- Perfil Personal: Editor de información, foto, skills y redes sociales
- Portafolio: Gestión de proyectos académicos y laborales
- Asesorías: Inbox para gestionar solicitudes de asesorías
- Dashboard: Vista general de actividad personal

### Usuario Externo
- Directorio: Explorar perfiles de programadores disponibles
- Portafolios: Ver proyectos y habilidades de cada programador
- Asesorías: Solicitar asesorías sin necesidad de registro
- Seguimiento: Consultar estado de solicitudes por email

## Sistema de Notificaciones

El sistema incluye notificaciones automáticas por correo electrónico:

- Al programador: Notificación inmediata cuando se solicita una asesoría
- Al solicitante: Confirmación cuando se aprueba o rechaza la solicitud

### Configuración de EmailJS

1. Crear cuenta en [EmailJS](https://www.emailjs.com/)
2. Configurar servicio de correo (Gmail, Outlook, etc.)
3. Crear dos templates:
   - Template Programador: Para notificar nuevas solicitudes
   - Template Solicitante: Para respuestas de asesorías

Campos recomendados en los templates:
- `{{to_email}}` - Destinatario
- `{{programmer_name}}` / `{{requester_name}}` - Nombres
- `{{date}}`, `{{time}}` - Detalles de la cita
- `{{status}}`, `{{response_message}}` - Estado y respuesta

## Despliegue

### Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Autenticación
firebase login

# Inicializar hosting
firebase init hosting

# Desplegar
pnpm run build
firebase deploy
```

### Variables de Producción

Asegúrate de configurar las variables de entorno en Firebase:
```bash
firebase functions:config:set \
  emailjs.service_id="tu_service_id" \
  emailjs.public_key="tu_public_key"
```

## Testing

```bash
# Ejecutar tests (si se implementan)
pnpm run test

# Coverage
pnpm run test:coverage
```

## Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Guías de Desarrollo

- Usar TypeScript para tipado fuerte
- Seguir convenciones de ESLint
- Mantener commits descriptivos
- Documentar componentes complejos

## Problemas Conocidos

- Las imágenes se almacenan en localStorage (limitación del navegador)
- Requiere conexión a internet para Firebase
- EmailJS puede tener límites de envío gratuitos

## Roadmap

- Migración a Firebase Storage para imágenes
- Implementación de tests unitarios
- Sistema de calificaciones para asesorías
- Integración con calendarios (Google Calendar)
- API REST para integraciones externas
- Modo offline con Service Workers

## Licencia

Proyecto académico desarrollado para la Universidad Nacional de Loja - Carrera de Computación.

**Asignatura:** Programación y Plataformas Web  
**Docente:** Ing. Pablo Torres  
**Período:** Octubre 2025 - Febrero 2026

## Autores

- **Alex Guaaman** - [@kennypallchizaca-coder](https://github.com/kennypallchizaca-coder)
- **Daniel Guanga** - Desarrollo colaborativo

## Contacto

Para preguntas o soporte:
- **Email**: aguamanp4@est.ups.edu.ec
- **GitHub**: [kennypallchizaca-coder](https://github.com/kennypallchizaca-coder)

---

**LEXISWARE** - Portafolio Profesional © 2025

*Desarrollado para la comunidad de programadores*
