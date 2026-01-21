# 🚀 Backend Spring Boot - LEXISWARE Portafolio

> ⚠️ **ARQUITECTURA 100% POSTGRESQL**  
> Este backend usa **PostgreSQL** para TODO: base de datos + autenticación.  
> **NO usa Firebase**. Autenticación con **Spring Security + JWT**.

## 📋 Tabla de Contenidos
1. [Prerrequisitos](#prerrequisitos)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Setup PostgreSQL con Docker](#setup-postgresql-con-docker)
4. [Inicialización del Proyecto](#inicialización-del-proyecto)
5. [Estructura del Proyecto](#estructura-del-proyecto)
6. [Configuración](#configuración)
7. [Entidades y Modelos](#entidades-y-modelos)
8. [Repositorios](#repositorios)
9. [Servicios](#servicios)
10. [Controladores REST](#controladores-rest)
11. [Seguridad con Firebase Auth](#seguridad-con-firebase-auth)
12. [Testing](#testing)
13. [Deployment](#deployment)

---

## 🔧 Prerrequisitos

### Software Requerido
- ✅ **Java 17+** (LTS)
- ✅ **Maven 3.8+** o **Gradle 8+**
- ✅ **Docker Desktop** (para PostgreSQL)
- ✅ **Git**
- ✅ **IDE**: IntelliJ IDEA / Eclipse / VS Code
- ✅ **Postman** o **Thunder Client** (para testing)

### Verificar Instalaciones
```bash
java -version    # Debe mostrar Java 17 o superior
mvn -version     # Maven 3.8+
docker --version # Docker 20+
docker-compose --version
```

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────┐      HTTP/REST       ┌──────────────────┐
│   Frontend  │ ──────────────────> │  Spring Boot API │
│  (React +   │ <──────────────────  │   (Port 8080)    │
│   Vite)     │    JWT Token         │                  │
└─────────────┘                      └─────────┬────────┘
                                               │
                      ┌────────────────────────┼──────────┐
                      │                        │          │
                      ▼                        ▼          ▼
             ┌────────────────┐     ┌──────────────┐  ┌─────────┐
             │   PostgreSQL   │     │ EmailJS API  │  │  Cloud  │
             │   (Database)   │     │   (Emails)   │  │ Storage │
             │   in Docker    │     └──────────────┘  │(Imágenes│
             │   Port 5432    │                       └─────────┘
             │                │
             │ - users        │
             │ - projects     │
             │ - advisories   │
             │ - auth tokens  │
             └────────────────┘
```

### Stack Tecnológico
- **Frontend**: React + TypeScript + Vite
- **Backend**: Spring Boot 3.2 + Java 17
- **Base de Datos**: PostgreSQL 15 (Docker)
- **Autenticación**: Spring Security + JWT (100% PostgreSQL)
- **Password Hashing**: BCrypt
- **ORM**: Spring Data JPA + Hibernate
- **API**: RESTful con JSON
- **Deployment**: Railway / Render / Docker

### 🔐 Flujo de Autenticación

1. **Registro**: `POST /api/auth/register`
   - Usuario envía email + password
   - Backend hashea password con BCrypt
   - Guarda en PostgreSQL
   - **NO usa Firebase**

2. **Login**: `POST /api/auth/login`
   - Usuario envía credenciales
   - Backend valida contra PostgreSQL
   - Genera JWT token
   - Frontend guarda token en localStorage

3. **Requests autenticados**:
   - Frontend envía `Authorization: Bearer {token}`
   - Spring Security valida JWT
   - Permite/rechaza acceso

---

## 🐳 Setup PostgreSQL con Docker

### 1. Crear `docker-compose.yml`

En la raíz del proyecto backend:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: portafolio-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: portafolio_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres123
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - portafolio-network

  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: portafolio-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@lexisware.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "8081:80"
    volumes:
      - pgadmin_data:/var/lib/pgadmin
    networks:
      - portafolio-network
    depends_on:
      - postgres

volumes:
  postgres_data:
  pgadmin_data:

networks:
  portafolio-network:
    driver: bridge
```

### 2. Iniciar PostgreSQL

```bash
# Iniciar contenedores
docker-compose up -d

# Verificar que estén corriendo
docker-compose ps

# Ver logs
docker-compose logs -f postgres
```

### 3. Acceder a pgAdmin (Opcional)

- URL: http://localhost:8081
- Email: `admin@lexisware.com`
- Password: `admin123`

**Conectar a PostgreSQL desde pgAdmin:**
- Host: `postgres` (nombre del contenedor)
- Port: `5432`
- Database: `portafolio_db`
- Username: `postgres`
- Password: `postgres123`

### 4. Conectar desde terminal

```bash
# Entrar al contenedor
docker exec -it portafolio-db psql -U postgres -d portafolio_db

# Comandos útiles
\l          # Listar bases de datos
\dt         # Listar tablas
\d users    # Descripción de tabla
\q          # Salir
```

### 5. Detener contenedores

```bash
# Detener
docker-compose down

# Detener y eliminar datos
docker-compose down -v
```

---

## 🎯 Inicialización del Proyecto

### Opción 1: Spring Initializr (Recomendado)

1. **Ir a**: https://start.spring.io/
2. **Configurar**:
   - Project: `Maven`
   - Language: `Java`
   - Spring Boot: `3.2.1` (última estable)
   - Group: `com.lexisware`
   - Artifact: `portafolio-backend`
   - Name: `portafolio-backend`
   - Package name: `com.lexisware.portafolio`
   - Packaging: `Jar`
   - Java: `17`

3. **Dependencias** (Add Dependencies):
   ```
   - Spring Web
   - Spring Data JPA
   - PostgreSQL Driver
   - Spring Security
   - Validation
   - Lombok
   - Spring Boot DevTools
   ```

4. **Generar** y descargar el ZIP

---

## ⚙️ Configuración

### 1. `pom.xml` - Dependencias Completas

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.1</version>
    </parent>
    
    <groupId>com.lexisware</groupId>
    <artifactId>portafolio-backend</artifactId>
    <version>1.0.0</version>
    <name>portafolio-backend</name>
    <description>Backend API para LEXISWARE Portafolio - PostgreSQL + JWT Auth</description>
    
    <properties>
        <java.version>17</java.version>
        <jjwt.version>0.12.3</jjwt.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Web -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- Spring Data JPA -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        
        <!-- PostgreSQL Driver -->
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Spring Security -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        
        <!-- JWT - JSON Web Token -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- Lombok -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- DevTools -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        
        <!-- Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>
```

### 2. `application.properties` - Configuración Principal

```properties
# Application
spring.application.name=portafolio-backend
server.port=8080

# ========================================
# DATABASE - PostgreSQL en Docker
# ========================================
spring.datasource.url=jdbc:postgresql://localhost:5432/portafolio_db
spring.datasource.username=postgres
spring.datasource.password=postgres123
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.jdbc.lob.non_contextual_creation=true

# ========================================
# FIREBASE AUTH (Solo autenticación)
# ========================================
firebase.config.path=classpath:firebase-adminsdk.json

# ========================================
# CORS - Frontend URLs permitidas
# ========================================
cors.allowed-origins=http://localhost:5173,https://portafolio-two-snowy-24.vercel.app

# ========================================
# LOGGING
# ========================================
logging.level.com.lexisware=DEBUG
logging.level.org.springframework.security=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

### 3. Variables de Entorno (.env)

Crear `.env` en la raíz del backend:

```env
# Database (Docker PostgreSQL)
DB_URL=jdbc:postgresql://localhost:5432/portafolio_db
DB_USERNAME=postgres
DB_PASSWORD=postgres123

# Firebase Auth (solo para validar tokens)
FIREBASE_CONFIG_PATH=./src/main/resources/firebase-adminsdk.json

# CORS
ALLOWED_ORIGINS=http://localhost:5173,https://portafolio-two-snowy-24.vercel.app

# Server
SERVER_PORT=8080
```

### 4. application-dev.properties (Desarrollo)

```properties
# Development profile con Docker
spring.datasource.url=jdbc:postgresql://localhost:5432/portafolio_db
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### 5. application-prod.properties (Producción)

```properties
# Production profile
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
```

---

## 📦 Entidades y Modelos

### `User.java`

```java
package com.lexisware.portafolio.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    private String uid; // Firebase UID
    
    @Column(nullable = false)
    private String email;
    
    @Column(name = "display_name")
    private String displayName;
    
    @Enumerated(EnumType.STRING)
    private Role role; // PROGRAMMER, ADMIN, EXTERNAL
    
    private String specialty;
    
    @Column(length = 1000)
    private String bio;
    
    private String photoURL;
    
    private Boolean available = false;
    
    @ElementCollection
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "skill")
    private List<String> skills;
    
    @ElementCollection
    @CollectionTable(name = "user_schedules", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "time_slot")
    private List<String> schedule;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    public enum Role {
        PROGRAMMER, ADMIN, EXTERNAL
    }
}
```

### `Project.java`

```java
package com.lexisware.portafolio.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "projects")
@Data
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, name = "owner_id")
    private String ownerId; // Firebase UID
    
    @Column(nullable = false)
    private String title;
    
    @Column(length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    private Category category;
    
    @Enumerated(EnumType.STRING)
    private ProjectRole role;
    
    @ElementCollection
    @CollectionTable(name = "project_tech_stack", joinColumns = @JoinColumn(name = "project_id"))
    @Column(name = "technology")
    private List<String> techStack;
    
    private String repoUrl;
    private String demoUrl;
    private String imageUrl;
    
    @Column(name = "programmer_name")
    private String programmerName;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public enum Category {
        academico, laboral
    }
    
    public enum ProjectRole {
        frontend, backend, fullstack, db
    }
}
```

### `Advisory.java`

```java
package com.lexisware.portafolio.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "advisories")
@Data
public class Advisory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "programmer_id", nullable = false)
    private String programmerId;
    
    @Column(name = "programmer_email")
    private String programmerEmail;
    
    @Column(name = "programmer_name")
    private String programmerName;
    
    @Column(name = "requester_name", nullable = false)
    private String requesterName;
    
    @Column(name = "requester_email", nullable = false)
    private String requesterEmail;
    
    private String date;
    private String time;
    
    @Column(length = 1000)
    private String note;
    
    @Enumerated(EnumType.STRING)
    private Status status = Status.pending;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
    
    public enum Status {
        pending, approved, rejected
    }
}
```

---

## 🗄️ Repositorios

### `UserRepository.java`

```java
package com.lexisware.portafolio.repository;

import com.lexisware.portafolio.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    List<User> findByRole(User.Role role);
    List<User> findByAvailableTrue();
}
```

### `ProjectRepository.java`

```java
package com.lexisware.portafolio.repository;

import com.lexisware.portafolio.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerId(String ownerId);
    List<Project> findByCategory(Project.Category category);
}
```

### `AdvisoryRepository.java`

```java
package com.lexisware.portafolio.repository;

import com.lexisware.portafolio.entity.Advisory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AdvisoryRepository extends JpaRepository<Advisory, Long> {
    List<Advisory> findByProgrammerId(String programmerId);
    List<Advisory> findByRequesterEmail(String email);
    List<Advisory> findByStatus(Advisory.Status status);
}
```

---

## 🔐 Seguridad con Firebase

### `FirebaseConfig.java`

```java
package com.lexisware.portafolio.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;

@Configuration
public class FirebaseConfig {
    
    @Value("${firebase.config.path}")
    private String firebaseConfigPath;
    
    @PostConstruct
    public void initialize() throws IOException {
        FileInputStream serviceAccount = new FileInputStream(firebaseConfigPath);
        
        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                .build();
        
        if (FirebaseApp.getApps().isEmpty()) {
            FirebaseApp.initializeApp(options);
        }
    }
}
```

### `SecurityConfig.java`

```java
package com.lexisware.portafolio.config;

import com.lexisware.portafolio.security.FirebaseAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final FirebaseAuthenticationFilter firebaseAuthFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/public/**").permitAll()
                .requestMatchers("/api/users/**").authenticated()
                .requestMatchers("/api/projects/**").authenticated()
                .requestMatchers("/api/advisories/**").authenticated()
                .anyRequest().permitAll()
            )
            .addFilterBefore(firebaseAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

---

## 🌐 Controladores REST

### `UserController.java`

```java
package com.lexisware.portafolio.controller;

import com.lexisware.portafolio.entity.User;
import com.lexisware.portafolio.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private the UserService userService;
    
    @GetMapping("/programmers")
    public ResponseEntity<List<User>> getAllProgrammers() {
        return ResponseEntity.ok(userService.getProgrammers());
    }
    
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal String uid) {
        return ResponseEntity.ok(userService.getUserById(uid));
    }
    
    @PutMapping("/me")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal String uid,
            @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(uid, user));
    }
}
```

---

## ▶️ Comandos para Ejecutar

### Compilar
```bash
mvn clean install
```

### Ejecutar en Desarrollo
```bash
mvn spring-boot:run
```

### Ejecutar JAR
```bash
java -jar target/portafolio-backend-1.0.0.jar
```

### Probar API
```bash
curl http://localhost:8080/api/public/health
```

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
mvn test

# Test específico
mvn test -Dtest=UserServiceTest
```

---

## 🚀 Deployment

### Railway.app
1. Crear cuenta en Railway.app
2. Nuevo proyecto → Deploy from GitHub
3. Variables de entorno en Railway
4. Deploy automático

### Render.com
```yaml
# render.yaml
services:
  - type: web
    name: portafolio-backend
    env: java
    buildCommand: ./mvnw clean install
    startCommand: java -jar target/portafolio-backend-1.0.0.jar
```

---

## 📝 Checklist de Implementación

- [ ] Crear proyecto con Spring Initializr
- [ ] Configurar `pom.xml` con dependencias
- [ ] Configurar PostgreSQL local
- [ ] Crear entidades JPA
- [ ] Crear repositorios
- [ ] Implementar servicios
- [ ] Crear controladores REST
- [ ] Configurar seguridad Firebase
- [ ] Configurar CORS
- [ ] Probar endpoints con Postman
- [ ] Escribir tests unitarios
- [ ] Deploy a producción
# 🔗 Guía de Integración Frontend-Backend

## 📋 Resumen

Esta guía te muestra cómo conectar tu frontend React (actual) con el nuevo backend Spring Boot + PostgreSQL + JWT.

**Migración**: Firebase → PostgreSQL + Spring Boot

---

## 🎯 Cambios Necesarios

### Frontend (React)
- ❌ Eliminar Firebase (auth.ts, firebase.ts, firestore.ts)
- ✅ Crear API Layer con Axios
- ✅ Implementar autenticación JWT
- ✅ Actualizar componentes y páginas

### Backend (Spring Boot)
- ✅ PostgreSQL como base de datos
- ✅ Spring Security + JWT para auth
- ✅ RESTful API endpoints
- ✅ Sin Firebase (100% independiente)

---

## 📁 Paso 1: Instalar Dependencias en Frontend

```bash
cd c:\Users\kenny\OneDrive\Documents\PROYECTO-PPW-PORTAFOLIO

# Instalar Axios para HTTP requests
npm install axios

# Instalar jwt-decode para leer tokens
npm install jwt-decode

# Opcional: React Query para cache
npm install @tanstack/react-query
```

---

## 🗂️ Paso 2: Crear Estructura API en Frontend

### 2.1 Crear carpetas

```
src/
├── api/                    # 🆕 Nueva carpeta
│   ├── client.ts          # Cliente HTTP (Axios)
│   ├── endpoints.ts       # URLs de endpoints
│   └── services/
│       ├── auth.service.ts
│       ├── users.service.ts
│       ├── projects.service.ts
│       └── advisories.service.ts
├── models/                 # 🆕 TypeScript types
│   ├── User.ts
│   ├── Project.ts
│   ├── Advisory.ts
│   └── Auth.ts
└── ...
```

### 2.2 Variables de Entorno

Actualizar `.env` o crear `.env.local`:

```env
# Backend API URL
VITE_API_URL=http://localhost:8080/api

# Producción (cuando deploys el backend)
# VITE_API_URL=https://tu-backend.railway.app/api
```

---

## 📦 Paso 3: Implementar API Client

### `src/api/client.ts`

```typescript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
})

// Interceptor para agregar JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 🔗 Paso 4: Definir Endpoints

### `src/api/endpoints.ts`

```typescript
export const ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
  },
  
  // Users
  USERS: {
    LIST: '/users',
    PROGRAMMERS: '/users/programmers',
    GET_BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    UPDATE_PROFILE: '/users/me',
  },
  
  // Projects
  PROJECTS: {
    LIST: '/projects',
    CREATE: '/projects',
    GET_BY_ID: (id: number) => `/projects/${id}`,
    GET_BY_OWNER: (ownerId: string) => `/projects/owner/${ownerId}`,
    UPDATE: (id: number) => `/projects/${id}`,
    DELETE: (id: number) => `/projects/${id}`,
  },
  
  // Advisories
  ADVISORIES: {
    LIST: '/advisories',
    CREATE: '/advisories',
    GET_BY_PROGRAMMER: (programmerId: string) => `/advisories/programmer/${programmerId}`,
    GET_BY_EMAIL: (email: string) => `/advisories/requester/${email}`,
    UPDATE_STATUS: (id: number) => `/advisories/${id}/status`,
  },
}
```

---

## 🔐 Paso 5: Servicio de Autenticación

### `src/api/services/auth.service.ts`

```typescript
import { apiClient } from '../client'
import { ENDPOINTS } from '../endpoints'
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '../../models/Auth'

export const authService = {
  /**
   * Registrar nuevo usuario
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.REGISTER, data)
    
    // Guardar token y usuario
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  /**
   * Login
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, {
      email,
      password,
    })
    
    // Guardar token y usuario
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    
    return response.data
  },

  /**
   * Logout
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT)
    } finally {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  },

  /**
   * Obtener usuario actual
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get(ENDPOINTS.AUTH.ME)
    
    // Actualizar usuario en localStorage
    localStorage.setItem('user', JSON.stringify(response.data))
    
    return response.data
  },

  /**
   * Verificar si está autenticado
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token')
  },

  /**
   * Obtener token
   */
  getToken: (): string | null => {
    return localStorage.getItem('auth_token')
  },

  /**
   * Obtener usuario de localStorage
   */
  getUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },
}
```

---

## 📦 Paso 6: Modelos TypeScript

### `src/models/Auth.ts`

```typescript
export interface User {
  uid: string
  email: string
  displayName: string
  role: 'PROGRAMMER' | 'ADMIN' | 'EXTERNAL'
  specialty?: string
  bio?: string
  photoURL?: string
  available?: boolean
  skills?: string[]
  schedule?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
  role: 'PROGRAMMER' | 'EXTERNAL'
}

export interface AuthResponse {
  token: string
  user: User
}
```

### `src/models/Project.ts`

```typescript
export interface Project {
  id: number
  ownerId: string
  title: string
  description: string
  category: 'academico' | 'laboral'
  role: 'frontend' | 'backend' | 'fullstack' | 'db'
  techStack: string[]
  repoUrl?: string
  demoUrl?: string
  imageUrl?: string
  programmerName?: string
  createdAt: string
}
```

---

## 👥 Paso 7: Servicio de Usuarios

### `src/api/services/users.service.ts`

```typescript
import { apiClient } from '../client'
import { ENDPOINTS } from '../endpoints'
import type { User } from '../../models/Auth'

export const usersService = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get(ENDPOINTS.USERS.LIST)
    return data
  },

  getProgrammers: async (): Promise<User[]> => {
    const { data } = await apiClient.get(ENDPOINTS.USERS.PROGRAMMERS)
    return data
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await apiClient.get(ENDPOINTS.USERS.GET_BY_ID(id))
    return data
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const { data } = await apiClient.put(ENDPOINTS.USERS.UPDATE_PROFILE, userData)
    
    // Actualizar localStorage
    localStorage.setItem('user', JSON.stringify(data))
    
    return data
  },
}
```

---

## 📝 Paso 8: Servicio de Proyectos

### `src/api/services/projects.service.ts`

```typescript
import { apiClient } from '../client'
import { ENDPOINTS } from '../endpoints'
import type { Project } from '../../models/Project'

