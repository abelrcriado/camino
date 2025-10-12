# 📋 BACKLOG - Tareas Pendientes

**Última actualización:** 12 de octubre de 2025  
**Versión:** 2.0 - **REORGANIZADO: Optimizaciones PRIMERO**

> 🔍 **ANÁLISIS COMPLETO DE INGENIERÍA:** Ver [`ANALISIS_INGENIERIA_OPTIMIZACION.md`](./ANALISIS_INGENIERIA_OPTIMIZACION.md)  
> Incluye: 5 Red Flags Críticos, 8 Mejoras Importantes, Plan de Acción Detallado

> ⚠️ **ESTRATEGIA NUEVA:** Implementar infraestructura y patrones de calidad ANTES de continuar con features.  
> **Objetivo:** No rehacer código, no refactorizar después. Todo el código nuevo ya usará las mejores prácticas.

---

## 🚨 FASE 1: FUNDAMENTOS DE CALIDAD (Sprints 6-7) - CRÍTICO

**Duración:** 8 días  
**Objetivo:** Establecer infraestructura de calidad para que TODO el código futuro sea production-ready desde día 1

---

## 🎯 Sprint 6: INFRAESTRUCTURA DE CÓDIGO (5 días)

**Meta:** Eliminar duplicación, establecer patrones, configurar herramientas ANTES de escribir más código

**Meta:** Eliminar duplicación, establecer patrones, configurar herramientas ANTES de escribir más código

### Sprint 6.1: asyncHandler + Eliminar console.log (2 días) 🔴 CRÍTICO

**Descripción:** Refactorizar TODOS los endpoints existentes con asyncHandler y eliminar console.log

**Por qué primero:**

- ✅ Wrapper `asyncHandler` YA EXISTE en `src/middlewares/error-handler.ts`
- ✅ Winston logger YA ESTÁ CONFIGURADO en `src/config/logger.ts`
- ✅ Solo necesita aplicarse, no desarrollar nada nuevo
- ✅ Todo código futuro usará estos patrones desde día 1

**Tasks DÍA 1 (asyncHandler):**

- [ ] Crear script automatizado `scripts/migrate-async-handler.sh`
- [ ] Ejecutar en 50+ endpoints (procesamiento batch)
- [ ] Validar tests después de cada batch
- [ ] Crear regla ESLint para requerir asyncHandler

**Tasks DÍA 2 (console.log):**

- [ ] Buscar todas las referencias: `grep -r "console\." src/`
- [ ] Reemplazar con Winston logger (30+ instancias)
- [ ] Añadir regla ESLint: `'no-console': ['error']`
- [ ] Validar tests completos

**Archivos afectados:**

```bash
# asyncHandler
pages/api/**/*.ts  (50+ archivos)

# console.log
src/services/stock-request.service.ts (16 instancias)
src/controllers/stock-request.controller.ts (10 instancias)
src/services/payment.service.ts (2 instancias)
src/controllers/inventory.controller.ts (3 instancias)
# ... 30+ total
```

**Script de migración:**

```bash
#!/bin/bash
# scripts/migrate-async-handler.sh

echo "🔄 Migrando endpoints a asyncHandler..."

files=$(grep -rl "export default async function handler" pages/api/)
total=$(echo "$files" | wc -l)
count=0

for file in $files; do
  count=$((count + 1))
  echo "[$count/$total] Processing: $file"

  # Backup
  cp "$file" "$file.bak"

  # Transform (usar sed/awk para reemplazar patrón)
  # ... transformaciones automáticas

  # Run tests para este endpoint
  npm test -- "$file.test.ts" --silent

  if [ $? -eq 0 ]; then
    echo "  ✅ Migrated successfully"
    rm "$file.bak"
  else
    echo "  ❌ Tests failed, reverting"
    mv "$file.bak" "$file"
  fi
done

echo "✅ Migration complete: $count endpoints"
```

