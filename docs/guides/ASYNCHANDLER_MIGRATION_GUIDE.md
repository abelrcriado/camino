# asyncHandler Migration Guide

**Objetivo:** Migrar 102 endpoints de páginas API a usar `asyncHandler` wrapper para eliminar código duplicado de manejo de errores.

**Fecha:** 13 de octubre de 2025  
**Sprint:** 6.3  
**Estado:** 20/122 endpoints migrados (16.4%)

---

## 📋 ¿Por qué asyncHandler?

### Problema Actual

Cada endpoint tiene ~5-10 líneas de try/catch duplicado:

```typescript
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Lógica del endpoint (3-50 líneas)
    const result = await controller.someMethod(req, res);
    return res.status(200).json(result);
  } catch (error) {
    logger.error("Error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
```

**Problemas:**

- ~250 líneas de código duplicado en 102 endpoints
- Inconsistencias en manejo de errores
- Logging manual repetido
- Difícil de mantener

### Solución: asyncHandler

El wrapper `asyncHandler` centraliza todo el manejo de errores:

```typescript
import { asyncHandler } from "@/middlewares/error-handler";

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // Solo la lógica del endpoint
  const result = await controller.someMethod(req, res);
  return res.status(200).json(result);
});
```

**Beneficios:**

- Elimina ~250 líneas de código duplicado
- Manejo consistente de errores en TODOS los endpoints
- Logging automático con Winston
- Soporte para AppError hierarchy (404, 400, 409, 500)
- Código más limpio y fácil de leer

---

## 🎯 Patrón de Migración

### ANTES (Endpoint sin asyncHandler)

```typescript
// pages/api/productos/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ProductoController } from "@/controllers/producto.controller";
import logger from "@/lib/logger";

const controller = new ProductoController();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      return await controller.getById(req, res);
    } else if (req.method === "PUT") {
      return await controller.update(req, res);
    } else if (req.method === "DELETE") {
      return await controller.delete(req, res);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    logger.error("Error en productos/[id]:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
```

### DESPUÉS (Endpoint con asyncHandler)

```typescript
// pages/api/productos/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ProductoController } from "@/controllers/producto.controller";
import { asyncHandler } from "@/middlewares/error-handler";

const controller = new ProductoController();

export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    return await controller.getById(req, res);
  } else if (req.method === "PUT") {
    return await controller.update(req, res);
  } else if (req.method === "DELETE") {
    return await controller.delete(req, res);
  } else {
    return res.status(405).json({ error: "Method not allowed" });
  }
});
```

**Cambios realizados:**

1. ✅ Importar `asyncHandler` de `@/middlewares/error-handler`
2. ✅ Eliminar import de `logger` (asyncHandler lo hace automáticamente)
3. ✅ Cambiar `export default async function handler` → `export default asyncHandler(async`
4. ✅ Eliminar todo el bloque try/catch
5. ✅ Eliminar logging manual
6. ✅ Cerrar con `})` al final

**Código eliminado:**

- ~10 líneas de try/catch
- ~2-3 líneas de logging
- ~3-5 líneas de manejo de error genérico

---

## 🔍 Casos Especiales

### Caso 1: Endpoint con Swagger Docs

**IMPORTANTE:** Preservar todos los comentarios JSDoc de Swagger

```typescript
/**
 * @swagger
 * /api/productos/{id}:
 *   get:
 *     summary: Obtener producto por ID
 *     tags: [Productos]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: UUID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
export default asyncHandler(async (req: NextApiRequest, res: NextApiResponse) => {
  // ... lógica
});
```

### Caso 2: Endpoint con Validación Previa

Si hay validación ANTES del try/catch, moverla DENTRO del asyncHandler:

```typescript
// ❌ INCORRECTO - Validación fuera de asyncHandler
export default async function handler(req, res) {
  if (!req.query.id) {
    return res.status(400).json({ error: "ID requerido" });
  }

  try {
    // ... lógica
  } catch (error) {
    // ...
  }
}

// ✅ CORRECTO - Validación dentro de asyncHandler
export default asyncHandler(async (req, res) => {
  if (!req.query.id) {
    return res.status(400).json({ error: "ID requerido" });
  }

  // ... lógica
});
```

### Caso 3: Endpoint con Múltiples Catch Blocks

Simplificar a un solo asyncHandler (el middleware maneja AppError correctamente):

```typescript
// ❌ ANTES - Múltiples catch blocks
try {
  // ... lógica
} catch (error) {
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  } else if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  } else {
    return res.status(500).json({ error: "Error interno" });
  }
}

// ✅ DESPUÉS - asyncHandler maneja todo
export default asyncHandler(async (req, res) => {
  // ... lógica (throw NotFoundError o ValidationError)
  // asyncHandler convierte automáticamente a código HTTP correcto
});
```

---

## 📊 Endpoints por Prioridad

### ALTA PRIORIDAD (Endpoints activos, ~40 endpoints)

**Pagos y Ventas:**

