# Copilot Instructions for Camino Service Backend

## Project Overview

This is a **Next.js** service backend implementing **Clean Architecture** with TypeScript, Supabase, and Stripe integration. The system manages a service marketplace with users, workshops, inventory, bookings## MANDATORY: Documentation Process After Each Sprint

**CRITICAL RULE:** Al finalizar CUALQUIER sprint o bloque de trabajo, EJECUTAR proceso completo:

### Mandatory Steps (NO OPTIONAL)

1. **Generate CHANGELOG**
   ```bash
   npm run release  # Semantic version bump + CHANGELOG.md
   ```

2. **Create Sprint Report**
   - Copy `docs/templates/SPRINT_REPORT_TEMPLATE.md` to `docs/sprints/SPRINT_X.X_COMPLETADO.md`
   - Complete ALL sections (no skipping):
     - Resumen ejecutivo
     - Tasks por día
     - Problemas y soluciones
     - Métricas finales
     - Lecciones aprendidas
     - Issues conocidos
     - Impacto en backlog

3. **Update COMPLETED_SPRINTS.md**
   - Add new sprint entry at TOP
   - Include: date, duration, metrics, deliverables
   - Update "Resumen General" table

4. **Update BACKLOG.md**
   - Mark completed tasks as ✅
   - Move completed tasks to appropriate section
   - Add new tasks discovered during sprint
   - Update priorities if changed
   - Move pending tasks to future sprints

5. **Update ROADMAP.md**
   - Mark sprint as ✅ COMPLETADO
   - Update "Próximos Sprints" section
   - Adjust estimations if necessary

### Enforcement Rule

**If ANY of these 5 steps is skipped, the sprint is NOT complete.**

No exceptions. This ensures:
- Complete historical record
- CHANGELOG always up to date
- Backlog reflects reality
- Roadmap is accurate
- Future developers understand decisions

### Frequency

- **Sprint completo (3-5 días):** FULL process MANDATORY
- **Bloque de trabajo (1 día):** Minimum BACKLOG.md update
- **Bug fix crítico:** CHANGELOG + BACKLOG.md

### Checklist Before Completing Sprint

```markdown
- [ ] npm run release executed → CHANGELOG.md generated
- [ ] Sprint report created in docs/sprints/
- [ ] COMPLETED_SPRINTS.md updated
- [ ] BACKLOG.md updated (all tasks moved)
- [ ] ROADMAP.md updated (sprint marked complete)
- [ ] Tests: 100% passing
- [ ] Lint: 0 errors
- [ ] Git commit: "chore(release): vX.X.X"
- [ ] Git tag: vX.X.X pushed
```

## MANDATORY TESTING: Si hay un test fallando del ámbito que sea, se arregla antes de dar por finalizada cualquier tarea y si se detecta que falta un test, se añade and payments.

## Architecture: 5-Layer Clean Architecture

The codebase follows a strict 5-layer architecture pattern (see `docs/CLEAN_ARCHITECTURE.md` for full details):

```
pages/api/          ← Layer 5: Endpoints (Swagger docs + delegation)
src/controllers/    ← Layer 4: HTTP handling + Zod validation
src/services/       ← Layer 3: Business logic
src/repositories/   ← Layer 2: Data access (Supabase queries)
src/dto/           ← Layer 1: Type definitions
```

### Critical Patterns

**BaseRepository & BaseService**: All repositories extend `BaseRepository<T>` and services extend `BaseService<T>` providing CRUD operations with TypeScript generics.

**Response Conventions**:

- GET: Returns object or array
- POST/PUT: Returns array with single item `[item]`
- DELETE: Returns message object `{ message: "..." }`

**Error Handling**: All errors returned in Spanish with consistent format.

## Development Workflow

### Essential Commands

```bash
npm run dev          # Development server
npm test             # Run all tests
npm run test:watch   # Watch mode testing
npm run test:coverage # Coverage report
```

### Database Connection

Supabase client configured in `src/services/supabase.ts` with fallback env vars:

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

### Testing

- Jest with Next.js integration
- Test files in `__tests__/` directory
- Coverage thresholds: 50% statements, 40% branches
- UUID mocking in `__mocks__/uuid.js`

## Creating New Endpoints

Follow this exact pattern for all new endpoints:

1. **DTO** (`src/dto/entity.dto.ts`): Define interfaces
2. **Repository** (`src/repositories/entity.repository.ts`): Extend BaseRepository, add custom queries
3. **Service** (`src/services/entity.service.ts`): Extend BaseService, implement business rules
4. **Controller** (`src/controllers/entity.controller.ts`): Handle HTTP, validate with Zod
5. **Endpoint** (`pages/api/entity.ts`): Swagger docs + delegate to controller

