# Test Helpers - Supabase Mock Builder

Utilities para crear mocks consistentes y reutilizables del Supabase query builder en tests.

## Instalación

```typescript
import {
  createSupabaseQueryMock,
  createMultiCallQueryMock,
  createSupabaseRpcMock,
  createSingleItemQueryMock,
  createNotFoundQueryMock,
  createPaginatedQueryMock,
} from "../helpers/supabase-mock-builder";
```

## Ejemplos de Uso

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
