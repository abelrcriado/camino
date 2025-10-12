# 🏔️ Camino Service Backend

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Tests](https://img.shields.io/badge/tests-2421%20passing-success.svg)](/)
[![Coverage](https://img.shields.io/badge/coverage-99.72%25-brightgreen.svg)](/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**Sistema de gestión para marketplace de servicios para peregrinos del Camino de Santiago**

Backend RESTful API construido con **Clean Architecture**, TypeScript strict, y cobertura de tests del 99.72%. Gestiona service points, vending machines, talleres, productos, ventas y bookings.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tech Stack](#-tech-stack)
- [Arquitectura](#-arquitectura)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Desarrollo](#-desarrollo)
- [Testing](#-testing)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Roadmap](#-roadmap)
- [Licencia](#-licencia)

---

## ✨ Características

### Gestión de Service Points
- **Jerarquía completa**: Caminos → Ubicaciones → Service Points → Servicios
- Sistema de precios jerárquico (Base → Ubicación → Service Point)
- Geolocalización y mapas de puntos de servicio

### Vending Machines
- Gestión de máquinas expendedoras con slots
- Inventario en tiempo real por slot y producto
- Control de stock con alertas de reposición

### Ventas & Reservas
- Sistema de ventas con códigos de retiro
- Reservas automáticas de stock
- Integración completa con Stripe para pagos

### Talleres Mecánicos
- Gestión de talleres y servicios
- Sistema de bookings con disponibilidad
- Reviews y ratings de servicios

### Características Técnicas
- ✅ **Clean Architecture** (5 capas estrictas)
- ✅ **Type Safety** (TypeScript strict mode, zero `any`)
- ✅ **99.72% Test Coverage** (2421 tests pasando)
- ✅ **API REST completa** (35+ endpoints)
- ✅ **Swagger Documentation** (OpenAPI 3.0)
- ✅ **Validación robusta** (Zod schemas)
- ✅ **Error handling centralizado**
- ✅ **Logging estructurado** (Winston)

---

## 🛠️ Tech Stack

### Core Framework
- **[Next.js 14.2](https://nextjs.org/)** - React framework con Pages Router
- **[TypeScript 5.x](https://www.typescriptlang.org/)** - Strict mode
- **[React 18.3](https://react.dev/)** - UI library

### Base de Datos & Backend
- **[Supabase](https://supabase.com/)** - PostgreSQL managed + Auth
- **[Stripe](https://stripe.com/)** - Procesamiento de pagos
- **PostgreSQL** - 42 tablas relacionales

### Validación & Testing
- **[Zod 3.x](https://zod.dev/)** - Schema validation con type inference
- **[Jest 29.x](https://jestjs.io/)** - Test runner
- **[node-mocks-http](https://www.npmjs.com/package/node-mocks-http)** - HTTP mocking

### Utilities
- **[Winston](https://github.com/winstonjs/winston)** - Structured logging
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS
- **[ESLint](https://eslint.org/)** - Code linting

---

## 🏛️ Arquitectura

Sistema basado en **Clean Architecture de 5 capas** con separación estricta de responsabilidades:

```
┌─────────────────────────────────────────┐
│  Layer 5: API Endpoints (pages/api/)    │ ← Swagger docs + delegación
├─────────────────────────────────────────┤
│  Layer 4: Controllers (src/controllers/)│ ← HTTP + Zod validation
├─────────────────────────────────────────┤
│  Layer 3: Services (src/services/)      │ ← Lógica de negocio
├─────────────────────────────────────────┤
│  Layer 2: Repositories (src/repositories/)│ ← Acceso a datos (Supabase)
├─────────────────────────────────────────┤
│  Layer 1: DTOs (src/dto/)               │ ← Definiciones de tipos
└─────────────────────────────────────────┘
```

### Modelo de Datos

```
CAMINO (Ruta completa)
  └── UBICACION (Pueblo/ciudad)
       └── SERVICE_POINT (Punto físico)
            ├── SERVICIO (Servicio ofrecido)
            │    ├── TALLER (Taller mecánico)
            │    └── BOOKING (Reservas)
            └── VENDING_MACHINE
                 └── SLOT (Posición)
                      └── PRODUCTO
```

**Ver documentación completa:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 📦 Instalación

### Prerrequisitos

- **Node.js 18+** (recomendado: 20.x LTS)
- **npm 9+** o **yarn 1.22+**
- **Git**
- Cuenta en **Supabase** (para base de datos)
- Cuenta en **Stripe** (para pagos)

### Clonar Repositorio

```bash
git clone https://github.com/tu-usuario/camino-backend.git
cd camino-backend
```

### Instalar Dependencias

```bash
npm install
# o
yarn install
```

---

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env.local` en la raíz del proyecto:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Preferred

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Base de Datos

#### Opción 1: Usar Conexión Supabase Existente

Si usas el proyecto de Supabase existente, las tablas ya están configuradas.

#### Opción 2: Crear Nueva Base de Datos

```bash
# 1. Crear proyecto en Supabase.com

# 2. Obtener connection string
# Dashboard → Settings → Database → Connection String

# 3. Aplicar migraciones
psql "tu-connection-string" < supabase/migrations/20251010_120000_enable_extensions.sql
psql "tu-connection-string" < supabase/migrations/20251011_143000_create_tables.sql
# ... aplicar todas las migraciones en orden
```

**Naming convention:** `YYYYMMDD_HHMMSS_description.sql`

### Verificar Configuración

```bash
# Verificar conexión a Supabase
npm run dev
# Abrir http://localhost:3000/api/health (si existe)

# Verificar Stripe
node scripts/verify-stripe-config.js
```

---

## 📁 Estructura del Proyecto

```
camino/
├── pages/                  # Next.js Pages Router
│   ├── api/               # API Routes (35+ endpoints)
│   │   ├── booking.ts
│   │   ├── caminos/
│   │   ├── productos/
│   │   ├── precios/
│   │   ├── service-points/
│   │   ├── ubicaciones/
│   │   ├── vending-machines/
│   │   ├── ventas-app/
│   │   └── workshops/
│   ├── admin/             # Admin dashboard
│   └── dashboard/         # User dashboard
│
├── src/
│   ├── components/        # React components
│   ├── config/            # Configuration files
│   │   └── swagger.ts     # Swagger OpenAPI config
│   ├── constants/         # Constants
│   │   └── error-messages.ts  # 50+ error messages
│   ├── controllers/       # HTTP Controllers (13 clases)
│   ├── dto/               # Data Transfer Objects (29 interfaces)
│   ├── errors/            # Custom error classes
│   ├── lib/               # Third-party integrations
│   │   └── stripe.ts
│   ├── middlewares/       # Middlewares
│   │   ├── error-handler.ts
│   │   └── validate-uuid.ts
│   ├── repositories/      # Data Access (29 clases)
│   │   └── base.repository.ts  # Generic CRUD
│   ├── schemas/           # Zod validation schemas (13 files)
│   ├── services/          # Business Logic (25 clases)
│   │   ├── base.service.ts
│   │   └── supabase.ts
│   ├── styles/            # Global CSS
│   ├── types/             # TypeScript types
│   └── utils/             # Utility functions
│       ├── pagination.ts  # 8 funciones de paginación
│       ├── validate-ownership.ts  # 6 funciones
│       └── validation.ts
│
├── __tests__/             # Tests (2421 tests)
│   ├── api/               # Integration tests
│   ├── controllers/       # Controller unit tests
│   ├── repositories/      # Repository unit tests
│   ├── schemas/           # Schema validation tests
│   ├── services/          # Service unit tests
│   └── utils/             # Utility tests
│
├── __mocks__/             # Jest mocks
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md    # ⭐ Clean Architecture guide
│   ├── ROADMAP.md         # ⭐ Future sprints (6-10+)
│   ├── SPRINT_5.1_COMPLETADO.md
│   ├── SPRINT_5.2_COMPLETADO.md
│   ├── TEST_STATUS_REPORT.md
│   ├── notas.md           # Business model
│   └── archive/           # Historical docs
│
├── supabase/
│   └── migrations/        # Database migrations
│
├── scripts/               # Utility scripts
├── logs/                  # Winston logs (gitignored)
├── public/                # Static assets
│
├── .env.local             # Environment vars (gitignored)
├── .eslintrc.json
├── .gitignore
├── jest.config.js         # Jest configuration
├── next.config.ts
├── package.json
├── tsconfig.json          # TypeScript strict mode
└── README.md              # This file
```

### Path Aliases

Imports limpios con alias `@/`:

```typescript
import { UserService } from "@/services/user.service";
import { ErrorMessages } from "@/constants/error-messages";
import { validateUUID } from "@/middlewares/validate-uuid";
```

---

## 💻 Desarrollo

### Comandos Principales

```bash
# Iniciar servidor de desarrollo
npm run dev
# → http://localhost:3000
# → API docs: http://localhost:3000/api-docs

# Build de producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint          # Verificar errores
npm run lint:fix      # Autofix errores

# Testing
npm test              # Correr todos los tests
npm run test:watch    # Watch mode
npm run test:coverage # Reporte de coverage

# Database
# Ver sección "Configuración → Base de Datos"
```

### Workflow de Desarrollo

1. **Crear nueva feature:**
   ```bash
   git checkout -b feature/nombre-feature
   ```

2. **Implementar siguiendo Clean Architecture:**
   - Layer 1: Crear DTO en `src/dto/entity.dto.ts`
   - Layer 2: Crear Repository en `src/repositories/entity.repository.ts`
   - Layer 3: Crear Service en `src/services/entity.service.ts`
   - Layer 4: Crear Controller en `src/controllers/entity.controller.ts`
   - Layer 5: Crear Endpoint en `pages/api/entity.ts`

3. **Crear tests:**
   ```bash
   # Tests unitarios
   __tests__/schemas/entity.schema.test.ts
   __tests__/repositories/entity.repository.test.ts
   __tests__/services/entity.service.test.ts
   __tests__/controllers/entity.controller.test.ts
   
   # Tests de integración
   __tests__/api/entity.test.ts
   ```

4. **Validar:**
   ```bash
   npm test           # Tests deben pasar (100%)
   npm run lint       # Zero errores
   npm run build      # Build exitoso
   ```

5. **Commit:**
   ```bash
   git add .
   git commit -m "feat: agregar endpoint de entity"
   # Cuando Husky esté configurado (Sprint 6+)
   ```

### Hot Reload

Next.js recompila automáticamente al guardar archivos:
- **API Routes:** Cambios se reflejan instantáneamente
- **Components:** Fast Refresh preserva estado de React
- **Styles:** Tailwind recompila automáticamente

---

## 🧪 Testing

### Estrategia de Testing

**Cobertura Actual:**
- ✅ **2421 tests pasando** (100% success rate)
- ✅ **97 test suites** (100% passing)
- ✅ **99.72% coverage** promedio

**Testing Layers:**
- **Unit Tests**: Controllers, Services, Repositories, Schemas, Utils
- **Integration Tests**: Flujos completos API (pendiente Sprint 8)
- **E2E Tests**: Playwright (pendiente Sprint 8)

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Watch mode (recomendado para desarrollo)
npm run test:watch

# Coverage report
npm run test:coverage
# → Genera reporte en coverage/

# Test específico
npm test -- booking.controller.test

# Tests por patrón
npm test -- "*.schema.test"

# Tests con logs detallados
npm test -- --verbose
```

### Escribir Tests

#### Controller Test

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
    const { req, res } = createMocks({ 
      method: "GET", 
      query: { id: "123" } 
    });
    
    mockService.findById.mockResolvedValue({ 
      id: "123", 
      nombre: "Test User" 
    });

    await controller.handleGet(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      data: { id: "123", nombre: "Test User" }
    });
  });
});
```

#### Service Test

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
    mockRepo.create.mockResolvedValue({ 
      id: "123", 
      email: "test@example.com" 
    });

    const result = await service.createUser({ 
      email: "test@example.com",
      nombre: "Test",
      rol: "user"
    });

    expect(result).toHaveProperty("id");
    expect(mockRepo.create).toHaveBeenCalled();
  });

  it("debe fallar si email ya existe", async () => {
    mockRepo.findByEmail.mockResolvedValue({ 
      id: "123", 
      email: "test@example.com" 
    });

    await expect(
      service.createUser({ email: "test@example.com" })
    ).rejects.toThrow("Email ya registrado");
  });
});
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

### Debugging Tests

```bash
# Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# VS Code: Agregar a .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache"],
  "console": "integratedTerminal"
}
```

---

## 📚 API Documentation

### Swagger UI

**URL:** http://localhost:3000/api-docs

Documentación interactiva OpenAPI 3.0 con:
- ✅ Todos los endpoints documentados
- ✅ Request/Response schemas
- ✅ Ejemplos de uso
- ✅ Validaciones y constraints
- ✅ Try it out (ejecutar desde el navegador)

### Endpoints Principales

#### Caminos & Ubicaciones

```http
GET    /api/caminos              # Listar caminos
GET    /api/caminos/[id]         # Obtener camino
GET    /api/caminos/[id]/ubicaciones  # Ubicaciones de camino

GET    /api/ubicaciones          # Listar ubicaciones
GET    /api/ubicaciones/[id]     # Obtener ubicación
GET    /api/ubicaciones/[id]/service-points  # Service points de ubicación
```

#### Service Points & Servicios

```http
GET    /api/service-points       # Listar service points
GET    /api/service-points/[id]  # Obtener service point
POST   /api/service-points       # Crear service point
PUT    /api/service-points/[id]  # Actualizar service point
DELETE /api/service-points/[id]  # Eliminar service point
```

#### Productos & Vending

```http
GET    /api/productos            # Listar productos
GET    /api/productos/[id]       # Obtener producto
POST   /api/productos            # Crear producto

GET    /api/vending-machines/[id]/slots  # Slots de máquina
GET    /api/vending-machines/[id]/slots/[slotId]  # Slot específico
PUT    /api/vending-machines/[id]/slots/[slotId]  # Actualizar slot
```

#### Precios

```http
GET    /api/precios              # Listar precios con filtros
GET    /api/precios/resolve      # Resolver precio (jerarquía BASE→UBICACION→SP)
  ?producto_id=uuid
  &service_point_id=uuid
  &ubicacion_id=uuid
```

#### Ventas App

```http
POST   /api/ventas-app           # Crear venta + reserva + pago
GET    /api/ventas-app/usuario/[userId]  # Ventas de usuario
GET    /api/ventas-app/service-point/[spId]  # Ventas de SP

POST   /api/ventas-app/confirmar-retiro  # Confirmar retiro con código
  { codigo: "ABC123", venta_id: "uuid" }
```

#### Bookings

```http
GET    /api/booking              # Listar bookings con filtros
POST   /api/booking              # Crear booking
GET    /api/booking/[id]         # Obtener booking
PUT    /api/booking/[id]         # Actualizar booking
DELETE /api/booking/[id]         # Cancelar booking
```

#### Talleres

```http
GET    /api/workshops            # Listar talleres
GET    /api/workshops/[id]       # Obtener taller
GET    /api/workshops/[id]/services  # Servicios de taller
```

### Convenciones de Respuestas

#### Success Responses

```json
// GET (single)
{
  "data": {
    "id": "uuid",
    "nombre": "Producto X"
  }
}

// GET (collection con paginación)
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156,
    "totalPages": 16
  }
}

// POST/PUT (siempre array)
{
  "data": [
    {
      "id": "uuid",
      "nombre": "Producto X"
    }
  ]
}

// DELETE
{
  "message": "Producto eliminado exitosamente"
}
```

#### Error Responses

```json
{
  "error": "Descripción del error en español"
}

// Con detalles de validación
{
  "error": "Datos inválidos",
  "details": [
    {
      "field": "email",
      "message": "Email inválido"
    }
  ]
}
```

### Paginación

**Query Params:**
- `page`: Número de página (default: 1)
- `limit`: Items por página (default: 10, max: 100)

**Ejemplo:**
```http
GET /api/productos?page=2&limit=20
```

### Filtrado

**Query Params:** Campos del recurso como filtros

**Ejemplo:**
```http
GET /api/productos?categoria=comida&precio_max=5.00&activo=true
```

### Ordenamiento

**Query Params:**
- `sort`: Campo a ordenar
- `order`: `asc` | `desc` (default: `desc`)

**Ejemplo:**
```http
GET /api/productos?sort=precio&order=asc
```

---

## 🚀 Deployment

### Build de Producción

```bash
# 1. Build
npm run build
# → Genera .next/ optimizado

# 2. Verificar build
npm start
# → Servidor producción en puerto 3000

# 3. Verificar tests
npm test

# 4. Verificar lint
npm run lint
```

### Environment Variables (Producción)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key...
SUPABASE_SERVICE_ROLE_KEY=prod_service_key...

# Stripe (PROD keys)
STRIPE_SECRET_KEY=sk_live_51...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51...

# App
NEXT_PUBLIC_APP_URL=https://camino.app
NODE_ENV=production
```

### Deployment Platforms

#### Vercel (Recomendado para Next.js)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production deploy
vercel --prod
```

**Environment vars:** Configurar en Vercel Dashboard → Settings → Environment Variables

#### Docker (Alternativa)

```dockerfile
# Dockerfile (ejemplo)
FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t camino-backend .
docker run -p 3000:3000 --env-file .env.production camino-backend
```

### Database Migrations

**MANDATORY: Siempre crear backup antes de migraciones**

```bash
# 1. Backup
mkdir -p backups
pg_dump "postgresql://..." > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Aplicar migración
psql "postgresql://..." < supabase/migrations/nueva_migracion.sql

# 3. Verificar
psql "postgresql://..." -c "\dt" # Listar tablas

# 4. Restaurar si falla
psql "postgresql://..." < backups/backup_YYYYMMDD_HHMMSS.sql
```

### Monitoring & Logs

**Winston Logs:**
- `logs/combined-YYYY-MM-DD.log`: Todos los logs
- `logs/errors-YYYY-MM-DD.log`: Solo errores

**Producción:** Configurar integración con:
- Sentry (error tracking)
- LogDNA / Datadog (log aggregation)
- New Relic / AppDynamics (APM)

---

## 📝 Documentation Process

This project follows a **mandatory documentation process** for every sprint:

### After Each Sprint ✅ REQUIRED

1. **Generate CHANGELOG**: `npm run release`
2. **Create Sprint Report**: Use `docs/templates/SPRINT_REPORT_TEMPLATE.md`
3. **Update COMPLETED_SPRINTS.md**: Add sprint summary
4. **Update BACKLOG.md**: Move completed tasks, add new ones
5. **Update ROADMAP.md**: Mark sprint as complete

See [ROADMAP.md](docs/ROADMAP.md#proceso-mandatory-de-documentación) for full process.

---

## 🤝 Contributing

### Pre-requisitos

- Leer [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Familiarizarse con Clean Architecture de 5 capas
- Conocer convenciones de código

### Workflow

1. **Fork & Clone**
   ```bash
   git clone https://github.com/tu-usuario/camino-backend.git
   ```

2. **Crear Feature Branch**
   ```bash
   git checkout -b feature/nombre-feature
   ```

3. **Implementar Feature**
   - Seguir Clean Architecture (5 capas)
   - Crear tests unitarios (mínimo 99% coverage)
   - Documentar endpoint con Swagger
   - Validar con Zod schemas
   - Mensajes de error en español

4. **Validar**
   ```bash
   npm test            # 100% tests pasando
   npm run lint        # Zero errores
   npm run build       # Build exitoso
   ```

5. **Commit** (Conventional Commits - cuando Husky esté configurado)
   ```bash
   git commit -m "feat: agregar endpoint de entity"
   # Formato: <type>: <description>
   # Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore
   ```

6. **Push & Pull Request**
   ```bash
   git push origin feature/nombre-feature
   # Crear PR en GitHub
   ```

### Code Style

- **TypeScript strict mode**: Zero `any` types
- **Path aliases**: Usar `@/` para imports
- **Error messages**: Usar `ErrorMessages` constants
- **UUID validation**: Usar `validateUUID` middleware
- **Pagination**: Usar `pagination.ts` utilities
- **Response format**: Seguir convenciones (GET → object/array, POST/PUT → array)

### Mandatory Rules

**CRITICAL:** Si cambias una entidad, alinear TODO:
1. Database schema (migration)
2. DTO interfaces
3. Zod schemas
4. Repository (table, columns)
5. Service (business logic)
6. Controller (validation, mapping)
7. Tests (create if missing, update existing)
8. Dashboard/UI (if applicable)

**Testing Rule:** Si un componente no tiene tests, CREARLOS primero antes de continuar.

### Git Hooks (Configuración pendiente Sprint 6+)

```bash
# Cuando Husky esté configurado:

# Pre-commit
- ESLint autofix
- Prettier format
- Run affected tests

# Commit-msg
- Validate Conventional Commits format

# Pre-push
- Run full test suite
```

---

## 🗺️ Roadmap

Ver **[docs/ROADMAP.md](docs/ROADMAP.md)** para plan completo de Sprints 6-10+

### Próximos Sprints

**Sprint 6: Aplicación de Utilidades** (Semana 13)
- Refactorizar 10-15 endpoints con utilidades centralizadas
- Middleware asyncHandler para eliminar try/catch
- Documentar patrones

**Sprint 7: Inventario Avanzado** (Semana 14)
- Tabla stock_movements (trazabilidad completa)
- Reglas de reposición automáticas
- Alertas de stock bajo

**Sprint 8: Testing E2E** (Semana 15)
- Tests de integración con base de datos de test
- Playwright para tests E2E de dashboard
- CI/CD pipeline

**Sprint 9: Optimizaciones** (Semana 16)
- Redis caching (precios, service points, inventario)
- Rate limiting (100 req/min por IP)
- Benchmarks de performance

**Sprint 10: Dashboard Improvements** (Semana 17)
- Dashboard de inventario real-time
- Reporting y analytics
- Exportación CSV/PDF

### Largo Plazo (Sprints 11+)

- **Sprint 11**: Autenticación y permisos granulares
- **Sprint 12**: Sistema de notificaciones (push, email, webhooks)
- **Sprint 13-15**: Mobile App React Native
- **Sprint 16-17**: Integraciones externas (ERP, APIs)
- **Sprint 18+**: Machine Learning (predicción de demanda)

---

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License**.

```
MIT License

Copyright (c) 2025 Camino Service Backend

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Contacto y Soporte

**Documentación:**
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Clean Architecture completa
- [ROADMAP.md](docs/ROADMAP.md) - Próximos sprints y pendientes
- [API Docs](http://localhost:3000/api-docs) - Swagger UI interactivo

**Reportar Issues:**
- GitHub Issues: [github.com/tu-usuario/camino-backend/issues](https://github.com/tu-usuario/camino-backend/issues)
- Email: soporte@camino.app

**Maintainers:**
- Equipo Camino

---

<p align="center">
  Hecho con ❤️ para los peregrinos del Camino de Santiago
</p>

<p align="center">
  <a href="docs/ARCHITECTURE.md">Architecture</a> •
  <a href="docs/ROADMAP.md">Roadmap</a> •
  <a href="http://localhost:3000/api-docs">API Docs</a>
</p>
