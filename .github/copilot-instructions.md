# Copilot Instructions for Camino Service Backend

## Project Overview

**Next.js 14 + TypeScript + Supabase** backend for Camino de Santiago service marketplace. **44% test coverage** (2409/2410 passing), strict Clean Architecture enforcement.

**Core Domain:** Caminos → Ubicaciones → Service Points → Vending Machines → Productos/Bookings/Ventas

### 🎯 Two Separate Sub-Projects

**CRITICAL ARCHITECTURAL PRINCIPLE:** This is **NOT a monolithic project**. It consists of two independent sub-projects with distinct responsibilities:

#### 1. **API REST** (`pages/api/` + `src/`)

- **Purpose:** Serve data to mobile app (future)
- **Consumers:** Mobile app, third-party integrations
- **Priority:** **HIGH** - All API features come FIRST
- **Scope:**
  - Public endpoints for app consumption
  - Authentication & authorization
  - Business logic (services, repositories)
  - Data validation and transformation
  - Payments, bookings, inventory management

#### 2. **Dashboard/Admin** (`pages/dashboard/`)

- **Purpose:** Configure and manage data served by the API
- **Consumers:** Internal admin users (service point managers, admins)
- **Priority:** **LOW** - Only after API features are complete
- **Scope:**
  - Admin UI for managing caminos, ubicaciones, service points
  - Inventory management interface
  - Pricing and configuration tools
  - Reports and analytics

**DO NOT MIX RESPONSIBILITIES:**

- ❌ API endpoints should NOT contain admin-only logic
- ❌ Dashboard should NOT duplicate API business logic
- ✅ Dashboard **consumes** the API (calls API endpoints)
- ✅ API is **independent** of dashboard (can work without it)

**Development Order:**

1. **Phase 1:** API features (current focus)
2. **Phase 2:** Dashboard UI (after API is feature-complete)

## CRITICAL: Task Completion at 100%

**NON-NEGOTIABLE RULE:** When assigned a task (e.g., "refactor tests"), complete it at **100%**, NOT 3-4 files out of 20.

**Mandatory workflow:**

1. Identify ALL affected files/components
2. Complete ALL before marking task as done
3. Document in CHANGELOG.md (`npm run release`)
4. Update `docs/ROADMAP.md` (move completed task, add new discovered tasks)
5. If new issues discovered → Add to ROADMAP backlog

**Example:**

- ❌ **WRONG:** "Refactor tests" → Only 4/20 files updated
- ✅ **CORRECT:** "Refactor tests" → 20/20 files updated + documented

## Documentation After Each Work Block

**After completing ANY work block:**

1. `npm run release` → Auto-generates CHANGELOG.md
2. Update `docs/ROADMAP.md`:
   - Move task from BACKLOG to COMPLETED
   - Add new tasks discovered during work
   - Update priorities if needed

**Documentation structure:**

- 📋 **Work tracking:** `docs/ROADMAP.md` (single source of truth)
- 🏗️ **Architecture:** `docs/CLEAN_ARCHITECTURE.md`, `docs/ARCHITECTURE.md`
- � **Business model:** `docs/notas.md`
- 📦 **History:** Git commits + `CHANGELOG.md`

## ZERO TOLERANCE: Quality Gates

**Before marking ANY task complete:**

```bash
npm test          # ALL tests MUST pass (currently 2409/2410)
npm run lint      # ZERO errors allowed
npm run build     # Must succeed
```

**Task NOT complete until:**

- ✅ All affected files updated (100%, not partial)
- ✅ CHANGELOG.md generated (`npm run release`)
- ✅ ROADMAP.md updated (task moved + new tasks added)
- ✅ All tests passing

**If ANY test fails or component lacks tests → CREATE TESTS FIRST, then continue.**

## Architecture: 5-Layer Clean Architecture

**Strict separation of concerns** (see `docs/CLEAN_ARCHITECTURE.md`):