**ESLint rules nuevas:**

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      // ❌ No permitir console.log
      "no-console": ["error", { allow: [] }],

      // ⚠️ Advertir si función async sin asyncHandler
      // (regla custom a implementar)
    },
  },
];
```

**Criterios de Éxito:**

- ✅ 50+ endpoints refactorizados con asyncHandler
- ✅ Zero console.log en src/
- ✅ Tests: 2421/2421 pasando (100%)
- ✅ ESLint rules configuradas
- ✅ Reducción de código: ~250 líneas eliminadas

**Impacto en código futuro:**

- ✅ TODOS los nuevos endpoints DEBEN usar asyncHandler (validado por ESLint)
- ✅ TODOS los logs DEBEN usar Winston (validado por ESLint)
- ✅ No más try/catch duplicado
- ✅ No más debugging imposible en producción

---

### Sprint 6.2: Coverage Threshold + Aplicar Utilidades (3 días)

**Descripción:** Ajustar thresholds y refactorizar endpoints con utilities de Sprint 5.3

**Tasks DÍA 1 (Coverage):**

- [ ] Ajustar `jest.config.js` threshold a 95%
- [ ] Ejecutar tests para validar
- [ ] Documentar en CONTRIBUTING.md

**Tasks DÍA 2-3 (Utilidades):**

- [ ] Refactorizar 10-15 endpoints con `ErrorMessages`
- [ ] Refactorizar 10-15 endpoints con `validateUUID/validateUUIDs`
- [ ] Refactorizar 5-8 endpoints con `validateOwnership`
- [ ] Refactorizar 8-10 endpoints con `pagination.ts`
- [ ] Actualizar tests
- [ ] Documento Before/After

**Endpoints prioritarios:**

```typescript
// Con ErrorMessages + validateUUID
pages / api / booking.ts;
pages / api / payment.ts;
pages / api / inventory.ts;
pages / api / user.ts;
pages / api / workshop.ts;

// Con validateOwnership
pages / api / workshops / [id] / services.ts;
pages / api / ubicaciones / [id] / service - points.ts;
pages / api / vending - machines / [id] / slots / [slotId].ts;

// Con pagination
pages / api / precios.ts;
pages / api / service - points / index.ts;
pages / api / products / index.ts;
```

**Criterios de Éxito:**

- ✅ Coverage threshold: 95% (actual: 99.72%)
- ✅ 10-15 endpoints refactorizados
- ✅ Tests siguen pasando
- ✅ Documento Before/After creado

---

## 🎯 Sprint 7: INFRAESTRUCTURA DE SEGURIDAD & DB (3 días)

**Meta:** Transacciones, rate limiting, secrets management ANTES de features críticas

### Sprint 7.1: Transacciones PostgreSQL con RPC (2 días) 🔴 CRÍTICO

**Descripción:** Crear funciones RPC transaccionales para operaciones críticas

**Por qué primero:**

- ✅ Evita inconsistencia de datos en TODAS las features futuras
- ✅ Stock requests, payments, bookings ya existen sin transacciones
- ✅ Cualquier feature nueva que toque múltiples tablas NECESITA esto

**Tasks:**

- [ ] Crear función RPC: `create_stock_request_tx`
- [ ] Crear función RPC: `process_payment_tx`
- [ ] Crear función RPC: `create_booking_tx`
- [ ] Crear función RPC: `create_venta_app_tx`
- [ ] Crear función RPC: `assign_service_tx`
- [ ] Refactorizar servicios para usar RPCs
- [ ] Tests de rollback (simular errores)

**Ejemplo SQL:**

```sql
-- supabase/migrations/20251013_100000_create_stock_request_tx.sql
CREATE OR REPLACE FUNCTION create_stock_request_tx(
  p_request_data jsonb,
  p_quantity integer,
  p_product_id uuid,
  p_warehouse_id uuid
) RETURNS jsonb AS $$
DECLARE
  v_request_id uuid;
  v_movement_id uuid;
  v_available integer;
BEGIN
  -- 1. Verificar stock disponible
  SELECT available_quantity INTO v_available
  FROM warehouse_stock
  WHERE warehouse_id = p_warehouse_id
    AND product_id = p_product_id;

  IF v_available < p_quantity THEN
    RAISE EXCEPTION 'Insufficient stock: available=%, requested=%', v_available, p_quantity;
  END IF;

  -- 2. Crear stock request
  INSERT INTO stock_requests (...)
  VALUES (...) RETURNING id INTO v_request_id;

  -- 3. Reservar stock
  UPDATE warehouse_stock
  SET reserved_quantity = reserved_quantity + p_quantity,
      available_quantity = available_quantity - p_quantity
  WHERE warehouse_id = p_warehouse_id
    AND product_id = p_product_id;

  -- 4. Crear movimiento
  INSERT INTO stock_movements (...)
  VALUES (...) RETURNING id INTO v_movement_id;

  -- 5. Retornar resultado
  RETURN jsonb_build_object(
    'request_id', v_request_id,
    'movement_id', v_movement_id,
    'status', 'success'
  );

