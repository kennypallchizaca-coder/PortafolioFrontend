# 🚀 Backend Spring Boot - LEXISWARE Portafolio

## 📋 Tabla de Contenidos
1. [Prerrequisitos](#prerrequisitos)
2. [Inicialización del Proyecto](#inicialización-del-proyecto)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Configuración](#configuración)
5. [Entidades y Modelos](#entidades-y-modelos)
6. [Repositorios](#repositorios)
7. [Servicios](#servicios)
8. [Controladores REST](#controladores-rest)
9. [Seguridad con Firebase](#seguridad-con-firebase)
10. [Testing](#testing)
11. [Deployment](#deployment)

---

## 🔧 Prerrequisitos

### Software Requerido
- ✅ **Java 17+** (LTS)
- ✅ **Maven 3.8+** o **Gradle 8+**
- ✅ **PostgreSQL 14+** (o MySQL 8+)
- ✅ **Git**
- ✅ **IDE**: IntelliJ IDEA / Eclipse / VS Code

### Verificar Instalaciones
```bash
java -version    # Debe mostrar Java 17 o superior
mvn -version     # Maven 3.8+
psql --version   # PostgreSQL 14+
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

### Opción 2: Comando Maven
```bash
mvn archetype:generate \
  -DgroupId=com.lexisware \
  -DartifactId=portafolio-backend \
  -DarchetypeArtifactId=maven-archetype-quickstart \
  -DinteractiveMode=false
```

### Extraer y Abrir
```bash
unzip portafolio-backend.zip
cd portafolio-backend
code .  # O abrir con tu IDE
```

---

## 📁 Estructura del Proyecto

```
portafolio-backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── lexisware/
│   │   │           └── portafolio/
│   │   │               ├── PortafolioBackendApplication.java
│   │   │               ├── config/
│   │   │               │   ├── SecurityConfig.java
│   │   │               │   ├── CorsConfig.java
│   │   │               │   └── FirebaseConfig.java
│   │   │               ├── controller/
│   │   │               │   ├── UserController.java
│   │   │               │   ├── ProjectController.java
│   │   │               │   ├── AdvisoryController.java
│   │   │               │   └── PortfolioController.java
│   │   │               ├── dto/
│   │   │               │   ├── request/
│   │   │               │   │   ├── CreateProjectRequest.java
│   │   │               │   │   └── AdvisoryRequestDto.java
│   │   │               │   └── response/
│   │   │               │       ├── ProjectResponse.java
│   │   │               │       └── UserResponse.java
│   │   │               ├── entity/
│   │   │               │   ├── User.java
│   │   │               │   ├── Project.java
│   │   │               │   ├── Advisory.java
│   │   │               │   └── Portfolio.java
│   │   │               ├── exception/
│   │   │               │   ├── GlobalExceptionHandler.java
│   │   │               │   ├── ResourceNotFoundException.java
│   │   │               │   └── UnauthorizedException.java
│   │   │               ├── repository/
│   │   │               │   ├── UserRepository.java
│   │   │               │   ├── ProjectRepository.java
│   │   │               │   ├── AdvisoryRepository.java
│   │   │               │   └── PortfolioRepository.java
│   │   │               ├── security/
│   │   │               │   ├── FirebaseAuthenticationFilter.java
│   │   │               │   └── FirebaseTokenValidator.java
│   │   │               └── service/
│   │   │                   ├── UserService.java
│   │   │                   ├── ProjectService.java
│   │   │                   ├── AdvisoryService.java
│   │   │                   └── PortfolioService.java
│   │   └── resources/
│   │       ├── application.properties
│   │       ├── application-dev.properties
│   │       ├── application-prod.properties
│   │       └── firebase-adminsdk.json (NO subir a Git)
│   └── test/
│       └── java/
│           └── com/lexisware/portafolio/
│               └── (tests aquí)
├── .gitignore
├── pom.xml
└── README.md
```

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
    <description>Backend API para LEXISWARE Portafolio</description>
    
    <properties>
        <java.version>17</java.version>
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
        
        <!-- Validation -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        
        <!-- Firebase Admin SDK -->
        <dependency>
            <groupId>com.google.firebase</groupId>
            <artifactId>firebase-admin</artifactId>
            <version>9.2.0</version>
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

# Database PostgreSQL
spring.datasource.url=jdbc:postgresql://localhost:5432/portafolio_db
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Firebase
firebase.config.path=classpath:firebase-adminsdk.json

# CORS
cors.allowed-origins=http://localhost:5173,https://portafolio-two-snowy-24.vercel.app

# Logging
logging.level.com.lexisware=DEBUG
logging.level.org.springframework.security=DEBUG
```

### 3. Variables de Entorno (.env)

Crear `.env` en la raíz:
```env
DB_URL=jdbc:postgresql://localhost:5432/portafolio_db
DB_USERNAME=postgres
DB_PASSWORD=tu_password_segura
FIREBASE_CONFIG_PATH=./src/main/resources/firebase-adminsdk.json
ALLOWED_ORIGINS=http://localhost:5173,https://portafolio-two-snowy-24.vercel.app
```

### 4. Crear Base de Datos PostgreSQL

```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear database
CREATE DATABASE portafolio_db;

-- Verificar
\l

-- Conectarse
\c portafolio_db

-- Listo para que Spring cree las tablas automáticamente
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
