# ANÁLISIS ARQUITECTURA CAMINO - PARTE 3

# Secciones 7-9: Roadmap de Base de Datos, Implementación y Dudas

---

## 7. ROADMAP DE BASE DE DATOS

### 7.1. Fase 1: Jerarquía de Entidades (Semana 1)

**Objetivo:** Establecer la estructura jerárquica Camino → Ubicación → Service Point

#### Sprint 1.1: Caminos y Ubicaciones (3 días)

```sql
-- Día 1-2
✅ Migración 1: Crear tabla caminos
✅ Migración 2: Mejorar tabla locations (FK a caminos)
✅ Migración 2.1: Poblar datos iniciales de caminos
✅ Migración 2.2: Asociar locations existentes a caminos

-- Día 3
✅ Crear función get_camino_stats()
✅ Crear vista v_ubicaciones_full (con datos de camino)
✅ Tests de integridad referencial
```

#### Sprint 1.2: Service Points Mejorados (2 días)

```sql
-- Día 4-5
✅ Migración 3: Mejorar service_points (FK obligatorio a locations)
✅ Actualizar datos existentes (asignar location_id)
✅ Agregar campos: almacen_local_id, modo_operacion
✅ Crear función get_service_point_hierarchy()
✅ Crear vista v_service_points_full (con ubicación y camino)
```

### 7.2. Fase 2: Servicios y Relación N:M (Semana 2)

#### Sprint 2.1: Tabla Intermedia Servicio-SP (3 días)

```sql
-- Día 1-2
✅ Migración 4: Crear servicio_service_point
✅ Migración 5: Mejorar tabla services (deprecar service_point_id)
✅ Migrar datos existentes a tabla intermedia

-- Día 3
✅ Crear funciones:
   - assign_service_to_sp()
   - unassign_service_from_sp()
   - get_services_by_sp()
   - get_sps_by_service()
✅ Crear vista v_service_assignments_full
```

#### Sprint 2.2: Tipos de Servicio (2 días)

```sql
-- Día 4-5
✅ Verificar service_types está correctamente implementado
✅ Agregar campo tipo_servicio en services si falta
✅ Crear función get_services_by_type()
✅ Poblar catálogo inicial de tipos:
   - VENDING
   - ALQUILER_ESPACIO
   - MANTENIMIENTO
   - LAVADO
   - CARGA_EBIKE
```

### 7.3. Fase 3: Productos e Inventario (Semana 3)

#### Sprint 3.1: Productos (3 días)

```sql
-- Día 1-2
✅ Migración 6: Crear tabla productos
✅ Migrar datos de service_products a productos
✅ Agregar campos: unidad_medida, dimensiones, caducidad

-- Día 3
✅ Crear funciones:
   - get_producto_con_stock()
   - check_producto_disponible()
✅ Crear vista v_productos_inventario
```

#### Sprint 3.2: Máquinas Vending con Slots (2 días)

```sql
-- Día 4-5
✅ Migración 7: Mejorar vending_machines
✅ Crear tabla vending_machine_slots
✅ Migrar datos existentes (capacity → slots)
✅ Agregar: politica_reserva, tiempo_expiracion
✅ Crear funciones:
   - create_slots_for_machine()
   - asignar_producto_a_slot()
   - get_stock_disponible_slot()
```

### 7.4. Fase 4: Ventas y Precios (Semana 4)

#### Sprint 4.1: Ventas desde App (2 días)

```sql
-- Día 1-2
✅ Migración 8: Crear tabla ventas_app
✅ Crear funciones:
   - crear_venta_app()
   - reservar_stock_slot()
   - liberar_stock_expirado()
   - confirmar_retiro()
✅ Crear trigger auto-expiracion de reservas
```

#### Sprint 4.2: Sistema de Precios (3 días)

```sql
-- Día 3-5
✅ Migración 9: Crear tabla precios
✅ Migrar precios existentes como nivel 'base'
✅ Crear función resolver_precio() - Jerarquía completa
✅ Crear vista v_precios_vigentes
✅ Crear función get_precio_aplicable(
       entidad_tipo,
       entidad_id,
       ubicacion_id?,
       sp_id?,
       machine_id?,
       fecha?
   ) → PrecioResuelto
```

### 7.5. Fase 5: Inventario Completo (Semana 5)

#### Sprint 5.1: Ubicaciones de Inventario (3 días)

```sql
-- Día 1-2
✅ Migración 10: Mejorar warehouses (jerarquía)
✅ Crear tabla warehouse_stock_detail con estados
✅ Agregar columnas:
   - ubicacion_padre_id
   - nivel_jerarquia
   - warehouse_type (con más valores)

-- Día 3
✅ Crear funciones:
   - get_stock_by_ubicacion()
   - get_stock_jerarquia_completa()
   - transferir_stock()
```

#### Sprint 5.2: Movimientos de Stock (2 días)

```sql
-- Día 4-5
✅ Migración 11: Mejorar stock_movements
✅ Agregar estados: borrador, solicitado, en_transito, etc.
✅ Agregar: origen_tipo, destino_tipo, responsables
✅ Crear funciones:
   - crear_pedido_reposicion()
   - aprobar_pedido()
   - iniciar_transito()
   - confirmar_recepcion()
✅ Crear triggers para actualizar stock automáticamente
```

### 7.6. Fase 6: Reglas y Automatización (Semana 6)

#### Sprint 6.1: Reglas de Reposición (2 días)

```sql
-- Día 1-2
✅ Migración 12: Crear reglas_reposicion
✅ Crear funciones:
   - check_stock_bajo_minimo()
   - generar_pedido_automatico()
   - get_productos_requieren_reposicion()
✅ Crear job programado check_reposicion_diario
```

#### Sprint 6.2: Auditoría y Ajustes (3 días)

```sql
-- Día 3-5
✅ Crear tabla conteos_inventario
✅ Crear tabla ajustes_stock
✅ Crear funciones:
   - iniciar_conteo()
   - registrar_conteo()
   - cerrar_conteo_con_ajustes()
   - get_diferencias_inventario()
✅ Crear vista v_auditoria_stock
```

---

## 8. ROADMAP DE IMPLEMENTACIÓN (CÓDIGO)

### 8.1. Fase 1: DTOs y Schemas (Semana 7)

#### Sprint 1.1: Nuevos DTOs (3 días)

```typescript
Día 1:
✅ src/dto/camino.dto.ts
✅ src/dto/ubicacion.dto.ts
✅ src/schemas/camino.schema.ts
✅ src/schemas/ubicacion.schema.ts

Día 2:
✅ src/dto/producto.dto.ts
✅ src/dto/vending-machine-slot.dto.ts
✅ src/schemas/producto.schema.ts
✅ src/schemas/vending-machine-slot.schema.ts

Día 3:
✅ src/dto/venta-app.dto.ts
✅ src/dto/precio.dto.ts
✅ src/schemas/venta-app.schema.ts
✅ src/schemas/precio.schema.ts
```

#### Sprint 1.2: Refactorizar DTOs Existentes (2 días)

```typescript
Día 4:
✅ Separar service-point.dto.ts (eliminar LocationDTO, BookingDTO, etc.)
✅ Limpiar vending_machine.dto.ts (agregar slots)
✅ Actualizar inventory.dto.ts (estados de stock)

Día 5:
✅ Crear tests para todos los nuevos DTOs
✅ Verificar alineación DTO ↔ BD
```

### 8.2. Fase 2: Repositories (Semana 8)

#### Sprint 2.1: Nuevos Repositories (3 días)

```typescript
Día 1:
✅ src/repositories/camino.repository.ts (extends BaseRepository)
✅ src/repositories/ubicacion.repository.ts
✅ Tests: camino.repository.test.ts, ubicacion.repository.test.ts

Día 2:
✅ src/repositories/producto.repository.ts
✅ src/repositories/vending-machine-slot.repository.ts
✅ Tests correspondientes

Día 3:
✅ src/repositories/venta-app.repository.ts
✅ src/repositories/precio.repository.ts
✅ Tests correspondientes
```

#### Sprint 2.2: Refactorizar Repositories (2 días)

```typescript
Día 4:
✅ ELIMINAR: vending-machine.repository.ts (duplicado)
✅ Actualizar vending_machine.repository.ts (agregar métodos slots)
✅ Refactorizar service.repository.ts → service-instance.repository.ts
✅ Separar lógica de service-type.repository.ts

Día 5:
✅ Actualizar inventory.repository.ts (estados de stock)
✅ Actualizar warehouse.repository.ts (jerarquía)
✅ Actualizar stock-movement.repository.ts (estados completos)
✅ Tests de repositories modificados
```