EXCEPTION WHEN OTHERS THEN
  -- Rollback automático de PostgreSQL
  RAISE;
END;
$$ LANGUAGE plpgsql;
```

**Uso en service:**

```typescript
// src/services/stock-request.service.ts
async createRequest(data: CreateStockRequestDto) {
  // ✅ ANTES: Sin transacción (3 operaciones separadas, puede fallar)
  // const request = await this.repository.create(data);
  // await warehouseStock.update(...); // Puede fallar aquí
  // await stockMovement.create(...);  // O aquí

  // ✅ DESPUÉS: Con transacción (todo o nada)
  const { data: result, error } = await this.db.rpc('create_stock_request_tx', {
    p_request_data: data,
    p_quantity: data.quantity,
    p_product_id: data.product_id,
    p_warehouse_id: data.source_warehouse_id,
  });

  if (error) throw new DatabaseError(error.message);
  return result;
}
```

**Criterios de Éxito:**

- ✅ 5 funciones RPC creadas y testeadas
- ✅ Servicios refactorizados
- ✅ Tests de rollback pasando
- ✅ Documentación en ARCHITECTURE.md

**Impacto en código futuro:**

- ✅ TODAS las operaciones multi-tabla DEBEN usar RPCs
- ✅ Pattern establecido para nuevas transacciones
- ✅ Zero inconsistencia de datos

---

### Sprint 7.2: Rate Limiting + Secrets (1 día)

**Descripción:** Proteger API y configurar secrets management

**Tasks (Rate Limiting):**

- [ ] Instalar Upstash Rate Limit (sin Redis, más simple)
- [ ] Crear `middleware.ts` en raíz del proyecto
- [ ] Configurar límites por endpoint
- [ ] Tests de rate limiting

**Tasks (Secrets):**

- [ ] Mover secrets a Vercel Environment Variables
- [ ] Crear script `scripts/setup-secrets.sh`
- [ ] Documentar en CONTRIBUTING.md
- [ ] Eliminar `.env` del tracking (ya en .gitignore)

**Configuración rate limiting:**

```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 req/min general
});

