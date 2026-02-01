# LEXISWARE - Portafolio Profesional

![Banner del Proyecto](imagenes/image0.png)

> **Plataforma Integral de Gestión de Portafolios y Asesorías Técnicas**

## Descripción del Proyecto

**LEXISWARE** es una aplicación web de tipo **Single Page Application (SPA)** desarrollada para profesionalizar la presencia digital de los desarrolladores de software. Su objetivo principal es centralizar la exhibición de proyectos técnicos y facilitar la conexión profesional a través de asesorías técnicas.

El sistema resuelve la necesidad de los programadores de tener un espacio unificado para su marca personal, y brinda a los reclutadores o clientes una plataforma confiable para validar habilidades técnicas.

### Casos de Uso y Funcionalidades
*   **Perfil Público de Programador:** Exhibición de biografía, habilidades técnicas, enlaces a redes y portafolio de proyectos.
*   **Gestión de Asesorías:** Sistema completo para que usuarios soliciten mentorías, con flujo de aprobación/rechazo por parte del programador.
*   **Panel Administrativo:** Control total sobre los usuarios registrados, validación de proyectos subidos y monitoreo de la actividad de la plataforma.
*   **Seguridad:** Control de acceso basado en roles (RBAC) para Admin y Programador.

---

## Requisitos del Sistema

Para garantizar el correcto funcionamiento del entorno de desarrollo, asegúrese de cumplir con:

*   **Sistema Operativo:** Windows 10/11, macOS, o Linux.
*   **Node.js:** Versión 18.0.0 (LTS) o superior.
*   **Gestor de Paquetes:** npm (v9+ recommended), pnpm o yarn.
*   **Backend:** Instancia activa del servidor Spring Boot LEXISWARE (Local o Remoto).
*   **Navegador:** Chrome, Firefox, Edge o Safari (versiones recientes).

---

## Instalación y Ejecución

Siga estos pasos detallados para configurar el proyecto localmente:

### 1. Obtención del Código Fuente
Clone el repositorio utilizando Git y navegue al directorio del proyecto:
```bash
git clone https://github.com/kennypallchizaca-coder/PORTAFOLIO.git
cd PORTAFOLIO
```

### 2. Instalación de Dependencias
Instale las librerías necesarias definidas en `package.json`:
```bash
npm install
```

### 3. Configuración de Entorno
Cree un archivo `.env` en la raíz (consulte la sección **Configuración**).

### 4. Ejecución en Desarrollo
Inicie el servidor de desarrollo Vite con Hot Module Replacement (HMR):
```bash
npm run dev
```
Acceda a la aplicación en: `http://localhost:5173`

### 5. Construcción para Producción
Genere los archivos optimizados para despliegue:
```bash
npm run build
```
Los archivos resultantes se ubicarán en `dist/`.

---

## Estructura del Repositorio

La arquitectura de carpetas sigue un patrón modular y escalable:

```text
src/
├── assets/             # Recursos estáticos globales (imágenes, fuentes)
├── components/         # Bloques de construcción UI
│   ├── ui/             # Componentes atómicos (Botones, Modales, Inputs)
│   └── ...             # Componentes compuestos específicos
├── context/            # Gestión de estado global (Context API)
│   ├── AuthContext.tsx # Lógica de autenticación y sesión de usuario
│   └── ThemeContext.tsx # Manejo de tema visual (Claro/Oscuro)
├── layouts/            # Estructuras de página base
│   ├── AdminLayout.tsx # Layout con sidebar para administradores
│   └── PublicLayout.tsx # Layout con navbar para visitantes
├── pages/              # Vistas principales (Páginas)
│   ├── admin/          # Módulos del panel administrativo
│   │   ├── AdminDashboard.tsx # Métricas y resumen
│   │   ├── ProgrammersPage.tsx # Gestión de usuarios programadores
│   │   └── ProjectsAdmin.tsx # Moderación de proyectos
│   ├── auth/           # Vistas de autenticación (Login, Register)
│   ├── programmer/     # Módulos del panel de programador
│   │   ├── ProfileEditor.tsx # Edición de datos personales
│   │   ├── PortfolioEditor.tsx # Gestión de proyectos del portafolio
│   │   └── AdvisoryInbox.tsx # Bandeja de solicitudes de asesoría
│   └── public/         # Vistas de acceso público
├── services/           # Capa de comunicación con API Backend
│   ├── api.ts          # Configuración base de Axios e interceptores
│   ├── auth.ts         # Servicios de Login/Registro
│   ├── programmers.ts  # Servicios de gestión de perfiles
│   └── ...
├── utils/              # Funciones de utilidad pura y formateadores
├── App.tsx             # Definición de rutas y estructura de la app
└── main.tsx            # Punto de entrada y montaje en el DOM
```

---

## Arquitectura y Componentes Clave

### Arquitectura de Software
El proyecto utiliza una arquitectura de **Cliente Rico (Rich Client)** desacoplada. EL Frontend gestiona la presentación, el enrutamiento y la lógica de interfaz, comunicándose con el Backend exclusivamente a través de una API REST.

