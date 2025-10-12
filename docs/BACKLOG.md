# 📋 BACKLOG - Tareas Pendientes

**Última actualización:** 12 de octubre de 2025  
**Versión:** 1.0

---

## 🎯 High Priority (Sprint 6)

### Sprint 6.1: Aplicar Utilidades Centralizadas (3 días)

**Descripción:** Refactorizar 10-15 endpoints existentes con las utilidades de Sprint 5.3

**Tasks:**
- [ ] Refactorizar endpoints con `ErrorMessages` (10-15 endpoints)
- [ ] Refactorizar endpoints con `validateUUID/validateUUIDs` (10-15 endpoints)
- [ ] Refactorizar endpoints con `validateOwnership` (5-8 endpoints)
- [ ] Refactorizar endpoints con `pagination.ts` utilities (8-10 endpoints)
- [ ] Actualizar tests para nuevos mensajes de error
- [ ] Documentar patrón Before/After

**Endpoints Prioritarios:**
1. `pages/api/booking.ts`
2. `pages/api/precios.ts`
3. `pages/api/service-points/index.ts`
4. `pages/api/workshops/[id]/services.ts`
5. `pages/api/inventory.ts`
6. 5-10 endpoints adicionales

**Criterios de Éxito:**
- ✅ 10-15 endpoints refactorizados
- ✅ Tests siguen pasando (2421/2421)
- ✅ Documento con Before/After de cada endpoint
- ✅ Zero errores de lint

### Sprint 6.2: Middleware Global de Error Handling (2 días)

**Descripción:** Centralizar try/catch patterns usando `asyncHandler` wrapper

**Tasks:**
- [ ] Crear `asyncHandler` middleware
- [ ] Aplicar a 5-10 endpoints como prueba
- [ ] Actualizar tests si es necesario
- [ ] Documentar patrón en ARCHITECTURE.md

**Criterios de Éxito:**
- ✅ asyncHandler implementado y testeado
- ✅ 5-10 endpoints usando el wrapper
- ✅ Tests pasando
- ✅ Documentación actualizada

---

## 🔄 Medium Priority (Sprint 7)

### Sprint 7.1: Movimientos de Stock (3 días)

**Descripción:** Implementar trazabilidad completa de inventario

**Tasks:**
- [ ] Migración: tabla `stock_movements`
- [ ] DTO: `StockMovement` interface
- [ ] Repository: `StockMovementRepository` (CRUD + queries especiales)
- [ ] Service: `StockMovementService` (lógica de negocio)
- [ ] Controller: `StockMovementController`
- [ ] Endpoints: POST `/api/stock-movements`, GET `/api/stock-movements`
- [ ] Integración con VentaApp (reserva, retiro, expiración)
- [ ] Tests unitarios (50+ tests)

**Criterios de Éxito:**
- ✅ Tabla en producción
- ✅ Endpoints funcionando
- ✅ Integración con ventas completa
- ✅ Tests pasando

### Sprint 7.2: Reglas de Reposición (2 días)

**Descripción:** Alertas automáticas de stock bajo

**Tasks:**
- [ ] Migración: tabla `restock_rules`
- [ ] DTO: `RestockRule` interface
- [ ] Service: `RestockAlertService`
- [ ] Endpoint: GET `/api/restock-alerts`
- [ ] Cron job: verificación cada hora
- [ ] Tests unitarios

**Criterios de Éxito:**
- ✅ Alertas funcionando
- ✅ Cron job configurado
- ✅ Endpoint operativo

---

## 📊 Medium Priority (Sprint 8)

### Sprint 8.1: Tests de Integración API (3 días)

**Tasks:**
- [ ] Setup: Base de datos de test en Supabase
- [ ] Fixtures: Datos de prueba
- [ ] Test: Flujo de venta completa
- [ ] Test: Flujo de reposición
- [ ] Test: Flujo de precios jerárquicos
- [ ] Cleanup automático

**Criterios de Éxito:**
- ✅ 50+ tests de integración
- ✅ BD de test configurada
- ✅ Fixtures documentados

### Sprint 8.2: Tests E2E con Playwright (2 días)

**Tasks:**
- [ ] Instalar y configurar Playwright
- [ ] Test E2E: Flujo admin (dashboard)
- [ ] Test E2E: Flujo gestor (inventario)
- [ ] Test E2E: Flujo API (venta móvil)
- [ ] CI/CD: Integrar tests en pipeline

**Criterios de Éxito:**
- ✅ Playwright configurado
- ✅ 20+ tests E2E
- ✅ CI/CD con tests

---

## ⚡ Low Priority (Sprint 9)

### Sprint 9.1: Caching con Redis (3 días)

**Tasks:**
- [ ] Instalar y configurar Redis
- [ ] Implementar `CacheService`
- [ ] Cache de precios (TTL: 1h)
- [ ] Cache de service points (TTL: 15m)
- [ ] Cache de inventario (TTL: 5m)
- [ ] Benchmarks de performance
- [ ] Tests unitarios

**Criterios de Éxito:**
- ✅ Redis configurado
- ✅ 3 servicios con caching
- ✅ Benchmarks documentados

### Sprint 9.2: Rate Limiting (2 días)

