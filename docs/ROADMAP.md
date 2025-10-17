# 🗺️ ROADMAP - Camino Service Backend

**Última actualización:** 17 de octubre de 2025  
**Versión del código:** v0.4.0  
**Estado:** API Features - Fase 1

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

**Total de sprints completados:** 11 sprints
**Versión actual:** v0.4.0
**Siguiente funcionalidad:** Issue #12 - Vending Machine Integration

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
