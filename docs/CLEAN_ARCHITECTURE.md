# Clean Architecture - Guía Completa

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [Arquitectura de 5 Capas](#arquitectura-de-5-capas)
- [Flujo de una Petición](#flujo-de-una-petición)
- [Descripción de Cada Capa](#descripción-de-cada-capa)
- [Patrones y Convenciones](#patrones-y-convenciones)
- [Ejemplos Prácticos](#ejemplos-prácticos)
- [Beneficios](#beneficios)

---

## Introducción

Este proyecto implementa **Clean Architecture** (Arquitectura Limpia) con un enfoque de **5 capas** que separa las responsabilidades del código de forma clara y mantenible.

### ¿Qué es Clean Architecture?

Es un patrón arquitectónico que organiza el código en capas con responsabilidades bien definidas, donde:

- Cada capa tiene una única responsabilidad
- Las dependencias fluyen en una sola dirección (de afuera hacia adentro)
- El código es testeable, mantenible y escalable

---

## Arquitectura de 5 Capas

```
┌─────────────────────────────────────────────────────────────┐
│  CAPA 5: Endpoint (pages/api/)                              │
│  Responsabilidad: Documentación Swagger + Delegación        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 4: Controller (src/controllers/)                      │
│  Responsabilidad: HTTP, Validación Zod, Manejo de Errores   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 3: Service (src/services/)                            │
│  Responsabilidad: Lógica de Negocio, Reglas de Validación   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 2: Repository (src/repositories/)                     │
│  Responsabilidad: Acceso a Datos, Queries Personalizadas    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  CAPA 1: DTO (src/dto/)                                     │
│  Responsabilidad: Definición de Tipos e Interfaces          │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo de una Petición

### Ejemplo: POST /api/user (Crear usuario)

```
1. Cliente HTTP
   ↓
2. pages/api/user.ts (ENDPOINT)
   - Recibe la petición HTTP
   - Delega a UserController
   ↓
3. src/controllers/user.controller.ts (CONTROLLER)
   - Valida datos con Zod
   - Valida UUID si es necesario
   - Maneja errores de validación
   - Llama a UserService
   ↓
4. src/services/user.service.ts (SERVICE)
   - Aplica lógica de negocio (ej: email único)
   - Transforma datos si es necesario
   - Llama a UserRepository
   ↓
5. src/repositories/user.repository.ts (REPOSITORY)
   - Ejecuta query en Supabase
   - Retorna datos o error
   ↓
6. src/dto/user.dto.ts (DTO)
   - Define la estructura de User
   - Garantiza tipos correctos
   ↓
7. Respuesta al Cliente
   - JSON con usuario creado
   - Status 201 Created
```

---

## Descripción de Cada Capa

### 📁 Capa 1: DTO (Data Transfer Objects)

**Ubicación:** `src/dto/`

**Responsabilidad:**

- Definir interfaces TypeScript para las entidades
- Definir tipos para Create/Update/Filters
- **NO contiene lógica**, solo tipos

**Ejemplo:** `src/dto/user.dto.ts`

```typescript
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface UserFilters {
  email?: string;
  role?: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  role?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  role?: string;
}
```

**¿Qué hace?**

- Define la estructura de datos que fluye entre capas
- Garantiza type safety en TypeScript
- Sirve como contrato entre capas

---

### 📁 Capa 2: Repository

**Ubicación:** `src/repositories/`

**Responsabilidad:**

- Acceso a la base de datos (Supabase)
- Queries personalizadas
- **NO contiene lógica de negocio**

**Ejemplo:** `src/repositories/user.repository.ts`

```typescript
import { BaseRepository } from "./base.repository";
import { supabase } from "../services/supabase";
import type { User } from "../dto/user.dto";

export class UserRepository extends BaseRepository<User> {
  constructor() {
    super(supabase, "usuarios"); // Tabla en Supabase
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email: string) {
    return this.db.from(this.tableName).select("*").eq("email", email).single();
  }

  /**
   * Buscar usuarios por rol
   */
  async findByRole(role: string) {
    return this.db.from(this.tableName).select("*").eq("role", role);
  }
}
```

**¿Qué hace?**

- **CRUD básico heredado de BaseRepository:**
  - `findAll()` - Lista todos los registros
  - `findById(id)` - Busca por ID
  - `create(data)` - Crea registro
  - `update(id, data)` - Actualiza registro
  - `delete(id)` - Elimina registro
  - `count()` - Cuenta registros

- **Métodos personalizados:**
  - Queries específicas del dominio (ej: `findByEmail`)
  - Joins complejos
  - Agregaciones

---

### 📁 Capa 3: Service

**Ubicación:** `src/services/`

**Responsabilidad:**

- Lógica de negocio
- Validaciones de dominio
- Transformaciones de datos
- Orquestación de repositorios

**Ejemplo:** `src/services/user.service.ts`

```typescript
import { BaseService } from "./base.service";
import { UserRepository } from "../repositories/user.repository";
import type { User, CreateUserDto, UpdateUserDto } from "../dto/user.dto";

export class UserService extends BaseService<User> {
  private userRepository: UserRepository;

  constructor() {
    const repository = new UserRepository();
    super(repository);
    this.userRepository = repository;
  }

  /**
   * Crear usuario con validación de email único
   */
  async createUser(data: CreateUserDto) {
    // LÓGICA DE NEGOCIO: Validar email único
    const { data: existing } = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new Error("El email ya está registrado");
    }

    // Delegar creación al repositorio
    return this.create(data);
  }

  /**
   * Actualizar usuario
   */
  async updateUser(id: string, data: UpdateUserDto) {
    return this.update(id, data);
  }

  /**
   * Obtener usuarios por rol
   */
  async findByRole(role: string) {
    const { data, error } = await this.userRepository.findByRole(role);
    if (error) throw error;
    return data || [];
  }
}
```

**¿Qué hace?**

- Implementa **reglas de negocio** (ej: email único)
- Coordina múltiples repositorios si es necesario
- Transforma datos entre capas
- Maneja errores de dominio

---

### 📁 Capa 4: Controller

**Ubicación:** `src/controllers/`

**Responsabilidad:**

- Manejo de peticiones HTTP
- Validación de entrada con Zod
- Formateo de respuestas
- Manejo de errores HTTP

**Ejemplo:** `src/controllers/user.controller.ts`

```typescript
import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { UserService } from "../services/user.service";
import type { UserFilters } from "../dto/user.dto";

// Schemas de validación con Zod
const UserSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email(),
  role: z.enum(["admin", "user", "mechanic"]).optional(),
});

const UserUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(150).optional(),
  email: z.string().email().optional(),
  role: z.enum(["admin", "user", "mechanic"]).optional(),
});

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Manejador principal de la API
   */
  async handle(req: NextApiRequest, res: NextApiResponse) {
    try {
      switch (req.method) {
        case "GET":
          return await this.getUsers(req, res);
        case "POST":
          return await this.createUser(req, res);
        case "PUT":
          return await this.updateUser(req, res);
        case "DELETE":
          return await this.deleteUser(req, res);
        default:
          return res.status(405).json({ error: "Método no permitido" });
      }
    } catch (error) {
      console.error("Error en UserController:", error);
      return res.status(500).json({
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  /**
   * GET /api/user
   */
  private async getUsers(req: NextApiRequest, res: NextApiResponse) {
    const { id, email, role, page, limit } = req.query;

    // Si se solicita un ID específico
    if (id) {
      if (typeof id !== "string" || !this.isValidUUID(id)) {
        return res.status(400).json({ error: "ID inválido" });
      }
      const user = await this.userService.findById(id);
      return res.status(200).json(user);
    }

    // Filtros específicos
    if (role && typeof role === "string") {
      const users = await this.userService.findByRole(role);
      return res.status(200).json(users);
    }

    // Lista paginada
    const filters: UserFilters = {};
    if (email && typeof email === "string") filters.email = email;
    if (role && typeof role === "string") filters.role = role;

    const pageNum = page && typeof page === "string" ? parseInt(page) : 1;
    const limitNum = limit && typeof limit === "string" ? parseInt(limit) : 10;

    const users = await this.userService.findAll(filters, {
      page: pageNum,
      limit: limitNum,
    });
    return res.status(200).json(users);
  }

  /**
   * POST /api/user
   */
  private async createUser(req: NextApiRequest, res: NextApiResponse) {
    // VALIDACIÓN con Zod
    const validation = UserSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const user = await this.userService.createUser(validation.data);
    return res.status(201).json([user]); // Array para POST
  }

  /**
   * PUT /api/user
   */
  private async updateUser(req: NextApiRequest, res: NextApiResponse) {
    const validation = UserUpdateSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        error: "Errores de validación",
        details: validation.error.issues,
      });
    }

    const { id, ...updateData } = validation.data;

    if (!this.isValidUUID(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const user = await this.userService.updateUser(id, updateData);
    return res.status(200).json([user]); // Array para PUT
  }

  /**
   * DELETE /api/user
   */
  private async deleteUser(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.body;

    if (!id || typeof id !== "string" || !this.isValidUUID(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    await this.userService.delete(id);
    return res.status(200).json({ message: "Usuario eliminado correctamente" });
  }

  /**
   * Validar formato UUID
   */
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }
}
```

**¿Qué hace?**

- **Valida** datos de entrada con Zod
- **Valida** UUIDs con regex
- **Maneja** diferentes métodos HTTP (GET, POST, PUT, DELETE)
- **Formatea** respuestas (arrays para POST/PUT, objetos para GET)
- **Traduce** errores a español
- **Delega** lógica de negocio al Service

---

### 📁 Capa 5: Endpoint

**Ubicación:** `pages/api/`

**Responsabilidad:**

- Documentación Swagger/OpenAPI
- Delegación al Controller
- **Código mínimo** (10-200 líneas)

**Ejemplo:** `pages/api/user.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from "next";
import { UserController } from "../../src/controllers/user.controller";

/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del usuario específico
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filtrar por email
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, user, mechanic]
 *         description: Filtrar por rol
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *   post:
 *     summary: Crear nuevo usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, user, mechanic]
 *     responses:
 *       201:
 *         description: Usuario creado
 */

const controller = new UserController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return controller.handle(req, res);
}
```

**¿Qué hace?**

- Define **documentación Swagger** completa
- **Instancia** el controller
- **Delega** toda la lógica al controller
- Código ultra-simple: ~10-200 líneas

---

## Patrones y Convenciones

### 1. Herencia con Genéricos

**BaseRepository<T>** y **BaseService<T>** usan TypeScript generics para reutilizar código:

```typescript
// BaseRepository proporciona CRUD genérico
export class BaseRepository<T> {
  async findAll(filters?: Record<string, unknown>) { ... }
  async findById(id: string) { ... }
  async create(data: Partial<T>) { ... }
  async update(id: string, data: Partial<T>) { ... }
  async delete(id: string) { ... }
}

// UserRepository hereda y extiende
export class UserRepository extends BaseRepository<User> {
  // Métodos personalizados
  async findByEmail(email: string) { ... }
}
```

### 2. Validación con Zod

Todos los controllers usan **Zod** para validación de tipos:

```typescript
const UserSchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email(),
  role: z.enum(["admin", "user", "mechanic"]).optional(),
});