// Rate limits específicos por path
const customLimits = {
  "/api/payment": Ratelimit.slidingWindow(10, "1 m"), // 10 req/min
  "/api/booking": Ratelimit.slidingWindow(30, "1 m"), // 30 req/min
  "/api/user": Ratelimit.slidingWindow(5, "1 h"), // 5 req/hora (registro)
};

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const ip = request.ip || "anonymous";

  // Seleccionar limiter apropiado
  const limiter = customLimits[path] || ratelimit;

  const { success, remaining } = await limiter.limit(`${ip}:${path}`);

  if (!success) {
    return NextResponse.json(
      {
        error: "Rate limit exceeded",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: 60,
      },
      { status: 429 },
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Remaining", remaining.toString());
  return response;
}

export const config = {
  matcher: "/api/:path*",
};
```

**Criterios de Éxito:**

- ✅ Rate limiting funcional
- ✅ Endpoints críticos protegidos
- ✅ Secrets en Vercel
- ✅ Tests de rate limiting pasando

**Impacto en código futuro:**

- ✅ API protegida contra DoS/abuso
- ✅ Secrets nunca en código
- ✅ Configuración por ambiente (dev/prod)

---

## 📊 FASE 2: FEATURES CON CALIDAD (Sprints 8-10)

**Duración:** 12 días  
**Objetivo:** Implementar features usando TODOS los patrones establecidos en Fase 1

> ⚠️ **REGLA ESTRICTA:** Ningún PR se acepta si no usa:
>
> - ✅ asyncHandler en endpoints
> - ✅ Winston logger (zero console.log)
> - ✅ ErrorMessages constants
> - ✅ validateUUID/validateOwnership donde aplique
> - ✅ RPCs para operaciones multi-tabla
> - ✅ Tests con coverage >95%

---

## 🎯 Sprint 8: INVENTORY ADVANCED (5 días)

## 🎯 Sprint 8: INVENTORY ADVANCED (5 días)

**Meta:** Implementar trazabilidad de inventario con TODOS los patrones de calidad

### Sprint 8.1: Stock Movements (3 días)

**Descripción:** Sistema completo de movimientos de stock

**Tasks:**

- [ ] Migración: tabla `stock_movements` con índices
- [ ] DTO: `StockMovement` interface completo
- [ ] Repository: `StockMovementRepository extends BaseRepository<StockMovement>`
- [ ] Service: `StockMovementService extends BaseService<StockMovement>`
- [ ] Controller: usando asyncHandler + ErrorMessages + validateUUID
- [ ] Endpoint POST: usando RPC `create_stock_movement_tx`
- [ ] Endpoint GET: usando pagination helpers
- [ ] Tests: 50+ tests unitarios (coverage >95%)

**Patrón de endpoint (YA CON CALIDAD):**

```typescript
// pages/api/stock-movements.ts
import { asyncHandler } from "@/middlewares/error-handler";
import { StockMovementController } from "@/controllers/stock-movement.controller";

/**
 * @swagger
 * /api/stock-movements:
 *   post:
 *     summary: Crear movimiento de stock
 *     tags: [Inventory]
 */
export default asyncHandler(async (req, res) => {
  // ✅ No try/catch - asyncHandler lo maneja
  // ✅ Controller usa ErrorMessages
  // ✅ Controller usa validateUUID
  // ✅ Service usa RPC transaccional
  const controller = new StockMovementController();
  return controller.handleRequest(req, res);
});
```

**Controller pattern:**

```typescript
// src/controllers/stock-movement.controller.ts
import { asyncHandler } from "@/middlewares/error-handler";
import { ErrorMessages } from "@/constants/error-messages";
import { validateUUID } from "@/middlewares/validate-uuid";
import logger from "@/config/logger"; // ✅ No console.log

export class StockMovementController {
  async handleRequest(req, res) {
    if (req.method === "POST") return this.create(req, res);
    if (req.method === "GET") return this.list(req, res);
    return res.status(405).json({ error: ErrorMessages.METHOD_NOT_ALLOWED });
  }

  private async create(req, res) {
    const error = validateUUID(req.body.product_id, "producto");
    if (error) return res.status(400).json({ error });

    logger.info("Creating stock movement", {
      productId: req.body.product_id,
      quantity: req.body.quantity,
    });

    // ✅ Service usa RPC transaccional
    const movement = await this.service.create(req.body);
    return res.status(201).json({ data: [movement] });
  }
}
```

**Criterios de Éxito:**

- ✅ asyncHandler en endpoint
- ✅ ErrorMessages en controller
- ✅ validateUUID en controller
- ✅ Winston logger (zero console.log)
- ✅ RPC transaccional en service
- ✅ Tests >95% coverage
- ✅ Swagger docs completo

---

### Sprint 8.2: Restock Rules + Alerts (2 días)

**Descripción:** Alertas automáticas de stock bajo

**Tasks:**

- [ ] Migración: tabla `restock_rules`
- [ ] DTO + Repository + Service + Controller (patrón estándar)
- [ ] Endpoint: POST/GET `/api/restock-rules` (con asyncHandler)
- [ ] Endpoint: GET `/api/restock-alerts` (con pagination)
- [ ] Cron job: verificación cada hora
- [ ] Tests: 30+ tests unitarios

**Criterios de Éxito:**

- ✅ Todos los patrones de calidad aplicados
- ✅ Cron job funcional
- ✅ Tests >95%

---

## 🎯 Sprint 9: TESTING & OBSERVABILITY (4 días)

**Meta:** Configurar testing e2e y monitoring ANTES de más features

### Sprint 9.1: E2E Testing + CI/CD (2 días)

**Descripción:** Playwright + GitHub Actions

**Tasks:**

- [ ] Instalar Playwright
- [ ] Test E2E: Flujo de venta completa
- [ ] Test E2E: Flujo de reposición
- [ ] GitHub Actions: CI/CD pipeline
- [ ] GitHub Actions: Tests automáticos en PR

**GitHub Actions config:**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  pull_request:
    branches: [master, develop]
  push:
    branches: [master]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
          cache: "npm"

      - name: Install
        run: npm ci

      - name: Lint
        run: npm run lint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install
        run: npm ci

      - name: Unit Tests
        run: npm test -- --coverage

      - name: Check Coverage Threshold (95%)
        run: npm test -- --coverage --coverageThreshold='{"global":{"statements":95,"branches":90,"functions":95,"lines":95}}'

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - name: Install
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E Tests
        run: npm run test:e2e

      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [lint, test, e2e]
    if: github.ref == 'refs/heads/master'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

**Criterios de Éxito:**

- ✅ 20+ tests E2E
- ✅ CI/CD funcionando
- ✅ Deploy automático en master

---

### Sprint 9.2: Error Monitoring + Health Check (2 días)

**Descripción:** Sentry + health endpoint

**Tasks:**

- [ ] Configurar Sentry
- [ ] Integrar con error-handler.ts
- [ ] Crear endpoint `/api/health`
- [ ] Health checks: DB, Stripe, Redis
- [ ] Alertas Slack para errores críticos

**Health check endpoint:**

```typescript
// pages/api/health.ts
import { asyncHandler } from "@/middlewares/error-handler";
import logger from "@/config/logger";

export default asyncHandler(async (req, res) => {
  const startTime = Date.now();

  const checks = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    version: process.env.npm_package_version || "0.1.0",
    database: await checkDatabase(),
    stripe: await checkStripe(),
    redis: await checkRedis(),
  };

  const isHealthy = Object.values(checks)
    .filter((c) => typeof c === "object")
    .every((c: any) => c.status === "ok");

  const responseTime = Date.now() - startTime;

  logger.info("Health check completed", {
    healthy: isHealthy,
    responseTime,
  });

  return res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "healthy" : "degraded",
    checks,
    responseTime,
  });
});