### 8.3. Fase 3: Services (Semana 9)

#### Sprint 3.1: Nuevos Services (3 días)

```typescript
Día 1:
✅ src/services/camino.service.ts (extends BaseService)
✅ src/services/ubicacion.service.ts
✅ Lógica de negocio: validaciones, estadísticas

Día 2:
✅ src/services/producto.service.ts
✅ src/services/vending-machine-slot.service.ts
✅ Lógica: asignación producto-slot, cálculo stock disponible

Día 3:
✅ src/services/venta-app.service.ts
✅ Lógica: reserva, expiración, confirmación retiro
✅ Integración con payment.service.ts
```

#### Sprint 3.2: Servicio de Precios (2 días)

```typescript
Día 4-5:
✅ src/services/precio.service.ts
✅ Lógica de resolución jerárquica:
   - resolverPrecio(entidad, ubicacion, sp, machine)
   - getPrecioAplicable()
   - createPrecioOverride()
   - getHistorialPrecios()
✅ Tests completos de jerarquía
```

### 8.4. Fase 4: Controllers (Semana 10)

#### Sprint 4.1: Nuevos Controllers (3 días)

```typescript
Día 1:
✅ src/controllers/camino.controller.ts
✅ src/controllers/ubicacion.controller.ts
✅ Validación Zod, manejo errores

Día 2:
✅ src/controllers/producto.controller.ts
✅ src/controllers/vending-machine-slot.controller.ts
✅ Validación Zod completa

Día 3:
✅ src/controllers/venta-app.controller.ts
✅ src/controllers/precio.controller.ts
✅ Tests controllers
```

#### Sprint 4.2: Refactorizar Controllers (2 días)

```typescript
Día 4:
✅ Actualizar service-point.controller.ts (usar nuevos DTOs)
✅ Actualizar vending_machine.controller.ts (endpoints slots)
✅ Actualizar inventory.controller.ts (estados stock)

Día 5:
✅ Tests completos de controllers modificados
✅ Verificar cobertura >80% para nuevos controllers
```

### 8.5. Fase 5: Endpoints API (Semana 11)

#### Sprint 5.1: Nuevos Endpoints (3 días)

```typescript
Día 1: Caminos y Ubicaciones
✅ pages/api/caminos/index.ts (GET, POST)
✅ pages/api/caminos/[id].ts (GET, PUT, DELETE)
✅ pages/api/caminos/[id]/stats.ts
✅ pages/api/ubicaciones/index.ts
✅ pages/api/ubicaciones/[id].ts
✅ pages/api/ubicaciones/[id]/service-points.ts

Día 2: Productos y Slots
✅ pages/api/productos/index.ts (reemplazar products/)
✅ pages/api/productos/[id].ts
✅ pages/api/productos/sku/[sku].ts
✅ pages/api/vending-machines/[id]/slots/index.ts
✅ pages/api/vending-machines/[id]/slots/[slotId].ts
✅ pages/api/vending-machines/[id]/slots/reabastecer.ts

Día 3: Ventas y Precios
✅ pages/api/ventas-app/index.ts (POST - crear venta)
✅ pages/api/ventas-app/[id].ts (GET - detalle)
✅ pages/api/ventas-app/[id]/confirmar-retiro.ts (POST)
✅ pages/api/ventas-app/usuario/[userId].ts (GET - mis ventas)
✅ pages/api/precios/index.ts (GET, POST)
✅ pages/api/precios/[id].ts (GET, PUT, DELETE)
✅ pages/api/precios/resolver.ts (POST - resolver precio jerárquico)
```

#### Sprint 5.2: Documentación Swagger (2 días)

```typescript
Día 4-5:
✅ Agregar Swagger docs a todos los nuevos endpoints
✅ Actualizar swagger.ts con nuevas rutas
✅ Ejemplos de request/response
✅ Documentar códigos de error
```

### 8.6. Fase 6: Testing Completo (Semana 12)

#### Sprint 6.1: Tests Unitarios (3 días)

```typescript
Día 1: DTOs y Schemas
✅ Tests Zod schemas (success/fail cases)
✅ Tests DTO type inference
✅ Coverage >90% para schemas

Día 2: Repositories y Services
✅ Tests repositories con mock Supabase
✅ Tests services con mock repositories
✅ Coverage >80% para lógica de negocio

Día 3: Controllers
✅ Tests controllers con mock services
✅ Tests validación de entrada
✅ Tests manejo de errores
```

#### Sprint 6.2: Tests de Integración (2 días)

```typescript
Día 4:
✅ Tests E2E endpoints principales
✅ Tests flujo completo: crear venta → confirmar retiro
✅ Tests sistema de precios jerárquico

Día 5:
✅ Tests migración de datos
✅ Tests integridad referencial BD
✅ Tests performance queries críticos
✅ Verificar coverage global >50%
```

---

## 9. DUDAS Y CLARIFICACIONES NECESARIAS

### 9.1. Jerarquía de Entidades

#### ✅ RESUELTO: Concepto "Camino"

**Decisión:** Opción A - **Entidad independiente** implementada como tabla `caminos`

**Justificación:** Se mantiene como entidad separada para permitir gestión diferenciada por división de negocio (diferentes managers, políticas de pricing, reporting consolidado por camino).

**Implementación:**

```sql
CREATE TABLE caminos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  zona_operativa VARCHAR(100),
  region VARCHAR(100),
  estado_operativo VARCHAR(50) DEFAULT 'activo'
);
```

#### ✅ RESUELTO: Ubicación vs Service Point

**Decisión:** Mantener separación Ubicación → Service Point (relación 1:N flexible)

**Escenarios soportados:**

- Pueblo pequeño: 1 ubicación = 1 SP ✅
- Ciudad grande: 1 ubicación = 10+ SPs ✅

**Justificación:** La separación permite:

- Gestión a nivel ciudad (ej: "Madrid tiene descuento del 10% en todos los SPs")
- Políticas diferenciadas por ubicación
- Reporting consolidado por ciudad/zona

**Implementación:**

```sql
-- locations representa "Ubicación" (ciudad/zona)
ALTER TABLE locations ADD COLUMN camino_id UUID REFERENCES caminos(id);

-- service_points con FK obligatorio a locations
ALTER TABLE service_points
  ALTER COLUMN location_id SET NOT NULL,
  ADD CONSTRAINT fk_service_point_location
    FOREIGN KEY (location_id) REFERENCES locations(id);
```

#### ✅ RESUELTO: Mini-almacén Local

**Decisión:** Opción A - **Warehouse separado** con `warehouse_type='service_point'`

**Justificación:** Aunque sea un mueble/estantería pequeña, puede contener productos que no están a la venta inmediata (stock de respaldo). Necesitamos inventario detallado por producto.

**Implementación:**

```sql
ALTER TABLE service_points
  ADD COLUMN almacen_local_id UUID REFERENCES warehouses(id);

-- Warehouse con tipo específico
ALTER TABLE warehouses
  ADD COLUMN warehouse_type VARCHAR(50) DEFAULT 'central'
    CHECK (warehouse_type IN ('central', 'service_point', 'transitorio'));
```

**Flujo operativo:**

```
Almacén Central (warehouse_type='central')
  └─> Mini-almacén SP (warehouse_type='service_point')
       └─> Máquina Vending (inventory directo en slots)
```

### 9.2. Servicios y Productos

#### ✅ RESUELTO: Servicio Global vs Servicio Local

**Decisión:** Opción A - **Servicio como Plantilla Global** con customización local

**Respuestas validadas:**

1. ✅ **¿Necesitas reporting consolidado?** → SI (ej: "¿Cuántos SPs tienen Vending activo?")
2. ✅ **¿Quién crea servicios nuevos?** → ADMIN CENTRAL
3. ✅ **¿Desactivar globalmente?** → NO (desactivación solo a nivel SP, nunca global)

**Justificación:**

- Reporting consolidado es clave para el negocio
- Control centralizado de catálogo de servicios
- Flexibilidad total de cada SP para personalizar precios/horarios/configuración
- Desactivación solo local protege autonomía de cada SP

**Implementación:**

