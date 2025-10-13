# 🗺️ ROADMAP - Camino Service Backend

**Última actualización:** 13 de octubre de 2025  
**Versión:** 2.1 (Post-Sprint 6.1: console.log eliminado)  
**Versión del código:** v0.3.0

> ⚠️ **CAMBIO ESTRATÉGICO:** Este ROADMAP ha sido completamente reorganizado siguiendo la estrategia **"CALIDAD PRIMERO"**. Todas las optimizaciones de infraestructura se completan ANTES de continuar con nuevas features. Ver `docs/ANALISIS_INGENIERIA_OPTIMIZACION.md` para el análisis completo.

---

## 📊 Estado Actual del Proyecto

### ✅ Completado (Sprints 1-5)

**Sprint 1-2: Base de Datos y Jerarquía** ✅

- Tablas core implementadas (42 tablas en producción)
- Jerarquía: Caminos → Ubicaciones → Service Points → Servicios
- Sistema de precios jerárquico (BASE → UBICACION → SERVICE_POINT)
- Máquinas vending con slots

**Sprint 3-4: Lógica de Negocio** ✅

- DTOs, Repositories, Services completos (29 repositories, 25 services)
- Sistema de ventas con reservas y códigos de retiro
- Integración Stripe para pagos
- Inventario básico en vending machines

**Sprint 5.1: Endpoints API** ✅ (16 endpoints nuevos)

- Caminos y Ubicaciones (5 endpoints)
- Productos y Vending Slots (5 endpoints)
- Ventas App y Precios (6 endpoints)
- Documentación Swagger completa

**Sprint 5.2: Tests Unitarios** ✅ (254 tests, 99.72% coverage)

- 16 archivos de test creados (~4,800 líneas)
- 2421 tests pasando (100% success rate)
- Patrones de testing documentados

**Sprint 5.3: Refactoring y Utilidades** ✅

- error-messages.ts (242 líneas, 50+ constantes)
- validate-uuid.ts (185 líneas, 6 funciones)
- validate-ownership.ts (215 líneas, 6 funciones)
- pagination.ts (332 líneas, 8 funciones)
- 3 endpoints refactorizados como ejemplo

**Sprint 5.4: Documentación y Análisis** ✅

- Sistema Mandatory de Documentación implementado
- Git profesional configurado (Husky, Conventional Commits)
- Primera release: v0.1.0 con CHANGELOG.md
- Análisis de ingeniería completo (5 red flags, 8 mejoras)
- BACKLOG reorganizado con estrategia de 3 fases

### 📈 Métricas del Sistema

| Métrica               | Valor Actual                    | Objetivo Fase 1            |
| --------------------- | ------------------------------- | -------------------------- |
| **Tablas en BD**      | 42 tablas                       | 42 + 5 RPC functions       |
| **Endpoints API**     | 35+ endpoints activos           | 35+ (refactorizados)       |
| **Tests**             | 2421 tests (100% passing)       | 2421+ (100% passing)       |
| **Coverage**          | 99.72% promedio                 | 99%+ mantenido             |
| **asyncHandler**      | 16% adoption (20/122 endpoints) | **100% adoption** 🎯       |
| **console.log**       | ✅ 0 instancias (v0.3.0)        | **0 instancias** ✅        |
| **Transacciones**     | 0/5 operaciones                 | **5/5 operaciones** 🎯     |
| **Rate Limiting**     | ❌ No implementado              | **✅ Activo** 🎯           |
| **DTOs**              | 29 interfaces                   | 29 interfaces              |
| **Repositories**      | 29 clases                       | 29 clases                  |
| **Services**          | 25 clases                       | 25 clases                  |
| **Controllers**       | 13 clases                       | 13 clases                  |
| **Arquitectura**      | Clean Architecture 5-layer      | Clean Architecture 5-layer |
| **TypeScript Errors** | 0                               | 0                          |
| **Lint Errors**       | 0                               | 0                          |

---

## 🚨 RED FLAGS CRÍTICOS IDENTIFICADOS

En el análisis de ingeniería se identificaron **5 Red Flags Críticos** que deben resolverse ANTES de continuar con features:

### 1. asyncHandler No Usado (Alta Prioridad) 🔴

- **Problema:** Existe en `error-handler.ts` pero 0% adoption
- **Impacto:** 50+ endpoints con try/catch duplicado (250+ líneas repetidas)
- **Solución:** Sprint 6.1 - Migración masiva con script automatizado

