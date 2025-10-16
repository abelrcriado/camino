# Guía de Migración a AppError Hierarchy

## 📋 Contexto

Esta guía documenta el proceso de refactorización de servicios que usan `throw new Error()` genéricos a la jerarquía de `AppError` para obtener códigos HTTP semánticamente correctos.

**Problema:** Todos los errores retornan HTTP 500 → Viola estándares REST, confunde frontend, alerta monitoreo incorrectamente.

**Solución:** Usar clases de error específicas que mapean a códigos HTTP apropiados.

## 🎯 Jerarquía AppError

Ubicación: `src/errors/custom-errors.ts`

| Clase AppError         | Código HTTP | Cuándo Usar                          |
| ---------------------- | ----------- | ------------------------------------ |
| `NotFoundError`        | 404         | Recurso no existe en BD              |
| `ValidationError`      | 400         | Input validation failed (Zod/manual) |
| `BusinessRuleError`    | 400         | Violación de regla de negocio        |
| `ConflictError`        | 409         | Duplicado/conflicto de recursos      |
| `UnauthorizedError`    | 401         | Usuario no autenticado               |
| `ForbiddenError`       | 403         | Usuario sin permisos                 |
| `DatabaseError`        | 500         | Error de operación DB                |
| `ExternalServiceError` | 503         | Servicio externo no disponible       |

## 📝 Casos de Uso Específicos

### 1. NotFoundError (404)

**Usar cuando:** Recurso específico no existe en base de datos.

```typescript
// ❌ ANTES (INCORRECTO - Retorna 500)
if (!result.data) {
  throw new Error(`Venta con ID ${ventaId} no encontrada`);
}

// ✅ DESPUÉS (CORRECTO - Retorna 404)
if (!result.data) {
  throw new NotFoundError("Venta", ventaId);
}
```

**Constructor:**

```typescript
new NotFoundError(resourceName: string, resourceId: string)
// Genera mensaje: "Venta con ID abc-123 no encontrada"
```

### 2. BusinessRuleError (400)

**Usar cuando:** Operación viola reglas de negocio (estado inválido, acción no permitida).

```typescript
// ❌ ANTES (INCORRECTO - Retorna 500)
if (currentEstado !== "pagada") {
  throw new Error("Transición de estado inválida");
}

// ✅ DESPUÉS (CORRECTO - Retorna 400)
if (currentEstado !== "pagada") {
  throw new BusinessRuleError(`Transición de estado inválida: ${currentEstado} → ${newEstado}`);
}
```

**Constructor:**

```typescript
new BusinessRuleError(message: string, details?: Record<string, unknown>)
// Código de error: BUSINESS_RULE_VIOLATION
```

### 3. ValidationError (400)

**Usar cuando:** Datos de entrada no pasan validación (formato incorrecto, valores fuera de rango).

```typescript
// ❌ ANTES (INCORRECTO)
if (minutos < 1 || minutos > 1440) {
  throw new Error("Minutos debe estar entre 1 y 1440");
}

// ✅ DESPUÉS (CORRECTO)
if (minutos < 1 || minutos > 1440) {
  throw new ValidationError("Minutos debe estar entre 1 y 1440");
}
```

**Constructor:**

```typescript
new ValidationError(message: string, details?: Record<string, unknown>)
// Código de error: VALIDATION_ERROR
```

### 4. DatabaseError (500)

**Usar cuando:** Error inesperado en operación de base de datos (conexión, query failed, timeout).

```typescript
// ❌ ANTES (INCORRECTO - Pierde contexto)
} catch (error) {
  throw new Error(`Error al crear venta: ${error.message}`);
}

// ✅ DESPUÉS (CORRECTO - Preserva contexto)
} catch (error) {
  if (error instanceof ValidationError || error instanceof BusinessRuleError) {
    throw error; // Preservar errores específicos
  }
  throw new DatabaseError(
    "Error al crear venta",
    { originalError: error instanceof Error ? error.message : String(error) }
  );
}
```

**Constructor:**

```typescript
new DatabaseError(message: string, details?: Record<string, unknown>)
// Código de error: DATABASE_ERROR
```

## 🔄 Patrón de Refactorización

### Paso 1: Agregar Imports

```typescript
import { ValidationError, NotFoundError, BusinessRuleError, DatabaseError } from "../errors/custom-errors";
```

### Paso 2: Refactorizar Métodos Helper

**Patrón getOrThrow:**

