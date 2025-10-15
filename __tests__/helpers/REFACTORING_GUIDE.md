# Schema Tests Refactoring Guide

Esta guía documenta el proceso de refactorización de tests de schemas usando `@ngneat/falso` para abstracción de datos.

## Estado Actual

### ✅ Tests Refactorizados (4/20)

1. **user.schema.test.ts** - 29 tests ✅
2. **payment.schema.test.ts** - 25 tests ✅
3. **booking.schema.test.ts** - 33 tests ✅
4. **csp.schema.test.ts** - 70 tests ✅

**Total**: 157 tests refactorizados

### ⏳ Tests Pendientes (16/20)

1. camino.schema.test.ts
2. precio.schema.test.ts
3. vending_machine.schema.test.ts
4. vending_machine_slot.schema.test.ts
5. venta_app.schema.test.ts
6. producto.schema.test.ts
7. inventory.schema.test.ts
8. inventory_items.schema.test.ts
9. workshop.schema.test.ts
10. availability.schema.test.ts
11. review.schema.test.ts
12. favorite.schema.test.ts
13. partner.schema.test.ts
14. service_assignment.schema.test.ts
15. taller_manager.schema.test.ts
16. report.schema.test.ts

**Total**: ~982 tests pendientes

## Proceso de Refactorización

### Paso 1: Importar Generadores

```typescript
import { TestDataGenerators, SchemaDataGenerators, InvalidDataGenerators } from "../helpers/test-data-generators";
```

### Paso 2: Identificar Datos Hardcoded

Buscar patrones como:

- UUIDs: `"550e8400-e29b-41d4-a716-446655440000"`
- Emails: `"test@example.com"`
- Nombres: `"John Doe"`
- Fechas: `"2025-01-01T00:00:00.000Z"`
- Números: `100`, `42.5`

### Paso 3: Reemplazar con Generadores

**Antes:**

```typescript
const validData = {
  id: "550e8400-e29b-41d4-a716-446655440001",
  email: "test@example.com",
  name: "John Doe",
};
```

**Después:**

```typescript
const validData = {
  id: SchemaDataGenerators.user.id(),
  email: SchemaDataGenerators.user.email(),
  name: SchemaDataGenerators.user.fullName(),
};
```

### Paso 4: Manejar Datos Correlacionados

Para datos que tienen relaciones (ej: `start_time < end_time`), crear helper functions:

```typescript
const generateValidBookingData = () => {
  const startTime = TestDataGenerators.futureDate();
  const startDate = new Date(startTime);
  const endDate = new Date(startDate.getTime() + 3600000); // +1 hour
  const endTime = endDate.toISOString();

  return {
    start_time: startTime,
    end_time: endTime,
    // ... otros campos
  };
};

it("should validate correct data", () => {
  const validData = generateValidBookingData();
  // ...
});
```

### Paso 5: Tests de Valores Inválidos

Usar `InvalidDataGenerators` o helpers específicos:

```typescript
it("should reject invalid UUID", () => {
  const data = {
    id: TestDataGenerators.alphanumeric(10), // No es UUID
    email: SchemaDataGenerators.user.email(),
  };
  const result = schema.safeParse(data);
  expect(result.success).toBe(false);
});
```

### Paso 6: Verificar Tests Pasan

```bash
npm test -- __tests__/schemas/nombre-del-archivo.test.ts
```

## Casos Especiales

### 1. Arrays de Valores para Iterar

**Antes:**

```typescript
const emails = ["user@example.com", "user.name@example.com", "user+tag@example.co.uk"];
```

**Después:**

```typescript
const emails = TestDataGenerators.emails(3);
```

### 2. Seleccionar de un Enum

**Antes:**

```typescript
const role = "admin";
```

**Después:**

```typescript
const role = SchemaDataGenerators.user.role(); // Selecciona uno aleatorio
// O para validar todos:
const roles = ["admin", "manager", "user"];
roles.forEach((role) => {
  // test con cada role
});
```

### 3. Datos con Formato Específico

Si `SchemaDataGenerators` no tiene el generador exacto, usar `TestDataGenerators`:

```typescript
// Coordenadas
const latitude = TestDataGenerators.latitude(); // -90 a 90
const longitude = TestDataGenerators.longitude(); // -180 a 180

// Texto con longitud específica
const description = TestDataGenerators.text(200);

// Número en rango
const price = TestDataGenerators.number({ min: 100, max: 10000 });
```

### 4. Evitar Reutilización de `validData`

❌ **Incorrecto** (datos aleatorios se generan una sola vez):

```typescript
const validData = {
  id: SchemaDataGenerators.user.id(),
  email: SchemaDataGenerators.user.email(),
};

it("test 1", () => {
  const result = schema.safeParse(validData);
  // ...
});

it("test 2", () => {
  const result = schema.safeParse(validData);
  // Usa MISMO id y email que test 1
});
```

✅ **Correcto** (generar fresh data en cada test o usar helper):

```typescript
const generateValidData = () => ({
  id: SchemaDataGenerators.user.id(),
  email: SchemaDataGenerators.user.email(),
});

it("test 1", () => {
  const validData = generateValidData();
  // ...
});

it("test 2", () => {
  const validData = generateValidData();
  // Usa NUEVO id y email
});
```

## Checklist por Test File

- [ ] Importar generadores
- [ ] Identificar todos los datos hardcoded
- [ ] Reemplazar con generadores apropiados
- [ ] Crear helpers para datos correlacionados si necesario
- [ ] Ejecutar tests y verificar 100% pasan
- [ ] Commit cambios con mensaje descriptivo

## Agregar Nuevos Generadores

Si necesitas un generador que no existe, agrégalo a `test-data-generators.ts`:

```typescript
export const SchemaDataGenerators = {
  // ... existentes

  nuevoSchema: {
    id: () => TestDataGenerators.uuid(),
    campo: () => TestDataGenerators.text(50),
    // ... más campos
  },
};
```

## Beneficios de la Refactorización

1. ✅ **Cero Hardcoding**: Datos generados dinámicamente
2. ✅ **Mantenibilidad**: Un solo lugar para cambiar lógica
3. ✅ **Realismo**: Datos que parecen reales
4. ✅ **Variedad**: Cada run usa datos diferentes
5. ✅ **Detección de Edge Cases**: Más probable encontrar bugs

## Métricas de Progreso

- **Tests Refactorizados**: 157 / 1139 (13.8%)
- **Files Completados**: 4 / 20 (20%)
- **Objetivo**: 100% de schema tests usando generadores

## Referencias

- [Test Data Generators README](./README.md)
- [@ngneat/falso Documentation](https://ngneat.github.io/falso/)
- [Ejemplo Completo: user.schema.test.ts](__tests__/schemas/user.schema.test.ts)
