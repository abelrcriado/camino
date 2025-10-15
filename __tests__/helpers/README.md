# Test Helpers - Camino Service Backend

Utilities para crear tests consistentes y reutilizables con datos generados y mocks de Supabase.

## Instalación

```typescript
// Test Data Generators
import { TestDataGenerators, SchemaDataGenerators, InvalidDataGenerators } from "../helpers/test-data-generators";

// Supabase Mock Builder
import { createSupabaseQueryMock, createMultiCallQueryMock, createSupabaseRpcMock, createSingleItemQueryMock, createNotFoundQueryMock, createPaginatedQueryMock } from "../helpers/supabase-mock-builder";
```

---

## 1. Test Data Generators

Utilidades para generar datos de test usando `@ngneat/falso`. Esto elimina hardcoding y hace los tests más mantenibles.

### Uso Básico

```typescript
import { TestDataGenerators } from "../helpers/test-data-generators";

describe("My Schema Test", () => {
  it("should validate UUID", () => {
    const validUUID = TestDataGenerators.uuid();
    const result = schema.safeParse({ id: validUUID });
    expect(result.success).toBe(true);
  });

  it("should validate email", () => {
    const validEmail = TestDataGenerators.email();
    const result = schema.safeParse({ email: validEmail });
    expect(result.success).toBe(true);
  });
});
```

### Generadores Disponibles

#### TestDataGenerators (Datos Genéricos)

```typescript
// Identificadores
TestDataGenerators.uuid(); // "550e8400-e29b-41d4-a716-446655440000"
TestDataGenerators.uuids(3); // Array de 3 UUIDs únicos

// Contacto
TestDataGenerators.email(); // "user@example.com"
TestDataGenerators.emails(5); // Array de 5 emails únicos
TestDataGenerators.fullName(); // "Jane Doe"
TestDataGenerators.phone(); // "+34612345678"

// URLs y texto
TestDataGenerators.url(); // "https://example.com/path"
TestDataGenerators.text(100); // Texto de 100 caracteres
TestDataGenerators.description(); // Texto largo (200 chars)

// Números
TestDataGenerators.number({ min: 1, max: 100 }); // Entero
TestDataGenerators.float({ min: 1, max: 100, fraction: 2 }); // Decimal

// Fechas (ISO 8601)
TestDataGenerators.pastDate(); // "2024-01-15T10:30:00.000Z"
TestDataGenerators.futureDate(); // "2026-01-15T10:30:00.000Z"
TestDataGenerators.recentDate(); // "2025-01-10T15:20:00.000Z"

// Ubicación
TestDataGenerators.latitude(); // 42.123456
TestDataGenerators.longitude(); // -8.654321
TestDataGenerators.address(); // "Calle Mayor, Madrid"
TestDataGenerators.city(); // "Barcelona"

// Utilidades
TestDataGenerators.boolean(); // true o false
TestDataGenerators.alphanumeric(10); // "aB3dF7kL9m"
TestDataGenerators.oneOf(["admin", "user"]); // Selecciona uno
TestDataGenerators.someOf([1, 2, 3, 4], 2); // Selecciona 2 elementos
```

#### SchemaDataGenerators (Datos Específicos por Entidad)

```typescript
// User
SchemaDataGenerators.user.id();
SchemaDataGenerators.user.email();
SchemaDataGenerators.user.fullName();
SchemaDataGenerators.user.phone();
SchemaDataGenerators.user.avatarUrl();
SchemaDataGenerators.user.preferredLanguage(); // "es", "en", "fr", etc.
SchemaDataGenerators.user.role(); // "admin", "manager", "user", etc.

// Payment
SchemaDataGenerators.payment.id();
SchemaDataGenerators.payment.userId();
SchemaDataGenerators.payment.bookingId();
SchemaDataGenerators.payment.amount();
SchemaDataGenerators.payment.currency(); // "eur"
SchemaDataGenerators.payment.paymentMethod(); // "card", "cash", etc.
SchemaDataGenerators.payment.status(); // "pending", "succeeded", etc.
SchemaDataGenerators.payment.description();
SchemaDataGenerators.payment.metadata();

// Booking
SchemaDataGenerators.booking.id();
SchemaDataGenerators.booking.userId();
SchemaDataGenerators.booking.servicePointId();
SchemaDataGenerators.booking.workshopId();
SchemaDataGenerators.booking.serviceType();
SchemaDataGenerators.booking.startTime();
SchemaDataGenerators.booking.endTime();
SchemaDataGenerators.booking.status();

// CSP (Camino Service Point)
SchemaDataGenerators.csp.id();
SchemaDataGenerators.csp.name();
SchemaDataGenerators.csp.latitude();
SchemaDataGenerators.csp.longitude();
SchemaDataGenerators.csp.description();
SchemaDataGenerators.csp.address();
SchemaDataGenerators.csp.cspType();
SchemaDataGenerators.csp.openingHours();

// Camino
SchemaDataGenerators.camino.id();
SchemaDataGenerators.camino.nombre();
SchemaDataGenerators.camino.codigo();
SchemaDataGenerators.camino.estadoOperativo();

// Precio
SchemaDataGenerators.precio.id();
SchemaDataGenerators.precio.entidadTipo();
SchemaDataGenerators.precio.precio();
SchemaDataGenerators.precio.nivel();

// Vending Machine
SchemaDataGenerators.vendingMachine.id();
SchemaDataGenerators.vendingMachine.slotNumber();
SchemaDataGenerators.vendingMachine.capacidadMaxima();
```