```
pages/api/                    ← Layer 5: Swagger docs + delegate to controller
src/api/controllers/          ← Layer 4: HTTP + Zod validation + error handling
src/api/services/             ← Layer 3: Business logic ONLY
src/api/repositories/         ← Layer 2: Supabase queries ONLY
src/api/dto/                  ← Layer 1: TypeScript interfaces
src/shared/                   ← Shared utilities, constants, types (used by all layers)
```

### Mandatory Base Classes

**ALL repositories extend `BaseRepository<T>`:**

- Provides `findAll()`, `findById()`, `create()`, `update()`, `delete()`, `count()`
- Constructor: `constructor(db?: SupabaseClient)` (dependency injection for testing)
- Custom queries added as methods

**ALL services extend `BaseService<T>`:**

- Inherits CRUD operations with pagination, filtering, sorting
- Custom business logic added as methods
- Never touches Supabase directly (use repository)

### Response Format Conventions

```typescript
// GET single/collection
{ data: T | T[], pagination?: PaginationMeta }

// POST/PUT (always array with single item)
{ data: [T] }

// DELETE
{ message: "..." }
```

**All errors in Spanish.**

## Development Workflow

### Essential Commands

```bash
npm run dev          # Development server
npm test             # Run all tests
npm run test:watch   # Watch mode testing
npm run test:coverage # Coverage report
```

### Database Connection

Supabase client configured in `src/api/lib/supabase.ts` with fallback env vars:

- `SUPABASE_SERVICE_ROLE_KEY` (preferred)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (fallback)

**Direct PostgreSQL Connection** (interactive by default):

```bash
# Use with pipe to avoid interactive mode
psql "postgresql://postgres.vjmwoqwqwblllrdbnkod:D3s4rr0ll0.@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require" < query.sql
# or
echo "SELECT * FROM usuarios LIMIT 5;" | psql "postgresql://postgres.vjmwoqwqwblllrdbnkod:D3s4rr0ll0.@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require"
```

**Database Migrations & Backups**:

```bash
# ALWAYS create backup before migrations
mkdir -p backups
echo "-- Backup $(date)" > backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Migration naming convention: YYYYMMDD_HHMMSS_description.sql
# Example: 20251010_120000_enable_extensions.sql

# Apply migrations (manually via psql)
psql "postgresql://..." < supabase/migrations/migration_file.sql
```

## Testing: 44% Coverage Standard

### Current Metrics

