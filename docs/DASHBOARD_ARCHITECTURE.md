# Arquitectura del Dashboard Camino

## Estructura Basada en Endpoints Existentes

> **Fecha**: 15 de octubre de 2025  
> **Versión**: 2.0  
> **Objetivo**: Rediseño completo del dashboard eliminando código legacy y basándose 100% en los endpoints disponibles

---

## 📋 Principios de Diseño

1. **Un endpoint = Una página o sección**
2. **Agrupación lógica por dominio de negocio**
3. **Sin duplicación**: Eliminar páginas legacy que no tienen endpoints
4. **Navegación intuitiva**: Máximo 3 niveles de profundidad
5. **Datos en tiempo real**: Cada página consume su API correspondiente

---

## 🗂️ Estructura del Dashboard (Árbol Completo)

```
📱 ADMIN PANEL (/admin)
├── 🏠 Home (Overview/Stats generales)
│   └── Endpoints: /api/index (stats generales del sistema)
│
├── 📊 ANALYTICS & REPORTES
│   ├── 📈 Reportes
│   │   └── /api/report
│   └── 📉 Configuración de Red
│       └── /api/network/configuration
│
├── 💰 FACTURACIÓN & PAGOS
│   ├── 💳 Pagos (/dashboard/payments)
│   │   ├── Lista: GET /api/payments
│   │   ├── Detalle: GET /api/payments/[id]
│   │   ├── Estadísticas: GET /api/payments/stats
│   │   ├── Acciones:
│   │   │   ├── Confirmar: POST /api/payments/confirm
│   │   │   ├── Cancelar: POST /api/payments/cancel
│   │   │   └── Reembolsar: POST /api/payments/refund
│   │   └── Webhook: /api/webhook/stripe
│   │
│   ├── 💵 Márgenes de Ganancia (/dashboard/margins)
│   │   ├── Lista: GET /api/margins/[id]
│   │   └── Productos por margen: GET /api/margins/[id]/products
│   │
│   └── 🏷️ Sistema de Precios (/dashboard/pricing)
│       ├── Lista: GET /api/precios
│       ├── Detalle: GET /api/precios/[id]
│       └── Resolver precio: POST /api/precios/resolver
│
├── 📦 INVENTARIO & PRODUCTOS
│   ├── 🛍️ Productos (/dashboard/products)
│   │   ├── Lista: GET /api/products
│   │   ├── Detalle: GET /api/products/[id]
│   │   ├── Por SKU: GET /api/products/sku/[sku]
│   │   ├── Marcas: GET /api/products/brands
│   │   └── Tags: GET /api/products/tags
│   │   └── LEGACY: /api/productos/* (migrar a /api/products/*)
│   │
│   ├── 📂 Categorías (/dashboard/categories)
│   │   ├── Lista: GET /api/categories
│   │   ├── Detalle: GET /api/categories/[id]
│   │   └── Reordenar: PUT /api/categories/reorder
│   │
│   ├── 📁 Subcategorías (/dashboard/subcategories)
│   │   ├── Lista: GET /api/subcategories
│   │   └── Detalle: GET /api/subcategories/[id]
│   │
│   ├── 🏭 Almacenes (/dashboard/warehouses)
│   │   ├── Lista: GET /api/warehouses
│   │   ├── Detalle: GET /api/warehouses/[id]
│   │   └── Inventario por almacén: GET /api/warehouse-inventory/warehouse/[id]
│   │
│   └── 📊 Inventario de Almacén (/dashboard/warehouse-inventory)
│       ├── Resumen: GET /api/warehouse-inventory/summary
│       ├── Valor total: GET /api/warehouse-inventory/value
│       ├── Stock bajo: GET /api/warehouse-inventory/low-stock
│       ├── Ubicaciones: GET /api/warehouse-inventory/locations
│       ├── Movimientos: GET /api/warehouse-inventory/movements
│       ├── Por producto: GET /api/warehouse-inventory/product/[id]
│       └── Operaciones:
│           ├── Compra: POST /api/warehouse-inventory/purchase
│           ├── Ajuste: POST /api/warehouse-inventory/adjust
│           └── Transferencia: POST /api/warehouse-inventory/transfer
│
├── 🤖 VENDING MACHINES
│   ├── 🎰 Máquinas (/dashboard/vending-machines)
│   │   ├── Lista: GET /api/vending-machines
│   │   ├── Detalle: GET /api/vending-machines/[id]
│   │   └── Slots por máquina: GET /api/vending-machines/[id]/slots
│   │
│   └── 🎯 Slots (/dashboard/vending-machine-slots)
│       ├── Lista global: GET /api/vending-machine-slots
│       ├── Detalle: GET /api/vending-machines/[id]/slots/[slotId]
│       ├── Asignar producto: POST /api/vending-machine-slots/assign-product
│       ├── Crear múltiples: POST /api/vending-machine-slots/create-for-machine
│       ├── Reabastecer: POST /api/vending-machines/[id]/slots/reabastecer
│       └── Operaciones de stock: POST /api/vending-machine-slots/stock-operations
│
├── 📍 RED DE SERVICIO
│   ├── 🗺️ Ubicaciones (/dashboard/locations)
│   │   ├── Lista: GET /api/ubicaciones
│   │   ├── Detalle: GET /api/ubicaciones/[id]
│   │   └── Service points: GET /api/ubicaciones/[id]/service-points
│   │
│   ├── 🏪 Service Points (CSP) (/dashboard/service-points)
│   │   ├── Lista: GET /api/service-points
│   │   ├── Detalle: GET /api/service-points/[id]
│   │   ├── Estadísticas: GET /api/service-points/stats
│   │   ├── Ingresos: GET /api/service-points/[id]/revenue
│   │   └── LEGACY: /api/csp (migrar)
│   │
│   ├── ⚙️ Servicios (/dashboard/services)
│   │   ├── Lista: GET /api/services
│   │   ├── Detalle: GET /api/services/[id]
│   │   ├── Por estado: GET /api/services/by-status
│   │   ├── Requieren mantenimiento: GET /api/services/needing-maintenance
│   │   ├── Estado del servicio: GET /api/services/[id]/status
│   │   ├── Uso: GET /api/services/[id]/usage
│   │   └── Mantenimiento:
│   │       ├── Programar: POST /api/services/[id]/schedule-maintenance
│   │       └── Completar: POST /api/services/[id]/complete-maintenance
│   │
│   ├── 🏷️ Tipos de Servicio (/dashboard/service-types)
│   │   ├── Lista: GET /api/service-types
│   │   └── Detalle: GET /api/service-types/[id]
│   │
│   └── 🔗 Asignaciones de Servicio (/dashboard/service-assignments)
│       ├── Lista: GET /api/service-assignments
│       ├── Detalle: GET /api/service-assignments/[id]
│       └── Desasignar: POST /api/service-assignments/unassign
│
├── 📅 DISPONIBILIDAD (CSP)
│   └── 🕐 Gestión de Disponibilidad (/dashboard/availability)
│       ├── Estado general: GET /api/csp/[id]/availability
│       ├── Está abierto: GET /api/csp/[id]/availability/is-open
│       ├── Horarios: GET /api/csp/[id]/availability/opening-hours
│       ├── Verificar slot: GET /api/csp/[id]/availability/check-slot
│       ├── Servicios disponibles: GET /api/csp/[id]/availability/services
│       ├── Servicio específico: GET /api/csp/[id]/availability/services/[serviceId]
│       └── Cierres:
│           ├── Lista: GET /api/csp/[id]/availability/closures
│           ├── Crear: POST /api/csp/[id]/availability/closures
│           ├── Actualizar: PUT /api/csp/[id]/availability/closures/[closureId]
│           └── Eliminar: DELETE /api/csp/[id]/availability/closures/[closureId]
│
├── 📦 SOLICITUDES DE STOCK
│   └── 📋 Stock Requests (/dashboard/stock-requests)
│       ├── Lista: GET /api/stock-requests
│       ├── Detalle: GET /api/stock-requests/[id]
│       ├── Estadísticas: GET /api/stock-requests/stats
│       ├── En tránsito: GET /api/stock-requests/in-transit
│       ├── Requieren acción: GET /api/stock-requests/requiring-action
│       └── Operaciones:
│           ├── Consolidar: POST /api/stock-requests/[id]/consolidate
│           ├── Preparar: POST /api/stock-requests/[id]/prepare
│           ├── Enviar: POST /api/stock-requests/[id]/ship
│           ├── Entregar: POST /api/stock-requests/[id]/deliver
│           └── Cancelar: POST /api/stock-requests/[id]/cancel
│
├── 📅 RESERVAS & CITAS
│   └── 🗓️ Bookings (/dashboard/bookings)
│       ├── Lista: GET /api/bookings
│       ├── LEGACY: GET /api/booking (migrar)
│       └── Operaciones:
│           ├── Aprobar: POST /api/bookings/[id]/approve
│           ├── Cancelar: POST /api/bookings/[id]/cancel
│           └── Reagendar: POST /api/bookings/[id]/reschedule
│
├── 🛒 VENTAS APP
│   └── 💸 Ventas App (/dashboard/ventas-app)
│       ├── Lista: GET /api/ventas-app
│       ├── Detalle: GET /api/ventas-app/[id]
│       ├── Por usuario: GET /api/ventas-app/usuario/[userId]
│       └── Confirmar retiro: POST /api/ventas-app/[id]/confirmar-retiro
│
├── 👥 USUARIOS & PARTNERS
│   ├── 👤 Usuarios (/dashboard/users)
│   │   ├── Lista: GET /api/users
│   │   ├── Detalle: GET /api/users/[id]
│   │   └── LEGACY: /api/user (migrar)
│   │
│   ├── 🤝 Partners (/dashboard/partners)
│   │   └── LEGACY: /api/partner
│   │
│   └── ⭐ Favoritos (/dashboard/favorites)
│       └── /api/favorite
│
├── 🔧 TALLERES
│   ├── 🏗️ Talleres (/dashboard/workshops)
│   │   ├── Lista: GET /api/workshops
│   │   └── Detalle: GET /api/workshops/[id]
│   │
│   └── 👨‍🔧 Gestores de Taller (/dashboard/workshop-managers)
│       └── LEGACY: /api/taller_manager
│
├── ⭐ REVIEWS
│   └── 💬 Reseñas (/dashboard/reviews)
│       └── /api/review
│
├── 🚶 CAMINOS
│   └── 🛤️ Caminos (/dashboard/caminos)
│       ├── Lista: GET /api/caminos
│       ├── Detalle: GET /api/caminos/[id]
│       └── Estadísticas: GET /api/caminos/[id]/stats
│
├── 📍 GEOLOCALIZACIÓN
│   └── 🗺️ Servicios de Geo (/dashboard/geolocation)
│       └── /api/geolocation/[...path]
│
└── 📦 LEGACY (A MIGRAR O ELIMINAR)
    ├── /api/inventory.ts → Mover a warehouse-inventory
    ├── /api/inventory_items.ts → Mover a warehouse-inventory
    ├── /api/locations/* → Ya migrado a ubicaciones
    ├── /api/productos/* → Migrado a /api/products/*
    └── /api/vending_machine.ts → Migrado a vending-machines

```

