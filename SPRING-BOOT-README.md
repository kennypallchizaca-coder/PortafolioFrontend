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
