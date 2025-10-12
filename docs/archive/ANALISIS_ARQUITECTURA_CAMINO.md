# ANÁLISIS ARQUITECTURA CAMINO - ROADMAP DE IMPLEMENTACIÓN

**Fecha:** 10 de Octubre de 2025  
**Versión:** 1.0  
**Proyecto:** Sistema Camino - Marketplace de Servicios para Ciclistas

---

## ÍNDICE

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Estado Actual del Sistema](#2-estado-actual-del-sistema)
3. [Modelo de Negocio Requerido vs Implementado](#3-modelo-de-negocio-requerido-vs-implementado)
4. [Código Legacy a Eliminar](#4-código-legacy-a-eliminar)
5. [Código a Modificar](#5-código-a-modificar)
6. [Código a Implementar](#6-código-a-implementar)
7. [Roadmap de Base de Datos](#7-roadmap-de-base-de-datos)
8. [Roadmap de Implementación](#8-roadmap-de-implementación)
9. [Dudas y Clarificaciones Necesarias](#9-dudas-y-clarificaciones-necesarias)

---

## 1. RESUMEN EJECUTIVO

### 1.1. Situación Actual

El proyecto Camino tiene implementada una **arquitectura mixta** con:

- ✅ Clean Architecture de 5 capas funcional
- ✅ Sistema de Service Points básico (CSP, CSS, CSH)
- ✅ Gestión de bookings y pagos con Stripe
- ⚠️ Sistema de inventario parcialmente implementado
- ⚠️ Modelo de precios simplificado (sin jerarquía completa)
- ❌ **Falta concepto "Camino" como agrupador de ubicaciones**
- ❌ **Falta concepto "Ubicación" como contenedor de Service Points**
- ❌ Sistema de productos y máquinas de vending incompleto
- ❌ Gestión de stock entre almacén-SP-máquina no completada

### 1.2. Gap Principal

**ARQUITECTURA REQUERIDA vs IMPLEMENTADA:**

```
REQUERIDO:
Camino (1)
  └─> Ubicación/Ciudad (N)
       └─> Service Point (N)
            └─> Servicio (N)
                 └─> Máquina Vending (0-N) [si tipo VENDING]
                      └─> Productos con Stock

IMPLEMENTADO:
[NO EXISTE Camino]
  └─> [EXISTE "locations" pero SIN uso en relaciones]
       └─> Service Point (✓ EXISTE)
            └─> [Servicios mezclados con service_types]
                 └─> Vending Machine (✓ EXISTE pero sin productos)
                      └─> [Productos existen pero sin stock por máquina]
```

### 1.3. Impacto Estimado

- **Código Legacy a eliminar:** ~15% del código actual
- **Código a modificar:** ~40% del código actual
- **Código nuevo a implementar:** ~45% adicional
- **Migraciones de BD:** 12-15 migraciones críticas
- **Tiempo estimado:** 6-8 semanas (desarrollo full-time)

---

## 2. ESTADO ACTUAL DEL SISTEMA

### 2.1. Tablas Existentes en Base de Datos

**Total: 37 tablas**

#### Tablas Core (Usuarios y Autenticación)

- ✅ `users` - Usuarios del sistema
- ✅ `profiles` - Perfiles de usuarios
- ✅ `partners` - Socios/Partners

#### Tablas Service Points y Servicios

- ✅ `service_points` - Puntos de servicio (CSP/CSS/CSH)
- ✅ `workshops` - Talleres
- ✅ `vending_machines` - Máquinas de vending
- ✅ `services` - **Instancias de servicios** (cada servicio en un SP)
- ✅ `service_types` - **Tipos de servicios** (catálogo: VENDING, ALQUILER, etc.)
- ✅ `service_assignments` - Asignación servicios a SP
- ✅ `service_availability` - Disponibilidad de servicios
- ✅ `opening_hours` - Horarios de apertura
- ✅ `special_closures` - Cierres especiales

#### Tablas Ubicaciones

- ✅ `locations` - **Ciudades/Ubicaciones (EXISTE pero infrautilizada)**
- ⚠️ **NO hay tabla "caminos"** (concepto faltante)

#### Tablas Productos e Inventario

- ✅ `service_products` - Productos ofrecidos por servicios
- ✅ `product_categories` - Categorías de productos
- ✅ `product_subcategories` - Subcategorías de productos
- ✅ `service_product_assignments` - Asignación productos a servicios
- ⚠️ `warehouse_stock` - **Stock en almacenes (estructura básica)**
- ⚠️ `stock_movements` - **Movimientos de stock (estructura básica)**
- ⚠️ `warehouses` - **Almacenes (estructura básica, sin tipos)**

#### Tablas Reservas y Transacciones

- ✅ `bookings` - Reservas de servicios
- ✅ `payments` - Pagos
- ✅ `refunds` - Reembolsos
- ✅ `service_transactions` - Transacciones de servicio
- ✅ `revenue_streams` - Flujos de ingresos

#### Tablas Gestión y Reportes

- ✅ `favorites` - Favoritos de usuarios
- ✅ `reviews` - Reseñas
- ✅ `reportes` - Reportes del sistema
- ✅ `taller_managers` - Gestores de talleres
- ✅ `csps` - Datos específicos CSP

#### Tablas Pricing y Márgenes

- ✅ `service_pricing_rules` - Reglas de precios
- ✅ `service_point_margins` - Márgenes por punto de servicio

#### Otras Tablas

- ✅ `subscriptions` - Suscripciones
- ✅ `advertising_campaigns` - Campañas publicitarias
- ✅ `workshop_services` - Servicios de taller
- ✅ `spatial_ref_sys` - PostGIS (sistema de referencia espacial)
- ⚠️ `test_table` - **Tabla de pruebas (ELIMINAR)**

### 2.2. Estructura de Carpetas (Código)

#### DTOs Existentes

```
src/dto/
├── availability.dto.ts ✅
├── booking.dto.ts ✅
├── csp.dto.ts ✅
├── favorite.dto.ts ✅
├── inventory.dto.ts ⚠️ (simplificado)
├── inventory_item.dto.ts ⚠️ (simplificado)
├── partner.dto.ts ✅
├── payment.dto.ts ✅
├── report.dto.ts ✅
├── review.dto.ts ✅
├── service-point.dto.ts ✅ (MUY completo, mezcla conceptos)
├── taller_manager.dto.ts ✅
├── user.dto.ts ✅
├── vending_machine.dto.ts ✅ (sin productos)
└── workshop.dto.ts ✅
```

**FALTAN DTOs:**

- ❌ `camino.dto.ts` - Concepto jerárquico superior
- ❌ `ubicacion.dto.ts` - Reemplaza/extiende `location`
- ❌ `servicio.dto.ts` - Separar de `service-point.dto.ts`
- ❌ `producto.dto.ts` - Productos con inventario completo
- ❌ `stock.dto.ts` - Gestión de stock por ubicación
- ❌ `precio.dto.ts` - Sistema de precios jerárquico

#### Repositories Existentes (29 archivos)

```
src/repositories/
├── availability.repository.ts ✅
├── base.repository.ts ✅ (patrón correcto)
├── booking.repository.ts ✅
├── csp.repository.ts ✅
├── favorite.repository.ts ✅
├── geolocation.repository.ts ✅
├── inventory.repository.ts ⚠️
├── inventory_item.repository.ts ⚠️
├── location.repository.ts ✅ (infrautilizado)
├── partner.repository.ts ✅
├── payment.repository.ts ✅
├── product-category.repository.ts ✅
├── product-subcategory.repository.ts ✅
├── report.repository.ts ✅
├── review.repository.ts ✅
├── service-assignment.repository.ts ✅
├── service-point.repository.ts ✅
├── service-product.repository.ts ⚠️
├── service-type.repository.ts ✅
├── service.repository.ts ⚠️ (confuso con service_types)
├── stock-movement.repository.ts ⚠️ (básico)
├── stock-request.repository.ts ⚠️ (básico)
├── taller_manager.repository.ts ✅
├── user.repository.ts ✅
├── vending-machine.repository.ts ✅ (duplicado)
├── vending_machine.repository.ts ✅ (duplicado)
├── warehouse-stock.repository.ts ⚠️
├── warehouse.repository.ts ⚠️
└── workshop.repository.ts ✅
```

**ISSUES:**

- 🔴 **Duplicado:** `vending-machine.repository.ts` y `vending_machine.repository.ts`
- 🔴 **Confusión:** `service.repository.ts` vs `service-type.repository.ts` (conceptos mezclados)
- 🟡 **Incompletos:** inventory, warehouse, stock-\* (sin lógica de negocio completa)

#### Services Existentes (25 archivos)

```
src/services/
├── availability.service.ts ✅
├── base.service.ts ✅
├── booking.service.ts ✅
├── csp.service.ts ✅
├── favorite.service.ts ✅
├── geolocation.service.ts ✅
├── inventory.service.ts ⚠️
├── inventory_item.service.ts ⚠️
├── location.service.ts ✅
├── partner.service.ts ✅
├── payment.service.ts ✅
├── product-category.service.ts ✅
├── product-subcategory.service.ts ✅
├── report.service.ts ✅
├── review.service.ts ✅
├── service-assignment.service.ts ✅
├── service-point.service.ts ✅
├── service-product.service.ts ⚠️
├── service-type.service.ts ✅
├── service.service.ts ⚠️
├── service.service.ts.bak ❌ (archivo backup)
├── stock-request.service.ts ⚠️
├── supabase-test.ts ❌ (archivo de prueba)
├── supabase.ts ✅
├── taller_manager.service.ts ✅
├── user.service.ts ✅
├── vending-machine.service.ts ⚠️
├── vending_machine.service.ts ⚠️ (duplicado)
├── warehouse-inventory.service.ts ⚠️
└── warehouse.service.ts ⚠️
```

**ISSUES:**

- 🔴 **Archivo .bak:** `service.service.ts.bak` (ELIMINAR)
- 🔴 **Test file:** `supabase-test.ts` (ELIMINAR o mover a **tests**)
- 🔴 **Duplicados:** vending-machine vs vending_machine

### 2.3. Endpoints API Existentes

```
pages/api/
├── booking.ts ✅
├── bookings/ ✅
├── categories/ ✅
├── csp.ts ✅
├── csp/ ✅
├── favorite.ts ✅
├── geolocation/ ✅
├── index.ts ✅
├── inventory.ts ⚠️
├── inventory_items.ts ⚠️
├── locations/ ⚠️ (infrautilizado)
├── margins/ ✅
├── network/ ✅
├── partner.ts ✅
├── payment.ts ✅
├── payments/ ✅
├── products/ ⚠️ (estructura básica)
├── report.ts ✅
├── review.ts ✅
├── service-assignments/ ✅
├── service-points/ ✅
├── service-types/ ✅
├── services/ ⚠️
├── stock-requests/ ⚠️ (básico)
├── subcategories/ ✅
├── swagger.ts ✅
├── taller_manager.ts ✅
├── user.ts ✅
├── users/ ✅
├── vending-machines/ ⚠️
├── vending_machine.ts ⚠️
├── warehouse-inventory/ ⚠️
├── warehouses/ ⚠️
├── webhook/ ✅
└── workshop.ts ✅
```

---

## 3. MODELO DE NEGOCIO REQUERIDO VS IMPLEMENTADO

### 3.1. Jerarquía de Entidades

#### ✅ IMPLEMENTADO CORRECTAMENTE

1. **Usuarios y Autenticación**

   - ✅ Sistema de usuarios completo
   - ✅ Roles (admin, user, mechanic)
   - ✅ Perfiles y autenticación

2. **Partners**

   - ✅ Gestión de socios
   - ✅ Tipos de partners (albergue, hotel, gasolinera)

3. **Service Points (Parcial)**

   - ✅ Tipos CSP/CSS/CSH implementados
   - ✅ Datos básicos (ubicación, contacto)
   - ✅ Horarios y disponibilidad
   - ⚠️ NO vinculados correctamente a "Ubicaciones"

4. **Bookings y Pagos**

   - ✅ Sistema de reservas completo
   - ✅ Integración Stripe
   - ✅ Gestión de estados

5. **Reviews y Favoritos**
   - ✅ Sistema de reseñas
   - ✅ Favoritos de usuarios

#### ⚠️ IMPLEMENTADO PARCIALMENTE

1. **Ubicaciones (locations)**

   - ✅ Tabla existe con campos básicos
   - ❌ NO se usa como contenedor de Service Points
   - ❌ NO tiene relación jerárquica con "Camino"
   - ❌ Falta `zona_operativa`, `estado_operativo`

2. **Servicios**

   - ✅ `service_types` - Catálogo de tipos
   - ✅ `services` - Instancias de servicios
   - ⚠️ Confusión entre "tipo" e "instancia"
   - ❌ Falta relación N:M con Service Points (tiene 1:N)
   - ❌ Falta tabla intermedia con atributos locales

3. **Productos**

   - ✅ Catálogo de productos (`service_products`)
   - ✅ Categorías y subcategorías
   - ⚠️ Asignación a servicios básica
   - ❌ Falta gestión de stock por máquina
   - ❌ Falta `unidad_medida`, `caducidad`, `lotes`, `series`

4. **Máquinas de Vending**

   - ✅ Tabla `vending_machines` existe
   - ✅ Vinculadas a `service_points`
   - ⚠️ `capacity` y `current_stock` son números simples
   - ❌ NO hay stock por slot
   - ❌ NO hay productos asignados por máquina
   - ❌ Falta `política_reserva`, `tiempo_expiración`

5. **Inventario y Stock**

   - ✅ Tablas básicas: `warehouses`, `warehouse_stock`, `stock_movements`
   - ⚠️ `warehouses` no tiene `warehouse_type` (físico vs lógico)
   - ❌ NO hay concepto de "UbicaciónInventario" unificada
   - ❌ NO hay estados de stock (disponible, reservado, en tránsito)
   - ❌ NO hay pedidos de reposición completos
   - ❌ Falta lógica de min/max/punto_pedido

6. **Sistema de Precios**
   - ✅ `service_pricing_rules` existe
   - ⚠️ Implementación básica
   - ❌ NO hay jerarquía: Base → Ubicación → SP → Máquina
   - ❌ NO hay versionado de precios
   - ❌ NO hay registro de fuente aplicada en ventas

#### ❌ NO IMPLEMENTADO

1. **Camino (Agrupador Superior)**

   - ❌ NO existe tabla `caminos`
   - ❌ NO hay concepto de "zona operativa" superior
   - ❌ Campos faltantes: `nombre`, `código`, `región`, `estado_operativo`

2. **Ubicación como Contenedor**

   - ❌ `locations` existe pero no actúa como contenedor
   - ❌ NO tiene FK a `caminos`
   - ❌ NO se usa para agrupar Service Points
   - ❌ Falta `zona_operativa`, `estado_operativo`

3. **Servicio con Relación N:M**

   - ❌ NO hay tabla intermedia `servicio_service_point`
   - ❌ NO se puede tener un servicio en múltiples SPs con configuración local
   - ❌ Precio y disponibilidad son globales, no por SP

4. **Talleres con Exclusividad**

   - ✅ Tabla `workshops` existe
   - ❌ NO hay campo `exclusividad` (1:1 vs N:M con SPs)
   - ❌ NO hay `tipo_servicio` del taller
   - ❌ NO hay `zona_cobertura`, `prioridad`

5. **Productos con Gestión Completa**

   - ❌ Falta tabla `productos` independiente (actualmente `service_products`)
   - ❌ NO hay `unidad_medida`, `permite_lote`, `permite_serie`
   - ❌ NO hay dimensiones para slots
   - ❌ NO hay gestión de caducidad

6. **Stock por Máquina con Slots**

   - ❌ NO hay tabla `vending_machine_slots`
   - ❌ NO hay `stock_real` vs `stock_reservado` por slot
   - ❌ NO hay `capacidad_maxima` por slot
   - ❌ NO hay asignación producto → slot

7. **Ventas desde Máquinas**

   - ⚠️ `bookings` es para servicios, NO para ventas de productos
   - ❌ NO hay tabla `ventas_app` o `vending_sales`
   - ❌ NO hay gestión de reserva temporal
   - ❌ NO se registra `fuente_precio` aplicada

8. **Sistema de Precios Jerárquico**

   - ❌ NO hay tabla `precios` con niveles
   - ❌ NO hay `precio_base` en servicio/producto
   - ❌ NO hay `precio_ubicacion_override`
   - ❌ NO hay `precio_sp_override`
   - ❌ NO hay `precio_maquina_override`
   - ❌ NO hay versionado (`fecha_inicio`, `fecha_fin`, `version`)

9. **Inventario con Ubicaciones Lógicas**

   - ❌ NO hay concepto unificado `ubicacion_inventario`
   - ❌ NO hay tipos: `ALMACEN`, `SP`, `MAQUINA`, `SLOT`
   - ❌ NO hay jerarquía `ubicacion_padre`
   - ❌ NO hay estados de stock múltiples
   - ❌ NO hay `stock_teorico` vs `stock_fisico`

10. **Pedidos de Material Completos**

    - ⚠️ `stock_movements` existe pero es básico
    - ❌ NO hay estados completos del pedido
    - ❌ NO hay `origen_tipo` / `destino_tipo`
    - ❌ NO hay responsables de preparación/recepción
    - ❌ NO hay `lead_time`, `estrategia_picking`

11. **Reglas de Reposición**

    - ❌ NO hay tabla `reglas_reposicion`
    - ❌ NO hay `min`, `max`, `punto_pedido` por producto-ubicación
    - ❌ NO hay estrategias FEFO/FIFO/LIFO
    - ❌ NO hay alertas automáticas

12. **Auditoría de Inventario**
    - ❌ NO hay tabla `conteos_inventario`
    - ❌ NO hay `ajustes_stock` con motivos
    - ❌ NO hay frecuencia de conteo por ubicación
    - ❌ NO hay evidencias/fotos de conteo

---