async function checkDatabase() {
  try {
    const { error } = await supabase.from("usuarios").select("id").limit(1);
    return { status: error ? "error" : "ok", message: error?.message };
  } catch (err) {
    return { status: "error", message: err.message };
  }
}

async function checkStripe() {
  try {
    await stripe.paymentIntents.list({ limit: 1 });
    return { status: "ok" };
  } catch (err) {
    return { status: "error", message: err.message };
  }
}

async function checkRedis() {
  try {
    if (!redis) return { status: "not_configured" };
    await redis.ping();
    return { status: "ok" };
  } catch (err) {
    return { status: "error", message: err.message };
  }
}
```

**Criterios de Éxito:**

- ✅ Sentry capturando errores
- ✅ Health check funcional
- ✅ Alertas Slack configuradas

---

## 🎯 Sprint 10: PERFORMANCE & CACHING (3 días)

**Meta:** Redis cache + APM antes de más features

### Sprint 10.1: Redis Caching (2 días)

**Descripción:** Cache layer para queries frecuentes

**Tasks:**

- [ ] Configurar Upstash Redis
- [ ] Crear `CacheService` con TTL
- [ ] Cache: productos (1h)
- [ ] Cache: caminos (24h)
- [ ] Cache: precios (30min)
- [ ] Cache: service-points (15min)
- [ ] Cache: availability (2min)
- [ ] Tests de invalidación

**Cache service pattern:**

```typescript
// src/services/cache.service.ts
import { Redis } from "@upstash/redis";
import logger from "@/config/logger";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key);
      if (cached) {
        logger.debug("Cache hit", { key });
        return cached as T;
      }
      logger.debug("Cache miss", { key });
      return null;
    } catch (error) {
      logger.error("Cache get error", { key, error });
      return null; // Fail gracefully
    }
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await redis.setex(key, ttl, value);
      logger.debug("Cache set", { key, ttl });
    } catch (error) {
      logger.error("Cache set error", { key, error });
    }
  }

  async invalidate(pattern: string): Promise<void> {
    logger.info("Cache invalidation", { pattern });
    // Implementar invalidación por patrón
  }
}

// Uso en service
export async function withCache<T>(key: string, ttl: number, fetchFn: () => Promise<T>): Promise<T> {
  const cache = new CacheService();

  const cached = await cache.get<T>(key);
  if (cached) return cached;

  const data = await fetchFn();
  await cache.set(key, data, ttl);
  return data;
}
```

**Uso en ProductoService:**

```typescript
// src/services/producto.service.ts
async findAll(filters, pagination) {
  const cacheKey = `productos:${JSON.stringify({ filters, pagination })}`;

  return withCache(cacheKey, 3600, async () => {
    return super.findAll(filters, pagination);
  });
}

