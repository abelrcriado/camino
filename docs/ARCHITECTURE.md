# 🏗️ ARCHITECTURE - Camino Service Backend

**Última actualización:** 12 de octubre de 2025  
**Versión:** 1.0 (Post-Sprint 5.3)

---

## 📖 Índice

1. [Visión General](#-visión-general)
2. [Clean Architecture (5 Capas)](#-clean-architecture-5-capas)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Tech Stack](#-tech-stack)
5. [Patrones de Diseño](#-patrones-de-diseño)
6. [Modelo de Datos](#-modelo-de-datos)
7. [Flujos de Datos](#-flujos-de-datos)
8. [API Design](#-api-design)
9. [Testing Strategy](#-testing-strategy)
10. [Deployment](#-deployment)

---

## 🎯 Visión General

**Camino Service Backend** es un sistema de gestión para un marketplace de servicios para peregrinos en el Camino de Santiago. Implementa una arquitectura limpia de 5 capas con TypeScript, Next.js, Supabase y Stripe.

### Características Principales

- **Clean Architecture**: Separación estricta en 5 capas
- **Type Safety**: TypeScript en modo strict, zero `any` types
- **Test Coverage**: 99.72% de cobertura, 2421 tests pasando
- **API REST**: 35+ endpoints documentados con Swagger
- **Pagos**: Integración completa con Stripe
- **Inventario**: Sistema de vending machines con slots
- **Ventas**: Reservas con códigos de retiro

### Casos de Uso

1. **Gestión de Service Points**: Administradores crean ubicaciones y servicios
2. **Vending Machines**: Máquinas con productos en slots
3. **Ventas App**: Peregrinos compran productos, reservan y retiran
4. **Talleres**: Reservas de servicios de talleres mecánicos
5. **Precios Jerárquicos**: Sistema de precios con herencia

---

## 🏛️ Clean Architecture (5 Capas)

La arquitectura sigue el principio de **Dependency Inversion**: las capas internas NO conocen las externas.

```
┌─────────────────────────────────────────────────────┐
│  LAYER 5: API Endpoints (pages/api/)                │
│  - Next.js API Routes                               │
│  - Swagger Documentation                            │
│  - Delegation to Controllers                        │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  LAYER 4: Controllers (src/controllers/)            │
│  - HTTP Request/Response handling                   │
│  - Zod Input Validation                             │
│  - Response formatting                              │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  LAYER 3: Services (src/services/)                  │
│  - Business Logic                                   │
│  - Orchestration                                    │
│  - Transaction Management                           │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  LAYER 2: Repositories (src/repositories/)          │
│  - Data Access Layer                                │
│  - Supabase Queries                                 │
│  - CRUD Operations                                  │
└─────────────────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────┐
│  LAYER 1: DTOs (src/dto/)                           │
│  - Type Definitions                                 │
│  - Interfaces                                       │
│  - No Implementation                                │
└─────────────────────────────────────────────────────┘
```

### Reglas de Dependencia

1. **Endpoints** solo llaman a **Controllers**
2. **Controllers** solo llaman a **Services**
3. **Services** solo llaman a **Repositories**
4. **Repositories** solo usan **DTOs**
5. **DTOs** no tienen dependencias

### Ejemplo de Flujo Completo

```typescript
// LAYER 1: DTO
export interface User {
  id: string;
  nombre: string;
  email: string;
  rol: UserRole;
  created_at?: string;
}

// LAYER 2: Repository
export class UserRepository extends BaseRepository<User> {
  constructor(supabase?: SupabaseClient) {
    super(supabase, "usuarios");
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select("*")
      .eq("email", email)
      .single();
    
    if (error) throw new RepositoryError(ErrorMessages.USER_NOT_FOUND);
    return data;
  }
}

// LAYER 3: Service
export class UserService extends BaseService<User> {
  private repository: UserRepository;

  constructor(repository?: UserRepository) {
    super(repository || new UserRepository());
    this.repository = repository || new UserRepository();
  }

  async createUser(data: CreateUserDto): Promise<User> {
    // Validación de negocio
    const existing = await this.repository.findByEmail(data.email);
    if (existing) {
      throw new BusinessError("Email ya registrado");
    }

    // Crear usuario
    return await this.repository.create(data);
  }
}

// LAYER 4: Controller
export class UserController {
  private service: UserService;

  constructor(service?: UserService) {
    this.service = service || new UserService();
  }

  async handlePost(req: NextApiRequest, res: NextApiResponse) {
    // Validación con Zod
    const validation = createUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ 
        error: "Datos inválidos",
        details: validation.error.errors 
      });
    }

    // Llamar servicio
    const user = await this.service.createUser(validation.data);
    
    // Respuesta estándar
    return res.status(201).json({ data: [user] });
  }
}

// LAYER 5: Endpoint
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Crear usuario
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *     responses:
 *       201:
 *         description: Usuario creado
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const controller = new UserController();
  
  if (req.method === "POST") {
    return await controller.handlePost(req, res);
  }
  
  return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
}
```

---

## 📁 Estructura del Proyecto

```
camino/
├── pages/                      # Next.js Pages Router
│   ├── _app.tsx               # App wrapper
│   ├── api/                   # API Routes (Layer 5)
│   │   ├── booking.ts         # Booking endpoints
│   │   ├── caminos/           # Caminos nested routes
│   │   │   ├── index.ts
│   │   │   └── [id]/
│   │   │       ├── index.ts
│   │   │       └── ubicaciones.ts
│   │   ├── productos/
│   │   ├── precios/
│   │   ├── service-points/
│   │   ├── ubicaciones/
│   │   ├── vending-machines/
│   │   ├── ventas-app/
│   │   └── workshops/
│   ├── admin/                 # Admin dashboard pages
│   └── dashboard/             # User dashboard pages
│
├── src/
│   ├── components/            # React components
│   │   ├── ui/                # UI primitives (buttons, inputs)
│   │   └── features/          # Feature-specific components
│   │
│   ├── config/                # Configuration files
│   │   └── swagger.ts         # Swagger OpenAPI config
│   │
│   ├── constants/             # Constants and enums
│   │   └── error-messages.ts  # Centralized error messages (50+)
│   │
│   ├── controllers/           # HTTP Controllers (Layer 4)
│   │   ├── booking.controller.ts
│   │   ├── user.controller.ts
│   │   └── ...                # 13 controllers total
│   │
│   ├── dto/                   # Data Transfer Objects (Layer 1)
│   │   ├── booking.dto.ts
│   │   ├── user.dto.ts
│   │   └── ...                # 29 DTOs total
│   │
│   ├── errors/                # Custom error classes
│   │   ├── base.error.ts
│   │   ├── business.error.ts
│   │   ├── repository.error.ts
│   │   └── validation.error.ts
│   │
│   ├── lib/                   # Third-party integrations
│   │   └── stripe.ts          # Stripe client config
│   │
│   ├── middlewares/           # Express-style middlewares
│   │   ├── error-handler.ts   # Global error handling
│   │   └── validate-uuid.ts   # UUID validation (6 functions)
│   │
│   ├── repositories/          # Data Access (Layer 2)
│   │   ├── base.repository.ts # Generic CRUD
│   │   ├── booking.repository.ts
│   │   ├── user.repository.ts
│   │   └── ...                # 29 repositories total
│   │
│   ├── schemas/               # Zod validation schemas
│   │   ├── booking.schema.ts
│   │   ├── user.schema.ts
│   │   └── ...                # 13 schema files
│   │
│   ├── services/              # Business Logic (Layer 3)
│   │   ├── base.service.ts    # Generic service methods
│   │   ├── booking.service.ts
│   │   ├── supabase.ts        # Supabase client config
│   │   └── ...                # 25 services total
│   │
│   ├── styles/                # Global CSS
│   │   └── globals.css
│   │
│   ├── types/                 # TypeScript type definitions
│   │   └── index.ts
│   │
│   └── utils/                 # Utility functions
│       ├── pagination.ts      # Pagination helpers (8 functions)
│       ├── validate-ownership.ts # Ownership validation (6 functions)
│       └── validation.ts      # General validation utils
│
├── __tests__/                 # Test files (mirror src/ structure)
│   ├── api/                   # Integration tests
│   ├── controllers/           # Controller unit tests
│   ├── repositories/          # Repository unit tests
│   ├── schemas/               # Schema validation tests
│   ├── services/              # Service unit tests
│   └── utils/                 # Utility function tests
│
├── __mocks__/                 # Jest mocks
│   └── uuid.js                # UUID mock for tests
│
├── docs/                      # Project documentation
│   ├── ARCHITECTURE.md        # This file
│   ├── ROADMAP.md             # Future plans
│   ├── CLEAN_ARCHITECTURE.md  # Architecture guide (original)
│   ├── SPRINT_5.1_COMPLETADO.md
│   ├── SPRINT_5.2_COMPLETADO.md
│   ├── TEST_STATUS_REPORT.md
│   └── negocio/               # Business documentation
│
├── supabase/
│   └── migrations/            # Database migrations
│       ├── YYYYMMDD_HHMMSS_description.sql
│       └── ...
│
├── scripts/                   # Utility scripts
│   ├── verify-stripe-config.js
│   └── test-payment-intent.sh
│
├── logs/                      # Winston logs
│   ├── combined-YYYY-MM-DD.log
│   └── errors-YYYY-MM-DD.log
│
├── public/                    # Static assets
│
├── .env.local                 # Environment variables (not in git)
├── .eslintrc.json             # ESLint config
├── .gitignore
├── eslint.config.mjs
├── jest.config.js             # Jest configuration
├── next.config.ts             # Next.js configuration
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json              # TypeScript config (strict mode)
└── README.md                  # Quick start guide
```

### Path Aliases

TypeScript está configurado con alias para imports limpios:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Uso:**
```typescript
// ✅ CORRECTO - Con alias
import { UserService } from "@/services/user.service";
import { ErrorMessages } from "@/constants/error-messages";

// ❌ INCORRECTO - Rutas relativas
import { UserService } from "../../services/user.service";
```

---

## 🛠️ Tech Stack

### Core Framework

- **Next.js 14.2.15**: React framework con Pages Router
- **TypeScript 5.x**: Strict mode, zero `any` types
- **React 18.3.1**: UI library

### Base de Datos

- **Supabase**: PostgreSQL managed con auth integrada
- **Direct Connection**: `postgresql://postgres.vjmwoqwqwblllrdbnkod:D3s4rr0ll0.@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require`
- **42 Tablas**: Modelo relacional completo

### Validación

- **Zod 3.x**: Schema validation con type inference
- **Custom Middleware**: validateUUID, validateOwnership

### Pagos

- **Stripe API**: Integración completa con Payment Intents
- **Config**: `scripts/verify-stripe-config.js`

### Testing

- **Jest 29.x**: Test runner con Next.js integration
- **node-mocks-http**: HTTP mocking para controllers
- **Coverage**: 99.72% promedio (branches: 40%, statements: 50%)

### Logging

- **Winston 3.x**: Structured logging
- **Daily Rotate**: Logs en `logs/` con rotación diaria

### Styling

- **Tailwind CSS 3.x**: Utility-first CSS
- **PostCSS**: CSS processing

### Development Tools

- **ESLint**: Linting con config Next.js
- **Prettier**: Code formatting (opcional)
- **Husky**: Git hooks (pendiente Sprint 6+)

---

## 🎨 Patrones de Diseño

### 1. BaseRepository Pattern

Todos los repositories extienden `BaseRepository<T>` con CRUD genérico:

```typescript
export abstract class BaseRepository<T> {
  protected supabase: SupabaseClient;
  protected tableName: string;

  constructor(supabase: SupabaseClient | undefined, tableName: string) {
    this.supabase = supabase || createClient(...);
    this.tableName = tableName;
  }

  async findAll(): Promise<T[]> { /* ... */ }
  async findById(id: string): Promise<T | null> { /* ... */ }
  async create(data: Partial<T>): Promise<T> { /* ... */ }
  async update(id: string, data: Partial<T>): Promise<T> { /* ... */ }
  async delete(id: string): Promise<void> { /* ... */ }
}
```

**Beneficios:**
- Elimina código duplicado
- Testing simplificado con dependency injection
- Interfaz consistente

### 2. BaseService Pattern

Servicios extienden `BaseService<T>` con lógica de negocio base:

```typescript
export abstract class BaseService<T> {
  protected repository: BaseRepository<T>;

  constructor(repository: BaseRepository<T>) {
    this.repository = repository;
  }

  async findAll(): Promise<T[]> {
    return await this.repository.findAll();
  }

  async findById(id: string): Promise<T | null> {
    return await this.repository.findById(id);
  }

  // Métodos customizables en subclases
}
```

### 3. Dependency Injection

Todos los componentes aceptan dependencias opcionales para testing:

```typescript
// Producción
const service = new UserService(); // Usa repository por defecto

// Testing
const mockRepo = new MockUserRepository();
const service = new UserService(mockRepo); // Inyecta mock
```

### 4. Response Format Convention

**GET**: Retorna objeto o array directo
```typescript
return res.status(200).json({ data: users }); // Array
return res.status(200).json({ data: user });  // Single object
```

**POST/PUT**: Retorna array con single item
```typescript
return res.status(201).json({ data: [newUser] }); // Siempre array
```

**DELETE**: Retorna mensaje
```typescript
return res.status(200).json({ message: "Usuario eliminado" });
```

### 5. Error Handling Pattern

Errores centralizados con `ErrorMessages` y `handleError`:

```typescript
import { ErrorMessages } from "@/constants/error-messages";
import { handleError } from "@/middlewares/error-handler";

try {
  // lógica
} catch (error) {
  return handleError(error, res);
}
```

### 6. UUID Validation Pattern

Validación centralizada con `validateUUID`:

```typescript
import { validateUUID } from "@/middlewares/validate-uuid";

const uuidError = validateUUID(id, "usuario");
if (uuidError) {
  return res.status(400).json({ error: uuidError });
}
```

### 7. Ownership Validation Pattern

Validación de recursos anidados con `validateOwnership`:

```typescript
import { validateSlotOwnership } from "@/utils/validate-ownership";

const slot = await service.findById(slotId);
const ownershipError = validateSlotOwnership(slot, machineId);
if (ownershipError) {
  return res.status(ownershipError.status).json({ 
    error: ownershipError.message 
  });
}
```

### 8. Pagination Pattern

Paginación centralizada con `pagination.ts`:

```typescript
import { 
  parsePaginationParams, 
  createPaginatedResponse 
} from "@/utils/pagination";

const { page, limit } = parsePaginationParams(req.query);
const offset = calculateOffset(page, limit);
const { data, total } = await service.findAll({ offset, limit });

return res.status(200).json(
  createPaginatedResponse(data, total, page, limit)
);
```

---

## 🗄️ Modelo de Datos

### Jerarquía Principal

```
CAMINO (Ruta completa del peregrino)
  └── UBICACION (Pueblo/ciudad en el camino)
       └── SERVICE_POINT (Punto de servicio físico)
            ├── SERVICIO (Servicio ofrecido)
            │    ├── TALLER (Taller mecánico)
            │    └── BOOKING (Reservas)
            └── VENDING_MACHINE
                 └── SLOT (Posición en la máquina)
                      └── PRODUCTO
```

### Tablas Core (42 total)

#### Usuarios y Autenticación
- `usuarios`: Usuarios del sistema
- `roles`: Roles de usuario (admin, gestor, user)

#### Jerarquía de Ubicaciones
- `caminos`: Rutas del Camino de Santiago
- `ubicaciones`: Pueblos/ciudades en caminos
- `service_points`: Puntos de servicio físicos
- `servicios`: Servicios ofrecidos en service points

#### Productos y Vending
- `productos`: Catálogo de productos
- `vending_machines`: Máquinas expendedoras
- `slots`: Posiciones en máquinas
- `inventario_vending`: Stock en slots

#### Precios (Sistema Jerárquico)
- `precios_base`: Precio base del producto
- `precios_ubicacion`: Override a nivel ubicación
- `precios_service_point`: Override a nivel service point

**Resolución:** SP → Ubicación → Base

#### Ventas
- `ventas_app`: Ventas de productos
- `codigos_retiro`: Códigos para retirar productos
- `reservas`: Estado de reservas

#### Talleres
- `talleres`: Talleres mecánicos
- `servicios_taller`: Servicios ofrecidos
- `bookings`: Reservas de servicios

#### Pagos
- `payments`: Registros de pagos Stripe
- `payment_intents`: Intents de Stripe

#### Partners y Favoritos
- `partners`: Partners del ecosistema
- `favoritos`: Favoritos de usuarios

#### CSP (Customer Service Points)
- `csp`: Puntos de atención al cliente

#### Reviews y Reports
- `reviews`: Reseñas de servicios
- `reports`: Reportes de incidencias

### Relaciones Clave

```sql
-- Jerarquía
ubicaciones.camino_id → caminos.id
service_points.ubicacion_id → ubicaciones.id
servicios.service_point_id → service_points.id

-- Vending
vending_machines.service_point_id → service_points.id
slots.machine_id → vending_machines.id
slots.producto_id → productos.id

-- Precios (herencia)
precios_base.producto_id → productos.id
precios_ubicacion.producto_id → productos.id
precios_ubicacion.ubicacion_id → ubicaciones.id
precios_service_point.producto_id → productos.id
precios_service_point.service_point_id → service_points.id

-- Ventas
ventas_app.producto_id → productos.id
ventas_app.slot_id → slots.id
codigos_retiro.venta_id → ventas_app.id
```

### Migraciones

Ubicación: `supabase/migrations/`

**Naming:** `YYYYMMDD_HHMMSS_description.sql`

**Ejemplo:**
```sql
-- 20251010_120000_enable_extensions.sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 20251011_143000_create_usuarios_table.sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'gestor', 'user')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Aplicar migración:**
```bash
# SIEMPRE crear backup antes
mkdir -p backups
echo "-- Backup $(date)" > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Aplicar migración
psql "postgresql://..." < supabase/migrations/migration_file.sql
```

---

## 🔄 Flujos de Datos

### Flujo de Venta Completa

```
Usuario → POST /api/ventas-app
  ↓
VentaAppController.handlePost()
  ↓ Validación Zod
VentaAppService.createVenta()
  ↓ Verificar disponibilidad
SlotRepository.findById()
  ↓ Crear reserva
VentaAppRepository.create()
  ↓ Generar código
CodigoRetiroRepository.create()
  ↓ Pago Stripe
StripeService.createPaymentIntent()
  ↓
Response: { venta, codigo, payment }
```

### Flujo de Resolución de Precios

```
Cliente → GET /api/precios?producto=X&service_point=Y
  ↓
PrecioController.handleGet()
  ↓
PrecioService.resolvePrice(productoId, spId)
  ↓ 1. Buscar precio en Service Point
PrecioServicePointRepository.findByProductoAndSP(productoId, spId)
  ↓ Si no existe ↓
  ↓ 2. Buscar precio en Ubicación
PrecioUbicacionRepository.findByProductoAndUbicacion(productoId, ubicacionId)
  ↓ Si no existe ↓
  ↓ 3. Buscar precio base
PrecioBaseRepository.findByProducto(productoId)
  ↓
Response: { precio, nivel: "service_point" | "ubicacion" | "base" }
```

### Flujo de Booking de Taller

```
Usuario → POST /api/booking
  ↓
BookingController.handlePost()
  ↓ Validación Zod
BookingService.createBooking()
  ↓ Verificar disponibilidad
AvailabilityService.checkAvailability(tallerId, fecha, hora)
  ↓ Crear booking
BookingRepository.create()
  ↓ Bloquear slot
AvailabilityRepository.updateSlot(tallerId, fecha, hora, status: "booked")
  ↓
Response: { booking, confirmacion }
```

---

## 🌐 API Design

### Base URL

**Development:** `http://localhost:3000/api`  
**Production:** `https://camino.app/api` (placeholder)

### Documentación

**Swagger UI:** `http://localhost:3000/api-docs`

Configuración: `src/config/swagger.ts`

### Convenciones de Endpoints

#### Naming

```
/api/entity                  # Collection
/api/entity/[id]             # Single resource
/api/entity/[id]/relation    # Nested resource
```

#### HTTP Methods

- `GET`: Leer recurso(s)
- `POST`: Crear recurso
- `PUT`: Actualizar recurso completo
- `PATCH`: Actualizar recurso parcial (no usado actualmente)
- `DELETE`: Eliminar recurso

#### Status Codes

| Code | Uso                                    |
| ---- | -------------------------------------- |
| 200  | Success (GET, PUT, DELETE)             |
| 201  | Created (POST)                         |
| 400  | Bad Request (validación falla)         |
| 401  | Unauthorized (falta autenticación)     |
| 403  | Forbidden (sin permisos)               |
| 404  | Not Found (recurso no existe)          |
| 405  | Method Not Allowed (método no soportado)|
| 409  | Conflict (violación de constraint)     |
| 500  | Internal Server Error                  |

#### Paginación

Todos los endpoints de colección soportan paginación:

**Query Params:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10, max: 100)

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16
  }
}
```

#### Filtrado

**Query Params:** Campos del recurso como filtros

**Ejemplo:**
```
GET /api/productos?categoria=comida&precio_max=5.00
```

#### Ordenamiento

**Query Params:**
- `sort`: Campo a ordenar
- `order`: `asc` | `desc` (default: `desc`)

**Ejemplo:**
```
GET /api/productos?sort=precio&order=asc
```

### Autenticación

**Actual:** Sin autenticación (desarrollo)  
**Futuro (Sprint 11):** JWT tokens con Supabase Auth

```typescript
// Header esperado
Authorization: Bearer <token>
```

### Rate Limiting

**Actual:** Sin rate limiting  
**Futuro (Sprint 9.2):**
- 100 requests/minuto por IP
- 1000 requests/hora por usuario autenticado

---

## 🧪 Testing Strategy

### Coverage Actual

| Tipo                | Tests | Coverage |
| ------------------- | ----- | -------- |
| **Controllers**     | 13    | 99.85%   |
| **Services**        | 15    | 99.72%   |
| **Repositories**    | 2     | 99.50%   |
| **Schemas**         | 13    | 99.80%   |
| **Utilities**       | 1     | 100%     |
| **TOTAL**           | 2421  | 99.72%   |

### Testing Layers

#### 1. Unit Tests

**Controllers:**
```typescript
import { createMocks } from "node-mocks-http";
import { UserController } from "@/controllers/user.controller";

describe("UserController", () => {
  let controller: UserController;
  let mockService: jest.Mocked<UserService>;

  beforeEach(() => {
    mockService = {
      findById: jest.fn(),
      create: jest.fn(),
    } as any;
    controller = new UserController(mockService);
  });

  it("debe retornar 200 con usuario", async () => {
    const { req, res } = createMocks({ method: "GET", query: { id: "123" } });
    mockService.findById.mockResolvedValue({ id: "123", nombre: "Test" });

    await controller.handleGet(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      data: { id: "123", nombre: "Test" }
    });
  });
});
```

**Services:**
```typescript
import { UserService } from "@/services/user.service";
import { UserRepository } from "@/repositories/user.repository";

describe("UserService", () => {
  let service: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    } as any;
    service = new UserService(mockRepo);
  });

  it("debe crear usuario si email no existe", async () => {
    mockRepo.findByEmail.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: "123", email: "test@example.com" });

    const result = await service.createUser({ email: "test@example.com" });

    expect(result).toHaveProperty("id");
    expect(mockRepo.create).toHaveBeenCalled();
  });
});
```

**Repositories:**
```typescript
import { UserRepository } from "@/repositories/user.repository";
import { SupabaseClient } from "@supabase/supabase-js";