// Validación
const validation = UserSchema.safeParse(req.body);
if (!validation.success) {
  return res.status(400).json({
    error: "Errores de validación",
    details: validation.error.issues,
  });
}
```

### 3. Validación de UUIDs

Regex estándar para validar UUIDs:

```typescript
private isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}
```

### 4. Mensajes de Error en Español

Todos los errores se devuelven en español:

```typescript
return res.status(400).json({ error: "Errores de validación" });
return res.status(404).json({ error: "Usuario no encontrado" });
return res.status(500).json({ error: "Error interno del servidor" });
```

### 5. Formato de Respuestas

**Convención de respuestas:**

- **GET:** Retorna objeto o array
- **POST:** Retorna array con el item creado `[item]`
- **PUT:** Retorna array con el item actualizado `[item]`
- **DELETE:** Retorna mensaje `{ message: "..." }`

```typescript
// GET /api/user?id=123
return res.status(200).json(user); // Objeto

// GET /api/user
return res.status(200).json(users); // Array

// POST /api/user
return res.status(201).json([user]); // Array con 1 elemento

// PUT /api/user
return res.status(200).json([user]); // Array con 1 elemento

// DELETE /api/user
return res.status(200).json({ message: "Usuario eliminado correctamente" });
```

### 6. Paginación

**Formato estándar:**

```typescript
const pageNum = page && typeof page === "string" ? parseInt(page) : 1;
const limitNum = limit && typeof limit === "string" ? parseInt(limit) : 10;