- `payment.ts`, `payments/[id].ts`, `payments/confirm.ts`, `payments/cancel.ts`, `payments/refund.ts`
- `ventas-app.ts`, `ventas-app/index.ts`

**Bookings:**

- `booking.ts`, `bookings/index.ts`, `bookings/[id]/approve.ts`, `bookings/[id]/cancel.ts`, `bookings/[id]/reschedule.ts`

**Inventario:**

- `inventory.ts`, `inventory_items.ts`
- `warehouse-inventory/*` (11 archivos)

**Productos:**

- `productos.ts`, `productos/[id].ts`, `products/index.ts`, `products/[id].ts`

**Caminos y Ubicaciones:**

- `caminos.ts`, `caminos/[id].ts`, `ubicaciones/[id].ts`, `ubicaciones/index.ts`

**Service Points:**

- `service-points/[id].ts`, `service-points/index.ts`, `service-points/[id]/revenue.ts`, `service-points/stats.ts`

**CSP (Customer Service Points):**

- `csp.ts` + 9 archivos de availability

### MEDIA PRIORIDAD (~30 endpoints)

**Servicios:**

- `services/*` (10 archivos)

**Vending Machines:**

- `vending-machine.ts`, `vending_machine.ts`, `vending-machines/[id].ts`, `vending-machines/index.ts`
- `vending-machine-slots/*` (4 archivos)

**Stock Requests:**

- `stock-requests/*` (10 archivos)

**Users:**

- `user.ts`, `users/[id].ts`, `users/index.ts`

### BAJA PRIORIDAD (~32 endpoints)

**Categorías y Tags:**

- `categories/*` (3 archivos), `subcategories/*` (2 archivos), `products/tags.ts`

**Service Types:**

- `service-types/[id].ts`, `service-types/index.ts`

**Workshops:**

- `workshop.ts`, `workshops/[id].ts`, `workshops/index.ts`

**Warehouses:**

- `warehouses/[id].ts`, `warehouses/index.ts`

**Otros:**

- `favorite.ts`, `review.ts`, `report.ts`, `partner.ts`, `taller_manager.ts`, `geolocation/[...path].ts`
- `swagger.ts`, `index.ts`

---

## ✅ Checklist de Migración

Para cada endpoint:

- [ ] Backup: Git commit antes de empezar batch
- [ ] Importar asyncHandler: `import { asyncHandler } from "@/middlewares/error-handler"`
- [ ] Eliminar import de logger (si solo se usa en catch)
- [ ] Cambiar firma: `export default async function handler` → `export default asyncHandler(async`
- [ ] Eliminar bloque try/catch completo
- [ ] Eliminar logging manual en catch
- [ ] Cerrar con `})` al final
- [ ] Preservar: Swagger docs, validaciones, lógica de negocio
- [ ] Tests: `npm test` después de cada 10 endpoints
- [ ] Commit: Cada 10-15 endpoints

---

## 🚨 Errores Comunes

### Error 1: Olvidar cerrar paréntesis

```typescript
// ❌ INCORRECTO
export default asyncHandler(async (req, res) => {
  // ...
}); // Falta un )

// ✅ CORRECTO
export default asyncHandler(async (req, res) => {
  // ...
}));
```

### Error 2: Eliminar validaciones importantes

```typescript
// ❌ INCORRECTO - Eliminaste validación crítica
export default asyncHandler(async (req, res) => {
  const result = await service.findById(req.query.id); // id puede ser undefined!
});

// ✅ CORRECTO - Preservar validaciones
export default asyncHandler(async (req, res) => {
  if (!req.query.id) {
    return res.status(400).json({ error: "ID requerido" });
  }
  const result = await service.findById(req.query.id as string);
});
```

### Error 3: Eliminar Swagger docs

```typescript
// ❌ INCORRECTO - Perdiste documentación API
export default asyncHandler(async (req, res) => {
  // ...
});

// ✅ CORRECTO - Preservar Swagger docs
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     summary: ...
 */
export default asyncHandler(async (req, res) => {
  // ...
});
```

---

## 📈 Progreso del Sprint

**Objetivo:** 122/122 endpoints (100% adoption)

**Estado actual:**

- ✅ Migrados: 20 endpoints (16.4%)
- 🔴 Pendientes: 102 endpoints (83.6%)

**Estrategia:**

- Batch 1: 40-50 endpoints de alta prioridad (Día 1)
- Batch 2: 52-62 endpoints restantes (Día 2)

**Commits:**

- Commit intermedio cada 10-15 endpoints
- Tests después de cada 10 endpoints
- Rollback fácil si hay problemas

---

## 🔗 Referencias

- **Middleware:** `src/middlewares/error-handler.ts` (línea ~15-30)
- **AppError Hierarchy:** `src/errors/custom-errors.ts`
- **Ejemplos migrados:** `pages/api/ventas-app/[id].ts`, `pages/api/precios/[id].ts`
- **Sprint Report:** `docs/sprints/SPRINT_6.3_COMPLETADO.md` (cuando termine)