export const projectsService = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await apiClient.get(ENDPOINTS.PROJECTS.LIST)
    return data
  },

  getByOwner: async (ownerId: string): Promise<Project[]> => {
    const { data } = await apiClient.get(ENDPOINTS.PROJECTS.GET_BY_OWNER(ownerId))
    return data
  },

  create: async (project: Omit<Project, 'id' | 'createdAt'>): Promise<Project> => {
    const { data } = await apiClient.post(ENDPOINTS.PROJECTS.CREATE, project)
    return data
  },

  update: async (id: number, project: Partial<Project>): Promise<Project> => {
    const { data } = await apiClient.put(ENDPOINTS.PROJECTS.UPDATE(id), project)
    return data
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.PROJECTS.DELETE(id))
  },
}
```

---

## 🔄 Paso 9: Actualizar AuthContext

### `src/context/AuthContext.tsx` (NUEVO)

```typescript
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../api/services/auth.service'
import type { User, LoginRequest, RegisterRequest } from '../models/Auth'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar usuario al iniciar
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Error loading user:', error)
        authService.logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const response = await authService.login(email, password)
    setUser(response.user)
  }

  const register = async (data: RegisterRequest) => {
    const response = await authService.register(data)
    setUser(response.user)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## 🎨 Paso 10: Actualizar Páginas

### Ejemplo: Login Page

**ANTES** (Firebase):
```typescript
// ❌ Código viejo
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../services/firebase'

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  await signInWithEmailAndPassword(auth, email, password)
}
```

**DESPUÉS** (Spring Boot + JWT):
```typescript
// ✅ Código nuevo
import { useAuth } from '../../context/AuthContext'

const { login } = useAuth()

const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  try {
    await login(email, password)
    navigate('/dashboard')
  } catch (error) {
    setError('Credenciales inválidas')
  }
}
```

---

## 📊 Paso 11: Endpoints del Backend

### Endpoints que el backend debe implementar:

```
POST   /api/auth/register          # Registro
POST   /api/auth/login             # Login
POST   /api/auth/logout            # Logout (opcional)
GET    /api/auth/me                # Usuario actual

GET    /api/users                  # Todos los usuarios
GET    /api/users/programmers      # Solo programadores
GET    /api/users/:id              # Usuario específico
PUT    /api/users/me               # Actualizar perfil

GET    /api/projects               # Todos los proyectos
POST   /api/projects               # Crear proyecto
GET    /api/projects/:id           # Proyecto específico
GET    /api/projects/owner/:id     # Proyectos de un owner
PUT    /api/projects/:id           # Actualizar proyecto
DELETE /api/projects/:id           # Eliminar proyecto

GET    /api/advisories             # Todas las asesorías
POST   /api/advisories             # Crear asesoría
GET    /api/advisories/programmer/:id   # Asesorías de un programador
GET    /api/advisories/requester/:email # Asesorías de un solicitante
PATCH  /api/advisories/:id/status       # Actualizar estado
```

---

## 🧪 Paso 12: Testing

### Test local:

1. **Iniciar Backend**:
```bash
cd portafolio-backend
mvn spring-boot:run
```

2. **Verificar que corre**:
```bash
curl http://localhost:8080/api/health
# Debe responder: {"status":"UP"}
```

3. **Iniciar Frontend**:
```bash
cd PROYECTO-PPW-PORTAFOLIO
npm run dev
```

4. **Probar registro**:
- Ir a `/register`
- Crear cuenta
- Verificar que guarda en PostgreSQL

---

## 📋 Checklist de Migración

### Backend
- [ ] PostgreSQL corriendo en Docker
- [ ] Spring Boot iniciado
- [ ] Todos los endpoints funcionando
- [ ] CORS configurado para frontend
- [ ] JWT generation funcionando

### Frontend
- [ ] Axios instalado
- [ ] API layer creada (`src/api/`)
- [ ] Modelos TypeScript definidos
- [ ] AuthContext actualizado
- [ ] Variables de entorno configuradas
- [ ] Login/Register usando nuevo API
- [ ] Todas las páginas migradas

### Testing
- [ ] Registro funciona
- [ ] Login funciona
- [ ] Token se guarda correctamente
- [ ] Requests autenticados funcionan
- [ ] Logout funciona

---

## 🚀 Deployment

### Backend (Railway/Render)
1. Deploy backend primero
2. Obtener URL: `https://tu-backend.railway.app`
3. Configurar PostgreSQL en producción

### Frontend (Vercel)
1. Actualizar `.env.production`:
   ```env
   VITE_API_URL=https://tu-backend.railway.app/api
   ```
2. Build y deploy
3. Verificar conexión

---

## ⚠️ Archivos a ELIMINAR del Frontend

Una vez migrado completamente:

```bash
# Eliminar servicios de Firebase
rm src/services/firebase.ts
rm src/services/firestore.ts
rm src/services/auth.ts (viejo)

# Desinstalar Firebase
npm uninstall firebase

# Actualizar .gitignore (eliminar referencias a Firebase)
```

---

## 💡 Tips Importantes

1. **CORS**: El backend debe permitir el origen del frontend
2. **JWT Expiration**: Manejar tokens expirados
3. **Error Handling**: Centralizar manejo de errores HTTP
4. **Loading States**: Mostrar estados de carga
5. **Optimistic Updates**: Para mejor UX

---

## 🆘 Troubleshooting

### Error: "Network Error"
- Verificar que backend esté corriendo
- Revisar URL en `.env`
- Verificar CORS en backend

### Error: "401 Unauthorized"
- Token expirado o inválido
- Revisar header `Authorization`
- Verificar que token esté en localStorage

### Error: "Cannot connect to database"
- PostgreSQL en Docker no está corriendo
- `docker-compose up -d`

---

## 📚 Recursos Adicionales

- [Axios Docs](https://axios-http.com/)
- [Spring Security JWT](https://spring.io/guides/tutorials/spring-boot-oauth2/)
- [React Query](https://tanstack.com/query) (opcional, para cache)