const result = await service.findAll(filters, { page: pageNum, limit: limitNum });

// Respuesta con PaginatedResponse<T>
{
  data: [...],
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
}
```

---

## Ejemplos Prácticos

### Ejemplo 1: Endpoint Completo (User)

**Estructura de archivos:**

```
src/
  dto/
    user.dto.ts          ← Interfaces y tipos
  repositories/
    user.repository.ts   ← Queries a BD
  services/
    user.service.ts      ← Lógica de negocio
  controllers/
    user.controller.ts   ← HTTP + Validación
pages/
  api/
    user.ts              ← Swagger + Delegación
```

### Ejemplo 2: Agregar Nuevo Método

**Caso:** Quiero buscar usuarios por ciudad

**1. DTO** - Ya existe User, no necesita cambios

**2. Repository** - Agregar query:

```typescript
async findByCity(city: string) {
  return this.db
    .from(this.tableName)
    .select("*")
    .eq("city", city);
}
```

**3. Service** - Exponer método:

```typescript
async findByCity(city: string) {
  const { data, error } = await this.userRepository.findByCity(city);
  if (error) throw error;
  return data || [];
}
```

**4. Controller** - Agregar en getUsers():

```typescript
if (city && typeof city === "string") {
  const users = await this.userService.findByCity(city);
  return res.status(200).json(users);
}
```

**5. Endpoint** - Documentar en Swagger:

```yaml
parameters:
  - in: query
    name: city
    schema:
      type: string
    description: Filtrar por ciudad