---

## 🎯 Páginas Prioritarias (MVP)

### Nivel 1: Esenciales (Implementar primero)

1. **Admin Home** → `/admin`
2. **Productos** → `/admin/products`
3. **Vending Machines** → `/admin/vending-machines`
4. **Service Points** → `/admin/service-points`
5. **Stock Requests** → `/admin/stock-requests`
6. **Pagos** → `/admin/payments`

### Nivel 2: Importantes

7. **Warehouse Inventory** → `/admin/warehouse-inventory`
8. **Bookings** → `/admin/bookings`
9. **Usuarios** → `/admin/users`
10. **Servicios** → `/admin/services`

### Nivel 3: Opcionales

11. **Categorías** → `/admin/categories`
12. **Precios** → `/admin/pricing`
13. **Ventas App** → `/admin/ventas-app`
14. **Disponibilidad** → `/admin/availability`

---

## 🗑️ Páginas a ELIMINAR (No tienen endpoints)

```
❌ pages/admin/* → Mover todo a pages/admin/*
❌ pages/admin/analytics.tsx (no hay endpoint)
❌ pages/admin/customers.tsx (duplicado de users)
❌ pages/admin/finances.tsx (no hay endpoint específico)
❌ pages/admin/reports.tsx (solo existe /api/report genérico)
❌ pages/admin/settings.tsx (no hay endpoint /api/settings)
```