#### InvalidDataGenerators (Datos Inválidos para Tests Negativos)

```typescript
InvalidDataGenerators.invalidUuid(); // "invalid-uuid"
InvalidDataGenerators.invalidUuids(); // ["not-a-uuid", "123", ...]
InvalidDataGenerators.invalidEmail(); // "invalid-email"
InvalidDataGenerators.invalidEmails(); // ["no-at-sign", "spaces in@test.com"]
InvalidDataGenerators.invalidUrl(); // "not-a-url"
InvalidDataGenerators.negativeNumber(); // -42
InvalidDataGenerators.tooLongText(100); // String de 101 chars
InvalidDataGenerators.tooShortText(5); // String de 4 chars
```

### Ejemplos Completos

#### Test de User Schema

```typescript
import { TestDataGenerators, SchemaDataGenerators } from "../helpers/test-data-generators";
import { createUserSchema } from "../../src/schemas/user.schema";

describe("User Schema", () => {
  it("should validate correct user data", () => {
    const validData = {
      id: SchemaDataGenerators.user.id(),
      email: SchemaDataGenerators.user.email(),
      full_name: SchemaDataGenerators.user.fullName(),
      phone: SchemaDataGenerators.user.phone(),
      role: SchemaDataGenerators.user.role(),
    };

    const result = createUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject invalid UUID", () => {
    const invalidData = {
      id: TestDataGenerators.alphanumeric(10), // No es UUID
      email: SchemaDataGenerators.user.email(),
    };

    const result = createUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it("should accept multiple valid emails", () => {
    const emails = TestDataGenerators.emails(5);

    emails.forEach((email) => {
      const data = {
        id: SchemaDataGenerators.user.id(),
        email,
      };
      const result = createUserSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
```

#### Test de Booking con Fechas Correlacionadas

```typescript
import { TestDataGenerators, SchemaDataGenerators } from "../helpers/test-data-generators";

it("should validate booking with valid time range", () => {
  const startTime = TestDataGenerators.futureDate();
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + 3600000); // +1 hora
  const endTime = endDate.toISOString();

  const data = {
    id: SchemaDataGenerators.booking.id(),
    user_id: SchemaDataGenerators.booking.userId(),
    start_time: startTime,
    end_time: endTime,
  };

  const result = updateBookingSchema.safeParse(data);
  expect(result.success).toBe(true);
});
```

### Beneficios

1. **Zero Hardcoding**: No más `"test@example.com"` repetido 50 veces
2. **Datos Realistas**: Usa @ngneat/falso para generar datos que parecen reales
3. **Mantenibilidad**: Un solo lugar para cambiar la generación de datos
4. **Variedad**: Cada test run usa datos diferentes, detectando edge cases
5. **Type-Safe**: TypeScript garantiza tipos correctos
6. **Tests Negativos Fáciles**: Generadores de datos inválidos incluidos

---

## 2. Supabase Mock Builder

Utilities para crear mocks consistentes y reutilizables del Supabase query builder en tests.

### Ejemplos de Uso

### 1. Query Básica (select → eq → order)

**Antes:**

```typescript
const mockQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data: mockSlots, error: null } as any),
};
```

**Después:**

```typescript
const mockQuery = createSupabaseQueryMock({
  chainMethods: ["select", "eq"],
  finalMethod: "order",
  data: mockSlots,
  error: null,
});
```

### 2. Query con Múltiples Llamadas al Mismo Método

**Antes:**