**Tasks:**
- [ ] Implementar middleware `rate-limiter`
- [ ] Configurar límites por endpoint
- [ ] Proteger todos POST/PUT/DELETE
- [ ] Tests de límites
- [ ] Documentar en API docs

**Criterios de Éxito:**
- ✅ Rate limiting funcional
- ✅ Endpoints protegidos
- ✅ Tests pasando

---

## 🎨 Low Priority (Sprint 10)

### Sprint 10.1: Dashboard de Inventario Real-Time (3 días)

**Tasks:**
- [ ] Vista: Stock por ubicación con mapa
- [ ] Vista: Gráficos de rotación
- [ ] Vista: Alertas en tiempo real
- [ ] Panel: Pedidos pendientes
- [ ] Panel: Historial de movimientos
- [ ] WebSocket: Updates real-time

**Criterios de Éxito:**
- ✅ 4 páginas nuevas en dashboard
- ✅ Integración con APIs
- ✅ WebSocket funcional

### Sprint 10.2: Reporting y Analytics (2 días)

**Tasks:**
- [ ] Reporte: Ventas por service point
- [ ] Reporte: Productos más vendidos
- [ ] Reporte: Revenue por ubicación
- [ ] Reporte: Stock actual vs óptimo
- [ ] Reporte: Rotación lenta
- [ ] Exportación: CSV/PDF

**Criterios de Éxito:**
- ✅ API endpoints de analytics
- ✅ Dashboard con gráficos
- ✅ Exportación funcional

---

## 🔮 Future Sprints (11+)

### Sprint 11: Autenticación Avanzada

**Tasks:**
- [ ] Roles granulares (admin, gestor, operador, viewer)
- [ ] Permisos por service point
- [ ] Audit log de acciones
- [ ] Tests de autorización

### Sprint 12: Sistema de Notificaciones

**Tasks:**
- [ ] Notificaciones push
- [ ] Emails automáticos
- [ ] Webhooks para integraciones
- [ ] Tests de notificaciones

### Sprint 13-15: Mobile App

**Tasks:**
- [ ] Setup React Native
- [ ] App para peregrinos
- [ ] Escaneo QR para retiro
- [ ] Pago in-app con Stripe
- [ ] Tests E2E móvil

### Sprint 16-17: Integraciones

**Tasks:**
- [ ] API para partners externos
- [ ] Integración con ERP/contabilidad
- [ ] Sincronización offline mejorada
- [ ] Documentación de API externa

### Sprint 18+: Machine Learning

**Tasks:**
- [ ] Predicción de demanda
- [ ] Optimización de stock
- [ ] Detección de anomalías
- [ ] Modelo de recomendación

---

## 🐛 Bugs Conocidos (Sin prioridad inmediata)

### Técnicos

1. **handleError formato diferente**
   - Tests esperan `{ error }` pero handleError retorna `{ error, code }`
   - Impacto: Bajo
   - Sprint sugerido: 6.2

2. **Paginación manual duplicada**
   - Misma lógica en múltiples endpoints
   - Impacto: Medio
   - Sprint sugerido: 6.1

3. **Filtrado fuera de servicios**
   - Lógica de negocio en endpoints
   - Impacto: Alto
   - Sprint sugerido: 6.1

---

## 📝 Mejoras Técnicas (Nice to Have)

### Arquitectura

- [ ] Centralizar filtrado en servicios
- [ ] Implementar paginación en todos los endpoints
- [ ] Documentar patrones de testing en wiki
- [ ] Migrar a TypeScript 5.0+
- [ ] Implementar feature flags

### Developer Experience

- [ ] Setup de debugging mejorado
- [ ] Hot reload optimization
- [ ] Documentar troubleshooting común
- [ ] Video tutorials de setup

### Performance

- [ ] Optimizar queries de Supabase
- [ ] Añadir índices faltantes
- [ ] Implementar lazy loading
- [ ] Comprimir responses

---

## 🔄 Proceso de Actualización

**MANDATORY:** Actualizar este backlog cada vez que:

1. ✅ Se completa un sprint → Mover tasks a `COMPLETED_SPRINTS.md`
2. ✅ Se identifica nueva tarea → Añadir a sección apropiada
3. ✅ Se cambia prioridad → Reorganizar secciones
4. ✅ Se descubre bug → Añadir a "Bugs Conocidos"

**Frecuencia:** Al final de cada sprint o bloque de trabajo

**Responsable:** Developer + Copilot

---

## 📊 Métricas de Progreso

**Sprint Actual:** Sprint 5.3 COMPLETADO  
**Próximo Sprint:** Sprint 6.1 (por iniciar)

**Progreso General:**
- ✅ Sprints completados: 5 (1-5)
- 🔄 Sprints planificados: 5 (6-10)
- 📋 Sprints futuros: 8+ (11-18+)

**Test Health:**
- 2421/2421 tests pasando (100%)
- 99.72% coverage
- Zero errores de lint

---

**Ver también:**
- [ROADMAP.md](ROADMAP.md) - Visión general de sprints
- [COMPLETED_SPRINTS.md](COMPLETED_SPRINTS.md) - Historial de sprints completados
- [CHANGELOG.md](../CHANGELOG.md) - Historial detallado de cambios