async update(id, data) {
  const updated = await super.update(id, data);

  // Invalidar caché
  await cacheService.invalidate('productos:*');

  return updated;
}
```

**Criterios de Éxito:**

- ✅ Redis configurado
- ✅ 5 servicios con cache
- ✅ Invalidación automática
- ✅ Tests de cache

---

### Sprint 10.2: APM Metrics (1 día)

**Descripción:** Métricas de performance con Prometheus

**Tasks:**

- [ ] Instalar prom-client
- [ ] Endpoint `/api/metrics`
- [ ] Métricas: http_request_duration
- [ ] Métricas: http_request_total
- [ ] Métricas: db_query_duration
- [ ] Dashboard Grafana (opcional)

**Criterios de Éxito:**

- ✅ Métricas expuestas
- ✅ Endpoint funcional

---

## 📊 FASE 3: FEATURES AVANZADAS (Sprints 11+)

**Duración:** Variable  
**Objetivo:** Features con infraestructura de calidad completa

> ⚠️ **CHECKPOINT:** Antes de iniciar Fase 3, validar:
>
> - ✅ asyncHandler en 100% de endpoints
> - ✅ Zero console.log
> - ✅ Coverage >95%
> - ✅ Transacciones en operaciones críticas
> - ✅ Rate limiting activo
> - ✅ CI/CD funcionando
> - ✅ Sentry monitoreando
> - ✅ Redis cacheando
> - ✅ Health check operativo

---

## 🎯 Sprint 11: DASHBOARD REAL-TIME (3 días)

**Meta:** Dashboard con WebSocket y gráficos

**Tasks:**

- [ ] Vista: Stock por ubicación con mapa
- [ ] Vista: Gráficos de rotación
- [ ] Vista: Alertas en tiempo real
- [ ] Panel: Pedidos pendientes
- [ ] Panel: Historial de movimientos
- [ ] WebSocket: Updates real-time con Socket.io
- [ ] Tests E2E de dashboard

**Criterios de Éxito:**

- ✅ 4 páginas nuevas
- ✅ WebSocket funcional
- ✅ Tests E2E pasando

---

## 🎯 Sprint 12: REPORTING & ANALYTICS (2 días)

## 🎯 Sprint 12: REPORTING & ANALYTICS (2 días)

**Meta:** Reportes y analytics con datos cacheados

**Tasks:**

- [ ] Endpoint: GET `/api/analytics/sales-by-service-point`
- [ ] Endpoint: GET `/api/analytics/top-products`
- [ ] Endpoint: GET `/api/analytics/revenue-by-location`
- [ ] Endpoint: GET `/api/analytics/stock-rotation`
- [ ] Dashboard: Gráficos con Recharts
- [ ] Exportación: CSV/PDF
- [ ] Tests de analytics

**Criterios de Éxito:**

- ✅ 4 endpoints de analytics
- ✅ Dashboard con gráficos
- ✅ Exportación funcional

---

## 🔮 SPRINTS FUTUROS (13+)

### Sprint 13-14: Autenticación & Autorización (4 días)

**Tasks:**

- [ ] Roles granulares con RLS de Supabase
- [ ] Permisos por service point
- [ ] Audit log de acciones
- [ ] Tests de autorización
- [ ] Middleware de permisos

### Sprint 15-17: Sistema de Notificaciones (5 días)

**Tasks:**

- [ ] Notificaciones push (Firebase Cloud Messaging)
- [ ] Emails automáticos (Resend/SendGrid)
- [ ] Webhooks para integraciones
- [ ] Cola de mensajes con BullMQ
- [ ] Tests de notificaciones

### Sprint 18-22: Mobile App (10 días)

**Tasks:**

- [ ] Setup React Native + Expo
- [ ] App para peregrinos
- [ ] Escaneo QR para retiro
- [ ] Pago in-app con Stripe
- [ ] Sincronización offline
- [ ] Tests E2E móvil con Detox

### Sprint 23-25: API Externa (5 días)

**Tasks:**

- [ ] API keys management
- [ ] Rate limiting por API key
- [ ] Documentación OpenAPI completa
- [ ] SDK en JavaScript/Python
- [ ] Tests de integración externa

### Sprint 26+: Machine Learning (Variable)

**Tasks:**

- [ ] Predicción de demanda (Prophet/TensorFlow)
- [ ] Optimización de stock (algoritmos genéticos)
- [ ] Detección de anomalías (Isolation Forest)
- [ ] Modelo de recomendación (Collaborative Filtering)
- [ ] Pipeline de ML con MLflow

---

## 🐛 BUGS CONOCIDOS (Resueltos en Fase 1)

### ✅ Eliminados en Sprint 6.1

1. **try/catch duplicado** → asyncHandler
2. **console.log en producción** → Winston logger
3. **Validación manual de UUID** → validateUUID middleware
4. **Mensajes de error inconsistentes** → ErrorMessages constants

### ✅ Eliminados en Sprint 7.1

5. **Sin transacciones** → RPCs PostgreSQL
6. **Inconsistencia de datos** → Funciones transaccionales

### ✅ Eliminados en Sprint 7.2

7. **Sin rate limiting** → Upstash Rate Limit
8. **Secrets en código** → Vercel Environment Variables

---

## 📝 MEJORAS TÉCNICAS (Implementadas en Fase 1-2)

### ✅ Arquitectura

- [x] asyncHandler en todos los endpoints
- [x] Winston logger centralizado
- [x] Transacciones RPC para operaciones críticas
- [x] Rate limiting por endpoint
- [x] Coverage threshold 95%
- [x] CI/CD con GitHub Actions
- [x] Error monitoring con Sentry
- [x] Cache layer con Redis
- [x] Health check endpoint
- [x] APM metrics con Prometheus

### 📋 Pendientes (Sprints 13+)

- [ ] Feature flags con LaunchDarkly
- [ ] A/B testing framework
- [ ] GraphQL API (alternativa a REST)
- [ ] WebSocket real-time (Socket.io)
- [ ] Offline-first architecture (Service Workers)

---

## 📊 MÉTRICAS DE PROGRESO

### Estado Actual

**Sprint Actual:** Sprint 5.3 COMPLETADO  
**Próximo Sprint:** Sprint 6.1 (FUNDAMENTOS DE CALIDAD)

**Fase 1 (Sprints 6-7):** 🔴 CRÍTICO - NO INICIAR
**Fase 2 (Sprints 8-10):** ⏸️ BLOQUEADO hasta Fase 1 completa  
**Fase 3 (Sprints 11+):** ⏸️ BLOQUEADO hasta Fase 2 completa

### Progreso por Fase

| Fase                             | Sprints | Días     | Estado       | Completo |
| -------------------------------- | ------- | -------- | ------------ | -------- |
| **Fase 1: Fundamentos**          | 6-7     | 8 días   | 🔴 Pendiente | 0%       |
| **Fase 2: Features con Calidad** | 8-10    | 12 días  | ⏸️ Bloqueado | 0%       |
| **Fase 3: Features Avanzadas**   | 11-12   | 5 días   | ⏸️ Bloqueado | 0%       |
| **Sprints Futuros**              | 13+     | Variable | 📋 Planeado  | 0%       |

### Test Health (Actual)

- ✅ 2421/2421 tests pasando (100%)
- ✅ 99.72% coverage
- ✅ Zero errores de lint
- ❌ Coverage threshold: 50% (debe ser 95%)
- ❌ asyncHandler: 0% adoption (debe ser 100%)
- ❌ console.log: 30+ instancias (debe ser 0)

### Métricas Objetivo (Fin de Fase 1)

- ✅ 2421+ tests pasando (100%)
- ✅ >95% coverage
- ✅ Zero errores de lint
- ✅ Coverage threshold: 95%
- ✅ asyncHandler: 100% adoption
- ✅ console.log: 0 instancias
- ✅ Transacciones: 5/5 operaciones críticas
- ✅ Rate limiting: Activo
- ✅ CI/CD: Funcionando

---

## 🎯 ESTRATEGIA DE IMPLEMENTACIÓN

### Regla de Oro

> **"NO MÁS CÓDIGO NUEVO SIN PATRONES DE CALIDAD"**

### Bloqueadores de PR

Un PR NO puede ser mergeado si:

❌ No usa `asyncHandler` en endpoints  
❌ Tiene `console.log/error` en vez de Winston  
❌ Validación manual de UUID en vez de `validateUUID`  
❌ Mensajes de error hardcoded en vez de `ErrorMessages`  
❌ Operación multi-tabla sin RPC transaccional  
❌ Coverage cae por debajo de 95%  
❌ Tests fallan  
❌ Lint errors

### Checklist de PR (MANDATORY)

```markdown
## Checklist de Calidad