- **2409/2410 tests passing (99.96%)**
- **Coverage: 44% actual** (configured in jest.config.js)
- **Target: 50%+ incremental** (grow organically, don't force prematurely)

### Test Structure (Mirror Source)

```
__tests__/
  schemas/entity.schema.test.ts      # Zod validation tests
  repositories/entity.repository.test.ts  # Data access tests
  services/entity.service.test.ts    # Business logic tests
  controllers/entity.controller.test.ts   # HTTP handler tests
  api/entity.test.ts                 # Integration tests
```

### Repository Test Pattern (Dependency Injection)

```typescript
import { SupabaseClient } from "@supabase/supabase-js";
import { EntityRepository } from "@/repositories/entity.repository";

describe("EntityRepository", () => {
  let repository: EntityRepository;
  let mockSupabase: jest.Mocked<SupabaseClient>;

  beforeEach(() => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    } as any;

    repository = new EntityRepository(mockSupabase);
  });

  it("should find by id", async () => {
    mockSupabase.single.mockResolvedValue({
      data: { id: "123", nombre: "Test" },
      error: null,
    });

    const result = await repository.findById("123");
    expect(result.data?.nombre).toBe("Test");
  });
});
```

### Controller Test Pattern (node-mocks-http)

```typescript
import { createMocks } from "node-mocks-http";
import { EntityController } from "@/controllers/entity.controller";

describe("EntityController", () => {
  let controller: EntityController;
  let mockService: jest.Mocked<EntityService>;

  beforeEach(() => {
    mockService = {
      findById: jest.fn(),
      create: jest.fn(),
    } as any;
    controller = new EntityController(mockService);
  });

  it("GET should return 200 with data", async () => {
    const { req, res } = createMocks({
      method: "GET",
      query: { id: "123" },
    });

    mockService.findById.mockResolvedValue({ id: "123", nombre: "Test" });

    await controller.handle(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      data: { id: "123", nombre: "Test" },
    });
  });
});
```

### Run Tests

```bash
npm test              # All 2409 tests (target: 100% passing)
npm run test:watch    # Watch mode (development)
npm run test:coverage # Coverage report (current: 44%)

# Specific test
npm test -- entity.controller.test

# If ANY test fails → FIX BEFORE CONTINUING
```

### MANDATORY: Test Data with Factories

**ZERO TOLERANCE for hardcoded test data** - ALL tests MUST use factories from `__tests__/helpers/factories.ts`:

```typescript
// ✅ CORRECTO - Usar factories
import { UserFactory, generateUUID } from "../helpers/factories";

const testUser = UserFactory.create();
const testUser2 = UserFactory.create({ role: "admin" }); // Con overrides
const userId = generateUUID();

// ❌ INCORRECTO - Datos hardcoded
const testUser = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  email: "test@example.com",
  full_name: "Test User",
};
```

**Available Factories** (`__tests__/helpers/factories.ts`):

- `UserFactory.create(overrides?)` - Generates realistic user data with @ngneat/falso
- `BookingFactory.create(overrides?)` - Booking test data
- `ProductoFactory.create(overrides?)` - Product test data
- `PaymentFactory.create(overrides?)` - Payment test data
- `generateUUID()` - Unique UUID v4
- `generateISODate()` - ISO 8601 timestamp
- `generateSKU()` - Product SKU

**Benefits of Factory Pattern:**

- ✅ **Unique data per test run** - Prevents test pollution
- ✅ **Realistic data** - Uses @ngneat/falso for names, emails, addresses
- ✅ **DRY principle** - Change factory once, affects all tests
- ✅ **Type safety** - Factory returns proper TypeScript types
- ✅ **Maintainable** - Centralized test data generation
- ✅ **Overrides** - Customize specific fields when needed

**Enforcement Rule:**

- **If you write hardcoded test data (UUIDs, emails, names, etc.) → IMMEDIATE REFACTORING REQUIRED**
- **All new tests MUST use factories from day 1**
- **When reviewing existing tests → Flag and refactor any hardcoded data**

## Creating New Endpoints: 5-Step Pattern

**Follow this EXACT sequence** for all new endpoints:

1. **DTO** (`src/api/dto/entity.dto.ts`):

   ```typescript
   export interface Entity {
     id: string;
     nombre: string;
     created_at?: string;
   }
   export interface CreateEntityDto {
     /* without id */
   }
   export interface UpdateEntityDto {
     id: string /* optional fields */;
   }
   export interface EntityFilters {
     /* query params */
   }
   ```

2. **Schema** (`src/api/schemas/entity.schema.ts`):

   ```typescript
   import { z } from "zod";

   export const createEntitySchema = z.object({
     nombre: z.string().min(2).max(150),
   });

   export const updateEntitySchema = z.object({
     id: z.string().uuid(),
     nombre: z.string().min(2).max(150).optional(),
   });

   export const queryEntitySchema = z.object({
     page: z.coerce.number().int().min(1).default(1),
     limit: z.coerce.number().int().min(1).max(100).default(10),
   });

   export type CreateEntityInput = z.infer<typeof createEntitySchema>;
   ```

3. **Repository** (`src/api/repositories/entity.repository.ts`):

   ```typescript
   import { BaseRepository } from "./base.repository";
   import { supabase } from "@/api/lib/supabase";
   import type { Entity } from "@/api/dto/entity.dto";

   export class EntityRepository extends BaseRepository<Entity> {
     constructor(db?: SupabaseClient) {
       super(db || supabase, "tabla_nombre");
     }
     // Add custom queries here
   }
   ```

4. **Service** (`src/api/services/entity.service.ts`):

   ```typescript
   import { BaseService } from "./base.service";
   import { EntityRepository } from "@/api/repositories/entity.repository";

   export class EntityService extends BaseService<Entity> {
     constructor(repo?: EntityRepository) {
       super(repo || new EntityRepository());
     }
     // Add business logic here
   }
   ```

5. **Controller** (`src/api/controllers/entity.controller.ts`):

   ```typescript
   import { asyncHandler } from "@/api/middlewares/async-handler";
   import { validateUUID } from "@/api/middlewares/validate-uuid";
   import { ErrorMessages } from "@/shared/constants/error-messages";
   import { AppError } from "@/api/errors/AppError";
   import { logger } from "@/api/lib/logger";
   import { createEntitySchema, updateEntitySchema, queryEntitySchema } from "@/api/schemas/entity.schema";

   export class EntityController {
     constructor(private service = new EntityService()) {}

     handle = asyncHandler(async (req, res) => {
       switch (req.method) {
         case "GET":
           return this.handleGet(req, res);
         case "POST":
           return this.handlePost(req, res);
         case "PUT":
           return this.handlePut(req, res);
         case "DELETE":
           return this.handleDelete(req, res);
         default:
           throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);
       }
     });

     private handleGet = asyncHandler(async (req, res) => {
       const { id } = req.query;

       if (id) {
         const error = validateUUID(id, "entity");
         if (error) throw new AppError(error, 400);

         const entity = await this.service.findById(id as string);
         if (!entity) throw new AppError(ErrorMessages.NOT_FOUND("Entity"), 404);

         return res.status(200).json({ data: entity });
       }

       const query = queryEntitySchema.parse(req.query);
       const result = await this.service.findAll(query);
       return res.status(200).json(result);
     });

     private handlePost = asyncHandler(async (req, res) => {
       const data = createEntitySchema.parse(req.body);
       const entity = await this.service.create(data);

       logger.info("Entity created", { entityId: entity.id });
       return res.status(201).json({ data: [entity] });
     });
   }
   ```

6. **Endpoint** (`pages/api/entity.ts`):

   ```typescript
   import { EntityController } from "@/api/controllers/entity.controller";

   /**
    * @swagger
    * /api/entity:
    *   get:
    *     summary: Obtener entidades
    *     tags: [Entity]
    *     parameters:
    *       - in: query
    *         name: id
    *         schema:
    *           type: string
    *           format: uuid
    *       - in: query
    *         name: page
    *         schema:
    *           type: integer
    *           default: 1
    *       - in: query
    *         name: limit
    *         schema:
    *           type: integer
    *           default: 10
    *     responses:
    *       200:
    *         description: Lista de entidades
    *   post:
    *     summary: Crear entidad
    *     tags: [Entity]
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             type: object
    *             required:
    *               - nombre
    *             properties:
    *               nombre:
    *                 type: string
    *     responses:
    *       201:
    *         description: Entidad creada
    */
   const controller = new EntityController();
   export default controller.handle;
   ```

## Validation & Error Handling

### Zod Schemas (MANDATORY)

**Centralize ALL validation** in `src/api/schemas/entity.schema.ts`:

```typescript
import { z } from "zod";

export const createEntitySchema = z.object({
  nombre: z.string().min(2).max(150),
  email: z.string().email(),
});

export const updateEntitySchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(2).max(150).optional(),
});

export const queryEntitySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Type inference
export type CreateEntityInput = z.infer<typeof createEntitySchema>;
```

### UUID Validation (Centralized)

**NEVER write manual UUID validation.** Use:

```typescript
import { validateUUID, validateUUIDs } from "@/api/middlewares/validate-uuid";

// Single UUID
const error = validateUUID(id, "producto");
if (error) throw new AppError(error, 400);

// Multiple UUIDs
const error = validateUUIDs(
  { id, slotId },
  {
    customNames: { slotId: "slot" },
  },
);
if (error) throw new AppError(error, 400);
```

### Error Messages (Centralized)

**NEVER hardcode error strings.** Use:

```typescript
import { ErrorMessages } from "@/shared/constants/error-messages";
import { AppError } from "@/api/errors/AppError";

throw new AppError(ErrorMessages.REQUIRED_ID("producto"), 400);
throw new AppError(ErrorMessages.PRODUCTO_NOT_FOUND, 404);
throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);
```

### Ownership Validation

**For nested resources** (slots in machines, ubicaciones in caminos):

```typescript
import { validateSlotOwnership, validateOwnership } from "@/shared/utils/validate-ownership";
import { AppError } from "@/api/errors/AppError";

const slot = await service.findById(slotId);
const ownershipError = validateSlotOwnership(slot, machineId);
if (ownershipError) {
  throw new AppError(ownershipError.message, ownershipError.status);
}
```

## Key Integrations

**Supabase**: Database client configured in `src/api/lib/supabase.ts` with automatic error handling through BaseRepository
**Stripe**: Payment processing client in `src/api/lib/stripe.ts` (config in `scripts/verify-stripe-config.js`)
**Winston**: Structured logging via `src/api/lib/logger.ts` - logs to `logs/` directory with daily rotation

## Project-Specific Conventions

- **All text responses in Spanish** (error messages, API responses)
- **TypeScript strict mode** - no `any` types allowed
- **Path aliases**: Use `@/` for `src/` imports (configured in `tsconfig.json`)
- **Pagination**: Standard format with `page`, `limit`, `total`, `totalPages`
- **Sorting**: Default by `created_at DESC`, customizable via `SortParams`

## Project Structure (ACTUAL)

**Critical: File locations have specific organization:**

```
src/
├── api/                         ← API-specific code (HIGH priority)
│   ├── controllers/             ← HTTP request handlers
│   ├── services/                ← Business logic layer
│   ├── repositories/            ← Data access layer
│   │   └── base.repository.ts   ← Generic CRUD operations
│   ├── dto/                     ← Data Transfer Objects (interfaces)
│   ├── schemas/                 ← Zod validation schemas
│   ├── middlewares/             ← Request processing (asyncHandler, validate-uuid)
│   ├── errors/                  ← Custom error classes (AppError)
│   └── lib/                     ← Third-party clients (supabase, stripe, logger)
│
├── shared/                      ← Shared utilities across API & Dashboard
│   ├── constants/               ← Centralized constants (error-messages)
│   ├── utils/                   ← Helper functions (validate-ownership, pagination)
│   └── types/                   ← Shared TypeScript types (common.types)
│
└── dashboard/                   ← Dashboard UI code (LOW priority - Phase 2)
```

**Import Path Examples:**

```typescript
// API layer imports
import { UserController } from "@/api/controllers/user.controller";
import { UserService } from "@/api/services/user.service";
import { UserRepository } from "@/api/repositories/user.repository";
import { asyncHandler } from "@/api/middlewares/async-handler";

// Shared utilities imports
import { ErrorMessages } from "@/shared/constants/error-messages";
import { validateOwnership } from "@/shared/utils/validate-ownership";
import { PaginationParams } from "@/shared/types/common.types";
```

## File Structure Patterns

- Controllers handle exactly one HTTP method per private method
- Services contain only business logic, never direct database calls
- Repositories contain only data access, never business logic
- DTOs are pure interfaces with no implementation
- All custom errors extend base classes in `src/errors/`

## Testing Guidelines

- Mock external dependencies (Supabase, Stripe)
- Use `node-mocks-http` for HTTP request/response testing
- Test each layer independently
- Coverage required for all business logic in services

## Critical Alignment Rule

**WHENEVER ANY CHANGE IS MADE, EVERYTHING MUST BE ALIGNED:**

When modifying any entity or field, you MUST update ALL of these in sequence:

1. **Database schema** (migration files)
2. **DTO interfaces** (`src/dto/*.dto.ts`)
3. **Zod schemas** (`src/schemas/*.schema.ts`)
4. **Repository** (table name, column names)
5. **Service** (business logic updates)
6. **Controller** (validation, field mapping)
7. **Tests** (create if missing, update existing)
8. **Dashboard/UI** (if applicable)

**MANDATORY TESTING RULE**: If ANY component doesn't have tests, CREATE THEM FIRST before continuing work. No exceptions.

- Schema missing tests? Create `__tests__/schemas/entity.schema.test.ts`
- Repository missing tests? Create `__tests__/repositories/entity.repository.test.ts`
- Service missing tests? Create `__tests__/services/entity.service.test.ts`
- Controller missing tests? Create `__tests__/controllers/entity.controller.test.ts`
- API integration missing tests? Create `__tests__/api/entity.test.ts`

**NO INCONSISTENCIES ALLOWED** - if you change something, change everything. This prevents:

- Runtime errors from mismatched field names
- Validation failures from outdated schemas
- Test failures from stale expectations
- UI bugs from missing data

**Example alignment sequence:**

```bash
# If changing "email" field to "correo_electronico":
1. Migration: ALTER TABLE usuarios RENAME COLUMN email TO correo_electronico
2. DTO: Update User interface field name
3. Schema: Update Zod schema field name
4. Repository: Update query field references
5. Service: Update business logic references
6. Controller: Update request/response mapping
7. Tests: Update all test data and assertions
```

## ARCHITECTURAL CONSISTENCY RULES

### Repository Architecture Standard

**ALL repositories MUST extend BaseRepository`<T>`** - this is non-negotiable for architectural consistency:

- Provides standardized CRUD operations
- Ensures consistent error handling
- Maintains uniform interface across all data access
- Enables dependency injection for testing (constructor accepts optional SupabaseClient)
- If a repository doesn't extend BaseRepository, it MUST be refactored immediately

### Controller Architecture Standard

**ALL controllers MUST follow identical patterns:**

- Import centralized Zod schemas from `src/schemas/`
- Use identical HTTP method structure (GET, POST, PUT, DELETE)
- Return standardized response formats:
  - GET: `{ data: T | T[], pagination?: PaginationMeta }`
  - POST/PUT: `{ data: T[] }` (always array with single item)
  - DELETE: `{ message: string }`
- Identical error handling with Spanish messages
- Identical validation pattern using Zod schemas

### DTO Architecture Standard

**ALL DTOs MUST follow identical structure:**

- Base interface (e.g., `User`, `Booking`)
- `CreateXDto` interface (without id, optional timestamps)
- `UpdateXDto` interface (with required id, optional fields)
- `XFilters` interface for query parameters
- Consistent field naming (snake_case matching database)
- Optional timestamps (`created_at?`, `updated_at?`)

### Schema Architecture Standard

**ALL Zod schemas MUST follow identical patterns:**

- UUID validation using `z.string().uuid()`
- Date validation using `z.string().datetime()` for ISO 8601
- Enum validation using centralized constants
- Four standard schemas: `createXSchema`, `updateXSchema`, `deleteXSchema`, `queryXSchema`
- Custom validations with Spanish error messages
- Type inference exports: `CreateXInput`, `UpdateXInput`, etc.

### Test Architecture Standard

**ALL tests MUST follow identical structure:**

- Repository tests: Mock SupabaseClient with dependency injection pattern
- Service tests: Mock repository dependencies
- Controller tests: Mock HTTP request/response using `node-mocks-http`
- Schema tests: Validate all success/failure cases
- Test file naming: `*.test.ts` in `__tests__/` directory
- Mock patterns: Use `/* eslint-disable @typescript-eslint/no-explicit-any */` for mock typing

## COMPLETION REQUIREMENTS

### Pre-Task Completion Checklist

**BEFORE marking any task as complete, MANDATORY verification:**

1. **Full Test Suite Pass**: Run `npm test` - ALL tests must pass
2. **No Lint Errors**: Run `npm run lint` - zero warnings/errors allowed
3. **Architecture Compliance**: Verify ALL components follow standard patterns
4. **Complete Alignment**: Database ↔ DTO ↔ Schema ↔ Repository ↔ Controller ↔ Tests
5. **Mock Strategy Documented**: All test mocks must use dependency injection pattern

**If ANY test fails or lint error exists, task is NOT complete** - fix all issues before proceeding.

### Test Coverage and Failure Policy

**MANDATORY RULE**: Si hay un test fallando del ámbito que sea, se arregla antes de dar por finalizada cualquier tarea y si se detecta que falta un test, se añade.

**Test Requirements**:

- ALL existing tests MUST pass before completing any task
- If a test fails during development, it MUST be fixed immediately
- If a component lacks tests, tests MUST be created before completing the task
- No exceptions - test failures block task completion
- Run full test suite (`npm test`) before marking any task as complete

### Test Strategy Documentation

**Standard Mock Pattern for Repository Tests:**

```typescript
// Mock Supabase client with dependency injection
const mockSupabase = {
  from: jest.fn(),
  select: jest.fn(),
  eq: jest.fn(),
  single: jest.fn(),
  insert: jest.fn(),
  // ... other methods
} as any as SupabaseClient;

// Configure chain behavior in beforeEach
(mockSupabase.from as jest.Mock).mockReturnValue(mockSupabase);
// ... other configurations

// Repository with dependency injection
repository = new Repository(mockSupabase);
```

## Common Pitfalls

- **Never** put business logic in controllers or repositories
- **Always** validate UUIDs before database queries
- **Always** extend BaseRepository/BaseService instead of implementing from scratch
- **Never** use direct Supabase client in controllers - go through services
- **Remember** response format conventions (arrays for POST/PUT)
- **CRITICAL**: Never make partial updates - align ALL layers when changing anything
- **MANDATORY**: All repositories MUST extend BaseRepository for architectural consistency
- **MANDATORY TESTING**: Si hay un test fallando del ámbito que sea, se arregla antes de dar por finalizada cualquier tarea y si se detecta que falta un test, se añade

## MANDATORY: Centralized Utilities Usage

### Error Messages (`src/shared/constants/error-messages.ts`)

**ALL error messages MUST use centralized constants:**

```typescript
import { ErrorMessages } from "@/shared/constants/error-messages";
import { AppError } from "@/api/errors/AppError";

// ✅ CORRECTO - Usar constantes centralizadas con AppError
throw new AppError(ErrorMessages.REQUIRED_ID("producto"), 400);
throw new AppError(ErrorMessages.PRODUCTO_NOT_FOUND, 404);
throw new AppError(ErrorMessages.METHOD_NOT_ALLOWED, 405);

// ❌ INCORRECTO - Mensajes hardcoded
throw new Error("ID de producto es requerido");
return res.status(404).json({ error: "Producto no encontrado" });
```

**Benefits**: Consistency, i18n readiness, zero duplication, easy refactoring

### UUID Validation (`src/api/middlewares/validate-uuid.ts`)

**ALL UUID validation MUST use centralized middleware:**

```typescript
import { validateUUID, validateUUIDs } from "@/api/middlewares/validate-uuid";
import { AppError } from "@/api/errors/AppError";

// ✅ CORRECTO - Validar un solo UUID
const error = validateUUID(id, "producto");
if (error) throw new AppError(error, 400);

// ✅ CORRECTO - Validar múltiples UUIDs
const error = validateUUIDs({ id, slotId }, { customNames: { id: "vending machine", slotId: "slot" } });
if (error) throw new AppError(error, 400);

// ❌ INCORRECTO - Validación manual repetida
if (!id || typeof id !== "string") {
  throw new Error("ID es requerido");
}
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(id)) {
  throw new Error("UUID inválido");
}
```

**Benefits**: Zero boilerplate, consistent validation, descriptive error messages

### Ownership Validation (`src/shared/utils/validate-ownership.ts`)

**ALL nested resource validation MUST use ownership helpers:**

```typescript
import { validateSlotOwnership, validateOwnership } from "@/shared/utils/validate-ownership";
import { AppError } from "@/api/errors/AppError";

// ✅ CORRECTO - Validar ownership de slot
const slot = await service.findById(slotId);
const ownershipError = validateSlotOwnership(slot, machineId);
if (ownershipError) {
  throw new AppError(ownershipError.message, ownershipError.status);
}

// ✅ CORRECTO - Validar ownership genérico
const ownershipError = validateOwnership(ubicacion, "Ubicación", ubicacion?.camino_id, caminoId, "camino");
if (ownershipError) {
  throw new AppError(ownershipError.message, ownershipError.status);
}

// ❌ INCORRECTO - Validación manual duplicada
if (!slot) {
  throw new AppError("Slot no encontrado", 404);
}
if (slot.machine_id !== machineId) {
  throw new AppError("Slot no encontrado en esta vending machine", 404);
}
```

**Benefits**: Consistent ownership checks, proper 404 handling, zero duplication

### Enforcement Rule

**BEFORE creating ANY new endpoint:**

1. Check if error messages exist in `ErrorMessages` - use them
2. Check if UUID validation is needed - use `validateUUID/validateUUIDs`
3. Check if ownership validation is needed - use ownership helpers
4. **ALWAYS use AppError for throwing errors** (enables proper asyncHandler catching)
5. **NEVER duplicate logic that exists in these utilities**
6. **If you find yourself writing validation/error code, STOP and use centralized utilities**

## ADDITIONAL ARCHITECTURAL RULES

### Swagger Documentation Standard

**ALL API endpoints MUST have complete Swagger documentation:**

- Every endpoint in `pages/api/` must include JSDoc comments with Swagger annotations
- Complete OpenAPI 3.0 specification with request/response schemas
- Parameter definitions with validation rules and examples
- Error response documentation with status codes and messages
- Authentication requirements clearly documented
- **If ANY endpoint lacks Swagger docs, generate them immediately** using established patterns

### Zod Validation Standard

**ALL input validation MUST use Zod schemas exclusively:**

- No manual validation in controllers - centralize in `src/schemas/`
- All API inputs validated through Zod schema parsing
- Type inference required: `CreateXInput`, `UpdateXInput`, etc.
- Custom validation messages in Spanish
- Schema reuse across controllers and tests
- **Zod is the ONLY validation library allowed** - refactor any manual validation

### Incremental Protection Standard

**COMPLETED schemas are LOCKED against regression:**

- **User Schema: LOCKED** ✅ - All tests must continue passing
- **Booking Schema: LOCKED** ✅ - All tests must continue passing
- Any change to locked schemas requires explicit approval
- New schemas follow locked schema patterns exactly
- **Zero tolerance for breaking locked components** during new development
- Run full test suite before any commit affecting locked schemas

### Quality Gate Standard

**MANDATORY pre-commit validation sequence:**

1. `npm test` - ALL tests must pass (no exceptions)
2. `npm run lint` - Zero warnings/errors allowed
3. Verify ALL locked schemas still pass individual tests
4. Check architectural compliance for ANY modified component
5. **If ANY check fails, work is NOT complete** - fix all issues before proceeding

These rules are **NON-NEGOTIABLE** and ensure system stability while enabling controlled growth.