```typescript
// ❌ ANTES
private async getVentaOrThrow(ventaId: string): Promise<VentaApp> {
  const result = await this.ventaRepository.findById(ventaId);
  if (result.error || !result.data) {
    throw new ValidationError(`Venta con ID ${ventaId} no encontrada`, result.error);
  }
  return result.data;
}

// ✅ DESPUÉS
private async getVentaOrThrow(ventaId: string): Promise<VentaApp> {
  const result = await this.ventaRepository.findById(ventaId);
  if (result.error || !result.data) {
    throw new NotFoundError("Venta", ventaId); // 404, no 400
  }
  return result.data;
}
```

**Patrón validateBusinessRule:**

```typescript
// ❌ ANTES
private validateEstadoTransition(currentEstado: string, newEstado: string): void {
  if (!isValidTransition(currentEstado, newEstado)) {
    throw new ValidationError(`Transición inválida: ${currentEstado} → ${newEstado}`);
  }
}

// ✅ DESPUÉS
private validateEstadoTransition(currentEstado: string, newEstado: string): void {
  if (!isValidTransition(currentEstado, newEstado)) {
    throw new BusinessRuleError(`Transición inválida: ${currentEstado} → ${newEstado}`);
  }
}
```

### Paso 3: Refactorizar Catch Blocks

**Patrón Estándar:**

```typescript
// ❌ ANTES
async createVenta(dto: CreateVentaDto): Promise<VentaApp> {
  try {
    // ... lógica de negocio ...
    return result;
  } catch (error) {
    throw new Error(
      `Error al crear venta: ${
        error instanceof Error ? error.message : "Error desconocido"
      }`
    );
  }
}

// ✅ DESPUÉS
async createVenta(dto: CreateVentaDto): Promise<VentaApp> {
  try {
    // ... lógica de negocio ...
    return result;
  } catch (error) {
    // Preservar errores específicos (ya tienen código HTTP correcto)
    if (error instanceof NotFoundError ||
        error instanceof ValidationError ||
        error instanceof BusinessRuleError) {
      throw error;
    }
    // Errores inesperados → DatabaseError (500)
    throw new DatabaseError(
      "Error al crear venta",
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}
```

**Regla de Oro:** El catch block debe **preservar errores específicos** y solo convertir errores genéricos a `DatabaseError`.

### Paso 4: Refactorizar Validaciones Inline

**Errores de validación:**

```typescript
// ❌ ANTES
if (result.error) {
  throw new Error(`Error al obtener ventas: ${result.error.message}`);
}

// ✅ DESPUÉS
if (result.error) {
  throw new DatabaseError("Error al obtener ventas", { originalError: result.error instanceof Error ? result.error.message : String(result.error) });
}
```

## ✅ Checklist de Verificación

### Durante Refactorización

- [ ] Imports agregados: `NotFoundError`, `BusinessRuleError`, `ValidationError`, `DatabaseError`
- [ ] Métodos `getOrThrow` usan `NotFoundError` (404)
- [ ] Validaciones de reglas de negocio usan `BusinessRuleError` (400)
- [ ] Validaciones de input usan `ValidationError` (400)
- [ ] Catch blocks preservan errores específicos con `instanceof` checks
- [ ] Errores de DB genéricos usan `DatabaseError` (500) con contexto en `details`
- [ ] 0 instancias de `throw new Error()` genéricos restantes

### Después de Refactorización

- [ ] Tests ejecutados: `npm test -- __tests__/api/<servicio>`
- [ ] Todos los tests pasan (no hay regresión)
- [ ] Lint ejecutado: `npm run lint` (0 errores)
- [ ] Grep verificación: `grep "throw new Error(" src/services/<servicio>.service.ts` → 0 matches
- [ ] Commit con mensaje descriptivo incluyendo count de cambios

## 🔍 Encontrar Instancias a Refactorizar

```bash
# 1. Buscar todos los throw new Error en un servicio
grep -n "throw new Error(" src/services/venta_app.service.ts

# 2. Contar instancias
grep "throw new Error(" src/services/venta_app.service.ts | wc -l

# 3. Ver contexto (3 líneas antes/después)
grep -B 3 -A 3 "throw new Error(" src/services/venta_app.service.ts

# 4. Buscar en múltiples servicios
grep -r "throw new Error(" src/services/ | grep -v ".test.ts"
```

## 📊 Ejemplo Completo: venta_app.service.ts

**Estadísticas de Refactorización:**

