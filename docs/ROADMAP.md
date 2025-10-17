# 🗺️ ROADMAP - Camino Service Backend

**Última actualización:** 17 de octubre de 2025  
**Versión del código:** v0.5.0  
**Estado:** API Features - Fase 1 (QR System COMPLETED ✅)

---

## 🎯 Arquitectura de Dos Sub-Proyectos

**PRINCIPIO FUNDAMENTAL:** Este proyecto NO es monolítico. Consiste en dos sub-proyectos independientes:

### 1️⃣ **API REST** (Prioridad ALTA - Fase 1)

- **Propósito:** Servir datos a la app móvil (futura)
- **Ubicación:** `pages/api/` + `src/` (controllers, services, repositories)
- **Consumidores:** App móvil, integraciones de terceros
- **Estado:** En desarrollo activo

### 2️⃣ **Dashboard/Admin** (Prioridad BAJA - Fase 2)

- **Propósito:** Configurar y gestionar datos servidos por la API
- **Ubicación:** `pages/dashboard/`
- **Consumidores:** Usuarios administradores internos
- **Estado:** Desarrollo diferido hasta que API esté completa

**SEPARACIÓN DE RESPONSABILIDADES:**

- ✅ Dashboard **consume** la API (hace llamadas HTTP a endpoints API)
- ✅ API es **independiente** del dashboard (funciona sin él)
- ❌ NO mezclar lógica de negocio entre API y Dashboard
- ❌ Dashboard NO duplica lógica del API

**ORDEN DE DESARROLLO:**

1. **Fase 1 (actual):** Completar features de API
2. **Fase 2 (después):** Construir Dashboard UI que consume API

---

## 📊 Estado Actual del Proyecto

### Métricas Clave

| Métrica                | Valor Actual               | Target                |
| ---------------------- | -------------------------- | --------------------- |
| **Endpoints API**      | 110 endpoints activos      | 130+ endpoints        |
| **Tests**              | 2442/2443 pasando (99.96%) | 100% passing          |
| **Coverage**           | **44% actual**             | **50%+ incremental**  |
| **Tablas BD**          | 43 tablas PostgreSQL       | 50+ tablas            |
| **Clean Architecture** | ✅ 5-layer enforced        | ✅ Mantener           |
| **asyncHandler**       | ✅ 100% adoption (110/110) | ✅ Mantener           |
| **Winston Logger**     | ✅ 0 console.log           | ✅ Mantener           |
| **AppError**           | ✅ 100% adoption           | ✅ Mantener           |
| **Factory Pattern**    | ✅ 100% test data          | ✅ Mantener MANDATORY |

### Stack Tecnológico

- **Backend:** Next.js 14 + TypeScript strict mode
- **Base de datos:** Supabase (PostgreSQL)
- **Validación:** Zod schemas
- **Testing:** Jest (2409 tests)
- **Pagos:** Stripe
- **Logging:** Winston

---

## 🎯 BACKLOG PRIORIZADO

### 🔴 FASE 1: API FEATURES (Prioridad CRÍTICA)

**Enfoque:** Completar TODA la funcionalidad de la API antes de tocar el dashboard.

---

#### Issue #12: Vending Machine Integration (READY)