---

## 📐 Estructura de Archivos Propuesta

```
pages/admin/
├── index.tsx                          # Home/Overview
│
├── products/
│   ├── index.tsx                      # Lista de productos
│   └── [id].tsx                       # Detalle de producto
│
├── vending-machines/
│   ├── index.tsx                      # Lista de máquinas
│   ├── [id].tsx                       # Detalle de máquina
│   └── slots/
│       ├── index.tsx                  # Todos los slots (global)
│       └── [id].tsx                   # Detalle de slot
│
├── service-points/
│   ├── index.tsx                      # Lista de CSPs
│   ├── [id].tsx                       # Detalle de CSP
│   └── availability/
│       └── [id].tsx                   # Gestión de disponibilidad
│
├── warehouse/
│   ├── inventory.tsx                  # Inventario general
│   ├── locations.tsx                  # Ubicaciones de almacén
│   └── warehouses.tsx                 # Lista de almacenes
│
├── stock-requests/
│   ├── index.tsx                      # Lista de solicitudes
│   └── [id].tsx                       # Detalle de solicitud
│
├── payments/
│   ├── index.tsx                      # Lista de pagos
│   └── [id].tsx                       # Detalle de pago
│
├── bookings/
│   ├── index.tsx                      # Lista de reservas
│   └── [id].tsx                       # Detalle de reserva
│
├── users/
│   ├── index.tsx                      # Lista de usuarios
│   └── [id].tsx                       # Detalle de usuario
│
├── services/
│   ├── index.tsx                      # Lista de servicios
│   ├── [id].tsx                       # Detalle de servicio
│   ├── types.tsx                      # Tipos de servicio
│   └── assignments.tsx                # Asignaciones
│
├── pricing/
│   ├── index.tsx                      # Sistema de precios
│   └── margins.tsx                    # Márgenes de ganancia
│
├── ventas-app/
│   └── index.tsx                      # Gestión de ventas app
│
└── categories/
    ├── index.tsx                      # Categorías
    └── subcategories.tsx              # Subcategorías
```