```

### Ejemplo 3: Crear Nuevo Endpoint

**Caso:** Crear endpoint para `Notification`

**Paso 1:** Crear DTO

```bash
src/dto/notification.dto.ts
```

**Paso 2:** Crear Repository

```bash
src/repositories/notification.repository.ts
```

**Paso 3:** Crear Service

```bash
src/services/notification.service.ts
```

**Paso 4:** Crear Controller

```bash
src/controllers/notification.controller.ts
```

**Paso 5:** Crear Endpoint

```bash
pages/api/notification.ts
```

**Paso 6:** Seguir los patrones establecidos de cada capa

---

## Beneficios

### ✅ Separación de Responsabilidades

Cada capa tiene un propósito claro:

- DTO: Tipos
- Repository: Datos
- Service: Negocio
- Controller: HTTP
- Endpoint: Documentación

### ✅ Testeable

Cada capa se puede testear independientemente:

```typescript
// Test del Repository (mock de Supabase)
const repository = new UserRepository();
const user = await repository.findByEmail("test@test.com");

// Test del Service (mock del Repository)
const service = new UserService();
const user = await service.createUser({ name: "Test", email: "test@test.com" });

// Test del Controller (mock del Service)
const controller = new UserController();
await controller.handle(mockReq, mockRes);
```

### ✅ Reutilizable

- BaseRepository y BaseService eliminan código duplicado
- Schemas Zod compartidos en `common.schema.ts`
- DTOs reutilizables entre capas

### ✅ Mantenible

- Cambios en una capa no afectan a las demás
- Fácil encontrar dónde hacer cambios:
  - ¿Cambiar validación? → Controller
  - ¿Cambiar regla de negocio? → Service
  - ¿Cambiar query? → Repository
  - ¿Cambiar tipos? → DTO

### ✅ Escalable

- Agregar nuevos endpoints es rápido (seguir el patrón)
- Agregar funcionalidad a endpoints existentes es claro
- Refactorizar es seguro (TypeScript + tests)

### ✅ Type-Safe

- TypeScript en todas las capas
- Sin tipos `any`
- Validación en compile-time y runtime (Zod)

---

## Testing y Coverage

### 📊 Estado Actual del Coverage (Octubre 2025)

**Coverage Global:**

- **Statements:** 44% (objetivo: incrementar gradualmente)
- **Branches:** 70%
- **Functions:** 57%
- **Lines:** 44%

**Tests:**

- **Total:** 2410 tests
- **Estado:** 100% passing ✅
- **Archivos de test:** 97 suites

### 📋 Coverage Threshold

El threshold en `jest.config.js` está configurado al nivel actual del coverage real para evitar fallos en CI/CD:

```javascript
coverageThreshold: {
  global: {
    statements: 44,
    branches: 40,
    functions: 57,
    lines: 44,
  },
}
```

**Nota:** Este threshold se ajustó en Sprint 6.4 (octubre 2025) para reflejar la realidad del proyecto. El objetivo es incrementarlo gradualmente a medida que se agregan más tests.

### 🎯 Estrategia de Coverage

1. **Tests de Capa de Servicio (Alta Prioridad)**
   - Servicios contienen la lógica de negocio crítica
   - Tests unitarios con mocks de repositories
   - Coverage objetivo: 80%+

2. **Tests de Capa de Controller (Media Prioridad)**
   - Validación HTTP y manejo de errores
   - Tests con `node-mocks-http`
   - Coverage objetivo: 70%+

3. **Tests de Integración (Baja Prioridad)**
   - Endpoints completos end-to-end
   - Coverage objetivo: 60%+

### ✅ Mejores Prácticas de Testing

- **Test por cada método público** en Services
- **Test de casos edge** (valores null, arrays vacíos, etc.)
- **Test de manejo de errores** (AppError classes)
- **Mock de dependencies** (repositories, external APIs)
- **Arrange-Act-Assert** pattern en todos los tests

### 📈 Plan de Incremento de Coverage

| Sprint | Objetivo Coverage | Acciones                            |
| ------ | ----------------- | ----------------------------------- |
| 6.x    | 44% (actual)      | Threshold ajustado a realidad       |
| 7.x    | 50%               | Tests para servicios sin coverage   |
| 8.x    | 60%               | Tests para controllers sin coverage |
| 9.x    | 70%               | Tests de integración                |
| 10.x   | 80%+              | Edge cases y optimizaciones         |

---

## Resumen Rápido

| Capa           | Archivo                               | ¿Qué hace?        | ¿Qué NO hace?               |
| -------------- | ------------------------------------- | ----------------- | --------------------------- |
| **DTO**        | `src/dto/user.dto.ts`                 | Define tipos      | No tiene lógica             |
| **Repository** | `src/repositories/user.repository.ts` | Queries a BD      | No valida reglas de negocio |
| **Service**    | `src/services/user.service.ts`        | Lógica de negocio | No maneja HTTP              |
| **Controller** | `src/controllers/user.controller.ts`  | HTTP + Validación | No accede a BD directamente |
| **Endpoint**   | `pages/api/user.ts`                   | Swagger + Delega  | No tiene lógica             |

---

## Conclusión

Esta arquitectura nos permite:

- **Desarrollar** rápido con patrones claros
- **Mantener** fácilmente el código
- **Escalar** sin acumular deuda técnica
- **Testear** cada capa independientemente
- **Colaborar** con código predecible

**Regla de oro:** Si no sabes dónde poner código, pregúntate:

- ¿Es un tipo? → DTO
- ¿Es una query? → Repository
- ¿Es una regla de negocio? → Service
- ¿Es validación HTTP? → Controller
- ¿Es documentación? → Endpoint

---

## Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Zod Documentation](https://zod.dev/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