```sql
-- Tabla 1: Servicios globales (plantillas reutilizables)
-- NOTA: Sin campo "activo" global, solo a nivel SP
services (
  id UUID PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  service_type_id UUID REFERENCES service_types(id),
  descripcion_base TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla 2: Asignación con customización por SP (tabla intermedia)
CREATE TABLE servicio_service_point (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  service_point_id UUID REFERENCES service_points(id) ON DELETE CASCADE,
  precio_local DECIMAL(10,2), -- Override del precio, NULL = usa precio del service_type
  horario_local JSONB, -- Override de horarios {"lunes": "08:00-20:00", ...}
  configuracion_local JSONB, -- Productos específicos, capacidad, etc.
  activo BOOLEAN DEFAULT true, -- Activo solo en este SP
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(service_id, service_point_id)
);

CREATE INDEX idx_servicio_sp_service ON servicio_service_point(service_id);
CREATE INDEX idx_servicio_sp_sp ON servicio_service_point(service_point_id);
CREATE INDEX idx_servicio_sp_activo ON servicio_service_point(activo) WHERE activo = true;
```

**Flujo operativo:**

1. Admin Central crea servicio "Vending Snacks" (plantilla global)
2. Manager SP-Madrid asigna servicio a su SP
3. Manager personaliza: precio 2.50€, productos {coca-cola, chips}, horario 24/7
4. Manager SP-Sevilla asigna mismo servicio
5. Manager personaliza: precio 2.00€, productos {agua, frutos secos}, horario 08:00-22:00
6. Si Manager SP-Madrid desactiva → Solo afecta a Madrid (activo=false local)
7. Si Admin Central elimina servicio → CASCADE elimina todas las asignaciones

#### ✅ RESUELTO: Precio de Servicio vs Precio de Producto

**Decisión:** El sistema de precios jerárquico aplica **TANTO a servicios COMO a productos**

**Confirmado:** Los servicios tienen precios variables por ubicación/SP:

**Ejemplo:**

```
Servicio: "Alquiler Espacio Taller"
├─> Precio base: 10€/hora
├─> Ubicación Madrid: 15€/hora (override)
├─> SP-Madrid-Atocha: 18€/hora (override)
└─> SP-Madrid-Retiro: 15€/hora (usa precio ubicación)
```

**Implementación:**

```sql
-- Tabla unificada de precios
CREATE TABLE precios (
  id UUID PRIMARY KEY,
  entidad_tipo VARCHAR(50), -- 'producto' o 'servicio'
  entidad_id UUID,          -- ID del producto o servicio
  nivel VARCHAR(50),        -- 'base', 'ubicacion', 'service_point', 'machine'
  ubicacion_id UUID,
  service_point_id UUID,
  machine_id UUID,
  precio DECIMAL(10,2),
  fecha_inicio DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT true
);
```

#### ✅ RESUELTO: Productos Fuera de Vending

**Decisión:** Los productos se gestionan **exclusivamente a través de máquinas de vending**

**Aclarado:**

- ❌ NO hay venta directa de productos sin máquina
- ✅ Usuario SOLO compra productos desde máquinas de vending
- ✅ Talleres mecánicos NO venden repuestos directos (solo servicios de mano de obra)

**Flujo confirmado:**

```
Usuario necesita repuesto
  └─> Taller hace el servicio (mano de obra) ✅
  └─> Repuesto viene de máquina vending O usuario trae el suyo ✅
  └─> Taller NO vende productos directamente ❌
```

**Impacto en BD:**

- Simplifica inventario: Solo máquinas gestionan productos
- Tabla `productos` solo se vincula a `vending_machine_slots`
- NO necesitamos `workshop_inventory`

**Sistema de Comisiones:**

```
Taller asociado hace mantenimiento
  ├─> Usuario paga servicio (ej: 20€)
  ├─> Camino comisiona al taller (ej: 10% = 2€)
  └─> Camino NO gestiona repuestos del taller
      (solo comisiona servicios referidos)
```

#### ✅ RESUELTO: Stock en Talleres

**Decisión:** Los talleres tienen inventario propio pero **Camino NO lo gestiona**

**Aclarado:**

- ✅ Workshops tienen stock de repuestos (cadenas, cables, etc.)
- ❌ Camino NO gestiona ese inventario
- ✅ Camino solo comisiona por servicios prestados

**Impacto en BD:**

- ❌ NO necesitamos `warehouse_type='workshop'`
- ❌ NO necesitamos rastrear stock de talleres
- ✅ Solo gestionamos: bookings + payments + comisiones

**Arquitectura simplificada:**

```sql
-- Talleres: solo datos del partner
workshops (id, partner_id, nombre, servicios_ofrecidos)

-- Servicios del taller (catálogo)
workshop_services (id, workshop_id, nombre, precio, duracion)

-- Bookings de servicios
bookings (id, user_id, workshop_id, service_id, fecha, estado)

-- Comisiones
service_transactions (id, booking_id, monto_total, comision_camino, pago_partner)
```

#### ✅ RESUELTO: Reserva HARD vs SOFT

**Decisión:** Solo reserva **HARD** (stock bloqueado inmediatamente)

**Definición:**

- **HARD**: Stock se bloquea al momento del pago, no se puede vender a otro usuario
- **SOFT**: (Eliminado - no aplica)

**Flujo confirmado:**

```
1. Usuario selecciona producto en app
2. Usuario PAGA (Stripe/otro medio)
3. Stock se BLOQUEA en slot inmediatamente
4. Usuario tiene X minutos para retirar (ej: 15 min)
5. Si expira tiempo → liberar stock automáticamente
```

**Implementación:**

```sql
-- Slot con estados claros
CREATE TABLE vending_machine_slots (
  id UUID PRIMARY KEY,
  machine_id UUID NOT NULL,
  slot_number INTEGER NOT NULL,
  producto_id UUID,
  capacidad_maxima INTEGER,
  stock_disponible INTEGER,  -- Stock libre para venta
  stock_reservado INTEGER,   -- Stock bloqueado (HARD)
  CONSTRAINT check_stock CHECK (stock_disponible + stock_reservado <= capacidad_maxima)
);

-- Venta con expiración
CREATE TABLE ventas_app (
  id UUID PRIMARY KEY,
  slot_id UUID,
  estado VARCHAR(50), -- 'pagado', 'confirmado', 'expirado'
  fecha_expiracion TIMESTAMP,
  codigo_retiro VARCHAR(10)
);

-- Job programado cada 1 minuto
CREATE FUNCTION liberar_reservas_expiradas()
RETURNS void AS $$
BEGIN
  UPDATE vending_machine_slots s
  SET stock_reservado = stock_reservado - 1,
      stock_disponible = stock_disponible + 1
  FROM ventas_app v
  WHERE v.slot_id = s.id
    AND v.estado = 'pagado'
    AND v.fecha_expiracion < NOW();

  UPDATE ventas_app
  SET estado = 'expirado'
  WHERE estado = 'pagado'
    AND fecha_expiracion < NOW();
END;
$$ LANGUAGE plpgsql;
```

### 9.3. Sistema de Precios

#### ✅ RESUELTO: Precio por Máquina

**Decisión:** Los precios son máximo hasta nivel **Service Point** (sin diferenciación por máquina individual)

**Jerarquía simplificada a 3 niveles:**

```
Nivel 1: Precio BASE (global)
  └─> Producto: "Coca-Cola" = 2.00€

Nivel 2: Precio UBICACIÓN (ciudad/zona)
  └─> Madrid: "Coca-Cola" = 2.50€ (override)
  └─> Sevilla: usa precio base 2.00€

Nivel 3: Precio SERVICE POINT (SP específico)
  └─> SP-Madrid-Atocha: "Coca-Cola" = 3.00€ (override)
  └─> SP-Madrid-Retiro: usa precio ubicación 2.50€
```

**Todas las máquinas del mismo SP tienen el mismo precio** ✅

**Justificación:** Simplifica operación y evita confusión para usuarios. No tiene sentido que dos máquinas a 10 metros de distancia tengan precios diferentes.

**Implementación:**