### 2. console.log en Producción (Alta Prioridad) 🔴

- **Problema:** 30+ instancias de console.log/error/warn
- **Impacto:** Winston configurado pero no usado, logs no estructurados
- **Solución:** Sprint 6.1 - Reemplazo masivo con ESLint enforcement

### 3. Sin Transacciones (Crítico para Integridad) 🔴

- **Problema:** Operaciones multi-tabla sin rollback (stock, pagos, bookings)
- **Impacto:** Riesgo de inconsistencia de datos
- **Solución:** Sprint 7.1 - PostgreSQL RPC functions transaccionales

### 4. Coverage Threshold Bajo (Calidad) 🟡

- **Problema:** Jest configurado con 50% threshold (industria: 80-90%)
- **Impacto:** Riesgo de regresiones, coverage actual 99.72% no protegido
- **Solución:** Sprint 6.2 - Ajustar threshold a 95%

### 5. Sin Rate Limiting (Seguridad) 🔴

- **Problema:** API expuesta sin protección contra DoS
- **Impacto:** Vulnerabilidad crítica en producción
- **Solución:** Sprint 7.2 - Upstash Rate Limit middleware

---

## 📋 ESTRATEGIA: 3 FASES CON BLOQUEO

```
┌─────────────────────────────────────────────────────────┐
│  🎯 FASE 1: FUNDAMENTOS DE CALIDAD (8 días) 🔴         │
│  ├─ Sprint 6: Infraestructura de Código (5 días)        │
│  └─ Sprint 7: Infraestructura de Seguridad (3 días)     │
│                                                           │
│  📦 FASE 2: FEATURES CON CALIDAD (12 días) ⏸️           │
│  ├─ Sprint 8: Inventory Advanced (5 días)               │
│  ├─ Sprint 9: Testing & Observability (4 días)          │
│  └─ Sprint 10: Performance & Caching (3 días)           │
│                                                           │
│  🚀 FASE 3: FEATURES AVANZADAS (Variable) ⏸️            │
│  └─ Sprints 11+: Dashboard, Analytics, Auth, etc.       │
│                                                           │
│  ⚠️ BLOQUEO: No se puede iniciar Fase 2 sin completar   │
│              Fase 1. No se puede iniciar Fase 3 sin      │
│              completar Fase 2.                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 FASE 1: FUNDAMENTOS DE CALIDAD (Sprints 6-7) 🔴 CRÍTICO

**Duración Total:** 8 días  
**Estado:** 🔴 PRÓXIMO - BLOQUEANTE PARA TODO LO DEMÁS  
**Objetivo:** Establecer infraestructura de calidad ANTES de escribir más código

### ✅ Sprint 6: Infraestructura de Código (5 días) � EN PROGRESO

**Objetivo:** Eliminar código duplicado y establecer patrones de calidad

#### ✅ Sprint 6.1: Eliminación console.log (1 día) ✅ COMPLETADO

**Estado:** ✅ COMPLETADO (13 de octubre 2025)  
**Versión liberada:** v0.3.0  
**Nota:** asyncHandler diferido a Sprint 6.2 tras corrupción con script automatizado

**Día 1 - console.log Elimination (6 horas efectivas):**

- ✅ Auditoría: 211 instancias de console.log/error/warn encontradas
- ✅ Reemplazadas con Winston logger (45 archivos modificados)
- ✅ Agregada ESLint rule: `'no-console': 'error'`
- ✅ Tests: 2410/2410 pasando (100%)
- ✅ Lint: 0 errors

**Entregables:**

- ✅ 211/211 console.log eliminados
- ✅ Winston logger en 45 archivos
- ✅ ESLint enforcement activo
- ✅ Documento: `docs/sprints/SPRINT_6.1_CONSOLE_LOG_ELIMINATION.md`
- ✅ CHANGELOG.md v0.3.0 generado
- ✅ Git tag: v0.3.0

**Criterios de Éxito:**

- ✅ console.log instances: 0/211 (100%)
- ✅ Tests passing: 2410/2410 (100%)
- ✅ Lint passing: 0 errors
- ✅ ESLint rule configured
- ❌ asyncHandler adoption: 0/102 (diferido a Sprint 6.2)

**Lecciones Aprendidas:**

- Scripts automatizados requieren validación cuidadosa (corrupción de datos)
- sed tiene limitaciones con archivos con muchos comentarios
- Tests son red de seguridad crítica
- Manual > Automatizado para refactors complejos

#### 🔴 Sprint 6.2: asyncHandler Migration (2 días) 🔴 PRÓXIMO

**Objetivo:** Migrar 102 endpoints restantes a asyncHandler wrapper

**Día 1 - Batch 1 (50 endpoints):**

- [ ] Migración manual de 50 endpoints prioritarios
- [ ] Pattern: `export default asyncHandler(async (req, res) => { ... })`
- [ ] Eliminar try/catch duplicado (~150 líneas)
- [ ] Tests: Validar cada 10 endpoints

**Día 2 - Batch 2 (52 endpoints):**

- [ ] Migración manual de 52 endpoints restantes
- [ ] Eliminar try/catch duplicado (~100 líneas)
- [ ] Tests finales: 2410/2410 pasando
- [ ] Configurar ESLint rule custom (opcional)

**Entregables:**

- 102 endpoints migrados a asyncHandler
- 122/122 endpoints usando asyncHandler (100%)
- ~250 líneas de código eliminadas
- Tests: 2410/2410 pasando
- Documento: `docs/sprints/SPRINT_6.2_COMPLETADO.md`

**Criterios de Éxito:**

- ✅ asyncHandler adoption: 122/122 (100%)
- ✅ Tests passing: 2410/2410
- ✅ Lint passing: 0 errors
- ✅ Code reduction: ~250 lines eliminated

#### Sprint 6.3: Coverage Threshold + Aplicar Utilidades (2 días)

**Día 1 - Coverage Threshold:**

- [ ] Ajustar `jest.config.js` threshold: 50% → 95%
- [ ] Validar coverage actual se mantiene
- [ ] Documentar estándar en `docs/CLEAN_ARCHITECTURE.md`

**Día 2 - Aplicar Utilidades:**

- [ ] Refactorizar 10-15 endpoints prioritarios:
  - `pages/api/booking.ts` (ErrorMessages + validateUUID)
  - `pages/api/payment.ts` (validateUUID + ownership)
  - `pages/api/inventory.ts` (pagination helpers)
  - `pages/api/precios.ts` (pagination + filters)
  - `pages/api/service-points/index.ts` (filtrado manual → parseSortParams)
  - `pages/api/workshops/[id]/services.ts` (validateOwnership)
  - 5-8 endpoints adicionales según prioridad

**Entregables:**

- jest.config.js con threshold 95%
- 10-15 endpoints refactorizados
- Tests actualizados si necesario
- Documento: `docs/sprints/SPRINT_6.3_COMPLETADO.md`

**Criterios de Éxito:**

- ✅ Coverage threshold: 95%
- ✅ Endpoints refactorizados: 10-15
- ✅ Tests passing: 2410/2410
- ✅ Utilidades adoption: 50%+ endpoints

---

### ✅ Sprint 7: Infraestructura de Seguridad & DB (3 días) 🔴 CRÍTICO

**Objetivo:** Proteger integridad de datos y seguridad de API

#### Sprint 7.1: Transacciones PostgreSQL RPC (2 días) 🔴 CRÍTICO

**Día 1 - Crear RPC Functions:**

- ✅ `create_stock_request_tx`: Stock request + reservation + movement (CRITICAL)
- ✅ `process_payment_tx`: Payment + update booking + stock adjustment
- ✅ `create_booking_tx`: Booking + availability update + notification

**Día 2 - Refactorizar Services:**

- ✅ `StockRequestService.createRequest()`: Usar RPC
- ✅ `PaymentService.processPayment()`: Usar RPC
- ✅ `BookingService.create()`: Usar RPC
- ✅ Agregar tests de rollback behavior

**Entregables:**

- 5 funciones RPC transaccionales en Supabase
- 5 services refactorizados
- Tests de rollback (simular errores)
- Documento: `docs/sprints/SPRINT_7.1_COMPLETADO.md`

**Criterios de Éxito:**

- ✅ RPC functions: 5/5 operacionales
- ✅ Operaciones críticas: 100% transaccionales
- ✅ Tests rollback: Passing
- ✅ Data integrity: Protected

#### Sprint 7.2: Rate Limiting + Secrets Management (1 día)

**Rate Limiting Setup:**

- ✅ Instalar Upstash Redis + @upstash/ratelimit
- ✅ Crear `middleware.ts` en project root
- ✅ Configurar limites por endpoint:
  - General: 100 requests/minuto
  - `/api/payment`: 10 requests/minuto
  - `/api/user` (registro): 5 requests/hora
- ✅ Agregar headers de rate limit en responses

**Secrets Management:**

- ✅ Mover secrets a Vercel environment variables
- ✅ Eliminar hardcoded secrets de código
- ✅ Documentar proceso en `docs/DEPLOYMENT.md`

**Entregables:**

- middleware.ts implementado
- Rate limiting activo en producción
- Secrets movidos a Vercel
- Documento: `docs/sprints/SPRINT_7.2_COMPLETADO.md`

**Criterios de Éxito:**

- ✅ Rate limiting: Activo
- ✅ DoS protection: Enabled
- ✅ Secrets: 100% en Vercel
- ✅ Tests: Rate limit behavior validated

---

## 📦 FASE 2: FEATURES CON CALIDAD (Sprints 8-10) ⏸️ BLOQUEADO

**Duración Total:** 12 días  
**Estado:** ⏸️ BLOQUEADO hasta completar Fase 1  
**Objetivo:** Implementar features usando infraestructura de calidad establecida

### ⏸️ Sprint 8: Inventory Advanced (5 días)

**BLOQUEADO HASTA:** Sprint 7.2 completado

**Sprint 8.1: Stock Movements (3 días)**

- Tabla: `stock_movements` (ENTRADA, SALIDA, TRANSFERENCIA, AJUSTE)
- Repository: `StockMovementRepository`
- Service: `StockMovementService` (usando asyncHandler, Winston, RPCs)
- Endpoints: `/api/stock-movements` (CRUD completo)
- Tests: 100% coverage con asyncHandler patterns

**Sprint 8.2: Restock Rules (2 días)**

- Tabla: `restock_rules` (stock_minimo, stock_maximo, auto_reorder)
- Service: `RestockService` con lógica de alertas
- Background job: Check stock levels diariamente
- Endpoints: `/api/restock-rules` + `/api/restock-alerts`

---

### ⏸️ Sprint 9: Testing & Observability (4 días)

**BLOQUEADO HASTA:** Sprint 8.2 completado

**Sprint 9.1: E2E Testing + CI/CD (2 días)**

- Playwright setup para E2E tests
- GitHub Actions workflow: lint → test → e2e → deploy
- Husky pre-push hooks
- Vercel preview deployments

**Sprint 9.2: Error Monitoring + Health Check (2 días)**

- Sentry integration para error tracking
- Health check endpoint: `/api/health`
- APM básico: Response times, error rates
- Alertas en Slack/Email

---

### ⏸️ Sprint 10: Performance & Caching (3 días)

**BLOQUEADO HASTA:** Sprint 9.2 completado

**Sprint 10.1: Redis Caching (2 días)**

- Redis setup (Upstash)
- Cache service: GET endpoints con TTL
- Cache invalidation strategy
- Cache headers en responses

**Sprint 10.2: APM Metrics (1 día)**

- Prometheus + Grafana setup
- Custom metrics: requests/sec, latency p95/p99
- Database query performance tracking

---

## 🚀 FASE 3: FEATURES AVANZADAS (Sprints 11+) ⏸️ BLOQUEADO

**Estado:** ⏸️ BLOQUEADO hasta completar Fase 2  
**Objetivo:** Features avanzadas con toda la infraestructura de calidad en place

### ⏸️ Sprint 11: Dashboard Real-Time (3 días)

**BLOQUEADO HASTA:** Sprint 10.2 completado

- WebSocket connection para updates real-time
- Dashboard widgets: Sales, stock, bookings
- Chart.js/Recharts visualizations
- Export to PDF/CSV

### ⏸️ Sprint 12: Reporting & Analytics (2 días)

**BLOQUEADO HASTA:** Sprint 11 completado

- Analytics service: Agregaciones y métricas
- Reports: Ventas por periodo, productos top, usuarios activos
- Scheduled reports (email diario/semanal)

### ⏸️ Sprint 13+: Auth, Notifications, Mobile, API Externa, ML

**BLOQUEADO HASTA:** Sprint 12 completado

- Sprint 13: Auth avanzado (JWT refresh, SSO)
- Sprint 14: Notifications (push, email, SMS)
- Sprint 15: Mobile API optimization
- Sprint 16: API externa para partners
- Sprint 17: ML recommendations

---

## 📊 MÉTRICAS DE PROGRESO

### Estado de Fases

| Fase   | Sprints | Días | Estado       | Completado | Bloqueado Por        |
| ------ | ------- | ---- | ------------ | ---------- | -------------------- |
| Fase 1 | 6-7     | 8    | 🔴 PRÓXIMO   | 0%         | -                    |
| Fase 2 | 8-10    | 12   | ⏸️ BLOQUEADO | 0%         | Fase 1 no completada |
| Fase 3 | 11+     | 20+  | ⏸️ BLOQUEADO | 0%         | Fase 2 no completada |

### Objetivos Fase 1 (CRÍTICO)

| Métrica            | Antes | Objetivo | Bloqueante     |
| ------------------ | ----- | -------- | -------------- |
| asyncHandler       | 0%    | 100%     | ✅ Sí          |
| console.log        | 30+   | 0        | ✅ Sí          |
| Transacciones      | 0/5   | 5/5      | ✅ Sí          |
| Rate Limiting      | ❌    | ✅       | ✅ Sí          |
| Coverage Threshold | 50%   | 95%      | ⚠️ Recomendado |

---

## 🎯 PRÓXIMA ACCIÓN: Sprint 6.1

**Sprint:** 6.1 - asyncHandler + Eliminar console.log  
**Duración:** 2 días  
**Prioridad:** 🔴 CRÍTICA - BLOQUEANTE  
**Estado:** 🔴 PENDIENTE

**Tareas Inmediatas:**

```bash
# Día 1: asyncHandler Migration
cd /Users/arcriado/Developer/camino
mkdir -p scripts

