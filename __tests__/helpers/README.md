# Test Helpers - Guía Completa

Utilities centralizadas para crear mocks consistentes y datos de test reutilizables.

## 📊 Resumen General de Migración

| Capa             | Archivos Totales | Migrados | Pendientes | Progreso | Prioridad     |
| ---------------- | ---------------- | -------- | ---------- | -------- | ------------- |
| **Services**     | 18               | 18 ✅    | 0          | 100% 🎉  | Completado    |
| **Schemas**      | 20               | 18 ✅    | 2          | 90% ✅   | Completado    |
| **Repositories** | 21               | 21 ✅    | 0          | 100% 🎉  | Completado    |
| **Controllers**  | 17               | 17 ✅    | 0          | 100% 🎉  | Completado    |
| **TOTAL**        | **76**           | **74**   | **2**      | **97%**  | **Casi 100%** |

**Tests totales pasando:** 1139/1139 ✅ (todas las capas)

**Factories creadas:** 20 totales (17 originales + 3 nuevas: PartnerFactory, CSPFactory, PrecioFactory)

**Nota:** 2 archivos de schemas no migrados (availability, service_assignment) por no tener factories correspondientes.

---

## Tabla de Contenidos

1. [Resumen de Migración](#-resumen-general-de-migración)
2. [Factories con @ngneat/falso](#factories-con-ngneatfalso)
3. [Supabase Mock Builder](#supabase-mock-builder)
4. [Patrones de Migración](#patrones-de-migración)
5. [Archivos Migrados por Capa](#archivos-migrados-)
6. [Referencias](#referencias)

---

## Factories con @ngneat/falso

### Descripción

Los **factories** son generadores de datos de test que:

- Generan datos válidos y realistas usando `@ngneat/falso`
- Aceptan overrides para casos específicos
- Retornan datos que pasan validaciones Zod
- Eliminan datos hardcoded duplicados en tests

### Factories Disponibles

Cada entidad tiene su factory con métodos estándar:

```typescript
// Factories disponibles
UserFactory;
BookingFactory;
PaymentFactory;
ProductoFactory;
VentaAppFactory;
VendingMachineFactory;
VendingMachineSlotFactory;
CaminoFactory;
WorkshopFactory;
ReviewFactory;
InventoryFactory;
InventoryItemFactory;
FavoriteFactory;
TallerManagerFactory;
ReportFactory;
PartnerFactory; // ✨ Nuevo
```

### Métodos Estándar de Cada Factory

#### 1. `create(overrides)` - Genera entidad completa

```typescript
// Sin overrides - datos random válidos
const user = UserFactory.create();
// => { id: "uuid-random", email: "random@example.com", role: "user", ... }

// Con overrides - personalizar campos específicos
const admin = UserFactory.create({ role: "admin", email: "admin@test.com" });
// => { id: "uuid-random", email: "admin@test.com", role: "admin", ... }
```

#### 2. `createDto(overrides)` - Genera DTO (sin id, sin timestamps)

```typescript
// Para crear nuevas entidades
const createData = UserFactory.createDto();
// => { email: "random@example.com", role: "user", ... }
// NO incluye: id, created_at, updated_at

// Con overrides
const createData = BookingFactory.createDto({
  service_type: "repair",
  notes: "Custom note",
});
```

#### 3. `createMany(count, overrides)` - Genera múltiples entidades

```typescript
// Generar 5 users con datos random
const users = UserFactory.createMany(5);
// => Array de 5 users con datos únicos

// Generar 3 bookings con mismo user_id
const bookings = BookingFactory.createMany(3, { user_id: "user-123" });
// => 3 bookings diferentes, todos con user_id: "user-123"
```

### Helpers de Test Scenarios

#### Fechas Válidas e Inválidas

```typescript
import { generateValidDateRange, generateInvalidDateRange, generateInvalidDateFormat } from "../helpers/factories";

// Par de fechas válidas (start < end)
const validDates = generateValidDateRange();
// => { start_time: "2025-10-16T10:00:00Z", end_time: "2025-10-16T11:00:00Z" }

// Par de fechas INVÁLIDAS (start > end) para tests de error
const invalidDates = generateInvalidDateRange();
// => { start_time: "2025-10-16T11:00:00Z", end_time: "2025-10-16T10:00:00Z" }

// Formato inválido para tests de validación
const badFormat = generateInvalidDateFormat();
// => "invalid-date-format"
```

#### Relaciones Entre Entidades

```typescript
import { generateRelatedItems } from "../helpers/factories";

// Generar 5 slots relacionados a una máquina
const machineId = "vm-123";
const slots = generateRelatedItems(VendingMachineSlotFactory, 5, "machine_id", machineId);
// => 5 slots diferentes, todos con machine_id: "vm-123"
```

### Utilidades Adicionales

```typescript
import { generateUUID, generateISODate, generateSKU, generateCodigoRetiro } from "../helpers/factories";

// UUID v4 válido
const id = generateUUID();
// => "a1b2c3d4-e5f6-7890-abcd-ef1234567890"

// Fecha ISO 8601
const pastDate = generateISODate({ past: true });
const futureDate = generateISODate({ future: true });
const recentDate = generateISODate();

// SKU único
const sku = generateSKU();
// => "SKU-A1B2C3D4"

// Código de retiro (6 dígitos)
const codigo = generateCodigoRetiro();
// => "123456"
```

---

## Patrones de Migración

### Patrón 1: Migrar Tests de Services

#### ANTES (datos hardcoded):

```typescript
describe("UserService", () => {
  it("should create user successfully", async () => {
    const createData: CreateUserDto = {
      email: "newuser@example.com",
      full_name: "Test User",
      role: "user",
    };

    const createdUser: User = {
      id: "new-user-id",
      email: "newuser@example.com",
      full_name: "Test User",
      role: "user",
      avatar_url: undefined,
      phone: undefined,
      preferred_language: undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockRepository.create.mockResolvedValue({
      data: [createdUser],
      error: undefined,
    });

    const result = await service.createUser(createData);
    expect(result).toEqual(createdUser);
  });
});
```

#### DESPUÉS (con factories):

```typescript
import { UserFactory } from "../helpers/factories";

describe("UserService", () => {
  it("should create user successfully", async () => {
    const createData = UserFactory.createDto();
    const createdUser = UserFactory.create(createData);

    mockRepository.create.mockResolvedValue({
      data: [createdUser],
      error: undefined,
    });

    const result = await service.createUser(createData);
    expect(result).toEqual(createdUser);
  });
});
```

**Beneficios:**

- ✅ Sin datos hardcoded repetidos
- ✅ Datos únicos en cada ejecución (evita falsos positivos)
- ✅ Código más conciso y legible
- ✅ Fácil customización con overrides

### Patrón 2: Tests con Validaciones de Fechas

#### ANTES:

```typescript
it("should throw error when start_time is after end_time", async () => {
  const createData: CreateBookingDto = {
    user_id: "user-123",
    service_type: "repair",
    start_time: "2025-06-15T12:00:00Z", // Hardcoded
    end_time: "2025-06-15T10:00:00Z", // Hardcoded
  };

  await expect(service.createBooking(createData)).rejects.toThrow("Start time must be before end time");
});
```

#### DESPUÉS:

```typescript
import { BookingFactory, generateInvalidDateRange } from "../helpers/factories";

it("should throw error when start_time is after end_time", async () => {
  const invalidDates = generateInvalidDateRange();
  const createData = BookingFactory.createDto(invalidDates);

  await expect(service.createBooking(createData)).rejects.toThrow("Start time must be before end time");
});
```

### Patrón 3: Tests con Arrays de Datos

#### ANTES:

```typescript
it("should return payments for user", async () => {
  const mockPayments: Payment[] = [
    {
      id: "pay-1",
      user_id: "user-1",
      amount: 50,
      currency: "eur",
      // ... 15 campos más hardcoded
    },
    {
      id: "pay-2",
      user_id: "user-1",
      amount: 100,
      currency: "eur",
      // ... 15 campos más hardcoded
    },
  ];

  mockRepository.findByUserId.mockResolvedValue(mockPayments);
  const result = await service.findByUser("user-1");
  expect(result).toEqual(mockPayments);
  expect(result).toHaveLength(2);
});
```

#### DESPUÉS:

```typescript
import { PaymentFactory } from "../helpers/factories";

it("should return payments for user", async () => {
  const userId = "user-123";
  const mockPayments = PaymentFactory.createMany(2, { user_id: userId });

  mockRepository.findByUserId.mockResolvedValue(mockPayments);
  const result = await service.findByUser(userId);
  expect(result).toEqual(mockPayments);
  expect(result).toHaveLength(2);
});
```

### Patrón 4: Tests con Overrides Condicionales

```typescript
it("should allow updating email to same user current email", async () => {
  const existingUser = UserFactory.create();
  const updateData: UpdateUserDto = {
    id: existingUser.id,
    email: existingUser.email, // Reutilizar email del mock
  };

  // Simular que el email existe pero es del mismo usuario
  mockRepository.findByEmail.mockResolvedValue({
    data: existingUser,
    error: undefined,
  });

  const updatedUser = UserFactory.create(existingUser); // Reutilizar datos

  mockRepository.update.mockResolvedValue({
    data: [updatedUser],
    error: undefined,
  });

  const result = await service.updateUser(updateData);
  expect(result).toEqual(updatedUser);
});
```

### Patrón 5: Tests de Error con IDs Específicos

```typescript
it("should throw ConflictError when updating to existing email", async () => {
  // Usar IDs fijos para asegurar que son diferentes
  const user1Id = "user-1-id";
  const user2Id = "user-2-id";
  const conflictEmail = "conflict@example.com";

  const user2 = UserFactory.create({ id: user2Id, email: conflictEmail });

  const updateData: UpdateUserDto = {
    id: user1Id,
    email: conflictEmail, // Intentar usar email de otro usuario
  };

  mockRepository.findByEmail.mockResolvedValue({
    data: user2,
    error: undefined,
  });

  await expect(service.updateUser(updateData)).rejects.toThrow(ConflictError);
});
```

### Patrón 5: Migrar Tests de Repositories

#### ANTES (datos hardcoded en mocks de Supabase):

```typescript
describe("UserRepository", () => {
  it("should find user by email", async () => {
    const mockUser = {
      id: "user-123",
      email: "test@example.com",
      full_name: "Test User",
      role: "user",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    };

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({
      data: mockUser,
      error: null,
    });

    const result = await repository.findByEmail("test@example.com");
    expect(result.data).toEqual(mockUser);
  });
});
```

#### DESPUÉS (con factories):

```typescript
import { UserFactory } from "../helpers/factories";

describe("UserRepository", () => {
  it("should find user by email", async () => {
    const testEmail = "test@example.com";
    const mockUser = UserFactory.create({ email: testEmail });

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({
      data: mockUser,
      error: null,
    });

    const result = await repository.findByEmail(testEmail);
    expect(result.data).toEqual(mockUser);
  });
});
```

**Beneficios**:

- Datos realistas retornados por Supabase queries
- Fácil crear múltiples registros con `createMany()`
- Consistencia con tests de Services

### Patrón 6: Migrar Tests de Controllers

#### ANTES (datos hardcoded en request/response):

```typescript
import { createMocks } from "node-mocks-http";

describe("UserController", () => {
  it("should create user via POST", async () => {
    const reqBody = {
      email: "newuser@example.com",
      full_name: "New User",
      role: "user",
    };

    const createdUser = {
      id: "new-id",
      email: "newuser@example.com",
      full_name: "New User",
      role: "user",
      created_at: "2025-01-01T00:00:00Z",
      updated_at: "2025-01-01T00:00:00Z",
    };

    const { req, res } = createMocks({
      method: "POST",
      body: reqBody,
    });

    mockService.createUser.mockResolvedValue(createdUser);

    await controller.createUser(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({ data: [createdUser] });
  });
});
```

#### DESPUÉS (con factories):

```typescript
import { createMocks } from "node-mocks-http";
import { UserFactory } from "../helpers/factories";

describe("UserController", () => {
  it("should create user via POST", async () => {
    const reqBody = UserFactory.createDto({ role: "user" });
    const createdUser = UserFactory.create({
      email: reqBody.email,
      full_name: reqBody.full_name,
      role: reqBody.role,
    });

    const { req, res } = createMocks({
      method: "POST",
      body: reqBody,
    });

    mockService.createUser.mockResolvedValue(createdUser);

    await controller.createUser(req, res);

    expect(res._getStatusCode()).toBe(201);
    expect(JSON.parse(res._getData())).toEqual({ data: [createdUser] });
  });
});
```

**Beneficios**:

- Request bodies realistas que pasan validaciones Zod
- Responses consistentes con estructura de datos real
- Fácil test de validaciones HTTP con datos inválidos

### Patrón 7: Tests de Schemas (Opcional)

#### ANTES:

```typescript
describe("createUserSchema", () => {
  it("should validate valid user data", () => {
    const validData = {
      email: "test@example.com",
      full_name: "Test User",
      role: "user",
    };

    expect(() => createUserSchema.parse(validData)).not.toThrow();
  });
});
```

#### DESPUÉS:

```typescript
import { UserFactory } from "../helpers/factories";

describe("createUserSchema", () => {
  it("should validate valid user data", () => {
    const validData = UserFactory.createDto();
    expect(() => createUserSchema.parse(validData)).not.toThrow();
  });

  it("should reject invalid email format", () => {
    const invalidData = UserFactory.createDto({ email: "invalid-email" });
    expect(() => createUserSchema.parse(invalidData)).toThrow();
  });
});
```

---

## Supabase Mock Builder

### Descripción

Utilities para crear mocks consistentes del Supabase query builder en tests de repositories.

[... contenido anterior del Supabase Mock Builder permanece igual ...]

---

## Checklist de Migración

### Para Services ✅

1. ✅ Importar factories necesarios de `../helpers/factories`
2. ✅ Reemplazar objetos hardcoded con `Factory.create()` o `Factory.createDto()`
3. ✅ Usar `Factory.createMany()` para arrays de datos
4. ✅ Usar helpers de fechas para tests de validación temporal
5. ✅ Ejecutar test: `npm test -- __tests__/services/X.service.test.ts`
6. ✅ Verificar que no hay datos hardcoded residuales
7. ✅ Commit: `test(services): migrate X.service.test to factories`

### Para Repositories ⏳

1. ⏳ Importar factories: `import { XFactory } from '../helpers/factories'`
2. ⏳ Reemplazar datos en `mockSupabase.single.mockResolvedValue({ data: ... })`
3. ⏳ Usar `Factory.create()` para datos únicos retornados por Supabase
4. ⏳ Usar `Factory.createMany()` para queries que retornan arrays
5. ⏳ Mantener estructura de mock: `{ data: XFactory.create(), error: null }`
6. ⏳ Ejecutar test: `npm test -- __tests__/repositories/X.repository.test.ts`
7. ⏳ Commit: `test(repositories): migrate X.repository.test to factories`

### Para Controllers ⏳

1. ⏳ Importar factories y `node-mocks-http`
2. ⏳ Usar `Factory.createDto()` para request bodies
3. ⏳ Usar `Factory.create()` para responses esperadas
4. ⏳ Mockear service con datos de factory: `mockService.method.mockResolvedValue(Factory.create())`
5. ⏳ Validar status codes y response structure
6. ⏳ Ejecutar test: `npm test -- __tests__/controllers/X.controller.test.ts`
7. ⏳ Commit: `test(controllers): migrate X.controller.test to factories`

### Para Schemas ✅

1. ✅ Importar factories: `import { XFactory, generateUUID } from '../helpers/factories'`
2. ✅ Reemplazar UUIDs hardcoded: `const validUUID = generateUUID()`
3. ✅ Casos válidos: `createXSchema.parse(XFactory.createDto())`
4. ✅ Casos inválidos: `XFactory.createDto({ email: "invalid" })`
5. ✅ Test edge cases con overrides específicos
6. ✅ Ejecutar test: `npm test -- __tests__/schemas/X.schema.test.ts`
7. ✅ Commit: `test(schemas): migrate X.schema.test to factories`

---

## Archivos Migrados ✅

### Services (18/18 completados - 272 tests migrados exitosamente) 🎉

- ✅ `user.service.test.ts` - 17/17 tests
- ✅ `booking.service.test.ts` - 16/16 tests
- ✅ `payment.service.test.ts` - 13/13 tests
- ✅ `vending_machine.service.test.ts` - 9/9 tests
- ✅ `workshop.service.test.ts` - 6/6 tests
- ✅ `review.service.test.ts` - 15/15 tests
- ✅ `partner.service.test.ts` - 6/6 tests (PartnerFactory agregado)
- ✅ `favorite.service.test.ts` - 15/15 tests
- ✅ `inventory.service.test.ts` - 9/9 tests
- ✅ `inventory_item.service.test.ts` - 9/9 tests
- ✅ `taller_manager.service.test.ts` - 9/9 tests
- ✅ `report.service.test.ts` - 15/15 tests
- ✅ `csp.service.test.ts` - 12/12 tests (CSPFactory agregado)
- ✅ `venta_app.service.test.ts` - 28/28 tests (migrado de helper local a VentaAppFactory)
- ✅ `availability.service.test.ts` - 23/23 tests (migrado con generateUUID)
- ✅ `geolocation.service.test.ts` - 21/21 tests (coordenadas refactorizadas)
- ✅ `precio.service.test.ts` - 28/28 tests (PrecioFactory agregado)
- ✅ `base.service.test.ts` - 21/21 tests (migrado con generateUUID)

**Progreso**: 100% completado (18/18 archivos) | **Tests**: 272/272 passing ✅

### Schemas (18/20 migrados - 90% COMPLETADO) ✅

**Archivos de test de schemas (validación Zod):**

- ⏳ `availability.schema.test.ts` - Sin factory (skipped - DTOs especiales)
- ✅ `booking.schema.test.ts` - 33 tests
- ✅ `camino.schema.test.ts` - 44 tests
- ✅ `csp.schema.test.ts` - 72 tests
- ✅ `favorite.schema.test.ts` - 65 tests
- ✅ `inventory.schema.test.ts` - 77 tests
- ✅ `inventory_items.schema.test.ts` - 79 tests
- ✅ `partner.schema.test.ts` - 61 tests
- ✅ `payment.schema.test.ts` - 22 tests
- ✅ `precio.schema.test.ts` - 101 tests
- ✅ `producto.schema.test.ts` - 60 tests
- ✅ `report.schema.test.ts` - 74 tests
- ✅ `review.schema.test.ts` - 63 tests
- ⏳ `service_assignment.schema.test.ts` - Sin factory (skipped)
- ✅ `taller_manager.schema.test.ts` - 86 tests
- ✅ `user.schema.test.ts` - 29 tests
- ✅ `vending_machine.schema.test.ts` - 68 tests
- ✅ `vending_machine_slot.schema.test.ts` - 66 tests
- ✅ `venta_app.schema.test.ts` - 58 tests
- ✅ `workshop.schema.test.ts` - 81 tests

**Progreso**: 90% completado (18/20 archivos) | **Tests**: 1139/1139 passing ✅

**Nota**: 2 archivos excluidos (availability, service_assignment) por no tener factories correspondientes.

### Repositories (0/21 migrados - pendiente)

**Archivos de test de repositories (Supabase queries):**

- ⏳ `user.repository.test.ts` - CRUD usuarios
- ⏳ `booking.repository.test.ts` - CRUD reservas
- ⏳ `payment.repository.test.ts` - CRUD pagos
- ⏳ `vending_machine.repository.test.ts` - CRUD vending machines
- ⏳ `vending_machine_slot.repository.test.ts` - CRUD slots
- ⏳ `workshop.repository.test.ts` - CRUD talleres
- ⏳ `review.repository.test.ts` - CRUD reseñas
- ⏳ `partner.repository.test.ts` - CRUD partners
- ⏳ `favorite.repository.test.ts` - CRUD favoritos
- ⏳ `inventory.repository.test.ts` - CRUD inventario
- ⏳ `inventory_item.repository.test.ts` - CRUD items inventario
- ⏳ `taller_manager.repository.test.ts` - CRUD gestores taller
- ⏳ `report.repository.test.ts` - CRUD reportes
- ⏳ `csp.repository.test.ts` - CRUD CSPs
- ⏳ `venta_app.repository.test.ts` - Queries ventas app
- ⏳ `availability.repository.test.ts` - Queries disponibilidad
- ⏳ `geolocation.repository.test.ts` - Queries geolocalización
- ⏳ `precio.repository.test.ts` - Queries precios
- ⏳ `producto.repository.test.ts` - CRUD productos
- ⏳ `service_assignment.repository.test.ts` - Queries asignaciones
- ⏳ `base.repository.test.ts` - Repository base genérico

**Progreso**: 0% completado (0/21 archivos) | **Prioridad**: Alta

**Beneficio esperado**: Usar factories para mockear datos de Supabase, reducir duplicación.

### Controllers (0/17 migrados - pendiente)

**Archivos de test de controllers (HTTP handlers):**

- ⏳ `user.controller.test.ts` - Endpoints usuarios
- ⏳ `booking.controller.test.ts` - Endpoints reservas
- ⏳ `payment.controller.test.ts` - Endpoints pagos
- ⏳ `vending_machine.controller.test.ts` - Endpoints vending machines
- ⏳ `workshop.controller.test.ts` - Endpoints talleres
- ⏳ `review.controller.test.ts` - Endpoints reseñas
- ⏳ `partner.controller.test.ts` - Endpoints partners
- ⏳ `favorite.controller.test.ts` - Endpoints favoritos
- ⏳ `inventory.controller.test.ts` - Endpoints inventario
- ⏳ `inventory_item.controller.test.ts` - Endpoints items inventario
- ⏳ `taller_manager.controller.test.ts` - Endpoints gestores taller
- ⏳ `report.controller.test.ts` - Endpoints reportes
- ⏳ `csp.controller.test.ts` - Endpoints CSPs
- ⏳ `venta_app.controller.test.ts` - Endpoints ventas app
- ⏳ `availability.controller.test.ts` - Endpoints disponibilidad
- ⏳ `geolocation.controller.test.ts` - Endpoints geolocalización
- ⏳ `precio.controller.test.ts` - Endpoints precios

**Progreso**: 0% completado (0/17 archivos) | **Prioridad**: Alta

**Beneficio esperado**: Usar factories para request/response mocks, test de validaciones HTTP.

### Nuevas Factories Agregadas

- ✅ `PartnerFactory` - Para entidad Partner (bike shops, repair shops, etc.)
- ✅ `CSPFactory` - Para Camino Service Points (rest areas, workshops, info points, bike stations)
- ✅ `PrecioFactory` - Para sistema de precios jerárquico (BASE, UBICACION, SERVICE_POINT)

---

## 🎯 Plan de Acción y Próximos Pasos

### Fase 1: Services ✅ COMPLETADA

- [x] Migrar 18 archivos de service tests
- [x] Crear 3 nuevas factories (Partner, CSP, Precio)
- [x] Documentar patrones de migración
- [x] Validar 272/272 tests pasando

### Fase 2: Repositories (Prioridad ALTA) ⏳

**Beneficio**: Reducir duplicación en mocks de Supabase, datos consistentes.

**Estrategia sugerida**:

1. Empezar con repositories más usados: `user`, `booking`, `payment`
2. Usar factories existentes para mockear datos retornados por Supabase
3. Usar `SupabaseMockBuilder` para queries complejas
4. Patrón: `mockSupabase.from().select().mockResolvedValue({ data: UserFactory.createMany(3) })`

**Archivos prioritarios** (orden sugerido):

1. `user.repository.test.ts` - UserFactory ya existe
2. `booking.repository.test.ts` - BookingFactory ya existe
3. `payment.repository.test.ts` - PaymentFactory ya existe
4. `vending_machine.repository.test.ts` - VendingMachineFactory ya existe
5. Resto según necesidad

### Fase 3: Controllers (Prioridad ALTA) ⏳

**Beneficio**: Tests de endpoints con datos realistas, validaciones HTTP consistentes.

**Estrategia sugerida**:

1. Usar factories para generar request bodies y responses
2. Combinar con `node-mocks-http` para mocks de req/res
3. Validar Zod schemas con datos de factories
4. Patrón: `const reqBody = UserFactory.createDto({ email: "test@example.com" })`

**Archivos prioritarios** (orden sugerido):

1. `user.controller.test.ts` - CRUD básico
2. `booking.controller.test.ts` - Flujo de reservas
3. `payment.controller.test.ts` - Integración con Stripe
4. `vending_machine.controller.test.ts` - Gestión de máquinas
5. Resto según necesidad

### Fase 4: Schemas (Prioridad MEDIA) ⏳

**Beneficio**: Menor impacto, schemas principalmente validan estructura.

**Nota**: Schemas generalmente tienen menos hardcode (validaciones de campos). Migración opcional, priorizar Repositories y Controllers primero.

**Estrategia si se migra**:

1. Usar factories para generar inputs válidos/inválidos
2. Tests de validación con casos edge usando overrides
3. Patrón: `createUserSchema.parse(UserFactory.createDto())` debe pasar

---

## 📈 Métricas de Éxito

### Objetivos Completados

- ✅ Services: 18/18 archivos migrados (272 tests passing)
- ✅ Factories creadas: 20 totales disponibles
- ✅ Documentación completa de patrones

### Objetivos Pendientes

- ⏳ Repositories: 0/21 migrados
- ⏳ Controllers: 0/17 migrados
- ⏳ Schemas: 0/20 migrados (opcional)

### KPIs

- **Cobertura de migración total**: 24% (18/76 archivos)
- **Tests pasando**: 272/272 (100%)
- **Factories disponibles**: 20
- **Reducción de hardcode en Services**: ~80%

---

## Referencias

- **Factories**: `__tests__/helpers/factories.ts`
- **@ngneat/falso docs**: https://ngneat.github.io/falso/
- **Supabase Mock Builder**: `__tests__/helpers/supabase-mock-builder.ts`