```sql
CREATE TABLE precios (
  id UUID PRIMARY KEY,
  entidad_tipo VARCHAR(50) CHECK (entidad_tipo IN ('producto', 'servicio')),
  entidad_id UUID NOT NULL,

  -- Jerarquía de 3 niveles (NO 4)
  nivel VARCHAR(50) CHECK (nivel IN ('base', 'ubicacion', 'service_point')),

  ubicacion_id UUID REFERENCES locations(id),      -- Solo para nivel 'ubicacion'
  service_point_id UUID REFERENCES service_points(id), -- Solo para nivel 'service_point'
  -- NO hay machine_id

  precio DECIMAL(10,2) NOT NULL,
  fecha_inicio DATE DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  version INTEGER DEFAULT 1,
  activo BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Función de resolución simplificada
CREATE FUNCTION resolver_precio(
  p_entidad_tipo VARCHAR,
  p_entidad_id UUID,
  p_ubicacion_id UUID DEFAULT NULL,
  p_service_point_id UUID DEFAULT NULL
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  precio_resuelto DECIMAL(10,2);
BEGIN
  -- Buscar en orden: SP → Ubicación → Base
  SELECT precio INTO precio_resuelto
  FROM precios
  WHERE entidad_tipo = p_entidad_tipo
    AND entidad_id = p_entidad_id
    AND activo = true
    AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
  ORDER BY
    CASE
      WHEN nivel = 'service_point' AND service_point_id = p_service_point_id THEN 1
      WHEN nivel = 'ubicacion' AND ubicacion_id = p_ubicacion_id THEN 2
      WHEN nivel = 'base' THEN 3
    END
  LIMIT 1;

  RETURN COALESCE(precio_resuelto, 0);
END;
$$ LANGUAGE plpgsql;
```

#### ✅ RESUELTO: Precios con Vigencia

**Decisión:** Soportar **AMBAS opciones** (programado Y manual)

**Opción A: Cambio programado (futuro)**

```sql
INSERT INTO precios (entidad_tipo, entidad_id, nivel, precio, fecha_inicio, fecha_fin)
VALUES
  -- Precio actual
  ('producto', 'prod-123', 'base', 2.00, '2025-01-01', '2025-11-30'),
  -- Precio futuro programado
  ('producto', 'prod-123', 'base', 2.50, '2025-12-01', NULL);
```

**Opción B: Cambio manual (inmediato)**

```sql
-- Desactivar precio actual
UPDATE precios
SET fecha_fin = CURRENT_DATE, activo = false
WHERE entidad_id = 'prod-123' AND nivel = 'base';

-- Crear nuevo precio activo HOY
INSERT INTO precios (entidad_tipo, entidad_id, nivel, precio, fecha_inicio)
VALUES ('producto', 'prod-123', 'base', 2.50, CURRENT_DATE);
```

**Implementación:**

```sql
-- Campo fecha_inicio permite scheduling
-- Función resolver_precio ya filtra por fechas vigentes

-- Ejemplo de consulta precios futuros
SELECT p.*, pr.nombre as producto
FROM precios p
JOIN productos pr ON p.entidad_id = pr.id
WHERE p.fecha_inicio > CURRENT_DATE
  AND p.activo = true
ORDER BY p.fecha_inicio;

-- Trigger para activar precios programados (ejecutar diariamente)
CREATE FUNCTION activar_precios_programados() RETURNS void AS $$
BEGIN
  UPDATE precios
  SET activo = true
  WHERE fecha_inicio = CURRENT_DATE
    AND activo = false;
END;
$$ LANGUAGE plpgsql;
```

### 9.4. Talleres y Workshop Services

#### ✅ RESUELTO: Exclusividad de Talleres

**Decisión confirmada:** Un taller puede estar asociado a **múltiples Service Points** (relación N:M)

**Implementación confirmada:**

```sql
-- Relación N:M entre workshops y service_points
CREATE TABLE workshop_service_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id),
  service_point_id UUID NOT NULL REFERENCES service_points(id),
  es_ubicacion_principal BOOLEAN DEFAULT false, -- ¿Cuál es la ubicación principal del taller?
  fecha_inicio DATE DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(workshop_id, service_point_id)
);

-- Índices para búsquedas eficientes
CREATE INDEX idx_wsp_workshop ON workshop_service_points(workshop_id) WHERE activo = true;
CREATE INDEX idx_wsp_service_point ON workshop_service_points(service_point_id) WHERE activo = true;

-- Workshop con exclusividad (opcional)
ALTER TABLE workshops
  ADD COLUMN exclusivo_camino BOOLEAN DEFAULT true;
```

**Escenarios soportados:**

```
Taller-001 "Taller Pérez"
  ├─> Asociado a SP-Madrid-Centro (ubicación principal)
  ├─> Asociado a SP-Madrid-Retiro (ubicación secundaria)
  └─> Asociado a SP-Sevilla-Norte (ubicación secundaria)
  └─> Exclusivo de red Camino (no trabaja con competencia)

Taller-002 "Taller García"
  └─> Asociado SOLO a SP-Barcelona-001 (ubicación única)
  └─> Exclusivo de red Camino
```

**Ventajas:**

- ✅ Taller puede ofrecer servicios en múltiples localizaciones
- ✅ Usuarios pueden encontrar el mismo taller en diferentes SPs
- ✅ Permite gestión centralizada del taller (mismo partner, mismos servicios base)
- ✅ Cada asociación SP puede tener configuración local (horarios, disponibilidad)

**Impacto en bookings:**

```sql
-- Booking debe especificar workshop Y service_point
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  workshop_id UUID NOT NULL REFERENCES workshops(id),
  service_point_id UUID NOT NULL REFERENCES service_points(id),
  service_id UUID NOT NULL, -- Servicio específico del taller
  fecha_hora TIMESTAMP NOT NULL,
  estado VARCHAR(50),

  -- Validar que workshop esté asociado al SP
  CONSTRAINT fk_workshop_sp_valid FOREIGN KEY (workshop_id, service_point_id)
    REFERENCES workshop_service_points(workshop_id, service_point_id)
);
```

**Consultas comunes:**

```sql
-- Obtener todos los SPs donde opera un taller
SELECT sp.*, wsp.es_ubicacion_principal
FROM workshop_service_points wsp
JOIN service_points sp ON sp.id = wsp.service_point_id
WHERE wsp.workshop_id = 'taller-001'
  AND wsp.activo = true;

-- Obtener todos los talleres disponibles en un SP
SELECT w.*, wsp.es_ubicacion_principal
FROM workshop_service_points wsp
JOIN workshops w ON w.id = wsp.workshop_id
WHERE wsp.service_point_id = 'sp-madrid-001'
  AND wsp.activo = true
  AND w.is_active = true;
```

#### ✅ RESUELTO: Sistema Dinámico de Catálogo de Servicios de Taller

**Decisión confirmada:** Implementar sistema de 3 niveles con gestión centralizada

**Decisiones validadas:**

1. ✅ **3 niveles son suficientes:** Categoría → Subcategoría → Servicio
2. ✅ **Admin Central crea catálogo:** Control total del catálogo de servicios
3. ✅ **Bookings vinculan a oferta del taller:** Tracking específico de qué taller hizo qué servicio
4. ✅ **Precio base en catálogo:** Precio sugerido global + override opcional por taller

**Sistema REQUERIDO (DINÁMICO) - CONFIRMADO:**

```sql
-- 1. Categorías configurables (ej: "Mecánica", "Eléctrica", "Estética")
CREATE TABLE service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  icono VARCHAR(50),
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true
);

-- 2. Subcategorías (ej: "Frenos", "Cambios", "Cadenas")
CREATE TABLE service_subcategories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true
);

-- 3. Servicios específicos (ej: "Cambio de pastillas", "Ajuste de frenos")
CREATE TABLE workshop_service_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subcategory_id UUID NOT NULL REFERENCES service_subcategories(id) ON DELETE CASCADE,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  duracion_estimada INTEGER, -- minutos
  precio_base DECIMAL(10,2),
  activo BOOLEAN DEFAULT true
);

-- 4. Asignación de servicios a talleres (qué ofrece cada taller)
CREATE TABLE workshop_offered_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id UUID NOT NULL REFERENCES workshops(id) ON DELETE CASCADE,
  service_catalog_id UUID NOT NULL REFERENCES workshop_service_catalog(id),
  precio_override DECIMAL(10,2), -- NULL = usa precio_base
  disponible BOOLEAN DEFAULT true,
  notas TEXT,
  UNIQUE(workshop_id, service_catalog_id)
);
```

**Ejemplo de jerarquía:**