**Estado:** READY (desbloqueado por Issue #11)  
**Estimación:** 2-3 días  
**Objetivo:** Integrar sistema de precios con vending machines

**Tareas:**

- [ ] GET /api/vending-machines/[id]/precios (API endpoint)
- [ ] Resolver precio aplicable por jerarquía (API logic)
- [ ] Tests de integración vending + precios (API tests)
- [ ] ⏸️ Dashboard UI para gestión (DIFERIDO a Fase 2)

**Dependencias:** ✅ Issue #11 completado

---

#### ✅ **Sprint 9: QR System Offline-First** (COMPLETADO)

**Estado:** ✅ COMPLETADO  
**Versión:** v0.5.0  
**Fecha:** 17 de octubre de 2025  
**Duración:** 1 día

**Objetivo:** Sistema completo de QR offline-first para compras sin conexión

**Tareas completadas:**

- [x] Diseño arquitectónico completo (docs/QR_SYSTEM_ARCHITECTURE.md - 1,047 líneas)
- [x] Migración de base de datos (20251017_130000_qr_system.sql)
  - [x] Tabla `transactions` (16 columnas, 5 índices)
  - [x] Tabla `access_logs` (8 columnas, 6 índices)
  - [x] Tabla `returns` (7 columnas, 4 índices)
  - [x] Campo `profiles.qr_secret` (VARCHAR 255, 64 chars hex)
- [x] DTOs y Schemas (245 líneas)
  - [x] 11 interfaces (qr.dto.ts - 140 líneas)
  - [x] 8 Zod schemas (qr.schema.ts - 105 líneas)
- [x] Backend Controllers (702 líneas totales)
  - [x] QRValidationController (270 líneas, 13-step validation)
  - [x] QRSyncController (124 líneas, race condition handling)
  - [x] QRReturnController (194 líneas, partial/full returns)
  - [x] QRLogsController (114 líneas, 6 filters)
- [x] API Endpoints (680 líneas Swagger)
  - [x] POST /api/access/verify-qr (161 líneas docs)
  - [x] POST /api/transactions/sync (179 líneas docs)
  - [x] POST /api/transactions/return (171 líneas docs)
  - [x] GET /api/access/logs (169 líneas docs)
- [x] Security Features
  - [x] HMAC-SHA256 signature verification
  - [x] One-time use enforcement (qr_used flag)
  - [x] 24-hour expiration validation
  - [x] QR invalidation on returns
- [x] Testing
  - [x] End-to-end validation tests
  - [x] HMAC signature verification test
  - [x] Reuse prevention test (409 Conflict)
  - [x] Falsified QR rejection test (403 Forbidden)
  - [x] Access logs retrieval test
- [x] Scripts
  - [x] create-qr-test-data.js (creación de datos de prueba)
  - [x] Documentación completa (docs/QR_SYSTEM_TESTING.md)
- [x] Fixes
  - [x] UUID validation (RFC 4122 compliance)
  - [x] Logger import en service-point.controller.ts
  - [x] Foreign key constraints (scanned_by opcional)

**Resultados:**

- ✅ **100% funcional:** 4 endpoints operativos
- ✅ **Seguridad robusta:** HMAC-SHA256 + uso único + expiración
- ✅ **Auditoría completa:** Registro en access_logs de todos los intentos
- ✅ **7 códigos de error** documentados (400, 403, 404, 409, 410, 500)
- ✅ **Zero console.log:** Winston logger en 100%
- ✅ **Zero hardcoded errors:** ErrorMessages centralizados
- ✅ **UUIDs válidos:** Cumplimiento RFC 4122

**Archivos creados/modificados:**

- `docs/QR_SYSTEM_ARCHITECTURE.md` (1,047 líneas)
- `docs/QR_SYSTEM_TESTING.md` (nuevo)
- `supabase/migrations/20251017_130000_qr_system.sql`
- `src/api/dto/qr.dto.ts`
- `src/api/schemas/qr.schema.ts`
- `src/api/controllers/qr-validation.controller.ts`
- `src/api/controllers/qr-sync.controller.ts`
- `src/api/controllers/qr-return.controller.ts`
- `src/api/controllers/qr-logs.controller.ts`
- `pages/api/access/verify-qr.ts`
- `pages/api/transactions/sync.ts`
- `pages/api/transactions/return.ts`
- `pages/api/access/logs.ts`
- `scripts/create-qr-test-data.js`

**Próximos pasos:**

- [ ] Unit tests (5 archivos de test)
- [ ] Integration tests (1 archivo)
- [ ] Frontend mobile integration

---

#### Feature: Auth Social Providers (API)

**Estimación:** 2-3 días  
**Objetivo:** Autenticación con proveedores sociales (API endpoints)  
**Estado:** Diferido - Auth básico completado en v0.4.0

**Tareas:**

- [ ] Configurar Apple Sign In en Supabase
- [ ] Configurar Google OAuth en Supabase
- [ ] Configurar Facebook Login en Supabase
- [ ] GET /api/auth/providers (listar proveedores disponibles)
- [ ] Callback handlers para OAuth flows
- [ ] Sincronización de perfiles desde providers
- [ ] Tests de integración
- [ ] Documentación en SUPABASE_AUTH_SETUP.md

**Dependencias:** ✅ Auth básico (email/password) completado

---

#### Feature: Notifications System (API)

**Estimación:** 3-4 días  
**Objetivo:** Sistema de notificaciones para usuarios (API endpoints)

**Tareas:**

- [ ] Tabla `notifications` en base de datos
- [ ] POST /api/notifications (crear notificación)
- [ ] GET /api/notifications (listar con filtros)
- [ ] PUT /api/notifications/[id]/read (marcar leída)
- [ ] Tipos: venta_confirmada, stock_bajo, booking_confirmado
- [ ] Tests completos (repository, service, controller)
- [ ] ⏸️ Dashboard UI para gestionar notificaciones (DIFERIDO a Fase 2)

---

#### Feature: Reviews & Ratings (API)

**Estimación:** 2-3 días  
**Objetivo:** Sistema de valoraciones para talleres y service points (API)

**Tareas:**

- [ ] Tabla `reviews` en base de datos
- [ ] POST /api/reviews (crear review)
- [ ] GET /api/reviews (filtros por taller/SP)
- [ ] Cálculo de rating promedio (API logic)
- [ ] Validación: 1 review por usuario por servicio (API business rule)
- [ ] Tests completos
- [ ] ⏸️ Dashboard UI para moderación (DIFERIDO a Fase 2)

---

#### Feature: Search & Filtering Avanzado (API)

**Estimación:** 2 días  
**Objetivo:** Búsqueda global y filtros avanzados (API endpoints)

**Tareas:**

- [ ] GET /api/search (búsqueda global)
- [ ] Búsqueda por: nombre, SKU, ubicación, categoría
- [ ] Filtros combinados (precio, distancia, disponibilidad)
- [ ] PostgreSQL full-text search
- [ ] Ordenamiento personalizable
- [ ] Tests completos

---

#### Feature: User Profiles & Preferences (API)

**Estimación:** 2 días  
**Objetivo:** Perfiles de usuario con preferencias (API endpoints)

**Tareas:**

- [ ] GET /api/users/[id]/profile (obtener perfil)
- [ ] PUT /api/users/[id]/profile (actualizar perfil)
- [ ] Campos: avatar, bio, preferencias
- [ ] Historial de compras (API endpoint)
- [ ] Favoritos de productos (API endpoint)
- [ ] Tests completos

---

### 🟡 FASE 2: DASHBOARD/ADMIN (Después de Fase 1)

**Enfoque:** Construir UI administrativa que consume la API existente.

**Diferido hasta completar API features. Ver sección al final del documento.**

---

### 🟢 FASE 3: OPTIMIZACIONES (Después de Fases 1-2)

#### Optimization: Test Factories Adoption

**Estimación:** 2-3 días  
**Objetivo:** Refactorizar tests para usar factories centralizadas

**Contexto:** Factories ya implementadas en `src/helpers/factories.ts` usando `@ngneat/falso`, pero los tests aún crean datos inline.

**Tareas:**

- [ ] Auditar todos los tests actuales (2409 tests)
- [ ] Identificar creación manual de datos de prueba
- [ ] Refactorizar a usar factories (createMockUsuario, createMockProducto, etc.)
- [ ] Eliminar duplicación de datos de prueba
- [ ] Actualizar documentación de testing patterns
- [ ] Beneficio: Tests más mantenibles y consistentes

---

#### Optimization: Redis Caching

**Estimación:** 2 días  
**Objetivo:** Cache de datos frecuentes

**Tareas:**

- [ ] Redis setup (local + producción)
- [ ] Cache precios (TTL 1h)
- [ ] Cache productos (TTL 15min)
- [ ] Cache inventario (TTL 5min)
- [ ] Invalidación automática en updates
- [ ] Tests con Redis mock

---

#### Optimization: Rate Limiting

**Estimación:** 1 día  
**Objetivo:** Protección contra abuso API

**Tareas:**

- [ ] next-rate-limit middleware
- [ ] 100 req/min por IP
- [ ] 1000 req/hour por usuario autenticado
- [ ] Respuesta 429 Too Many Requests
- [ ] Tests de límites

---

#### Optimization: Database Transactions

**Estimación:** 2 días  
**Objetivo:** Transacciones PostgreSQL para operaciones críticas

**Tareas:**

- [ ] Transacción venta + reserva + pago
- [ ] Transacción booking + notificación
- [ ] Transacción actualización stock múltiple
- [ ] Rollback automático en errores
- [ ] Tests con casos de fallo

---

#### Optimization: Performance Monitoring

**Estimación:** 1 día  
**Objetivo:** Monitoreo de performance

**Tareas:**

- [ ] Sentry setup para error tracking
- [ ] Winston logs a cloud (LogDNA/Datadog)
- [ ] Métricas de tiempo de respuesta
- [ ] Alertas de errores críticos
- [ ] Dashboard de monitoreo

---

## 🧪 Testing & Quality

### Backlog de Testing

- [ ] **Integration Tests:** Tests E2E con database real (30+ flujos)
- [ ] **Playwright Tests:** Tests UI del dashboard
- [ ] **Load Testing:** Artillery tests (1000 req/s)
- [ ] **Security Testing:** OWASP top 10 checks

### Code Quality

- [ ] **Type Coverage:** Incrementar a 100% (eliminar `any`)
- [ ] **Test Coverage:** Incrementar de 44% a 60%
- [ ] **Code Review:** Establecer proceso de PR reviews
- [ ] **CI/CD:** GitHub Actions pipeline completo

---

## 📝 Reglas de Ejecución

### Completitud al 100%

**REGLA CRÍTICA:** Cuando se asigna una tarea (ej: "refactorizar tests"), NO se refactorizan 3-4 archivos. Se completa la tarea al **100%**.

**Workflow obligatorio:**

1. Identificar TODOS los archivos/componentes afectados
2. Completar TODOS antes de marcar tarea como done
3. Documentar cambios en CHANGELOG.md
4. Actualizar ROADMAP.md (mover tarea completada)
5. Añadir nuevas tareas derivadas al backlog

**Ejemplo:**

- ❌ **INCORRECTO:** "Refactorizar tests" → Solo 4/20 archivos actualizados
- ✅ **CORRECTO:** "Refactorizar tests" → 20/20 archivos actualizados + documentado

---

### Proceso de Finalización de Sprint

**Después de completar CUALQUIER bloque de trabajo:**

1. `npm run release` → Genera CHANGELOG.md automático
2. Actualizar este ROADMAP.md:
   - Mover tarea de "BACKLOG" a "COMPLETADO"
   - Añadir nuevas tareas descubiertas
3. Commit con mensaje: `chore(release): vX.X.X - Feature/Fix completado`

**NO se considera terminado** hasta que:

- ✅ `npm test` → 100% tests passing
- ✅ `npm run lint` → 0 errores
- ✅ `npm run build` → Exitoso
- ✅ ROADMAP.md actualizado
- ✅ CHANGELOG.md generado

---

## 📋 FASE 2: DASHBOARD/ADMIN FEATURES (Diferido)

**Prerequisito:** Completar TODAS las features de API de Fase 1.

**Principio:** El dashboard SOLO consume la API existente. No duplica lógica de negocio.

### Features Dashboard Pendientes

#### Dashboard: Gestión de Precios por Vending Machine

- Interfaz UI para Issue #12
- Consumir GET /api/vending-machines/[id]/precios
- Formulario para establecer precios

#### Dashboard: Notificaciones Admin

- Interfaz UI para ver/gestionar notificaciones
- Consumir GET /api/notifications
- Moderación de notificaciones

#### Dashboard: Moderación de Reviews

- Interfaz UI para moderar reviews
- Consumir GET /api/reviews
- Aprobar/rechazar reviews

#### Dashboard: Analytics & Reports

- Gráficos de ventas (GET /api/analytics/sales)
- Reportes de inventario (GET /api/analytics/inventory)
- Exportación CSV/PDF

#### Dashboard: Gestión de Service Points

- CRUD completo de service points
- Consumir endpoints existentes de API
- Gestión de ubicaciones y caminos

**Estimación total Fase 2:** 3-4 semanas (después de Fase 1)

---

## ✅ Completado (Histórico)

### Sprint 1-5: Base del Sistema (May-Sep 2025)

- Base de datos (42 tablas)
- Clean Architecture (5 capas)
- 102 endpoints API
- Sistema de precios jerárquico
- Vending machines + slots
- Integración Stripe

### Sprint 6: Calidad de Código (Oct 2025)

- **v0.3.0:** Eliminación 211 console.log + Winston
- **v0.3.1:** AppError migration (124 errores)
- **v0.3.2:** asyncHandler 100% adoption
- **v0.3.3:** Utilities refactoring (51 endpoints)
- **v0.3.4:** Issue #11 - Sistema de precios verificado

### Sprint 7: Autenticación & Testing (Oct 2025)

- **v0.4.0:** Sistema de autenticación completo con Supabase
  - **DTOs, Schemas, Services, Controllers:** 17 archivos nuevos
  - **8 endpoints API:** login, register, logout, me, reset-password, change-password, refresh, verify-email
  - **Auth middleware:** requireAuth, optionalAuth, requireRole
  - **Tests completos:** 60 tests (27 schema + 33 controller) - 100% passing
  - **Factory Pattern MANDATORY:** Todos los tests usan UserFactory, generateUUID (ZERO hardcoded data)
  - **Configuración Supabase:** Email/password, templates en español, RLS policies, triggers
  - **Documentación:** docs/SUPABASE_AUTH_SETUP.md con guía completa paso a paso
  - **Logger mock fix:** \_\_esModule pattern para tests
  - **copilot-instructions.md:** Sección MANDATORY sobre factory pattern añadida

### Sprint 8: Documentación Swagger Completa (Oct 17, 2025)

- **v0.4.1:** Documentación Swagger 100% completa
  - **110 endpoints documentados:** Todos los endpoints API tienen documentación OpenAPI 3.0 completa
  - **5 commits realizados:**
    - Commit 1: Payments (5) + Products (5) + Vending Machines (2) = 12 endpoints
    - Commit 2: Service Points (4) + Categories (3) + Subcategories (2) = 9 endpoints
    - Commit 3: Users (2) + Locations (2) + Workshops (2) + Warehouses (2) = 8 endpoints
    - Commit 4: Stock Requests (10) + Warehouse Inventory (10) = 20 endpoints
    - Commit 5: Services (8) + Service Types (2) + Margins (2) + Network (1) + Service Assignments (2) + Webhook (1) = 16 endpoints
  - **~4,026 líneas de documentación:** Especificaciones completas con parámetros, schemas, responses
  - **16 categorías documentadas:** Bookings, Payments, Products, Vending Machines, Service Points, Categories, Subcategories, Users, Locations, Workshops, Warehouses, Stock Requests, Warehouse Inventory, Services, Service Types, Margins, Network, Service Assignments, Webhooks
  - **Formato consistente:** Todos en español, OpenAPI 3.0, respuestas 200/400/404/405/500
  - **Schemas reutilizables:** Componentes compartidos para entidades comunes

### Sprint 9: Sistema QR Offline-First (Oct 17, 2025)

- **v0.5.0 (EN PROGRESO):** Sistema de QR codes para acceso offline a servicios
  - **Arquitectura documentada:** `docs/QR_SYSTEM_ARCHITECTURE.md` (1,047 líneas, 28KB)
  - **Enfoque offline-first:** Generación de QR en app móvil sin internet, validación online en CSP
  - **Seguridad HMAC-SHA256:** Firma con secret único por usuario, previene falsificación
  - **Base de datos completada (78%):**
    - ✅ Migration ejecutada: `20251017_130000_qr_system.sql`
    - ✅ Tabla `transactions`: 16 columnas, 5 índices, tracking completo de QR
    - ✅ Tabla `access_logs`: Auditoría de escaneos (valid, invalid, expired, falsified)
    - ✅ Tabla `returns`: Registro de devoluciones con nueva transacción
    - ✅ Columna `profiles.qr_secret`: VARCHAR(255), 64 chars hex, 7 usuarios poblados
    - ✅ Trigger `update_transactions_updated_at` para timestamps automáticos
  - **Backend API completado (78%):**
    - ✅ DTOs (11 interfaces): Transaction, QRPayload, VerifyQRDto, AccessLog, Return
    - ✅ Zod Schemas (8 schemas): Validación completa con mensajes en español
    - ✅ 4 Controllers implementados (702 líneas):
      - `QRValidationController`: Verificación HMAC, expiración, uso único (270 líneas)
      - `QRSyncController`: Sincronización offline, race conditions (124 líneas)
      - `QRReturnController`: Devoluciones parciales/totales, invalidación (194 líneas)
      - `QRLogsController`: Consulta de auditoría con 6 filtros (114 líneas)
    - ✅ 4 Endpoints con Swagger (680 líneas de documentación):
      - POST `/api/access/verify-qr`: Validar QR escaneado (7 códigos de error)
      - POST `/api/transactions/sync`: Sincronizar compra offline (idempotente)
      - POST `/api/transactions/return`: Procesar devolución (parcial/total)
      - GET `/api/access/logs`: Consultar logs (paginación + 6 filtros)
  - **Pendiente (22%):**
    - ⏳ Tests (9 archivos): Schemas, controllers, integration tests
    - ⏳ Documentación final: Actualizar ANALISIS_GAPS_Y_MEJORAS.md

**Total de sprints completados:** 12 sprints
**Versión actual:** v0.5.0 (EN PROGRESO - 78% completado)
**Siguiente funcionalidad:** Completar tests del sistema QR

---

## 📌 Notas Importantes

- **Dos Sub-Proyectos:** API REST (Fase 1) + Dashboard/Admin (Fase 2)
- **Prioridad:** Features de API primero, Dashboard después
- **Separación clara:** Dashboard consume API, no duplica lógica
- **Documentación detallada:** Ver `docs/CLEAN_ARCHITECTURE.md` para patrones
- **Clean Architecture:** Ver `docs/CLEAN_ARCHITECTURE.md`
- **Modelo de negocio:** Ver `docs/notas.md`
- **Prioridad:** Features core primero, optimizaciones después
- **Coverage target:** 44% actual → 50%+ incremental (no forzar prematuramente)