### Validation Patterns

**Zod schemas** for all input validation:

```typescript
const EntitySchema = z.object({
  name: z.string().min(2).max(150),
  email: z.string().email(),
  role: z.enum(["admin", "user"]).optional(),
});
```

**UUID validation** with regex:

```typescript
/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
```

## Key Integrations

**Supabase**: Database client with automatic error handling through BaseRepository
**Stripe**: Payment processing (config in `scripts/verify-stripe-config.js`)
**Winston**: Logging to `logs/` directory with daily rotation

## Project-Specific Conventions

- **All text responses in Spanish** (error messages, API responses)
- **TypeScript strict mode** - no `any` types allowed
- **Path aliases**: Use `@/` for `src/` imports (configured in `tsconfig.json`)
- **Pagination**: Standard format with `page`, `limit`, `total`, `totalPages`
- **Sorting**: Default by `created_at DESC`, customizable via `SortParams`

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

- Repository missing tests? Create `__tests__/repositories/entity.repository.test.ts`
- Service missing tests? Create `__tests__/services/entity.service.test.ts`
- Controller missing tests? Create `__tests__/controllers/entity.controller.test.ts`
- Schema missing tests? Create `__tests__/schemas/entity.schema.test.ts`

**NO INCONSISTENCIES ALLOWED** - if you change something, change everything. This prevents:

- Runtime errors from mismatched field names
- Validation failures from outdated schemas
- Test failures from stale expectations
- UI bugs from missing data

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

### Error Messages (`src/constants/error-messages.ts`)

**ALL error messages MUST use centralized constants:**

```typescript
import { ErrorMessages } from "@/constants/error-messages";

// ✅ CORRECTO - Usar constantes centralizadas
return res.status(400).json({ error: ErrorMessages.REQUIRED_ID("producto") });
return res.status(404).json({ error: ErrorMessages.PRODUCTO_NOT_FOUND });
return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });

// ❌ INCORRECTO - Mensajes hardcoded
return res.status(400).json({ error: "ID de producto es requerido" });
return res.status(404).json({ error: "Producto no encontrado" });
```

**Benefits**: Consistency, i18n readiness, zero duplication, easy refactoring

### UUID Validation (`src/middlewares/validate-uuid.ts`)

**ALL UUID validation MUST use centralized middleware:**

```typescript
import { validateUUID, validateUUIDs } from "@/middlewares/validate-uuid";

// ✅ CORRECTO - Validar un solo UUID
const error = validateUUID(id, "producto");
if (error) return res.status(400).json({ error });

// ✅ CORRECTO - Validar múltiples UUIDs
const error = validateUUIDs(
  { id, slotId },
  { customNames: { id: "vending machine", slotId: "slot" } }
);
if (error) return res.status(400).json({ error });

// ❌ INCORRECTO - Validación manual repetida
if (!id || typeof id !== "string") {
  return res.status(400).json({ error: "ID es requerido" });
}
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(id)) {
  return res.status(400).json({ error: "UUID inválido" });
}
```

**Benefits**: Zero boilerplate, consistent validation, descriptive error messages

### Ownership Validation (`src/utils/validate-ownership.ts`)

**ALL nested resource validation MUST use ownership helpers:**

```typescript
import { validateSlotOwnership, validateOwnership } from "@/utils/validate-ownership";

// ✅ CORRECTO - Validar ownership de slot
const slot = await service.findById(slotId);
const ownershipError = validateSlotOwnership(slot, machineId);
if (ownershipError) {
  return res.status(ownershipError.status).json({ error: ownershipError.message });
}

// ✅ CORRECTO - Validar ownership genérico
const ownershipError = validateOwnership(
  ubicacion,
  "Ubicación",
  ubicacion?.camino_id,
  caminoId,
  "camino"
);
if (ownershipError) {
  return res.status(ownershipError.status).json({ error: ownershipError.message });
}

// ❌ INCORRECTO - Validación manual duplicada
if (!slot) {
  return res.status(404).json({ error: "Slot no encontrado" });
}
if (slot.machine_id !== machineId) {
  return res.status(404).json({ error: "Slot no encontrado en esta vending machine" });
}
```

**Benefits**: Consistent ownership checks, proper 404 handling, zero duplication

### Enforcement Rule

**BEFORE creating ANY new endpoint:**

1. Check if error messages exist in `ErrorMessages` - use them
2. Check if UUID validation is needed - use `validateUUID/validateUUIDs`
3. Check if ownership validation is needed - use ownership helpers
4. **NEVER duplicate logic that exists in these utilities**
5. **If you find yourself writing validation/error code, STOP and use centralized utilities**

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
