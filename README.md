# INFORME DEL PROYECTO – PORTAFOLIO ADMINISTRATIVO

![alt text](imagenes/image0.png)

## 2. Integrantes
- **Alex Guaman** – [https://github.com/kennypallchizaca-coder](https://github.com/kennypallchizaca-coder)
- **Daniel Guanga** – [https://github.com/Pangust-code](https://github.com/Pangust-code)
- **Repositorio principal:** [LEXISWARE - Portafolio Profesional](https://github.com/kennypallchizaca-coder/PORTAFOLIO)

## 3. Tecnologías Utilizadas
![React](https://img.shields.io/badge/React-19.0.0-blue.svg) ![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg) ![Vite](https://img.shields.io/badge/Vite-7.2.0-646CFF.svg) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC.svg) ![Spring Boot](https://img.shields.io/badge/SpringBoot-3.4.x-6DB33F.svg) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-336791.svg) ![JWT](https://img.shields.io/badge/JWT-JSON%20Web%20Token-black.svg)

- **Frontend:** React 19 + TypeScript, Vite, React Router v7, TailwindCSS con DaisyUI, Framer Motion.
- **Backend:** Spring Boot 3.x with Java 17+, Spring Security + JWT, Spring Data JPA.
- **Base de Datos:** PostgreSQL para persistencia relacional.
- **Notificaciones:** EmailJS para envío de correos y Spring Mail integrado.
- **Almacenamiento:** Integración con Cloudinary para gestión de imágenes.

## 4. Descripción del Proyecto
LEXISWARE es una plataforma web profesional para gestionar portafolios de programadores y solicitudes de asesoría técnica. La aplicación utiliza una arquitectura moderna de Frontend (SPA) y Backend (REST API) con control de acceso basado en roles (RBAC). Permite a los programadores mostrar su trabajo, gestionar su disponibilidad y atender solicitudes de mentoría, mientras que los administradores supervisan la integridad de la plataforma.

## 5. Roles y Funcionalidades
### Administrador
- Gestión centralizada de usuarios y asignación de roles.
- Supervisión de solicitudes de asesoría global.
- Administración del catálogo de proyectos y categorías.
- Dashboard de métricas y control académico.

### Programador
- Personalización de perfil profesional y enlaces sociales.
- Gestión de portafolio y proyectos individuales.
- Configuración de horarios de disponibilidad para asesorías.
- Bandeja de entrada para gestionar solicitudes (Aprobar/Rechazar/Responder).

### Usuario General (Visitante)
- Exploración pública de portafolios y proyectos.
- Creación de solicitudes de asesoría sin necesidad de registro.
- Seguimiento de estado de solicitudes vía Email.

## 6. Módulos del Sistema
- **Landing Page:** Presentación profesional con acceso a proyectos destacados.
- **Directorio de Programadores:** Visualización pública de talentos y sus portafolios.
- **Panel de Control (Admin/Programador):** Interfaces protegidas mediante JWT para gestión de datos.
- **Editor de Perfil y Portafolio:** Herramientas para el mantenimiento de la marca personal del programador.
- **Sistema de Asesorías:** Flujo completo desde la solicitud hasta la resolución con notificaciones.

## 7. Flujos Principales
1. **Acceso y Autenticación:** Los usuarios acceden mediante Google Auth o credenciales, recibiendo un JWT que autoriza sus peticiones a la API.
2. **Postulación de Asesoría:** Un visitante solicita apoyo; el sistema registra la petición en la BD relacional y notifica al programador.
3. **Gestión de Proyectos:** Los programadores cargan sus logros técnicos, los cuales se almacenan en PostgreSQL con imágenes optimizadas en la nube.
4. **Interacción Admin:** El administrador valida que los perfiles y proyectos cumplan con los estándares definidos.

## 8. Aspectos Técnicos Destacados
### Consumo de API REST (Axios)
```ts
// src/services/api.ts
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: { 'Content-Type': 'application/json' }
})

// Inyección automática de JWT
apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('auth_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
})
```

### Gestión de Proyectos (Backend integration)
```ts
// src/services/projects.ts
export const getProjectsByOwner = async (ownerId: string): Promise<Project[]> => {
    const response = await apiClient.get(`/api/projects/user/${ownerId}`);
    return response.data;
}
```

## 9. Conclusión
La migración a una arquitectura robusta con Spring Boot y PostgreSQL proporciona a LEXISWARE la escalabilidad y seguridad necesarias para un entorno profesional. La integración de JWT y el manejo eficiente de datos relacionales aseguran una experiencia de usuario fluida y confiable.

## 10. Anexos

- Link de nuestro video: https://youtu.be/HVLp-7pAvoE
- Link en gh-pages: https://kennypallchizaca-coder.github.io/

![alt text](imagenes/image.png)

![alt text](imagenes/image-1.png)

![alt text](imagenes/image-2.png)

![alt text](imagenes/image-3.png)

![alt text](imagenes/image-4.png)

![alt text](imagenes/image-5.png)

![alt text](imagenes/image-6.png)