```
Categoría: "Mecánica" (creada por Admin Central)
  ├─> Subcategoría: "Frenos" (creada por Admin Central)
  │     ├─> Servicio: "Cambio de pastillas" (30 min, precio base 25€) ← Admin Central
  │     └─> Servicio: "Ajuste de frenos" (15 min, precio base 10€) ← Admin Central
  │
  └─> Subcategoría: "Transmisión" (creada por Admin Central)
        ├─> Servicio: "Cambio cadena" (20 min, precio base 15€) ← Admin Central
        └─> Servicio: "Ajuste cambios" (20 min, precio base 12€) ← Admin Central

Taller-001 (Manager) selecciona qué ofrecer:
  ✅ "Cambio de pastillas" → Precio override: 30€ (Manager personaliza)
  ✅ "Cambio de cadena" → Usa precio base: 15€ (Manager acepta base)
  ❌ NO ofrece "Ajuste frenos" (Manager no lo selecciona)
```

**Flujo operativo CONFIRMADO:**

```
1. Admin Central crea jerarquía completa (categorías → subcategorías → servicios)
2. Admin Central define precios base para cada servicio
3. Manager de taller selecciona qué servicios ofrece su taller
4. Manager puede personalizar precio (override) para servicios específicos
5. Usuario busca servicio → ve talleres que lo ofrecen con sus precios
6. Booking se vincula a workshop_offered_services (tracking específico)
```

**✅ DECISIONES CONFIRMADAS:**

1. ✅ **3 niveles suficientes:** Categoría → Subcategoría → Servicio
2. ✅ **Admin Central crea catálogo:** Solo Admin puede crear/editar categorías y servicios
3. ✅ **Bookings vinculan a oferta del taller:** `workshop_offered_services.id` (no a servicio genérico)
4. ✅ **Precio base en catálogo:** `workshop_service_catalog.precio_base` + override opcional

**Impacto confirmado:**

- ✅ Requiere 4 nuevas tablas (service_categories, service_subcategories, workshop_service_catalog, workshop_offered_services)
- ✅ Cambio en `bookings` para FK a `workshop_offered_services`
- ✅ UI completa para Admin (gestión catálogo) + Manager Taller (selección servicios)
- ✅ Esta es funcionalidad CORE - diseño validado

**Modificación de tabla bookings:**

```sql
-- Actualizar bookings para vincular a oferta específica del taller
ALTER TABLE bookings
  ADD COLUMN workshop_offered_service_id UUID
    REFERENCES workshop_offered_services(id);

-- Migrar bookings existentes (si hay datos)
-- Crear workshop_offered_services para bookings legacy
-- Vincular bookings a nuevas ofertas

-- Índice para búsquedas eficientes
CREATE INDEX idx_bookings_offered_service
  ON bookings(workshop_offered_service_id);
```

### 9.5. Flujos Operativos

#### ✅ RESUELTO: Flujo de Reposición

**Decisión:** Opción C - **Sistema mixto** (alertas automáticas + creación manual con opción de auto-generación)

**Flujo automático de alertas:**

```sql
-- Reglas de reposición por producto/ubicación
CREATE TABLE reglas_reposicion (
  id UUID PRIMARY KEY,
  producto_id UUID NOT NULL REFERENCES productos(id),
  ubicacion_id UUID REFERENCES locations(id),
  service_point_id UUID REFERENCES service_points(id),

  stock_minimo INTEGER NOT NULL,
  stock_maximo INTEGER NOT NULL,
  punto_pedido INTEGER NOT NULL, -- Cuando llega aquí, alertar

  cantidad_pedido INTEGER NOT NULL, -- Cuánto pedir
  proveedor_preferido UUID REFERENCES warehouses(id),

  activo BOOLEAN DEFAULT true
);

-- Función que revisa stock y genera alertas
CREATE FUNCTION check_stock_bajo_minimo() RETURNS TABLE(
  producto_id UUID,
  ubicacion VARCHAR,
  stock_actual INTEGER,
  stock_minimo INTEGER,
  cantidad_sugerida INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.producto_id,
    COALESCE(sp.name, l.name) as ubicacion,
    s.stock_disponible as stock_actual,
    r.stock_minimo,
    r.cantidad_pedido as cantidad_sugerida
  FROM reglas_reposicion r
  LEFT JOIN vending_machine_slots s ON s.producto_id = r.producto_id
  LEFT JOIN service_points sp ON sp.id = r.service_point_id
  LEFT JOIN locations l ON l.id = r.ubicacion_id
  WHERE s.stock_disponible <= r.punto_pedido
    AND r.activo = true;
END;
$$ LANGUAGE plpgsql;
```

**Opción 1: Manager crea pedido manualmente**

```sql
-- Manager revisa alertas en dashboard
SELECT * FROM check_stock_bajo_minimo();

-- Manager crea pedido manual
INSERT INTO stock_movements (
  producto_id, cantidad, origen_tipo, origen_id,
  destino_tipo, destino_id, estado, tipo
)
VALUES (
  'prod-123', 50, 'warehouse', 'wh-central',
  'service_point', 'sp-001', 'solicitado', 'reposicion'
);
```

**Opción 2: Sistema auto-genera pedidos (opcional)**

```sql
-- Job programado diario (si se habilita auto-generación)
CREATE FUNCTION generar_pedidos_automaticos() RETURNS void AS $$
DECLARE
  alerta RECORD;
BEGIN
  FOR alerta IN SELECT * FROM check_stock_bajo_minimo() LOOP
    INSERT INTO stock_movements (
      producto_id, cantidad, origen_tipo, origen_id,
      destino_tipo, destino_id, estado, tipo, generado_auto
    )
    SELECT
      alerta.producto_id,
      r.cantidad_pedido,
      'warehouse',
      r.proveedor_preferido,
      'service_point',
      r.service_point_id,
      'borrador', -- Requiere aprobación
      'reposicion',
      true
    FROM reglas_reposicion r
    WHERE r.producto_id = alerta.producto_id
      AND r.activo = true;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

**Implementación:**

- ✅ Tabla `reglas_reposicion` con umbrales configurables
- ✅ Función de alertas ejecutable en dashboard
- ✅ Pedidos manuales siempre permitidos
- ⚠️ Auto-generación configurable por SP (flag `auto_reposicion_enabled`)

#### ✅ RESUELTO: Reposición Directa Almacén → Máquina

**Decisión:** **Ambas opciones son posibles** (directo Y con parada en mini-almacén)

**Flujo A: Directo (almacén → máquina)**

```sql
INSERT INTO stock_movements (
  producto_id, cantidad,
  origen_tipo, origen_id,      -- warehouse central
  destino_tipo, destino_id,    -- vending_machine
  estado, tipo
)
VALUES (
  'prod-123', 30,
  'warehouse', 'wh-central-001',
  'vending_machine', 'vm-madrid-001',
  'solicitado', 'reposicion'
);
```

**Flujo B: Con parada (almacén → mini-almacén SP → máquina)**

```sql
-- Paso 1: Central → Mini-almacén SP
INSERT INTO stock_movements (...)
VALUES (
  'prod-123', 50,
  'warehouse', 'wh-central-001',
  'warehouse', 'wh-sp-madrid-001', -- Mini-almacén del SP
  'en_transito', 'transferencia'
);

-- Paso 2: Mini-almacén → Máquina (cuando llegue operario)
INSERT INTO stock_movements (...)
VALUES (
  'prod-123', 30,
  'warehouse', 'wh-sp-madrid-001',
  'vending_machine', 'vm-madrid-001',
  'solicitado', 'reposicion'
);
```

**Ventajas de cada flujo:**

- **Flujo A (directo):** Más rápido, menos movimientos, ideal para reposiciones urgentes
- **Flujo B (con parada):** Más trazabilidad, permite validación intermedia, buffer de stock

**Implementación:**

```sql
ALTER TABLE stock_movements
  ADD COLUMN origen_tipo VARCHAR(50) CHECK (origen_tipo IN ('warehouse', 'vending_machine', 'service_point')),
  ADD COLUMN destino_tipo VARCHAR(50) CHECK (destino_tipo IN ('warehouse', 'vending_machine', 'service_point'));