# 1. Crear script de migración
cat > scripts/migrate-async-handler.sh << 'EOF'
#!/bin/bash
# Script automatizado de migración
files=$(grep -rl "export default async function handler" pages/api/)
for file in $files; do
  cp "$file" "$file.bak"
  # Transform with sed/awk
  npm test -- "$file.test.ts" --silent
  if [ $? -eq 0 ]; then
    echo "✅ Migrated: $file"
    rm "$file.bak"
  else
    echo "❌ Failed: $file - reverting"
    mv "$file.bak" "$file"
  fi
done
EOF

chmod +x scripts/migrate-async-handler.sh

# 2. Ejecutar migración
./scripts/migrate-async-handler.sh

# 3. Agregar ESLint rule
# Editar eslint.config.mjs

# 4. Validar tests
npm test
```

**Criterios de Completitud:**

- [ ] Script ejecutado en 50+ endpoints
- [ ] Tests passing: 2421/2421
- [ ] ESLint rule agregado
- [ ] Documento de sprint creado
- [ ] CHANGELOG actualizado
- [ ] Git commit + tag

---

## 📚 Referencias

**Documentos de Análisis:**

- `docs/ANALISIS_INGENIERIA_OPTIMIZACION.md` - Análisis completo de red flags y mejoras
- `docs/BACKLOG.md` v2.0 - Backlog reorganizado con 3 fases
- `docs/COMPLETED_SPRINTS.md` - Histórico de sprints completados

**Estándares de Calidad:**

- `docs/CLEAN_ARCHITECTURE.md` - Arquitectura y patrones
- `.github/copilot-instructions.md` - Reglas de desarrollo

**Herramientas:**

- Upstash Redis: Rate limiting + caching
- Sentry: Error monitoring
- Playwright: E2E testing
- GitHub Actions: CI/CD

---

## 🚨 REGLA CRÍTICA: NO AVANZAR SIN COMPLETAR FASE 1

**Esta organización es FINAL y NO NEGOCIABLE:**

1. ✅ Sprint 6.1 (2d) → ✅ Sprint 6.2 (3d) → ✅ Sprint 7.1 (2d) → ✅ Sprint 7.2 (1d)
2. ❌ **NO** se puede iniciar Sprint 8 sin completar Sprint 7.2
3. ❌ **NO** se puede escribir nuevo código sin asyncHandler
4. ❌ **NO** se puede usar console.log en nuevo código
5. ❌ **NO** se puede hacer operación multi-tabla sin RPC

**Razón:** Evitar refactoring masivo futuro. Establecer fundamentos AHORA para que TODO el código futuro siga best practices desde día 1.

**Enforcement:** ESLint rules + PR checklist + CI/CD checks bloquearán código que viole estos estándares.

---

**Última actualización:** 13 de octubre de 2025  
**Versión:** 2.0 (Post-Reorganización)  
**Próximo Sprint:** 6.1 (asyncHandler + console.log) - 2 días
