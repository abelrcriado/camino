# 🗺️ ROADMAP - Camino Service Backend

**Última actualización:** 12 de octubre de 2025  
**Versión:** 1.0 (Post-Sprint 5.3)

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

### 📈 Métricas del Sistema

| Métrica                | Valor                     |
| ---------------------- | ------------------------- |
| **Tablas en BD**       | 42 tablas                 |
| **Endpoints API**      | 35+ endpoints activos     |
| **Tests**              | 2421 tests (100% passing) |
| **Coverage**           | 99.72% promedio           |
| **DTOs**               | 29 interfaces             |
| **Repositories**       | 29 clases                 |
| **Services**           | 25 clases                 |
| **Controllers**        | 13 clases                 |
| **Arquitectura**       | Clean Architecture 5-layer|
| **TypeScript Errors**  | 0                         |
| **Lint Errors**        | 0                         |

---

## 🎯 Pendientes y Próximos Sprints

### Sprint 6: Aplicación de Utilidades (Semana 13)

**Objetivo:** Refactorizar endpoints existentes con utilidades centralizadas de Sprint 5.3

#### Sprint 6.1: Aplicar Utilidades a Endpoints Core (3 días)

**Alcance:** 10-15 endpoints prioritarios

- **Utilidades a aplicar:**
  - ErrorMessages para todos los strings de error
  - validateUUID/validateUUIDs para validación de IDs
  - validateOwnership para recursos anidados
  - parsePaginationParams/createPaginatedResponse para paginación

- **Endpoints prioritarios:**
  1. `pages/api/booking.ts` (alta complejidad)
  2. `pages/api/precios.ts` (paginación + filtros)
  3. `pages/api/service-points/index.ts` (filtrado manual)
  4. `pages/api/workshops/[id]/services.ts` (ownership)
  5. `pages/api/inventory.ts` (paginación)
  6. 5-10 endpoints adicionales según prioridad

- **Criterios de selección:**
  - Endpoints con múltiples validaciones UUID
  - Endpoints con paginación manual
  - Endpoints con filtrado post-query
  - Endpoints con ownership validation

- **Entregables:**
  - 10-15 endpoints refactorizados
  - Tests actualizados (si mensajes de error cambian)
  - Verificación: 2421 tests siguen pasando
  - Documento: Antes/Después de cada endpoint

#### Sprint 6.2: Middleware Global de Error Handling (2 días)

**Objetivo:** Centralizar try/catch patterns usando error-handler.ts existente

- **Tareas:**
  1. Auditar uso actual de handleError en endpoints
  2. Crear wrapper asyncHandler para eliminar try/catch repetitivo
  3. Aplicar a 5-10 endpoints como prueba
  4. Documentar patrón en ARCHITECTURE.md

- **Patrón propuesto:**
  ```typescript
  // ANTES
  export default async function handler(req, res) {
    try {
      // lógica
    } catch (error) {
      return handleError(error, res);
    }
  }

  // DESPUÉS
  export default asyncHandler(async (req, res) => {
    // lógica sin try/catch
  });
  ```

- **Entregables:**
  - asyncHandler implementado y documentado
  - 5-10 endpoints usando el wrapper
  - Tests verificados
  - Guía de uso en docs/

---

### Sprint 7: Inventario Avanzado (Semana 14)

**Objetivo:** Implementar sistema completo de inventario con movimientos

#### Sprint 7.1: Movimientos de Stock (3 días)

**Problema actual:** Inventario básico solo en vending machines, sin trazabilidad

**Implementar:**

1. **Tabla: stock_movements**
   - Campos: id, producto_id, origen_tipo, origen_id, destino_tipo, destino_id, cantidad, tipo_movimiento, fecha, usuario_id, referencia
   - Tipos: ENTRADA, SALIDA, TRANSFERENCIA, AJUSTE, RESERVA, DESRESERVA

2. **Repository: StockMovementRepository**
   - `create(movimiento)`: Registrar movimiento
   - `findByProducto(productoId, filters)`: Historial por producto
   - `findByUbicacion(tipo, id, filters)`: Movimientos de ubicación
   - `getBalance(tipo, id, productoId)`: Balance actual