-- Ambos flujos soportados, decisión operativa por manager
```

#### ✅ RESUELTO: Sincronización Offline

**Decisión:** Sincronización offline **SÍ está en scope**

**Aclarado:**

- ✅ Máquinas pueden funcionar offline
- ✅ Usuario puede comprar con conexión limitada
- ✅ Sincronización cuando vuelve internet

**Implementación requerida:**

```sql
-- Estados de sincronización en máquinas
ALTER TABLE vending_machines
  ADD COLUMN estado_sync VARCHAR(50) DEFAULT 'online'
    CHECK (estado_sync IN ('online', 'offline', 'syncing', 'conflict')),
  ADD COLUMN ultima_sincronizacion TIMESTAMP,
  ADD COLUMN intentos_sync INTEGER DEFAULT 0;

-- Ventas con flag de sincronización
ALTER TABLE ventas_app
  ADD COLUMN sync_status VARCHAR(50) DEFAULT 'synced'
    CHECK (sync_status IN ('pending', 'synced', 'conflict', 'failed')),
  ADD COLUMN sync_attempts INTEGER DEFAULT 0,
  ADD COLUMN local_timestamp TIMESTAMP, -- Timestamp del dispositivo
  ADD COLUMN server_timestamp TIMESTAMP; -- Timestamp del servidor

-- Cola de sincronización
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES vending_machines(id),
  entity_type VARCHAR(50), -- 'venta', 'stock_update', etc.
  entity_id UUID,
  operation VARCHAR(50),   -- 'create', 'update', 'delete'
  payload JSONB,
  status VARCHAR(50) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

-- Función de sincronización
CREATE FUNCTION process_offline_sales(p_machine_id UUID, p_sales JSONB[])
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  sale JSONB;
  conflicts JSONB[] := '{}';
BEGIN
  FOREACH sale IN ARRAY p_sales LOOP
    -- Validar stock disponible (puede haber vendido mientras offline)
    IF check_stock_disponible(sale->>'slot_id', (sale->>'cantidad')::INTEGER) THEN
      -- Insertar venta
      INSERT INTO ventas_app (...) VALUES (...);
      -- Actualizar stock
      UPDATE vending_machine_slots ...;
    ELSE
      -- Conflicto: stock insuficiente
      conflicts := array_append(conflicts, sale || '{"error": "stock_insuficiente"}'::JSONB);
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'conflicts', conflicts
  );
END;
$$ LANGUAGE plpgsql;
```

**Flujo offline:**

```
1. Máquina pierde conexión → estado_sync='offline'
2. Usuario compra producto → venta se guarda localmente
3. Máquina actualiza stock local
4. Cuando vuelve internet → estado_sync='syncing'
5. Máquina envía lote de ventas offline al servidor
6. Servidor valida stock y procesa ventas
7. Si hay conflicto → estado_sync='conflict' (requiere intervención manual)
8. Si todo OK → estado_sync='online'
```

**⚠️ COMPLEJIDAD ALTA:**

- Requiere lógica de resolución de conflictos
- Necesita timestamp local vs servidor
- Job de reintentos automáticos para ventas fallidas
- Dashboard de monitoreo de máquinas offline
- **Impacto en roadmap:** +2 semanas (Fase 7)

### 9.6. Reporting y Márgenes

#### ⚠️ PENDIENTE DE ACLARACIÓN: Revenue Streams

**Pregunta:** ¿Las tablas actuales `revenue_streams` y `service_transactions` son redundantes o complementarias?

**Situación actual:**

- Existe `revenue_streams` con tipos: VENDING, WORKSHOP_RENTAL, etc.
- Existe `service_transactions`
- Existe `payments`

**Opción A: Mantener separadas**

```
revenue_streams → Configuración de fuentes de ingreso (catálogo)
service_transactions → Transacciones individuales de servicios
payments → Pagos reales (Stripe, etc.)
ventas_app → Ventas de productos vending
```

**Opción B: Unificar en tabla transacciones**

```sql
CREATE TABLE transacciones_unificadas (
  id UUID PRIMARY KEY,
  tipo VARCHAR(50), -- 'venta_producto', 'servicio_booking', 'comision_partner'
  origen_entidad VARCHAR(50), -- 'vending_machine', 'workshop', etc.
  origen_id UUID,
  user_id UUID,
  monto_total DECIMAL(10,2),
  comision_camino DECIMAL(10,2),
  pago_partner DECIMAL(10,2),
  payment_id UUID REFERENCES payments(id),
  fecha TIMESTAMP
);
```

**⚠️ ACCIÓN REQUERIDA:**

- Definir si mantener estructura actual o unificar
- Si unificar: migración compleja de datos históricos
- **Marcar como PRIORIDAD BAJA** - no afecta MVP

#### ✅ PARCIALMENTE RESUELTO: Márgenes por SP

**Decisión sobre cálculo:** Los márgenes se calculan sobre **precio base**

**Aclarado:**

```
Producto: "Coca-Cola"
├─> Precio base: 5€
├─> Override SP-Madrid: 6€
└─> Margen SP: 15% sobre BASE (5€) = 0.75€

Cálculo:
- Usuario paga: 6€
- Camino recibe: 6€
- Margen registrado: 15% de 5€ = 0.75€
- Beneficio real: 6€ - costo - comisiones
```

**⚠️ PENDIENTE: Tipo de margen**
**Pregunta:** ¿El margen puede ser de ambos tipos?

**Opción A: Margen fijo por SP**

```sql
service_point_margins (
  service_point_id,
  margin_percentage DECIMAL(5,2), -- 15% para TODO en este SP
  applies_to VARCHAR(50) DEFAULT 'all' -- 'productos', 'servicios', 'all'
)
```

**Opción B: Margen por producto/servicio**

```sql
CREATE TABLE margenes_detallados (
  id UUID PRIMARY KEY,
  service_point_id UUID REFERENCES service_points(id),
  entidad_tipo VARCHAR(50), -- 'producto', 'servicio'
  entidad_id UUID,
  margin_percentage DECIMAL(5,2),
  UNIQUE(service_point_id, entidad_tipo, entidad_id)
);
```

**Opción C: Jerarquía de márgenes (override)**

```
Si existe margen específico producto → usar ese
Si no existe → usar margen general del SP
```

**Pregunta confirmada:** Pueden ser ambos, producto/servicio **anula** al del SP

**Implementación:**

```sql
-- Función de resolución de margen
CREATE FUNCTION resolver_margen(
  p_service_point_id UUID,
  p_entidad_tipo VARCHAR,
  p_entidad_id UUID
) RETURNS DECIMAL(5,2) AS $$
DECLARE
  margen DECIMAL(5,2);
BEGIN
  -- Buscar margen específico primero
  SELECT margin_percentage INTO margen
  FROM margenes_detallados
  WHERE service_point_id = p_service_point_id
    AND entidad_tipo = p_entidad_tipo
    AND entidad_id = p_entidad_id;

  -- Si no existe, usar margen general del SP
  IF margen IS NULL THEN
    SELECT margin_percentage INTO margen
    FROM service_point_margins
    WHERE service_point_id = p_service_point_id
      AND applies_to IN ('all', p_entidad_tipo);
  END IF;

  RETURN COALESCE(margen, 0);
END;
$$ LANGUAGE plpgsql;
```

**⚠️ ACCIÓN REQUERIDA:**

- Confirmar que la jerarquía de override es correcta
- Decidir si tabla `service_point_margins` actual es suficiente o necesita `margenes_detallados`

### 9.7. Migración y Scope

#### ✅ RESUELTO: Datos Existentes

**Decisión:** **NO hay datos en producción** - entorno de desarrollo limpio

**Impacto positivo:**

- ✅ Migraciones pueden ser más agresivas (DROP/RECREATE si necesario)
- ✅ NO necesitamos scripts complejos de migración de datos
- ✅ NO necesitamos planes de rollback elaborados
- ✅ Podemos rediseñar esquemas sin preocupación por datos legacy

**Estrategia de implementación simplificada:**

```sql
-- Ejemplo: Podemos hacer cambios destructivos sin problema
DROP TABLE IF EXISTS service_products CASCADE;
CREATE TABLE productos (
  -- Nueva estructura desde cero
);

-- No necesitamos:
-- ❌ Migración de datos históricos
-- ❌ Tablas temporales de compatibilidad
-- ❌ Vistas de transición
-- ❌ Scripts de rollback complejos
```

**Ventajas para el roadmap:**

- Reduce complejidad de migraciones 11 y 12
- Elimina riesgo de pérdida de datos
- Permite iteraciones rápidas en desarrollo
- **Tiempo ahorrado: ~1-2 semanas**

#### ✅ RESUELTO: Compatibilidad Temporal

**Decisión:** **NO necesitamos coexistencia** de sistemas

**Confirmado:**

- Implementación se hace en entorno de desarrollo
- Se puede "apagar todo y migrar de golpe"
- NO hay usuarios activos durante desarrollo

**Estrategia:**

```
Fase 1: Desarrollo completo en branch (Semanas 1-12)
  ├─> Migraciones BD completas
  ├─> Código nuevo completo
  └─> Tests exhaustivos

