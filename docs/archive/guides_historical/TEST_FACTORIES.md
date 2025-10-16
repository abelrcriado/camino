# Guía de Test Factories

## Índice

- [Introducción](#introducción)
- [Instalación](#instalación)
- [Factories Disponibles](#factories-disponibles)
- [Patrón de Uso](#patrón-de-uso)
- [Ejemplos Prácticos](#ejemplos-prácticos)
- [Mejores Prácticas](#mejores-prácticas)
- [Troubleshooting](#troubleshooting)

---

## Introducción

Este proyecto utiliza **Test Factories** para centralizar la generación de datos de prueba. Esto garantiza:

✅ **Consistencia:** Todos los tests usan el mismo formato de datos  
✅ **Mantenibilidad:** Cambios en el esquema solo requieren actualizar la factory  
✅ **Legibilidad:** Código de test más limpio y enfocado en lógica  
✅ **Tipado:** TypeScript garantiza coherencia con DTOs reales

### Tecnología

- **Librería:** [@ngneat/falso](https://github.com/ngneat/falso) v7.2.0
- **Ubicación:** `src/helpers/factories.ts`
- **Mocking UUID:** `__mocks__/uuid.js` (genera UUIDs incrementales únicos)

---

## Instalación

```bash
npm install --save-dev @ngneat/falso
```

**Configuración Jest** (ya incluida en `jest.config.js`):

```javascript
moduleNameMapper: {
  '^uuid$': '<rootDir>/__mocks__/uuid.js',
}
```

---

## Factories Disponibles

### Core Factories

| Factory           | Entidad  | Métodos                                    |
| ----------------- | -------- | ------------------------------------------ |
| `UserFactory`     | User     | `create()`, `createDto()`, `createMany(n)` |
| `BookingFactory`  | Booking  | `create()`, `createDto()`, `createMany(n)` |
| `PaymentFactory`  | Payment  | `create()`, `createDto()`, `createMany(n)` |
| `WorkshopFactory` | Workshop | `create()`, `createDto()`, `createMany(n)` |
| `ReviewFactory`   | Review   | `create()`, `createDto()`, `createMany(n)` |

### Inventory Factories

| Factory                | Entidad       | Métodos                                    |
| ---------------------- | ------------- | ------------------------------------------ |
| `ProductoFactory`      | Producto      | `create()`, `createDto()`, `createMany(n)` |
| `InventoryFactory`     | Inventory     | `create()`, `createDto()`, `createMany(n)` |
| `InventoryItemFactory` | InventoryItem | `create()`, `createDto()`, `createMany(n)` |

### Vending Machine Factories

| Factory                     | Entidad            | Métodos                                    |
| --------------------------- | ------------------ | ------------------------------------------ |
| `VendingMachineFactory`     | VendingMachine     | `create()`, `createDto()`, `createMany(n)` |
| `VendingMachineSlotFactory` | VendingMachineSlot | `create()`, `createDto()`, `createMany(n)` |

### Sales Factories

| Factory           | Entidad  | Métodos                                    |
| ----------------- | -------- | ------------------------------------------ |
| `VentaAppFactory` | VentaApp | `create()`, `createDto()`, `createMany(n)` |
| `CaminoFactory`   | Camino   | `create()`, `createDto()`, `createMany(n)` |

### Utility Functions

```typescript
import { generateUUID } from "@/helpers/factories";

const id = generateUUID(); // UUID incremental único
```

---

## Patrón de Uso

### ❌ INCORRECTO - Valores hardcodeados

```typescript
// ❌ NO HACER ESTO
const user = {
  id: "user-123",
  email: "test@example.com",
  name: "John Doe",
  role: "user" as UserRole,
  created_at: "2024-01-01T00:00:00Z",
};

const bookingId = "booking-456";
const workshopId = "workshop-789";
```

### ✅ CORRECTO - Uso de Factories

```typescript
import { UserFactory, BookingFactory, generateUUID } from "@/helpers/factories";

// ✅ Entidad completa con valores realistas
const user = UserFactory.create();

// ✅ DTO para crear (sin id, timestamps opcionales)
const createUserDto = UserFactory.createDto();

// ✅ Array de múltiples entidades
const users = UserFactory.createMany(5);

// ✅ UUID único y válido
const bookingId = generateUUID();

// ✅ Override de campos específicos
const adminUser = UserFactory.create({
  role: "admin" as UserRole,
});

// ✅ Override en DTOs
const invalidEmail = UserFactory.createDto({
  email: "invalid-email",
});
```

---

## Ejemplos Prácticos

### Ejemplo 1: Test de Repository

```typescript
import { UserFactory, generateUUID } from "@/helpers/factories";

describe("UserRepository", () => {
  it("should find user by email", async () => {
    const user = UserFactory.create();

    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.single.mockResolvedValue({
      data: user,
      error: null,
    });

    const result = await repository.findByEmail(user.email);

    expect(result.data).toEqual(user);
    expect(mockSupabase.eq).toHaveBeenCalledWith("email", user.email);
  });
});
```

### Ejemplo 2: Test de Service con Validación

```typescript
import { BookingFactory, generateUUID } from "@/helpers/factories";

describe("BookingService", () => {
  it("should throw error when booking dates overlap", async () => {
    const workshopId = generateUUID();
    const startDate = new Date(Date.now() + 86400000).toISOString();
    const endDate = new Date(Date.now() + 172800000).toISOString();

    const existingBooking = BookingFactory.create({
      workshop_id: workshopId,
      start_date: startDate,
      end_date: endDate,
      status: "confirmed" as BookingStatus,
    });

    const newBookingDto = BookingFactory.createDto({
      workshop_id: workshopId,
      start_date: startDate, // Mismo rango
      end_date: endDate,
    });

    mockRepository.findByWorkshopAndDateRange.mockResolvedValue({
      data: [existingBooking],
      error: undefined,
    });

    await expect(service.createBooking(newBookingDto)).rejects.toThrow("Ya existe una reserva confirmada en estas fechas");
  });
});
```

### Ejemplo 3: Test de Controller con Arrays

```typescript
import { InventoryFactory, InventoryItemFactory, generateUUID } from "@/helpers/factories";

describe("InventoryController", () => {
  it("should get low stock items", async () => {
    const inventoryId = generateUUID();

    const lowStockItems = InventoryItemFactory.createMany(3).map((item, index) => ({
      ...item,
      inventory_id: inventoryId,
      quantity: 4 + index, // 4, 5, 6
      min_stock: 10, // Todos bajo stock mínimo
    }));

    mockService.getLowStockItems.mockResolvedValue({
      data: lowStockItems,
      error: undefined,
    });

    const { req, res } = createMocks({
      method: "GET",
      query: { id: inventoryId },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    expect(JSON.parse(res._getData())).toEqual({
      data: lowStockItems,
    });
  });
});
```

### Ejemplo 4: Relaciones entre Factories

```typescript
import { VendingMachineFactory, VendingMachineSlotFactory, ProductoFactory, generateUUID } from "@/helpers/factories";

describe("VendingMachineService", () => {
  it("should add product to slot", async () => {
    const machineId = generateUUID();
    const slotId = generateUUID();
    const productId = generateUUID();

    const machine = VendingMachineFactory.create({ id: machineId });
    const slot = VendingMachineSlotFactory.create({
      id: slotId,
      machine_id: machineId,
      product_id: null, // Slot vacío
    });
    const product = ProductoFactory.create({ id: productId });

    // Mock setup...
    mockRepository.findById.mockResolvedValue({
      data: slot,
      error: undefined,
    });

    const result = await service.assignProductToSlot(slotId, productId);

    expect(result.product_id).toBe(productId);
  });
});
```

---

## Mejores Prácticas

### 1. ⚠️ NUNCA valores hardcodeados

```typescript
// ❌ MAL
const userId = "user-123";
const email = "test@example.com";

// ✅ BIEN
const userId = generateUUID();
const email = UserFactory.createDto().email!;
```

### 2. 📅 Fechas dinámicas

```typescript
// ❌ MAL - Fecha hardcodeada
const startDate = "2024-01-01T10:00:00Z";

// ✅ BIEN - Fecha relativa
const startDate = new Date(Date.now() + 86400000).toISOString(); // +1 día
const endDate = new Date(Date.now() + 172800000).toISOString(); // +2 días
```

### 3. 🔑 UUIDs únicos con generateUUID()

```typescript
// ❌ MAL - UUID hardcodeado (puede duplicarse)
const id1 = "550e8400-e29b-41d4-a716-446655440000";
const id2 = "550e8400-e29b-41d4-a716-446655440000"; // ¡Duplicado!

// ✅ BIEN - UUIDs únicos generados
const id1 = generateUUID(); // '550e8400-e29b-41d4-a716-446655440001'
const id2 = generateUUID(); // '550e8400-e29b-41d4-a716-446655440002'
```

**Nota importante:** El mock de UUID (`__mocks__/uuid.js`) genera UUIDs incrementales únicos para evitar colisiones en tests.

### 4. 🎭 Override solo cuando sea necesario

```typescript
// ✅ BIEN - Override para caso específico
const adminUser = UserFactory.create({ role: "admin" as UserRole });
const deletedUser = UserFactory.create({ deleted_at: new Date().toISOString() });

// ✅ BIEN - Override para validación
const invalidBooking = BookingFactory.createDto({
  start_date: "invalid-date",
});
```

### 5. 📦 Arrays con createMany()

```typescript
// ❌ MAL - Crear manualmente
const users = [UserFactory.create(), UserFactory.create(), UserFactory.create()];

// ✅ BIEN - Usar createMany
const users = UserFactory.createMany(3);

// ✅ MEJOR - Con transformación si es necesario
const bookings = BookingFactory.createMany(5).map((booking, index) => ({
  ...booking,
  status: index % 2 === 0 ? "confirmed" : ("pending" as BookingStatus),
}));
```

### 6. 🧪 Separar datos de test de lógica

```typescript
// ✅ EXCELENTE - Setup claro
describe("PaymentService", () => {
  it("should process Stripe payment", async () => {
    // Arrange - Datos de test
    const bookingId = generateUUID();
    const userId = generateUUID();
    const stripeIntentId = `pi_${generateUUID()}`;

    const payment = PaymentFactory.create({
      booking_id: bookingId,
      user_id: userId,
      stripe_payment_intent_id: stripeIntentId,
      status: "pending" as PaymentStatus,
    });

    // Act - Lógica bajo prueba
    mockStripe.paymentIntents.confirm.mockResolvedValue({
      id: stripeIntentId,
      status: "succeeded",
    });

    const result = await service.confirmPayment(payment.id);

    // Assert - Verificación
    expect(result.status).toBe("completed");
    expect(mockStripe.paymentIntents.confirm).toHaveBeenCalledWith(stripeIntentId);
  });
});
```

---

## Troubleshooting

### Problema: "Cannot destructure property 'data' of undefined"

**Causa:** Mock de repository no configurado correctamente.

**Solución:**

```typescript
// ✅ Asegurar que mock retorna estructura correcta
mockRepository.findById.mockResolvedValue({
  data: entity,
  error: undefined,
});
```

### Problema: "ConflictError not thrown when expected"

**Causa:** UUIDs duplicados por mock estático.

**Solución:** El mock de UUID ya genera IDs incrementales únicos. Si persiste:

```typescript
// Verificar que IDs son diferentes
const id1 = generateUUID();
const id2 = generateUUID();
console.log("Are different?", id1 !== id2); // debe ser true
```

### Problema: Tests fallan después de cambiar schema

**Solución:** Actualizar factory correspondiente en `src/helpers/factories.ts`:

```typescript
// Ejemplo: Si se agrega campo "priority" a Booking
create(overrides = {}) {
  return {
    ...this.createDto(),
    id: generateUUID(),
    priority: randNumber({ min: 1, max: 5 }), // ← Agregar
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}
```

### Problema: Fechas inválidas en tests

**Causa:** Uso de fechas hardcodeadas del pasado.

**Solución:**

```typescript
// ❌ MAL
const date = "2024-01-01T00:00:00Z";

// ✅ BIEN - Fechas relativas
const futureDate = new Date(Date.now() + 86400000).toISOString();
```

---

## Archivos Refactorizados (Sprint 7.2)

### Service Tests - 100% Factories

- ✅ `__tests__/services/booking.service.test.ts` (312 líneas)
- ✅ `__tests__/services/payment.service.test.ts` (200 líneas)
- ✅ `__tests__/services/workshop.service.test.ts` (120 líneas)
- ✅ `__tests__/services/user.service.test.ts` (382 líneas)
- ✅ `__tests__/services/vending_machine.service.test.ts` (180 líneas)
- ✅ `__tests__/services/inventory_item.service.test.ts` (180 líneas)
- ✅ `__tests__/services/inventory.service.test.ts` (170 líneas)

**Total:** 1,744 líneas de tests SIN valores hardcodeados.

---

## Verificación

```bash
# Ejecutar todos los tests
npm test

# Resultado esperado
# Test Suites: 97 passed, 97 total
# Tests:       2415 passed, 2415 total
```

---

## Referencias

- [@ngneat/falso Documentation](https://github.com/ngneat/falso)
- [Test Data Builders Pattern](https://martinfowler.com/bliki/TestDataBuilder.html)
- Clean Architecture Testing Principles