### Componentes Principales

#### 1. Capa de Servicios (`src/services/api.ts`)
Es el núcleo de la comunicación. Configura una instancia singleton de `axios` que incluye:
*   **Base URL:** Inyectada dinámicamente desde variables de entorno.
*   **Request Interceptor:** Inyecta automáticamente el token JWT (`Authorization: Bearer ...`) en cada petición si el usuario está autenticado.
*   **Response Interceptor:** Captura errores globales, como el código 401, para cerrar sesión automáticamente.

#### 2. Contexto de Autenticación (`AuthContext.tsx`)
Mantiene el estado de la sesión del usuario. Provee métodos globales como `login()`, `logout()` y `user` para que cualquier componente sepa si hay una sesión activa y qué rol tiene el usuario.

#### 3. Módulos de Administración (`src/pages/admin/`)
*   **ProgrammersPage.tsx:** Tabla compleja que permite listar, editar o desactivar cuentas de programadores.
*   **ProjectsAdmin.tsx:** Interfaz de auditoría para revisar los proyectos subidos antes de que sean visibles públicamente.

#### 4. Módulos de Programador (`src/pages/programmer/`)
*   **ProfileEditor.tsx:** Formulario extenso con validaciones para actualizar información profesional.
*   **AdvisoryInbox.tsx:** Panel de gestión de solicitudes, permitiendo cambiar estados (Pendiente, Aprobada, Rechazada).

---

## Configuración

La aplicación se configura mediante variables de entorno. Es obligatorio definir estas variables para la conexión con el Backend.

| Variable | Descripción | Valor Ejemplo | Requerido |
| :--- | :--- | :--- | :---: |
| `VITE_API_BASE_URL` | Endpoint raíz del servidor Backend. | `https://spring-proyecto.onrender.com` | Sí |
| `VITE_API_TIMEOUT` | Tiempo máximo de espera para peticiones (ms). | `120000` | No |

**Nota:** Utilice `.env.local` para sus configuraciones locales para evitar subirlas al repositorio.

---

## Dependencias

Las principales librerías que potencian LEXISWARE son:

*   **React 19 & React DOM:** Base del framework para construcción de interfaces reactivas.
*   **Vite:** Herramienta de construcción (bundler) de última generación, superior a Webpack en velocidad.
*   **TypeScript:** Superset de JavaScript que añade tipado estático, reduciendo errores en tiempo de ejecución.
*   **React Router Dom (v7):** Manejo de navegación SPA (sin recarga de página).
*   **Axios:** Cliente HTTP basado en promesas, usado por su facilidad para interceptores.
*   **TailwindCSS & DaisyUI:** Sistema de diseño. Tailwind ofrece utilidades de bajo nivel, y DaisyUI componentes semánticos (botones, cards) pre-estilizados.
*   **Framer Motion:** Biblioteca de animaciones declarativas para mejorar la experiencia de usuario (UX).
*   **EmailJS:** Solución Serverless para el envío de notificaciones por correo desde el frontend.

---

## Pruebas

Actualmente el proyecto está configurado para pruebas manuales intensivas.

### Pasos para Pruebas Manuales:
1.  **Smoke Test:** Inicie la aplicación y verifique que la Landing Page carga sin errores de consola.
2.  **Auth Flow:** Intente registrar un usuario nuevo y loguése. Verifique que el token JWT se guarde en `localStorage`.
3.  **CRUD Test:** Como programador, cree un proyecto nuevo. Verifique que aparece en su perfil.
4.  **Role Test:** Intente acceder a `/admin` con un usuario programador. Debería ser redirigido o ver un error de permisos.

*(Nota: La implementación de suites automatizadas con Vitest o Jest es una mejora planificada).*

---

## Convenciones de Desarrollo

El proyecto sigue estándares estrictos para mantener la calidad del código:

*   **Linting:** Se utiliza ESLint con configuración `react-hooks` y `react-refresh` para asegurar buenas prácticas de React.
*   **Estructura de Archivos:** PascalCase para componentes (`MiComponente.tsx`) y camelCase para utilidades/hooks (`useAuth.ts`).
*   **Imports:** Se prefieren imports absolutos o organizados por capas (primero librerías, luego componentes propios).
*   **Commits:** Se recomienda el uso de Conventional Commits (feat, fix, docs, style).

---

## Problemas Conocidos y Limitaciones

*   **Dependencia Backend:** La aplicación no funcionará correctamente si la variable `VITE_API_BASE_URL` no apunta a un servidor activo.
*   **Persistencia de Imágenes:** Actualmente depende de servicios externos configurados en el Backend; fallos en la red pueden afectar la carga de medios.

---

## Créditos

Equipo de Desarrollo - LEXISWARE

*   **Alex Guaman** – [GitHub: kennypallchizaca-coder](https://github.com/kennypallchizaca-coder)
*   **Daniel Guanga** – [GitHub: Pangust-code](https://github.com/Pangust-code)