---

## 🎨 Componentes Reutilizables Necesarios

```typescript
// Componentes base
src/components/dashboard/
├── DashboardLayout.tsx               ✅ Ya existe
├── DashboardHeader.tsx               🆕 Crear
├── DashboardSidebar.tsx              🆕 Crear
├── DashboardStats.tsx                🆕 Crear
│
├── data-tables/
│   ├── ProductsTable.tsx
│   ├── VendingMachinesTable.tsx
│   ├── ServicePointsTable.tsx
│   ├── PaymentsTable.tsx
│   └── GenericDataTable.tsx          🆕 Crear (reusable)
│
├── forms/
│   ├── ProductForm.tsx
│   ├── VendingMachineForm.tsx
│   ├── ServicePointForm.tsx
│   └── GenericForm.tsx               🆕 Crear (reusable)
│
└── widgets/
    ├── StatsCard.tsx                 🆕 Crear
    ├── RecentActivity.tsx            🆕 Crear
    ├── QuickActions.tsx              🆕 Crear
    └── AlertsBanner.tsx              🆕 Crear
```

---

## 🔄 Plan de Migración

### Fase 1: Limpieza (Semana 1)

- [ ] Eliminar archivos legacy sin endpoints
- [ ] Documentar endpoints duplicados (productos vs products)
- [ ] Crear estructura de carpetas nueva

### Fase 2: Componentes Base (Semana 1-2)

- [ ] Crear GenericDataTable reutilizable
- [ ] Crear GenericForm reutilizable
- [ ] Crear widgets de dashboard (StatsCard, etc.)

### Fase 3: Páginas MVP (Semana 2-3)

- [ ] Dashboard Home con stats generales
- [ ] Products (migrar desde productos)
- [ ] Vending Machines
- [ ] Service Points
- [ ] Stock Requests
- [ ] Payments

### Fase 4: Páginas Secundarias (Semana 3-4)

- [ ] Warehouse Inventory
- [ ] Bookings
- [ ] Users
- [ ] Services

### Fase 5: Testing & Refinamiento (Semana 4)

- [ ] Testing de todas las páginas
- [ ] Optimización de performance
- [ ] Documentación de uso

---

## 🚀 Ventajas del Nuevo Diseño

1. **100% basado en endpoints reales** - No hay páginas "fantasma"
2. **Navegación clara** - Máximo 3 niveles de profundidad
3. **Componentes reutilizables** - Menos código, más mantenible
4. **Escalable** - Fácil agregar nuevas secciones
5. **Performance** - Carga solo lo necesario
6. **TypeScript estricto** - Tipos para todos los endpoints
7. **Sin duplicación** - Un solo lugar para cada funcionalidad

---

## 📊 Métricas de Mejora Esperadas

| Métrica                   | Antes | Después | Mejora |
| ------------------------- | ----- | ------- | ------ |
| Páginas totales           | ~30   | ~18     | -40%   |
| Código duplicado          | Alto  | Bajo    | -60%   |
| Componentes reutilizables | ~5    | ~15     | +200%  |
| Endpoints sin usar        | ~10   | 0       | -100%  |
| Tiempo de carga           | Lento | Rápido  | +50%   |

---

## 🔗 Endpoints Legacy a Consolidar

```typescript
// ANTES (Legacy)
/api/productos → /api/products ✅
/api/user → /api/users ✅
/api/booking → /api/bookings ✅
/api/csp → /api/service-points ✅
/api/vending_machine → /api/vending-machines ✅
/api/locations → /api/ubicaciones ✅

// MANTENER como alias hasta migración completa
// Después deprecar y eliminar
```

---

## 📝 Notas Importantes

1. **No crear páginas sin endpoint**: Si no hay API, no hay página
2. **Usar SWR o React Query**: Para cache y revalidación automática
3. **Lazy loading**: Cargar componentes pesados solo cuando se necesiten
4. **Error boundaries**: Manejar errores de API gracefully
5. **Loading states**: Skeleton loaders en todas las páginas
6. **Responsive**: Mobile-first design

---

## 🎯 Próximos Pasos

1. **Revisar este documento** con el equipo
2. **Priorizar MVP** (6 páginas esenciales)
3. **Crear issues en GitHub** para cada página
4. **Asignar trabajo** por sprints
5. **Documentar cada endpoint** en Swagger
6. **Crear tests E2E** para flujos críticos

---

**Última actualización**: 15 de octubre de 2025  
**Autor**: AI Assistant  
**Revisor**: [Pendiente]