describe("UserRepository", () => {
  let repository: UserRepository;
  let mockSupabase: any;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    } as any as SupabaseClient;

    repository = new UserRepository(mockSupabase);
  });

  it("debe retornar usuario por ID", async () => {
    mockSupabase.single.mockResolvedValue({
      data: { id: "123", nombre: "Test" },
      error: null,
    });

    const result = await repository.findById("123");

    expect(result).toEqual({ id: "123", nombre: "Test" });
    expect(mockSupabase.from).toHaveBeenCalledWith("usuarios");
  });
});
```

**Schemas:**
```typescript
import { createUserSchema } from "@/schemas/user.schema";

describe("User Schema", () => {
  it("debe validar datos correctos", () => {
    const data = {
      nombre: "Test User",
      email: "test@example.com",
      rol: "user",
    };

    const result = createUserSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("debe rechazar email inválido", () => {
    const data = {
      nombre: "Test",
      email: "invalid-email",
      rol: "user",
    };

    const result = createUserSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
```

#### 2. Integration Tests (Pendiente Sprint 8)

Tests que involucran múltiples capas:

```typescript
describe("Flujo de Venta Completo", () => {
  it("debe crear venta, reservar stock y generar código", async () => {
    // Setup: Crear producto, slot, etc.
    // Test: Llamar endpoint de venta
    // Verify: Stock reservado, código generado, pago creado
  });
});
```

#### 3. E2E Tests (Pendiente Sprint 8)

Tests con Playwright:

```typescript
test("Usuario puede comprar producto", async ({ page }) => {
  await page.goto("/productos");
  await page.click('button:has-text("Comprar")');
  await page.fill('input[name="email"]', "test@example.com");
  await page.click('button:has-text("Confirmar")');
  await expect(page.locator(".success")).toBeVisible();
});
```

### Comandos de Test

```bash
# Todos los tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage

# Test específico
npm test -- booking.controller.test

# Test con patrón
npm test -- "*.schema.test"
```

### Configuración Jest

`jest.config.js`:
```javascript
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
  ],
  coverageThresholds: {
    global: {
      statements: 50,
      branches: 40,
    },
  },
};
```

### Mocks

**UUID Mock** (`__mocks__/uuid.js`):
```javascript
module.exports = {
  v4: jest.fn(() => "mocked-uuid-1234"),
};
```

**Supabase Mock Pattern:**
```typescript
const mockSupabase = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
} as any as SupabaseClient;
```

---

## 🚀 Deployment

### Environment Variables

**Archivo:** `.env.local` (no en git)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vjmwoqwqwblllrdbnkod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Preferred

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Build Process

```bash
# Desarrollo
npm run dev         # Next.js dev server en puerto 3000

# Producción
npm run build       # Genera .next/ optimizado
npm start           # Sirve build de producción

# Linting
npm run lint        # ESLint check
npm run lint:fix    # Autofix errores
```

### Database Backup

**MANDATORY antes de migraciones:**

```bash
# Crear backup
mkdir -p backups
echo "-- Backup $(date)" > backups/backup_$(date +%Y%m%d_%H%M%S).sql
pg_dump "postgresql://..." > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Aplicar migración
psql "postgresql://..." < supabase/migrations/migration.sql

# Restaurar si falla
psql "postgresql://..." < backups/backup_YYYYMMDD_HHMMSS.sql
```

### Deployment Checklist

- [ ] Tests pasando: `npm test`
- [ ] Lint clean: `npm run lint`
- [ ] Build exitoso: `npm run build`
- [ ] Environment vars configuradas
- [ ] Database migrations aplicadas
- [ ] Backup de BD creado
- [ ] Stripe keys actualizadas (producción)
- [ ] Logs configurados

### CI/CD (Pendiente Sprint 8+)

**Propuesta:**

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test
      - run: npm run lint
      - run: npm run build
```

---

## 📚 Referencias Adicionales

- **ROADMAP.md**: Pendientes y próximos sprints
- **SPRINT_5.1_COMPLETADO.md**: Endpoints implementados
- **SPRINT_5.2_COMPLETADO.md**: Tests creados
- **TEST_STATUS_REPORT.md**: Estado actual de tests
- **README.md**: Quick start y setup

---

## 📞 Contacto y Contribución

Para sugerencias, reportar bugs o proponer mejoras:

1. Crear issue en el repositorio
2. Seguir convenciones de commits (cuando Husky esté configurado en Sprint 6+)
3. Enviar PR con tests incluidos

**Maintainer:** Equipo Camino  
**Última revisión:** 12 de octubre de 2025