```typescript
const mockQuery = {
  select: jest.fn(),
  eq: jest.fn(),
  order: jest.fn(),
};

mockQuery.select.mockReturnValue(mockQuery);
mockQuery.eq.mockReturnValue(mockQuery);
mockQuery.order.mockReturnValueOnce(mockQuery); // Primera llamada
mockQuery.order.mockResolvedValueOnce({ data: mockSlots, error: null } as any); // Segunda llamada
```

**Después:**

```typescript
const mockQuery = createMultiCallQueryMock({
  chainMethods: ["select", "eq"],
  multiCallMethod: {
    method: "order",
    returnThisCount: 1, // Primera llamada retorna this
  },
  data: mockSlots,
  error: null,
});
```

### 3. Query con .single()

**Antes:**

```typescript
const mockQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: mockSlot, error: null }),
};
```

**Después:**

```typescript
const mockQuery = createSingleItemQueryMock({
  chainMethods: ["select", "eq"],
  data: mockSlot,
  error: null,
});
```

### 4. Query con Error Handling

**Antes:**

```typescript
const mockQuery = {
  select: jest.fn(),
  eq: jest.fn(),
  order: jest.fn(),
};

const dbError = new Error("Database error");
mockQuery.select.mockReturnValue(mockQuery);
mockQuery.eq.mockReturnValue(mockQuery);
mockQuery.order.mockResolvedValue({
  data: null,
  error: dbError,
} as any);
```

**Después:**

```typescript
const mockQuery = createSupabaseQueryMock({
  chainMethods: ["select", "eq"],
  finalMethod: "order",
  data: null,
  error: new Error("Database error"),
});
```

### 5. Not Found (PGRST116)

**Antes:**

```typescript
const mockQuery = {
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({
    data: null,
    error: { code: "PGRST116" },
  }),
};
```

**Después:**

```typescript
const mockQuery = createNotFoundQueryMock(["select", "eq"]);
```

### 6. Query con Paginación (count)

**Antes:**

```typescript
const mockChain = {
  select: jest.fn(),
  eq: jest.fn(),
  order: jest.fn(),
  range: jest.fn(),
};

mockChain.select.mockReturnValue(mockChain);
mockChain.eq.mockReturnValue(mockChain);
mockChain.order.mockReturnValue(mockChain);
mockChain.range.mockResolvedValue({
  data: mockVigentes,
  count: 25,
  error: null,
} as any);
```

**Después:**

```typescript
const mockQuery = createPaginatedQueryMock({
  chainMethods: ["select", "eq", "order"],
  finalMethod: "range",
  data: mockVigentes,
  count: 25,
});
```

### 7. RPC (Remote Procedure Call)

**Antes:**

```typescript
(mockSupabase.rpc as jest.Mock).mockResolvedValue({
  data: 10,
  error: null,
});
```

**Después:**

```typescript
mockSupabase.rpc = createSupabaseRpcMock({
  data: 10,
  error: null,
});
```

## Patrones de Uso

### Test Completo de Repository

```typescript
import { createSupabaseQueryMock } from "../helpers/supabase-mock-builder";

describe("MyRepository", () => {
  it("should fetch items successfully", async () => {
    const mockData = [{ id: "123", name: "Test" }];

    const mockQuery = createSupabaseQueryMock({
      chainMethods: ["select", "eq"],
      finalMethod: "order",
      data: mockData,
      error: null,
    });

    (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

    const result = await repository.findAll();

    expect(mockSupabase.from).toHaveBeenCalledWith("my_table");
    expect(result).toEqual(mockData);
  });
});
```

### Test de Error Handling

```typescript
it("should throw error on database failure", async () => {
  const mockQuery = createSupabaseQueryMock({
    chainMethods: ["select", "eq"],
    finalMethod: "order",
    data: null,
    error: new Error("Connection timeout"),
  });

  (mockSupabase.from as jest.Mock).mockReturnValue(mockQuery);

  await expect(repository.findAll()).rejects.toThrow("Connection timeout");
});
```

## Beneficios

1. **Consistencia**: Todos los mocks siguen el mismo patrón
2. **Mantenibilidad**: Cambios centralizados en una sola utility
3. **Legibilidad**: Código más conciso y expresivo
4. **Type Safety**: TypeScript ayuda a configurar correctamente los mocks
5. **Menos Errores**: Elimina errores comunes de configuración de mocks

## Migración Gradual

No es necesario refactorizar todos los tests a la vez. Los helpers son completamente opcionales y compatibles con el código existente. Se recomienda:

1. Usar helpers en todos los **nuevos tests**
2. Refactorizar tests existentes **cuando se editen**
3. Documentar patrones complejos como ejemplos

## Referencia Completa

Ver `supabase-mock-builder.ts` para la documentación completa de todas las funciones disponibles.