3. **Service: StockMovementService**
   - `registrarEntrada(data)`: Entrada de stock
   - `registrarSalida(data)`: Salida de stock
   - `transferir(origen, destino, producto, cantidad)`: Transferencia
   - `ajustar(ubicacion, producto, cantidad, motivo)`: Ajuste manual

4. **Integración con VentaApp:**
   - Reserva → Crear movimiento RESERVA
   - Retiro → Crear movimiento SALIDA + cancelar RESERVA
   - Expiración → Crear movimiento DESRESERVA

**Entregables:**
- Migración de BD con tabla stock_movements
- DTO, Repository, Service, Controller
- 2 endpoints: POST /api/stock-movements, GET /api/stock-movements
- Tests unitarios (50+ tests)

#### Sprint 7.2: Reglas de Reposición (2 días)

**Problema:** Reposición manual sin alertas automáticas

**Implementar:**

1. **Tabla: restock_rules**
   - Campos: id, ubicacion_tipo, ubicacion_id, producto_id, stock_min, stock_max, punto_pedido, lead_time_dias

2. **Service: RestockAlertService**
   - `checkLowStock()`: Detectar productos bajo mínimo
   - `generateRestockOrders()`: Generar pedidos automáticos
   - `getAlerts(filters)`: Alertas activas

3. **Cron Job:**
   - Verificar stock cada hora
   - Generar alertas automáticas
   - Notificar a responsables

**Entregables:**
- Tabla restock_rules
- Service con lógica de alertas
- Endpoint GET /api/restock-alerts
- Cron job configurado

---

### Sprint 8: Testing E2E y Integración (Semana 15)

**Objetivo:** Tests de integración completos para flujos críticos

#### Sprint 8.1: Tests de Integración API (3 días)

**Alcance:** Flujos completos con base de datos de test

1. **Flujo de Venta Completa:**
   - Crear venta → Pagar → Confirmar retiro
   - Verificar: stock reservado, stock consumido, movimientos registrados

2. **Flujo de Reposición:**
   - Crear pedido → Aprobar → Recibir
   - Verificar: stock actualizado, movimientos correctos

3. **Flujo de Precios:**
   - Crear precio base → Override ubicación → Resolver precio
   - Verificar: jerarquía correcta

**Setup:**
- Base de datos de test en Supabase
- Fixtures con datos de prueba
- Cleanup automático después de tests

**Entregables:**
- 50+ tests de integración
- Fixtures documentados
- Script de setup/teardown

#### Sprint 8.2: Tests E2E con Playwright (2 días)

**Alcance:** Flujos de usuario en dashboard

1. **Flujo Admin:**
   - Login → Ver dashboard → Crear service point → Asignar servicio

2. **Flujo Gestor:**
   - Ver inventario → Crear pedido reposición → Aprobar

3. **Flujo API:**
   - Simular app móvil → Crear venta → Confirmar retiro

**Entregables:**
- Playwright configurado
- 20+ tests E2E
- CI/CD pipeline con tests

---

### Sprint 9: Optimizaciones y Performance (Semana 16)

#### Sprint 9.1: Caching con Redis (3 días)

**Problema:** Queries repetitivas sin cache

**Implementar:**

1. **Cache de Precios:**
   - Key: `precio:${productoId}:${spId}:${ubicacionId}`
   - TTL: 1 hora
   - Invalidación: al actualizar precio

2. **Cache de Service Points:**
   - Key: `sp:${ubicacionId}`
   - TTL: 15 minutos

3. **Cache de Inventario:**
   - Key: `stock:${machineId}:${productoId}`
   - TTL: 5 minutos

**Entregables:**
- Redis configurado
- CacheService implementado
- 3 servicios con caching
- Benchmarks de performance

#### Sprint 9.2: Rate Limiting (2 días)

**Implementar:**

1. **Rate Limiter Middleware:**
   - 100 requests/minuto por IP
   - 1000 requests/hora por usuario autenticado
   - Limits personalizados por endpoint

2. **Endpoints Protegidos:**
   - Todos los POST/PUT/DELETE
   - Endpoints de consulta pública (stats, precios)

**Entregables:**
- Middleware rate-limiter
- Configuración por endpoint
- Tests de límites

---

### Sprint 10: Dashboard Improvements (Semana 17)

#### Sprint 10.1: Dashboard de Inventario Real-Time (3 días)

**Implementar:**