Fase 2: Deployment único (Semana 13)
  ├─> Ejecutar todas las migraciones en orden
  ├─> Deploy código nuevo
  └─> Testing en staging → producción
```

**NO necesitamos:**

- ❌ Vistas de compatibilidad
- ❌ Campos deprecados pero funcionales
- ❌ Doble escritura (BD vieja + nueva)
- ❌ Feature flags para activar/desactivar nuevo sistema

**Ventajas:**

- Arquitectura más limpia (sin legacy transitorio)
- Desarrollo más rápido (sin doble mantenimiento)
- Testing más simple (un solo sistema a la vez)
- **Tiempo ahorrado: ~1 semana**

#### ✅ RESUELTO: Scope de Implementación

**Decisión:** Sistema Completo pero con ajuste de tiempo

**Alcance confirmado:**

```
✅ Caminos y Ubicaciones (estructura jerárquica)
✅ Service Points mejorados con mini-almacenes
✅ Relación N:M Servicios ↔ Service Points
✅ Productos con SKU, dimensiones, caducidad
✅ Slots de máquinas vending con stock detallado
✅ Ventas app con reserva HARD y expiración
✅ Sistema de precios 3 niveles (base → ubicación → SP)
✅ Inventario jerárquico con estados
✅ Movimientos de stock con estados (borrador → en_tránsito → recibido)
✅ Reglas de reposición con alertas automáticas
✅ Sistema de sincronización offline (máquinas)
✅ Catálogo dinámico de servicios de taller (categorías → subcategorías → servicios)
```

**Ajustes al roadmap original:**

- ✅ Simplificación de precios: 3 niveles en vez de 4 (elimina precio por máquina)
- ✅ Ahorro de tiempo por falta de datos en producción: -2 semanas
- ⚠️ Complejidad añadida por offline sync: +2 semanas
- ⚠️ Complejidad añadida por catálogo dinámico talleres: +2 semanas

**NUEVO ROADMAP AJUSTADO: 12 semanas**

```
Semanas 1-2:  Caminos, Ubicaciones, SP mejorados
Semanas 3-4:  Servicios N:M, Productos, Slots, Ventas
Semanas 5-6:  Precios 3 niveles, Inventario, Stock movements
Semanas 7-8:  DTOs, Schemas, Repositories (todos)
Semanas 9-10: Services, Controllers (todos)
Semanas 11:   Endpoints, Swagger, Catálogo dinámico talleres
Semanas 12:   Sincronización offline, Testing completo
```

**Elementos diferidos a Fase 2 (futuro):**

```
❌ Predicción de demanda con ML
❌ Optimización de rutas de reposición
❌ Dashboard analytics avanzado
❌ Auditoría y conteos físicos de inventario (básico OK, avanzado futuro)
❌ Precios con vigencia futura (programación automática)
```

**MVP funcional disponible en Semana 6:**

```
Semana 6 = MVP básico operativo
  ✅ Estructura completa Caminos → Ubicaciones → SP
  ✅ Productos y ventas básicas
  ✅ Precios 3 niveles
  ✅ Inventario simple
  └─> Permite testing temprano con usuarios alpha
```

---

## 10. RESUMEN DE DECISIONES Y DUDAS PENDIENTES

### 10.1. ✅ DECISIONES CONFIRMADAS (15 resueltas)

#### Jerarquía y Estructura

1. **Camino como entidad:** ✅ Tabla independiente `caminos` implementada
2. **Ubicación → SP:** ✅ Relación 1:N flexible (soporta 1:1 y 1:N)
3. **Mini-almacén local:** ✅ Warehouse separado con `warehouse_type='service_point'`

#### Productos e Inventario

4. **Productos solo vending:** ✅ NO hay venta directa, solo desde máquinas
5. **Stock en talleres:** ✅ Talleres tienen stock propio pero Camino NO lo gestiona
6. **Reserva de stock:** ✅ Solo HARD (bloqueo inmediato), SOFT eliminado
7. **Reposición:** ✅ Sistema mixto (alertas automáticas + creación manual/auto opcional)
8. **Flujo reposición:** ✅ Ambos soportados (directo y con parada en mini-almacén)

#### Sistema de Precios

9. **Precio por máquina:** ✅ NO - precios hasta nivel SP (3 niveles: base → ubicación → SP)
10. **Precios con vigencia:** ✅ Soporta ambos (programado futuro Y cambio manual inmediato)
11. **Precios servicios:** ✅ Sistema jerárquico aplica a productos Y servicios

#### Márgenes

12. **Cálculo de margen:** ✅ Sobre precio BASE (no sobre override)
13. **Tipo de margen:** ✅ Ambos con jerarquía (específico producto/servicio anula general SP)

#### Migración

14. **Datos existentes:** ✅ NO hay datos en producción (entorno limpio)
15. **Compatibilidad temporal:** ✅ NO necesitamos coexistencia de sistemas

#### Funcionalidades Adicionales

16. **Sincronización offline:** ✅ SÍ está en scope (máquinas pueden funcionar offline)

### 10.2. ✅ DUDAS CRÍTICAS RESUELTAS (3)

#### ✅ RESUELTA: Modelo de Servicios Global vs Local

**Decisión confirmada:** Opción A - **Servicio como Plantilla Global** con tabla N:M

**Respuestas validadas:**

1. ✅ **¿Necesitas reporting consolidado?** → SI (ej: "¿Cuántos SPs tienen Vending activo?")
2. ✅ **¿Quién crea servicios nuevos?** → ADMIN CENTRAL
3. ✅ **¿Desactivar globalmente?** → NO (desactivación solo a nivel SP)

**Arquitectura confirmada:**

```sql
-- Tabla global de servicios (plantillas)
services (id, name, service_type_id, descripcion_base)