- ❌ Antes: 17 instancias de `throw new Error()`
- ✅ Después: 0 instancias (100% migrado)
- 📉 Código reducido: -35 líneas
- 🧪 Tests: 82/82 passing
- ⏱️ Tiempo: ~45 minutos

**Commits:**

- `f5cc67b` - refactor(services): migrate venta_app to AppError hierarchy

### Métodos Refactorizados (17)

1. `getVentaOrThrow` → NotFoundError (404)
2. `validateEstadoTransition` → BusinessRuleError (400)
3. `createVenta` → DatabaseError catch (500)
4. `reservarStock` → DatabaseError catch (500)
5. `confirmarPago` → DatabaseError catch (500)
6. `confirmarRetiro` → DatabaseError catch (500)
7. `cancelarVenta` → DatabaseError catch (500)
8. `crearYPagarVenta` → DatabaseError catch (500)
9. `getVentas` → DatabaseError (500)
10. `getVentasFull` → DatabaseError catch (500)
11. `getVentasActivas` → DatabaseError catch (500)
12. `getVentasPorExpirar` → DatabaseError catch (500)
13. `getEstadisticas` → DatabaseError catch (500)
14. `liberarStockExpirado` → DatabaseError catch (500)
15. `getNotificacionesVentasPorExpirar` → DatabaseError catch (500)
16. `findByCodigoRetiro` → DatabaseError (500)
17. `updateVenta` → DatabaseError catch (500)
18. `deleteVenta` → DatabaseError catch (500)
19. `countByEstado` → DatabaseError catch (500)
20. `countByUser` → DatabaseError catch (500)
21. `getIngresosByEstado` → DatabaseError catch (500)

## 🚀 Próximos Servicios a Refactorizar

**Prioridad 1 (Endpoints activos):**

1. `precio.service.ts` - Para endpoints `/api/precios`
2. `vending_machine_slot.service.ts` - Para `/api/vending-machines/[id]/slots`
3. `ubicacion.service.ts` - Para `/api/ubicaciones`
4. `producto.service.ts` - Para `/api/productos`

**Prioridad 2 (Servicios auxiliares):** 5. `service-product.service.ts` - 20+ errores genéricos 6. `warehouse-inventory.service.ts` - 5+ errores genéricos

**Estimación:** ~45 minutos por servicio de complejidad similar a venta_app

## 📚 Referencias

- **Código fuente:** `src/errors/custom-errors.ts`
- **Middleware:** `src/middlewares/error-handler.ts` (maneja AppError correctamente)
- **Tests:** `__tests__/api/ventas-app/*.test.ts` (validación de códigos HTTP)
- **Commit ejemplo:** `f5cc67b`

## ⚠️ Errores Comunes a Evitar

### 1. Usar ValidationError para NotFound

```typescript
// ❌ INCORRECTO (404 debería ser, no 400)
if (!venta) {
  throw new ValidationError("Venta no encontrada");
}

// ✅ CORRECTO
if (!venta) {
  throw new NotFoundError("Venta", ventaId);
}
```

### 2. No Preservar Errores Específicos en Catch

```typescript
// ❌ INCORRECTO (Convierte 404 a 500)
} catch (error) {
  throw new DatabaseError("Error al obtener venta", { error });
}

// ✅ CORRECTO (Preserva 404, 400, etc.)
} catch (error) {
  if (error instanceof NotFoundError || error instanceof ValidationError) {
    throw error; // Mantener código HTTP original
  }
  throw new DatabaseError("Error al obtener venta", { error });
}
```

### 3. Olvidar Details en DatabaseError

```typescript
// ❌ INCORRECTO (Pierde contexto de debugging)
throw new DatabaseError("Error al crear venta");

// ✅ CORRECTO (Preserva stack trace y contexto)
throw new DatabaseError("Error al crear venta", { originalError: error instanceof Error ? error.message : String(error) });
```

## 🎯 Objetivo Final

**100% de servicios usando AppError hierarchy** → API REST semánticamente correcta con códigos HTTP apropiados.

**Beneficios:**

- ✅ Frontend puede diferenciar errores (404 vs 500)
- ✅ Monitoreo alerta correctamente (404 = esperado, 500 = crítico)
- ✅ Logs más claros con `code` y `details`
- ✅ UX mejorado (mensajes específicos)
- ✅ Cumple estándares REST/HTTP

---

**Última actualización:** 2025-10-12 (Sprint 6.1 Extended)
**Servicios migrados:** 1/6 (venta_app ✅)
**Tests validados:** 82/82 passing