1. **Vista de Stock por Ubicación:**
   - Mapa de service points con alertas de stock bajo
   - Gráficos de rotación de productos
   - Alertas en tiempo real

2. **Panel de Reposición:**
   - Pedidos pendientes
   - Estado de transferencias
   - Historial de movimientos

**Entregables:**
- 4 páginas nuevas en dashboard
- Integración con APIs existentes
- WebSocket para updates real-time

#### Sprint 10.2: Reporting y Analytics (2 días)

**Implementar:**

1. **Reportes de Ventas:**
   - Ventas por service point
   - Productos más vendidos
   - Revenue por ubicación

2. **Reportes de Inventario:**
   - Stock actual vs óptimo
   - Productos con rotación lenta
   - Costo de inventario

**Entregables:**
- API endpoints de analytics
- Dashboard con gráficos
- Exportación a CSV/PDF

---

## 🔮 Roadmap Largo Plazo (Sprints 11+)

### Funcionalidades Planificadas

#### Autenticación y Permisos Avanzados (Sprint 11)
- Roles granulares (admin, gestor, operador, viewer)
- Permisos por service point
- Audit log de acciones

#### Notificaciones (Sprint 12)
- Sistema de notificaciones push
- Emails automáticos (alertas, confirmaciones)
- Webhooks para integraciones

#### Mobile App (Sprint 13-15)
- App React Native para peregrinos
- Escaneo QR para retiro
- Pago in-app con Stripe

#### Integraciones (Sprint 16-17)
- API para partners externos
- Integración con ERP/contabilidad
- Sincronización offline mejorada

#### Machine Learning (Sprint 18+)
- Predicción de demanda
- Optimización de stock
- Detección de anomalías

---

## 📝 Mejoras Técnicas Pendientes

### Alta Prioridad

1. **Centralizar Filtrado en Servicios**
   - **Problema:** Endpoints aplican filtros manualmente después de llamar servicios
   - **Solución:** Mover lógica de filtrado a servicios
   - **Archivos afectados:** service-points.ts, slots/index.ts, otros
   - **Impacto:** Reducir código en endpoints, mejorar testabilidad

2. **Implementar Paginación en Todos los Endpoints**
   - **Problema:** Solo algunos endpoints tienen paginación
   - **Solución:** Usar pagination.ts utility en todos los endpoints que retornan listas
   - **Archivos:** ~15 endpoints sin paginación
   - **Beneficio:** Performance, UX mejorada

3. **Documentar Patrones de Testing**
   - **Problema:** Conocimiento disperso, no documentado formalmente
   - **Solución:** Wiki con 10 patrones identificados en Sprint 5.2
   - **Contenido:** Mocking, validaciones, error handling, ownership
   - **Ubicación:** docs/testing/PATTERNS.md

### Prioridad Media

4. **Refactorizar Validaciones Repetitivas**
   - Crear middleware validateParams para validaciones comunes
   - Centralizar regex patterns (UUID, email, etc.)

5. **Mejorar Error Messages con i18n**
   - Preparar ErrorMessages para internacionalización
   - Soporte inglés/español

6. **Optimizar Queries de Supabase**
   - Añadir índices faltantes
   - Optimizar joins complejos
   - Cachear queries pesadas

### Baja Prioridad

7. **Migrar a TypeScript 5.0+**
   - Aprovechar nuevas features
   - Mejorar type safety

8. **Implementar Feature Flags**
   - Rollout gradual de features
   - A/B testing

---

## 🐛 Issues Conocidos

### Técnicos

1. **handleError retorna formato diferente a tests antiguos**
   - **Problema:** Tests esperan `{ error }` pero handleError retorna `{ error, code }`
   - **Impacto:** Bajo (solo afecta a tests no actualizados)
   - **Solución:** Actualizar tests gradualmente o crear adapter

2. **Paginación manual duplicada**
   - **Problema:** Misma lógica de paginación en múltiples endpoints
   - **Impacto:** Medio (código duplicado, mantenimiento)
   - **Solución:** Aplicar pagination.ts utility (Sprint 6)

3. **Filtrado fuera de servicios**
   - **Problema:** Lógica de negocio en endpoints
   - **Impacto:** Alto (violación de Clean Architecture)
   - **Solución:** Refactorizar en Sprint 6

### Deuda Técnica