- [ ] ✅ asyncHandler usado en todos los endpoints nuevos
- [ ] ✅ Winston logger (zero console.log)
- [ ] ✅ ErrorMessages constants
- [ ] ✅ validateUUID/validateOwnership donde aplique
- [ ] ✅ RPC transaccional si toca múltiples tablas
- [ ] ✅ Tests escritos (coverage >95%)
- [ ] ✅ Swagger docs actualizado
- [ ] ✅ CHANGELOG actualizado (si aplica)
- [ ] ✅ Lint passing (npm run lint)
- [ ] ✅ Tests passing (npm test)

## Descripción

<!-- Qué resuelve este PR -->

## Testing

<!-- Cómo testear manualmente -->

## Screenshots

<!-- Si aplica -->
```

### Proceso de Code Review

1. **Automated checks (CI/CD)**
   - Lint passing
   - Tests passing (coverage >95%)
   - Build successful

2. **Manual review**
   - Patrones de calidad aplicados
   - Código legible y mantenible
   - Documentación actualizada

3. **Approval**
   - 1 approval mínimo
   - Checks passing
   - Merge to develop

4. **Deploy**
   - Merge develop → master
   - Automated deployment (Vercel)
   - Health check verification

---

## 🔄 PROCESO DE ACTUALIZACIÓN

### MANDATORY: Actualizar BACKLOG

**Cuándo:**

1. ✅ Al completar un sprint → Mover tasks a `COMPLETED_SPRINTS.md`
2. ✅ Al identificar nueva tarea → Añadir a fase apropiada
3. ✅ Al cambiar prioridad → Reorganizar fases
4. ✅ Al descubrir bug → Añadir a "Bugs Conocidos" (si no se arregla inmediatamente)

**Frecuencia:** Al final de cada sprint o bloque de trabajo

**Responsable:** Developer + Copilot

### MANDATORY: Proceso de 5 Pasos

Al completar CUALQUIER sprint:

1. **Generate CHANGELOG**: `npm run release`
2. **Create Sprint Report**: `cp docs/templates/SPRINT_REPORT_TEMPLATE.md docs/sprints/SPRINT_X.X_COMPLETADO.md`
3. **Update COMPLETED_SPRINTS.md**: Add entry at top
4. **Update BACKLOG.md**: Move completed tasks, adjust priorities
5. **Update ROADMAP.md**: Mark sprint ✅ COMPLETADO

**Si falta un paso → Sprint NO completo** (no exceptions)

---

## 📖 REFERENCIAS

### Documentos Relacionados

- [ROADMAP.md](ROADMAP.md) - Visión general de sprints y fases
- [COMPLETED_SPRINTS.md](COMPLETED_SPRINTS.md) - Historial de sprints completados
- [ANALISIS_INGENIERIA_OPTIMIZACION.md](ANALISIS_INGENIERIA_OPTIMIZACION.md) - Análisis técnico completo
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura del sistema
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guía de contribución
- [CHANGELOG.md](../CHANGELOG.md) - Historial de cambios

### Estándares de Industria

- **Code Coverage:** [Google Testing Blog](https://testing.googleblog.com/2020/08/code-coverage-best-practices.html)
- **Rate Limiting:** [OWASP API Security](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/)
- **Transactions:** [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don%27t_Do_This)
- **Clean Code:** [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)

### Herramientas Configuradas

- ✅ **Jest**: Testing framework
- ✅ **ESLint**: Code linting
- ✅ **Prettier**: Code formatting
- ✅ **Husky**: Git hooks
- ✅ **Commitizen**: Conventional commits
- ✅ **Standard-version**: Semantic versioning
- ⏳ **Playwright**: E2E testing (Sprint 9.1)
- ⏳ **Sentry**: Error monitoring (Sprint 9.2)
- ⏳ **Upstash**: Redis & Rate limiting (Sprint 7.2, 10.1)
- ⏳ **Prometheus**: APM metrics (Sprint 10.2)

---

**Última actualización:** 12 de octubre de 2025  
**Versión:** 2.0 - Reorganizado con optimizaciones primero  
**Próxima revisión:** Al completar Sprint 6.1

---

**Estado del Proyecto:**

```
┌─────────────────────────────────────────────────────────┐
│  🎯 ESTRATEGIA: CALIDAD PRIMERO                         │
│                                                           │
│  Fase 1: FUNDAMENTOS (8 días) ────────────▶ CRÍTICO     │
│  ├─ Sprint 6.1: asyncHandler + logger (2d) 🔴           │
│  ├─ Sprint 6.2: Utilidades + Coverage (3d) 🔴           │
│  └─ Sprint 7: Transacciones + Security (3d) 🔴          │
│                                                           │
│  Fase 2: FEATURES CON CALIDAD (12 días) ──▶ BLOQUEADO   │
│  Fase 3: FEATURES AVANZADAS (5+ días) ────▶ BLOQUEADO   │
│                                                           │
│  📊 Métricas Actuales:                                   │
│  ✅ Tests: 2421/2421 (100%)                              │
│  ✅ Coverage: 99.72%                                     │
│  ❌ asyncHandler: 0%                                     │
│  ❌ console.log: 30+                                     │
│  ❌ Transacciones: 0/5                                   │
│                                                           │
│  🚀 Próxima Acción: Sprint 6.1 (asyncHandler + logger)  │
└─────────────────────────────────────────────────────────┘
```