-- Tabla N:M con customización local
CREATE TABLE servicio_service_point (
  id UUID PRIMARY KEY,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  service_point_id UUID REFERENCES service_points(id) ON DELETE CASCADE,
  precio_local DECIMAL(10,2), -- NULL = usa precio de service_type
  horario_local JSONB,         -- Override horarios
  configuracion_local JSONB,   -- Productos específicos, capacidad
  activo BOOLEAN DEFAULT true, -- Activo solo en este SP
  UNIQUE(service_id, service_point_id)
);
```

**Ventajas del modelo elegido:**

- ✅ Reporting consolidado ("¿Cuántos SPs tienen X servicio?")
- ✅ Control centralizado del catálogo por Admin
- ✅ Flexibilidad total de cada SP para personalizar
- ✅ Autonomía local: desactivación sin afectar otros SPs
- ✅ Trazabilidad de qué tipo de servicio es cada instancia

**Estado:** ✅ RESUELTO - Migraciones 4 y 5 DESBLOQUEADAS

### 10.3. ✅ DUDAS RESUELTAS ADICIONALES (2)

#### ✅ RESUELTA: Catálogo Dinámico de Servicios de Taller

**Decisión confirmada:** Sistema de 3 niveles con Admin Central como gestor del catálogo

**Respuestas confirmadas:**

1. ✅ **3 niveles suficientes:** Categoría → Subcategoría → Servicio
2. ✅ **Admin Central crea catálogo:** Solo Admin puede crear/editar categorías y servicios
3. ✅ **Bookings vinculan a oferta del taller:** FK a `workshop_offered_services` (tracking específico)
4. ✅ **Precio base en catálogo:** `workshop_service_catalog.precio_base` + override opcional por taller

**Implementación confirmada:**

- 4 nuevas tablas: service_categories, service_subcategories, workshop_service_catalog, workshop_offered_services
- Modificación de bookings: Añadir FK `workshop_offered_service_id`
- UI Admin: Gestión completa de catálogo
- UI Manager Taller: Selección de servicios + personalización precios

**Estado:** Resuelto completamente, diseño validado

#### ✅ RESUELTA: Exclusividad de Talleres

**Decisión:** Taller puede estar asociado a múltiples SPs (relación N:M)

**Confirmado:** Un taller puede operar en múltiples Service Points simultáneamente

**Implementación:** Tabla `workshop_service_points` con relación N:M confirmada

**Estado:** Resuelto completamente, implementación definida

### 10.4. ⚠️ DUDAS MENORES PENDIENTES (1 de baja prioridad)

#### 🟢 MENOR: Revenue Streams (Mantener vs Unificar)

**Pregunta:** ¿Mantener `revenue_streams` + `service_transactions` o unificar en tabla única?

**Impacto:** Reporting y analytics, NO afecta funcionalidad core

**Recomendación:** Diferir decisión, mantener actual en MVP

### 10.5. ROADMAP ACTUALIZADO CON DECISIONES

#### ✅ Cambios confirmados al roadmap original:

**Simplificaciones (+ahorro de tiempo):**

- Precios: 3 niveles en vez de 4 → -1 semana
- No hay datos en producción → -2 semanas migración
- No hay coexistencia de sistemas → -1 semana

**Complejidades añadidas:**

- Sincronización offline → +2 semanas
- Catálogo dinámico talleres → +2 semanas

**TOTAL: 12 semanas mantenido** (balance neutral)

#### 🚦 DEPENDENCIAS CRÍTICAS:

**Semana 1 - SIN BLOQUEOS:**

- ✅ Caminos, Ubicaciones, SP mejorados
- ✅ PUEDE EMPEZAR INMEDIATAMENTE

**Semana 2 - DESBLOQUEADA:**

- ✅ Modelo de Servicios RESUELTO
- ✅ Migraciones 4 y 5 listas para ejecutar
- ✅ servicio_service_point con arquitectura definida

**Semana 3 - DESBLOQUEADA:**

- ✅ Catálogo Talleres RESUELTO
- ✅ Productos, Slots, Ventas, Precios puede continuar

**Semana 6 - MVP básico disponible:**

- Caminos, Ubicaciones, SP, Productos, Ventas, Precios 3 niveles, Inventario simple
- Permite testing alpha con usuarios

**Semana 12 - Sistema completo:**

- Todas las funcionalidades incluyendo offline sync y catálogo dinámico

---

## 11. PRÓXIMOS PASOS INMEDIATOS

### 11.1. 🔴 ACCIÓN REQUERIDA URGENTE

#### Antes de continuar con implementación, RESOLVER:

**1. Duda Crítica ÚNICA: Modelo de Servicios** (BLOQUEANTE Semana 2)

- Decidir entre: Servicio Global (plantilla) vs Servicio Local (instancia por SP)
- Impacto: Arquitectura de tablas `services` y `servicio_service_point`
- Tiempo decisión: 30 minutos de discusión
- Sin esto: NO se pueden hacer Migraciones 4 y 5

### 11.2. ✅ ACCIONES DESBLOQUEADAS

**✅ Catálogo Dinámico de Talleres - RESUELTO**

- ✅ Estructura de 3 niveles confirmada
- ✅ Admin Central crea catálogo (control total)
- ✅ Bookings vinculan a workshop_offered_services
- ✅ Precio base en catálogo + override opcional
- **Implementación:** 4 nuevas tablas + modificación bookings
- **Estado:** Listo para implementar en Semana 3

**✅ Exclusividad Talleres - RESUELTO**

- ✅ Taller puede estar en múltiples SPs (relación N:M)
- **Implementación:** Tabla workshop_service_points
- **Estado:** Listo para implementar

### 11.3. ⚠️ DUDAS MENORES (No bloqueantes)

**🟢 Revenue Streams**

- Prioridad baja, no afecta funcionalidad core
- Recomendación: Diferir a Fase 2 (post-semana 12)

### 11.4. 🚀 PLAN DE ACCIÓN PROPUESTO

#### Opción A: Resolver duda crítica restante HOY (RECOMENDADO)

```
HOY (30 minutos):
  └─> Resolver Duda Crítica: Modelo de Servicios (Global vs Local)

MAÑANA:
  ├─> Comenzar implementación Semana 1
  └─> Sin bloqueos en Semana 2-3

Resultado: 12 semanas sin pausas ✅
```

#### Opción B: Empezar con lo claro, resolver en Semana 2

```
Semana 1: Implementar Caminos, Ubicaciones, SP (NO requiere dudas)
Semana 2: PAUSA - Resolver Duda Crítica 1 antes de continuar
Semana 3: PAUSA - Resolver Duda Crítica 2 antes de talleres
```

**⚠️ Opción B añade ~1 semana de esperas y context switches**

### 11.4. 📋 CHECKLIST PRE-IMPLEMENTACIÓN

Antes de ejecutar primera migración, verificar:

- [ ] **Duda Crítica 1 resuelta:** Modelo de Servicios definido
- [ ] **Duda Crítica 2 resuelta:** Catálogo Talleres diseñado completo
- [ ] **Backup BD:** Aunque no hay datos, backup de esquema actual
- [ ] **Branch creado:** `feature/arquitectura-completa-camino`
- [ ] **Documentos actualizados:** Todas las decisiones documentadas
- [ ] **Tests base:** Ejecutar `npm test` para verificar estado inicial
- [ ] **Environment variables:** Verificar acceso a Supabase

### 11.5. 🎯 ENTREGABLES ESPERADOS

#### Al finalizar Semana 2:

- ✅ 5 migraciones ejecutadas (Caminos, Ubicaciones, SP, Servicios N:M)
- ✅ Datos seed iniciales (caminos, ubicaciones de prueba)
- ✅ Tests de integridad referencial pasando

#### Al finalizar Semana 6 (MVP):

- ✅ 12 migraciones ejecutadas
- ✅ 6 DTOs nuevos + schemas Zod
- ✅ 6 repositories + services
- ✅ Endpoints básicos funcionales
- ✅ Sistema de precios 3 niveles operativo
- ✅ Ventas básicas desde app

#### Al finalizar Semana 12 (Sistema Completo):

- ✅ Todas las funcionalidades implementadas
- ✅ Sincronización offline funcional
- ✅ Catálogo dinámico de talleres
- ✅ Testing completo (>80% coverage nuevos módulos)
- ✅ Documentación Swagger completa
- ✅ Sistema listo para deployment a staging

---

## 12. CONCLUSIÓN

### Resumen Ejecutivo de Decisiones

**✅ RESUELTO: 18 de 20 dudas originales (90%)**

- Arquitectura clara: Camino → Ubicación → SP → Servicios/Máquinas
- Sistema de precios simplificado: 3 niveles (elimina complejidad precio por máquina)
- Productos solo vending (simplifica inventario)
- Talleres NO gestionan inventario (simplifica scope)
- Reservas HARD únicamente (elimina ambigüedad SOFT)
- Sistema mixto de reposición (automático + manual)
- Sincronización offline confirmada en scope
- No hay datos en producción (simplifica migraciones)
- No hay coexistencia de sistemas (simplifica deployment)
- **✅ NUEVO:** Catálogo dinámico de talleres con 3 niveles confirmado
- **✅ NUEVO:** Talleres pueden estar en múltiples SPs (N:M)

**⚠️ PENDIENTE: 1 duda crítica bloqueante**

1. **Modelo de Servicios:** Global vs Local (afecta Semana 2)

**⚠️ OPCIONAL: 1 duda menor no bloqueante**

2. Revenue Streams (diferible a Fase 2)

### Recomendación Final

**ACCIÓN INMEDIATA:** Resolver 1 duda crítica restante (30 minutos)

**ENTONCES:** Proceder con implementación completa en 12 semanas SIN más bloqueos

**RESULTADO ESPERADO:** Sistema robusto, escalable, con todas las funcionalidades core del negocio

### Progreso Actual

```
✅ 19 decisiones confirmadas (95%) 🎯
🟢 1 duda menor diferible (5%)
```

**Semana 1:** ✅ LISTA para empezar  
**Semana 2:** ✅ DESBLOQUEADA (Servicios RESUELTO)  
**Semana 3+:** ✅ DESBLOQUEADO

**⚡ ROADMAP COMPLETAMENTE DESBLOQUEADO - LISTO PARA IMPLEMENTACIÓN ⚡**

---

**Próximos pasos:**

1. Generar scripts SQL de las 12 migraciones (1-2 días)
2. Comenzar implementación Semana 1 (puede empezar ya)
3. Duda menor (Revenue Streams) diferible a Fase 2 post-semana 12