1. **Tests E2E faltantes**
   - **Sprint:** 8.2 (planificado)

2. **Caching no implementado**
   - **Sprint:** 9.1 (planificado)

3. **Rate limiting ausente**
   - **Sprint:** 9.2 (planificado)

---

## 📊 Dependencias Externas

### Integradas

- ✅ Supabase (Base de datos y Auth)
- ✅ Stripe (Pagos)
- ✅ Next.js (Framework)
- ✅ TypeScript (Lenguaje)

### Pendientes

- ⏳ Redis (Caching - Sprint 9.1)
- ⏳ Playwright (E2E Testing - Sprint 8.2)
- ⏳ React Native (Mobile App - Sprint 13+)

---

## 🎓 Documentación Relacionada

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Clean Architecture detallada
- [SPRINT_5.1_COMPLETADO.md](./SPRINT_5.1_COMPLETADO.md) - Endpoints creados
- [SPRINT_5.2_COMPLETADO.md](./SPRINT_5.2_COMPLETADO.md) - Tests implementados
- [TEST_STATUS_REPORT.md](./TEST_STATUS_REPORT.md) - Estado de tests
- [../README.md](../README.md) - Setup y quick start
- [../CONTRIBUTING.md](../CONTRIBUTING.md) - Guía de contribución

---

## 📋 PROCESO MANDATORY DE DOCUMENTACIÓN

**CRITICAL:** Al finalizar CADA sprint o bloque de trabajo:

### 1. Generar CHANGELOG ✅ MANDATORY

```bash
# Al completar el sprint
npm run release
# o para especificar tipo
npm run release:minor  # Nueva feature
npm run release:major  # Breaking change
npm run release:patch  # Bug fix
```

Esto generará automáticamente `CHANGELOG.md` con todos los commits del sprint.

### 2. Crear Sprint Report ✅ MANDATORY

```bash
# Copiar template
cp docs/templates/SPRINT_REPORT_TEMPLATE.md docs/sprints/SPRINT_X.X_COMPLETADO.md

# Completar todas las secciones
# - Resumen ejecutivo
# - Tareas completadas por día
# - Problemas y soluciones
# - Métricas finales
# - Lecciones aprendidas
```

### 3. Actualizar COMPLETED_SPRINTS.md ✅ MANDATORY

Añadir entrada del sprint completado con:
- Resumen ejecutivo
- Métricas clave
- Archivos creados/modificados
- Tests status
- Lecciones aprendidas

### 4. Actualizar BACKLOG.md ✅ MANDATORY

- [ ] Marcar tasks completadas como ✅
- [ ] Mover tasks completadas a sección "Completed"
- [ ] Añadir nuevas tasks identificadas
- [ ] Actualizar prioridades si cambiaron
- [ ] Mover tasks pendientes a sprints futuros

### 5. Actualizar ROADMAP.md (este archivo) ✅ MANDATORY

- [ ] Marcar sprint completado con ✅
- [ ] Actualizar sección "Pendientes y Próximos Sprints"
- [ ] Ajustar estimaciones si es necesario
- [ ] Documentar cambios de prioridad

### Checklist de Finalización de Sprint

Antes de dar por finalizado un sprint:

```markdown
- [ ] `npm run release` ejecutado → CHANGELOG.md generado
- [ ] Sprint report creado en docs/sprints/
- [ ] COMPLETED_SPRINTS.md actualizado
- [ ] BACKLOG.md actualizado (tasks movidas)
- [ ] ROADMAP.md actualizado (sprint marcado ✅)
- [ ] Tests: 100% pasando
- [ ] Lint: 0 errors
- [ ] Build: exitoso
- [ ] Git commit: "chore(release): vX.X.X"
- [ ] Git tag: vX.X.X
```

### Frecuencia

- **Sprint completo (3-5 días):** Proceso completo MANDATORY
- **Bloque de trabajo (1 día):** Actualizar BACKLOG.md mínimo
- **Bug fix crítico:** CHANGELOG + BACKLOG.md

### Responsable

**Developer + GitHub Copilot** - Ambos son responsables de ejecutar el proceso.

---

**Nota:** Este roadmap es un documento vivo. Se actualiza después de cada sprint con progreso real y ajustes basados en prioridades de negocio.

**Contacto:** Para sugerencias o cambios en prioridades, crear issue en el repositorio.
