# ANÁLISIS ARQUITECTURA CAMINO - PARTE 2

# Secciones 4-6: Código Legacy, Modificaciones y Nueva Implementación

---

## 4. CÓDIGO LEGACY A ELIMINAR

### 4.1. Archivos Duplicados

#### Repositories Duplicados

```bash
# ELIMINAR uno de estos (mantener snake_case por consistencia BD)
src/repositories/vending-machine.repository.ts  # ❌ ELIMINAR
# MANTENER:
src/repositories/vending_machine.repository.ts   # ✅ MANTENER
```

#### Services Duplicados

```bash
# ELIMINAR uno de estos
src/services/vending-machine.service.ts          # ❌ ELIMINAR
# MANTENER:
src/services/vending_machine.service.ts          # ✅ MANTENER
```

#### Endpoints Duplicados

```bash
# ELIMINAR:
pages/api/vending_machine.ts                     # ❌ ELIMINAR (usar carpeta)
# MANTENER:
pages/api/vending-machines/                      # ✅ MANTENER (estructura RESTful)
```

### 4.2. Archivos de Prueba/Backup

```bash
# Archivos a eliminar
src/services/service.service.ts.bak              # ❌ Backup file
src/services/supabase-test.ts                    # ❌ Test file (mover a __tests__ si necesario)

# Tabla de prueba en BD
DROP TABLE test_table;                            # ❌ Eliminar de BD
```

### 4.3. Código Obsoleto en DTOs

**Archivo:** `src/dto/service-point.dto.ts`

Este archivo mezcla demasiados conceptos. **Separar en:**

- `camino.dto.ts` - Nuevo
- `ubicacion.dto.ts` - Nuevo
- `service-point.dto.ts` - Simplificar (solo datos del SP)
- `servicio.dto.ts` - Nuevo (instancias de servicios)
- `servicio-tipo.dto.ts` - Ya existe como `service-type`

**Código a eliminar de `service-point.dto.ts`:**

```typescript
// ❌ ELIMINAR - Mover a ubicacion.dto.ts
export interface LocationDTO {
  id: string;
  city: string;
  province: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ❌ ELIMINAR - Mover a booking.dto.ts (ya existe)
export enum BookingType { ... }
export enum BookingStatus { ... }
export interface BookingDTO { ... }

// ❌ ELIMINAR - Mover a revenue-stream.dto.ts (nuevo)
export enum RevenueStreamType { ... }
export interface RevenueStreamDTO { ... }

// ❌ ELIMINAR - Mover a vending-machine.dto.ts (ya existe)
export interface VendingMachineDTO { ... }

// ❌ ELIMINAR - Mover a subscription.dto.ts (nuevo)
export interface SubscriptionDTO { ... }

// ❌ ELIMINAR - Mover a dashboard.dto.ts (nuevo)
export interface ServicePointRevenueStats { ... }
export interface NetworkDashboardStats { ... }
```

### 4.4. Repositories con Lógica Mezclada

**Archivo:** `src/repositories/service.repository.ts`

**PROBLEMA:** Mezcla conceptos de `service_types` (catálogo) con `services` (instancias)

```typescript
// ❌ CONFUSO - Filtro duplicado
export interface ServiceFilters {
  service_point_id?: string;
  service_type_id?: string;
  location_id?: string;
  status?: 'active' | 'inactive' | 'maintenance' | 'out_of_order';
  requires_inventory?: boolean;
  search?: string;
}
  status?: "active" | "inactive" | "maintenance" | "out_of_service";  // ❌ DUPLICADO
  search?: string;
}
```

**SOLUCIÓN:** Crear dos repositories separados:

- `service-type.repository.ts` ✅ (ya existe)
- `service-instance.repository.ts` (nuevo, reemplaza `service.repository.ts`)

---

## 5. CÓDIGO A MODIFICAR

### 5.1. Base de Datos - Migraciones Críticas

#### Migración 1: Crear tabla `caminos`

```sql
-- Archivo: 20251015_010000_create_caminos_table.sql
CREATE TABLE IF NOT EXISTS caminos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(150) NOT NULL,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    zona_operativa VARCHAR(100),  -- Ej: "Norte", "Centro", "Sur"
    region VARCHAR(100),           -- Ej: "Castilla y León", "Andalucía"
    estado_operativo VARCHAR(20) DEFAULT 'activo',
    -- Estados: activo, planificado, cerrado
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT check_estado_operativo
        CHECK (estado_operativo IN ('activo', 'planificado', 'cerrado'))
);

CREATE INDEX idx_caminos_codigo ON caminos(codigo);
CREATE INDEX idx_caminos_estado ON caminos(estado_operativo);
CREATE INDEX idx_caminos_zona ON caminos(zona_operativa);

COMMENT ON TABLE caminos IS 'Agrupación superior de ubicaciones - División de negocio';
COMMENT ON COLUMN caminos.zona_operativa IS 'Zona geográfica operativa (Norte, Sur, etc.)';
COMMENT ON COLUMN caminos.estado_operativo IS 'Estado: activo, planificado, cerrado';
```

#### Migración 2: Modificar tabla `locations` → `ubicaciones`

```sql
-- Archivo: 20251015_020000_enhance_locations_table.sql

-- Agregar FK a caminos
ALTER TABLE locations ADD COLUMN camino_id UUID REFERENCES caminos(id) ON DELETE SET NULL;

-- Agregar campos faltantes
ALTER TABLE locations ADD COLUMN zona_operativa VARCHAR(100);
ALTER TABLE locations ADD COLUMN region VARCHAR(100);
ALTER TABLE locations ADD COLUMN estado_operativo VARCHAR(20) DEFAULT 'activo';

-- Estados: activo, en_mantenimiento, cerrado_temporalmente, planificado
ALTER TABLE locations ADD CONSTRAINT check_ubicacion_estado
    CHECK (estado_operativo IN (
        'activo',
        'en_mantenimiento',
        'cerrado_temporalmente',
        'planificado'
    ));

-- Índices
CREATE INDEX idx_locations_camino_id ON locations(camino_id);
CREATE INDEX idx_locations_estado ON locations(estado_operativo);
CREATE INDEX idx_locations_zona ON locations(zona_operativa);

-- Actualizar SP para usar location_id
UPDATE service_points sp
SET location_id = (
    SELECT l.id
    FROM locations l
    WHERE l.city = sp.city
    LIMIT 1
)
WHERE location_id IS NULL;

COMMENT ON COLUMN locations.camino_id IS 'FK al camino padre que agrupa esta ubicación';
COMMENT ON COLUMN locations.estado_operativo IS 'Estado operativo de la ubicación';
```

#### Migración 3: Modificar tabla `service_points`

```sql
-- Archivo: 20251015_030000_enhance_service_points.sql

-- Agregar location_id como FK obligatorio (si no existe)
ALTER TABLE service_points
    ALTER COLUMN location_id SET NOT NULL;

-- Agregar constraint FK (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'fk_service_points_location'
    ) THEN
        ALTER TABLE service_points
            ADD CONSTRAINT fk_service_points_location
            FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- Cambiar estado_operativo para alinear con modelo
ALTER TABLE service_points
    DROP CONSTRAINT IF EXISTS check_sp_status;

ALTER TABLE service_points
    ADD CONSTRAINT check_sp_estado_operativo
    CHECK (status IN (
        'activo',
        'en_mantenimiento',
        'cerrado_temporalmente',
        'planificado'
    ));

-- Agregar campos faltantes
ALTER TABLE service_points
    ADD COLUMN IF NOT EXISTS almacen_local_id UUID REFERENCES locations(id),
    ADD COLUMN IF NOT EXISTS modo_operacion VARCHAR(20) DEFAULT 'manual';

-- modo_operacion: manual, automatizado, vending, mixto
ALTER TABLE service_points
    ADD CONSTRAINT check_modo_operacion
    CHECK (modo_operacion IN ('manual', 'automatizado', 'vending', 'mixto'));

COMMENT ON COLUMN service_points.location_id IS 'FK obligatorio a la ubicación/ciudad';
COMMENT ON COLUMN service_points.almacen_local_id IS 'Mini-almacén local como ubicación hija';
COMMENT ON COLUMN service_points.modo_operacion IS 'Modo: manual, automatizado, vending, mixto';
```

#### Migración 4: Crear tabla intermedia `servicio_service_point`

```sql
-- Archivo: 20251015_040000_create_service_sp_assignment.sql

-- Tabla intermedia para relación N:M con atributos propios
CREATE TABLE IF NOT EXISTS servicio_service_point (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    service_point_id UUID NOT NULL REFERENCES service_points(id) ON DELETE CASCADE,

    -- Atributos locales (overrides)
    is_active_local BOOLEAN DEFAULT true,
    precio_local BIGINT,  -- Override precio base (en centavos)
    condiciones_locales JSONB,  -- Condiciones específicas de este SP
    horario_local JSONB,  -- Override horarios si difieren del SP

    -- Configuración local
    capacidad_maxima_local INTEGER,
    personal_asignado VARCHAR(200),
    notas TEXT,

    -- Fechas
    fecha_activacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_desactivacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraint: única combinación servicio-SP
    CONSTRAINT unique_service_sp UNIQUE (service_id, service_point_id)
);

CREATE INDEX idx_service_sp_service ON servicio_service_point(service_id);
CREATE INDEX idx_service_sp_sp ON servicio_service_point(service_point_id);
CREATE INDEX idx_service_sp_active ON servicio_service_point(is_active_local);

COMMENT ON TABLE servicio_service_point IS 'Relación N:M entre servicios y service points con config local';
COMMENT ON COLUMN servicio_service_point.precio_local IS 'Override del precio base para este SP';
```

#### Migración 5: Modificar tabla `services`

```sql
-- Archivo: 20251015_050000_enhance_services_table.sql

-- Hacer service_point_id NULLABLE (ahora usa tabla intermedia)
ALTER TABLE services ALTER COLUMN service_point_id DROP NOT NULL;

-- Agregar campos base del servicio
ALTER TABLE services
    ADD COLUMN IF NOT EXISTS precio_base BIGINT,  -- Precio base en centavos
    ADD COLUMN IF NOT EXISTS modo_operacion VARCHAR(20) DEFAULT 'manual',
    ADD COLUMN IF NOT EXISTS es_multiubicacion BOOLEAN DEFAULT false;

-- Constraint para modo_operacion
ALTER TABLE services
    ADD CONSTRAINT check_service_modo_operacion
    CHECK (modo_operacion IN ('manual', 'automatizado', 'vending', 'mixto'));

-- Deprecar service_point_id (migración gradual)
COMMENT ON COLUMN services.service_point_id IS 'DEPRECATED - Usar servicio_service_point';
COMMENT ON COLUMN services.precio_base IS 'Precio base del servicio (antes de overrides)';
COMMENT ON COLUMN services.es_multiubicacion IS 'Si true, servicio disponible en múltiples SPs';
```

#### Migración 6: Crear tabla `productos` (unificar `service_products`)

```sql
-- Archivo: 20251015_060000_create_productos_table.sql

CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,

    -- Categorización
    categoria_id UUID REFERENCES product_categories(id),
    subcategoria_id UUID REFERENCES product_subcategories(id),

    -- Precio base
    precio_base BIGINT NOT NULL,  -- En centavos
    moneda VARCHAR(3) DEFAULT 'EUR',

    -- Inventario y medidas
    unidad_medida VARCHAR(20) DEFAULT 'u',  -- u, kg, L, m, etc.
    permite_lote BOOLEAN DEFAULT false,
    permite_serie BOOLEAN DEFAULT false,
    tiene_caducidad BOOLEAN DEFAULT false,

    -- Dimensiones para slots
    ancho_mm INTEGER,
    alto_mm INTEGER,
    profundo_mm INTEGER,
    peso_gramos INTEGER,

    -- Imágenes y metadatos
    imagen_url TEXT,
    imagenes JSONB,  -- Array de URLs
    marca VARCHAR(100),
    proveedor_preferente_id UUID,

    -- Estado
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT check_precio_base_positivo CHECK (precio_base >= 0),
    CONSTRAINT check_dimensiones CHECK (
        (ancho_mm IS NULL AND alto_mm IS NULL AND profundo_mm IS NULL) OR
        (ancho_mm > 0 AND alto_mm > 0 AND profundo_mm > 0)
    )
);

CREATE INDEX idx_productos_sku ON productos(sku);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_active ON productos(is_active);
CREATE INDEX idx_productos_nombre ON productos USING gin(to_tsvector('spanish', nombre));

COMMENT ON TABLE productos IS 'Catálogo de productos con gestión completa de inventario';
COMMENT ON COLUMN productos.unidad_medida IS 'Unidad: u (unidad), kg, L, m, etc.';
COMMENT ON COLUMN productos.permite_lote IS 'Si requiere control por lote (ej: medicamentos)';
COMMENT ON COLUMN productos.permite_serie IS 'Si requiere control por número de serie';
COMMENT ON COLUMN productos.tiene_caducidad IS 'Si tiene fecha de caducidad';
```

#### Migración 7: Modificar `vending_machines` - Agregar slots

```sql
-- Archivo: 20251015_070000_enhance_vending_machines.sql

ALTER TABLE vending_machines
    ADD COLUMN IF NOT EXISTS politica_reserva VARCHAR(10) DEFAULT 'SOFT',
    ADD COLUMN IF NOT EXISTS tiempo_expiracion_reserva_min INTEGER DEFAULT 15,
    ADD COLUMN IF NOT EXISTS propiedad VARCHAR(20) DEFAULT 'propia',
    ADD COLUMN IF NOT EXISTS fecha_instalacion DATE,
    ADD COLUMN IF NOT EXISTS contrato_id VARCHAR(50),
    ADD COLUMN IF NOT EXISTS estado_sync VARCHAR(20) DEFAULT 'en_sync';

-- Constraints
ALTER TABLE vending_machines
    ADD CONSTRAINT check_politica_reserva
    CHECK (politica_reserva IN ('HARD', 'SOFT'));

ALTER TABLE vending_machines
    ADD CONSTRAINT check_propiedad
    CHECK (propiedad IN ('propia', 'partner', 'tercero'));

ALTER TABLE vending_machines
    ADD CONSTRAINT check_estado_sync
    CHECK (estado_sync IN ('en_sync', 'pendiente_sync', 'error_sync'));

-- Crear tabla de slots
CREATE TABLE IF NOT EXISTS vending_machine_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vending_machine_id UUID NOT NULL REFERENCES vending_machines(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL,
    slot_code VARCHAR(10),  -- Ej: "A1", "B3"

    -- Producto asignado
    producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,

    -- Capacidad y stock
    capacidad_maxima INTEGER NOT NULL DEFAULT 10,
    stock_real INTEGER NOT NULL DEFAULT 0,
    stock_reservado INTEGER NOT NULL DEFAULT 0,

    -- Stock disponible = stock_real - stock_reservado

    -- Estado
    is_active BOOLEAN DEFAULT true,
    ultimo_reabastecimiento TIMESTAMP WITH TIME ZONE,
    notas TEXT,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_machine_slot UNIQUE (vending_machine_id, slot_number),
    CONSTRAINT check_stock_real CHECK (stock_real >= 0),
    CONSTRAINT check_stock_reservado CHECK (stock_reservado >= 0),
    CONSTRAINT check_stock_reservado_menor_real CHECK (stock_reservado <= stock_real),
    CONSTRAINT check_capacidad_maxima CHECK (capacidad_maxima > 0)
);

CREATE INDEX idx_vm_slots_machine ON vending_machine_slots(vending_machine_id);
CREATE INDEX idx_vm_slots_producto ON vending_machine_slots(producto_id);
CREATE INDEX idx_vm_slots_active ON vending_machine_slots(is_active);

COMMENT ON TABLE vending_machine_slots IS 'Slots individuales de máquinas vending con stock';
COMMENT ON COLUMN vending_machine_slots.stock_real IS 'Stock físico actual en el slot';
COMMENT ON COLUMN vending_machine_slots.stock_reservado IS 'Stock vendido pero no retirado';
```

#### Migración 8: Crear tabla `ventas_app` (ventas desde máquinas)

```sql
-- Archivo: 20251015_080000_create_ventas_app_table.sql

CREATE TABLE IF NOT EXISTS ventas_app (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_venta VARCHAR(50) UNIQUE NOT NULL,

    -- Referencias
    user_id UUID NOT NULL REFERENCES users(id),
    vending_machine_id UUID NOT NULL REFERENCES vending_machines(id),
    slot_id UUID NOT NULL REFERENCES vending_machine_slots(id),
    producto_id UUID NOT NULL REFERENCES productos(id),

    -- Cantidad y precio
    cantidad INTEGER NOT NULL DEFAULT 1,
    precio_unitario BIGINT NOT NULL,  -- Precio aplicado en centavos
    precio_total BIGINT NOT NULL,

    -- Fuente del precio aplicado
    fuente_precio VARCHAR(20) NOT NULL,  -- 'base', 'ubicacion', 'sp', 'maquina'
    version_precio VARCHAR(50),  -- Para auditoría

    -- Estado de la venta
    estado VARCHAR(20) DEFAULT 'reservado',
    -- Estados: reservado, retirado, expirado, cancelado, reembolsado

    -- Pago
    payment_id UUID REFERENCES payments(id),
    modo_pago VARCHAR(20),  -- tarjeta, wallet, prepago, QR
    estado_pago VARCHAR(20) DEFAULT 'pendiente',  -- pendiente, confirmado, reembolsado

    -- Timestamps
    fecha_venta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_expiracion_reserva TIMESTAMP WITH TIME ZONE,
    fecha_retiro TIMESTAMP WITH TIME ZONE,
    fecha_cancelacion TIMESTAMP WITH TIME ZONE,

    -- Código de retiro
    codigo_retiro VARCHAR(10),  -- PIN para retirar el producto

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT check_cantidad_positiva CHECK (cantidad > 0),
    CONSTRAINT check_precio_positivo CHECK (precio_total > 0),
    CONSTRAINT check_estado_venta CHECK (estado IN (
        'reservado', 'retirado', 'expirado', 'cancelado', 'reembolsado'
    )),
    CONSTRAINT check_fuente_precio CHECK (fuente_precio IN (
        'base', 'ubicacion', 'sp', 'maquina'
    ))
);

CREATE INDEX idx_ventas_user ON ventas_app(user_id);
CREATE INDEX idx_ventas_machine ON ventas_app(vending_machine_id);
CREATE INDEX idx_ventas_producto ON ventas_app(producto_id);
CREATE INDEX idx_ventas_estado ON ventas_app(estado);
CREATE INDEX idx_ventas_fecha ON ventas_app(fecha_venta);
CREATE INDEX idx_ventas_codigo ON ventas_app(codigo_venta);

COMMENT ON TABLE ventas_app IS 'Ventas de productos desde la app (vending)';
COMMENT ON COLUMN ventas_app.fuente_precio IS 'Nivel de precio aplicado: base, ubicacion, sp, maquina';
COMMENT ON COLUMN ventas_app.codigo_retiro IS 'PIN generado para retirar el producto de la máquina';
```

#### Migración 9: Crear sistema de precios jerárquico

```sql
-- Archivo: 20251015_090000_create_precios_hierarchy.sql

CREATE TABLE IF NOT EXISTS precios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Entidad a la que aplica el precio
    entidad_tipo VARCHAR(20) NOT NULL,  -- 'servicio', 'producto'
    entidad_id UUID NOT NULL,  -- ID del servicio o producto

    -- Nivel del precio
    nivel VARCHAR(20) NOT NULL,  -- 'base', 'ubicacion', 'sp', 'maquina'

    -- Referencia según nivel
    ubicacion_id UUID REFERENCES locations(id) ON DELETE CASCADE,
    service_point_id UUID REFERENCES service_points(id) ON DELETE CASCADE,
    vending_machine_id UUID REFERENCES vending_machines(id) ON DELETE CASCADE,

    -- Precio
    precio BIGINT NOT NULL,  -- En centavos
    moneda VARCHAR(3) DEFAULT 'EUR',

    -- Impuestos
    impuestos_incluidos BOOLEAN DEFAULT true,
    porcentaje_impuesto DECIMAL(5,2) DEFAULT 21.00,

    -- Vigencia
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE,  -- NULL = vigente indefinidamente
    activo BOOLEAN DEFAULT true,

    -- Versionado
    version INTEGER DEFAULT 1,
    precio_anterior_id UUID REFERENCES precios(id),  -- Link al precio que reemplaza

    -- Metadatos
    motivo_cambio TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT check_entidad_tipo CHECK (entidad_tipo IN ('servicio', 'producto')),
    CONSTRAINT check_nivel CHECK (nivel IN ('base', 'ubicacion', 'sp', 'maquina')),
    CONSTRAINT check_precio_positivo CHECK (precio >= 0),
    CONSTRAINT check_vigencia CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),

    -- Constraint: nivel debe coincidir con FK poblado
    CONSTRAINT check_nivel_fk CHECK (
        (nivel = 'base' AND ubicacion_id IS NULL AND service_point_id IS NULL AND vending_machine_id IS NULL) OR
        (nivel = 'ubicacion' AND ubicacion_id IS NOT NULL AND service_point_id IS NULL AND vending_machine_id IS NULL) OR
        (nivel = 'sp' AND service_point_id IS NOT NULL AND vending_machine_id IS NULL) OR
        (nivel = 'maquina' AND vending_machine_id IS NOT NULL)
    )
);

CREATE INDEX idx_precios_entidad ON precios(entidad_tipo, entidad_id);
CREATE INDEX idx_precios_nivel ON precios(nivel);
CREATE INDEX idx_precios_ubicacion ON precios(ubicacion_id);
CREATE INDEX idx_precios_sp ON precios(service_point_id);
CREATE INDEX idx_precios_maquina ON precios(vending_machine_id);
CREATE INDEX idx_precios_vigencia ON precios(fecha_inicio, fecha_fin);
CREATE INDEX idx_precios_activo ON precios(activo);

COMMENT ON TABLE precios IS 'Sistema de precios jerárquico: base → ubicacion → sp → maquina';
COMMENT ON COLUMN precios.nivel IS 'Nivel de override: base, ubicacion, sp, maquina';
COMMENT ON COLUMN precios.version IS 'Versión del precio para auditoría histórica';
```

#### Migración 10: Modificar `warehouses` - Tipos de ubicación

```sql
-- Archivo: 20251015_100000_enhance_warehouses_unified.sql

-- Renombrar conceptualmente a "ubicaciones_inventario"
-- (mantener nombre tabla por compatibilidad)

ALTER TABLE warehouses
    ADD COLUMN IF NOT EXISTS ubicacion_padre_id UUID REFERENCES warehouses(id),
    ADD COLUMN IF NOT EXISTS nivel_jerarquia INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS es_ubicacion_fisica BOOLEAN DEFAULT true;

-- warehouse_type ya existe, pero asegurar valores
UPDATE warehouses SET warehouse_type = 'physical_warehouse' WHERE warehouse_type IS NULL;

COMMENT ON COLUMN warehouses.warehouse_type IS 'Tipo: physical_warehouse, service_point, vending_machine, workshop';
COMMENT ON COLUMN warehouses.ubicacion_padre_id IS 'Jerarquía: almacén > SP > máquina';
COMMENT ON COLUMN warehouses.nivel_jerarquia IS 'Nivel 0=almacén, 1=SP, 2=máquina, 3=slot';
COMMENT ON COLUMN warehouses.es_ubicacion_fisica IS 'True=ubicación real, False=ubicación lógica';

CREATE INDEX idx_warehouses_padre ON warehouses(ubicacion_padre_id);
CREATE INDEX idx_warehouses_nivel ON warehouses(nivel_jerarquia);
```

#### Migración 11: Mejorar `stock_movements` con estados

```sql
-- Archivo: 20251015_110000_enhance_stock_movements.sql

ALTER TABLE stock_movements
    ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'completado',
    ADD COLUMN IF NOT EXISTS origen_tipo VARCHAR(20),
    ADD COLUMN IF NOT EXISTS destino_tipo VARCHAR(20),
    ADD COLUMN IF NOT EXISTS responsable_preparacion_id UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS responsable_recepcion_id UUID REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS fecha_preparacion TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS fecha_transito TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS fecha_recepcion TIMESTAMP WITH TIME ZONE;

-- Estados: borrador, solicitado, en_transito, recibido, cerrado, cancelado
ALTER TABLE stock_movements
    ADD CONSTRAINT check_estado_movimiento CHECK (estado IN (
        'borrador', 'solicitado', 'en_transito', 'recibido', 'cerrado', 'cancelado'
    ));

ALTER TABLE stock_movements
    ADD CONSTRAINT check_tipo_ubicacion CHECK (
        (origen_tipo IS NULL OR origen_tipo IN ('ALMACEN', 'SP', 'MAQUINA')) AND
        (destino_tipo IS NULL OR destino_tipo IN ('ALMACEN', 'SP', 'MAQUINA'))
    );

CREATE INDEX idx_stock_movements_estado ON stock_movements(estado);
CREATE INDEX idx_stock_movements_origen_tipo ON stock_movements(origen_tipo);
CREATE INDEX idx_stock_movements_destino_tipo ON stock_movements(destino_tipo);

COMMENT ON COLUMN stock_movements.estado IS 'Estado del movimiento: borrador, solicitado, en_transito, etc.';
COMMENT ON COLUMN stock_movements.origen_tipo IS 'Tipo de origen: ALMACEN, SP, MAQUINA';
```

#### Migración 12: Crear tabla `reglas_reposicion`

```sql
-- Archivo: 20251015_120000_create_reglas_reposicion.sql

CREATE TABLE IF NOT EXISTS reglas_reposicion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- A qué producto y ubicación aplica
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    ubicacion_inventario_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,

    -- Niveles de stock
    stock_minimo INTEGER NOT NULL,
    stock_maximo INTEGER NOT NULL,
    punto_pedido INTEGER NOT NULL,

    -- Reposición
    cantidad_pedido_sugerida INTEGER,
    lead_time_dias INTEGER DEFAULT 3,

    -- Estrategia de picking
    estrategia_picking VARCHAR(10) DEFAULT 'FIFO',
    -- FEFO (First Expired First Out), FIFO, LIFO, SERIE

    -- Proveedor
    proveedor_preferente_id UUID,

    -- Alertas
    generar_alerta_automatica BOOLEAN DEFAULT true,
    alerta_email TEXT,

    -- Estado
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_producto_ubicacion UNIQUE (producto_id, ubicacion_inventario_id),
    CONSTRAINT check_niveles_stock CHECK (
        stock_minimo >= 0 AND
        punto_pedido >= stock_minimo AND
        stock_maximo >= punto_pedido
    ),
    CONSTRAINT check_estrategia CHECK (estrategia_picking IN ('FEFO', 'FIFO', 'LIFO', 'SERIE'))
);

CREATE INDEX idx_reglas_producto ON reglas_reposicion(producto_id);
CREATE INDEX idx_reglas_ubicacion ON reglas_reposicion(ubicacion_inventario_id);
CREATE INDEX idx_reglas_active ON reglas_reposicion(is_active);

COMMENT ON TABLE reglas_reposicion IS 'Reglas de reposición automática por producto-ubicación';
COMMENT ON COLUMN reglas_reposicion.punto_pedido IS 'Nivel de stock que dispara pedido automático';
COMMENT ON COLUMN reglas_reposicion.estrategia_picking IS 'FEFO, FIFO, LIFO, SERIE';
```

---

## 6. CÓDIGO A IMPLEMENTAR (Nuevo)

### 6.1. Nuevos DTOs

#### `src/dto/camino.dto.ts`

```typescript
/**
 * DTO para Camino - Agrupador superior de ubicaciones
 */

export enum CaminoEstadoOperativo {
  ACTIVO = "activo",
  PLANIFICADO = "planificado",
  CERRADO = "cerrado",
}

export interface Camino {
  id: string;
  nombre: string;
  codigo: string;
  zona_operativa?: string; // Norte, Centro, Sur
  region?: string; // Castilla y León, Andalucía, etc.
  estado_operativo: CaminoEstadoOperativo;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCaminoDTO {
  nombre: string;
  codigo: string;
  zona_operativa?: string;
  region?: string;
  estado_operativo?: CaminoEstadoOperativo;
  observaciones?: string;
}

export interface UpdateCaminoDTO {
  nombre?: string;
  codigo?: string;
  zona_operativa?: string;
  region?: string;
  estado_operativo?: CaminoEstadoOperativo;
  observaciones?: string;
}

export interface CaminoFilters {
  zona_operativa?: string;
  region?: string;
  estado_operativo?: CaminoEstadoOperativo;
  search?: string;
}

// Con estadísticas
export interface CaminoConStats extends Camino {
  total_ubicaciones: number;
  total_service_points: number;
  ubicaciones_activas: number;
  revenue_total: number;
}
```

#### `src/dto/ubicacion.dto.ts`

```typescript
/**
 * DTO para Ubicación/Ciudad - Contenedor de Service Points
 */

export enum UbicacionEstadoOperativo {
  ACTIVO = "activo",
  EN_MANTENIMIENTO = "en_mantenimiento",
  CERRADO_TEMPORALMENTE = "cerrado_temporalmente",
  PLANIFICADO = "planificado",
}

export interface Ubicacion {
  id: string;
  camino_id?: string;
  camino_nombre?: string; // Poblado del JOIN

  city: string;
  province: string;
  postal_code?: string;
  country: string;
  latitude?: number;
  longitude?: number;

  zona_operativa?: string;
  region?: string;
  estado_operativo: UbicacionEstadoOperativo;

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateUbicacionDTO {
  camino_id?: string;
  city: string;
  province: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  zona_operativa?: string;
  region?: string;
  estado_operativo?: UbicacionEstadoOperativo;
  is_active?: boolean;
}

export interface UpdateUbicacionDTO {
  camino_id?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  zona_operativa?: string;
  region?: string;
  estado_operativo?: UbicacionEstadoOperativo;
  is_active?: boolean;
}

export interface UbicacionFilters {
  camino_id?: string;
  province?: string;
  zona_operativa?: string;
  estado_operativo?: UbicacionEstadoOperativo;
  is_active?: boolean;
  search?: string;
}

// Con estadísticas
export interface UbicacionConStats extends Ubicacion {
  total_service_points: number;
  service_points_activos: number;
  total_revenue: number;
  total_bookings: number;
}
```

#### `src/dto/producto.dto.ts`

```typescript
/**
 * DTO para Productos con gestión completa de inventario
 */

export interface Producto {
  id: string;
  sku: string;
  nombre: string;
  descripcion?: string;

  categoria_id?: string;
  categoria_nombre?: string; // Poblado del JOIN
  subcategoria_id?: string;
  subcategoria_nombre?: string; // Poblado del JOIN

  precio_base: number; // En centavos
  moneda: string;

  unidad_medida: string; // u, kg, L, m
  permite_lote: boolean;
  permite_serie: boolean;
  tiene_caducidad: boolean;

  ancho_mm?: number;
  alto_mm?: number;
  profundo_mm?: number;
  peso_gramos?: number;

  imagen_url?: string;
  imagenes?: string[];
  marca?: string;
  proveedor_preferente_id?: string;

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductoDTO {
  sku: string;
  nombre: string;
  descripcion?: string;
  categoria_id?: string;
  subcategoria_id?: string;
  precio_base: number;
  moneda?: string;
  unidad_medida?: string;
  permite_lote?: boolean;
  permite_serie?: boolean;
  tiene_caducidad?: boolean;
  ancho_mm?: number;
  alto_mm?: number;
  profundo_mm?: number;
  peso_gramos?: number;
  imagen_url?: string;
  imagenes?: string[];
  marca?: string;
  proveedor_preferente_id?: string;
  is_active?: boolean;
}

export interface UpdateProductoDTO {
  nombre?: string;
  descripcion?: string;
  categoria_id?: string;
  subcategoria_id?: string;
  precio_base?: number;
  unidad_medida?: string;
  permite_lote?: boolean;
  permite_serie?: boolean;
  tiene_caducidad?: boolean;
  ancho_mm?: number;
  alto_mm?: number;
  profundo_mm?: number;
  peso_gramos?: number;
  imagen_url?: string;
  imagenes?: string[];
  marca?: string;
  proveedor_preferente_id?: string;
  is_active?: boolean;
}

export interface ProductoFilters {
  categoria_id?: string;
  subcategoria_id?: string;
  marca?: string;
  is_active?: boolean;
  tiene_caducidad?: boolean;
  search?: string;
}

// Con stock
export interface ProductoConStock extends Producto {
  stock_total: number;
  stock_disponible: number;
  stock_reservado: number;
  stock_minimo?: number;
  requiere_reposicion: boolean;
}
```

#### `src/dto/vending-machine-slot.dto.ts`

```typescript
/**
 * DTO para Slots de máquinas vending
 */

export interface VendingMachineSlot {
  id: string;
  vending_machine_id: string;
  slot_number: number;
  slot_code?: string; // A1, B3, etc.

  producto_id?: string;
  producto_nombre?: string; // Poblado del JOIN
  producto_sku?: string;
  producto_imagen?: string;
  producto_precio_base?: number;

  capacidad_maxima: number;
  stock_real: number;
  stock_reservado: number;
  stock_disponible: number; // = stock_real - stock_reservado

  is_active: boolean;
  ultimo_reabastecimiento?: string;
  notas?: string;

  created_at: string;
  updated_at: string;
}

export interface CreateSlotDTO {
  vending_machine_id: string;
  slot_number: number;
  slot_code?: string;
  producto_id?: string;
  capacidad_maxima: number;
  stock_real?: number;
  is_active?: boolean;
  notas?: string;
}

export interface UpdateSlotDTO {
  producto_id?: string;
  capacidad_maxima?: number;
  stock_real?: number;
  stock_reservado?: number;
  is_active?: boolean;
  notas?: string;
}

export interface SlotFilters {
  vending_machine_id?: string;
  producto_id?: string;
  is_active?: boolean;
  stock_bajo?: boolean; // stock_real <= 20% capacidad_maxima
}

// Para reabastecimiento
export interface ReabastecerSlotDTO {
  slot_id: string;
  cantidad_agregada: number;
  responsable_id?: string;
  notas?: string;
}
```

#### `src/dto/venta-app.dto.ts`

```typescript
/**
 * DTO para Ventas desde la App (productos vending)
 */

export enum VentaEstado {
  RESERVADO = "reservado",
  RETIRADO = "retirado",
  EXPIRADO = "expirado",
  CANCELADO = "cancelado",
  REEMBOLSADO = "reembolsado",
}

export enum FuentePrecio {
  BASE = "base",
  UBICACION = "ubicacion",
  SP = "sp",
  MAQUINA = "maquina",
}

export interface VentaApp {
  id: string;
  codigo_venta: string;

  user_id: string;
  user_nombre?: string; // Poblado del JOIN

  vending_machine_id: string;
  machine_nombre?: string;
  machine_ubicacion?: string;

  slot_id: string;
  slot_code?: string;

  producto_id: string;
  producto_nombre?: string;
  producto_sku?: string;
  producto_imagen?: string;

  cantidad: number;
  precio_unitario: number; // En centavos
  precio_total: number;

  fuente_precio: FuentePrecio;
  version_precio?: string;

  estado: VentaEstado;

  payment_id?: string;
  modo_pago?: string;
  estado_pago?: string;

  fecha_venta: string;
  fecha_expiracion_reserva?: string;
  fecha_retiro?: string;
  fecha_cancelacion?: string;

  codigo_retiro?: string; // PIN

  created_at: string;
  updated_at: string;
}

export interface CreateVentaAppDTO {
  user_id: string;
  vending_machine_id: string;
  slot_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  precio_total: number;
  fuente_precio: FuentePrecio;
  version_precio?: string;
  modo_pago?: string;
}

export interface UpdateVentaAppDTO {
  estado?: VentaEstado;
  payment_id?: string;
  estado_pago?: string;
  fecha_retiro?: string;
  fecha_cancelacion?: string;
}

export interface VentaFilters {
  user_id?: string;
  vending_machine_id?: string;
  producto_id?: string;
  estado?: VentaEstado;
  fecha_desde?: string;
  fecha_hasta?: string;
}

// Para confirmar retiro
export interface ConfirmarRetiroDTO {
  venta_id: string;
  codigo_retiro: string;
}
```

#### `src/dto/precio.dto.ts`

```typescript
/**
 * DTO para Sistema de Precios Jerárquico
 */

export enum NivelPrecio {
  BASE = "base",
  UBICACION = "ubicacion",
  SP = "sp",
  MAQUINA = "maquina",
}

export enum EntidadTipo {
  SERVICIO = "servicio",
  PRODUCTO = "producto",
}

export interface Precio {
  id: string;

  entidad_tipo: EntidadTipo;
  entidad_id: string;
  entidad_nombre?: string; // Poblado del JOIN

  nivel: NivelPrecio;

  ubicacion_id?: string;
  ubicacion_nombre?: string;

  service_point_id?: string;
  service_point_nombre?: string;

  vending_machine_id?: string;
  machine_nombre?: string;

  precio: number; // En centavos
  moneda: string;

  impuestos_incluidos: boolean;
  porcentaje_impuesto: number;

  fecha_inicio: string;
  fecha_fin?: string;
  activo: boolean;

  version: number;
  precio_anterior_id?: string;

  motivo_cambio?: string;
  created_by?: string;

  created_at: string;
  updated_at: string;
}

export interface CreatePrecioDTO {
  entidad_tipo: EntidadTipo;
  entidad_id: string;
  nivel: NivelPrecio;
  ubicacion_id?: string;
  service_point_id?: string;
  vending_machine_id?: string;
  precio: number;
  moneda?: string;
  impuestos_incluidos?: boolean;
  porcentaje_impuesto?: number;
  fecha_inicio?: string;
  fecha_fin?: string;
  activo?: boolean;
  version?: number;
  precio_anterior_id?: string;
  motivo_cambio?: string;
  created_by?: string;
}

export interface UpdatePrecioDTO {
  precio?: number;
  fecha_fin?: string;
  activo?: boolean;
  motivo_cambio?: string;
}

export interface PrecioFilters {
  entidad_tipo?: EntidadTipo;
  entidad_id?: string;
  nivel?: NivelPrecio;
  ubicacion_id?: string;
  service_point_id?: string;
  vending_machine_id?: string;
  activo?: boolean;
  vigente?: boolean; // fecha_inicio <= hoy <= fecha_fin
}

// Para resolver precio aplicable
export interface ResolverPrecioDTO {
  entidad_tipo: EntidadTipo;
  entidad_id: string;
  ubicacion_id?: string;
  service_point_id?: string;
  vending_machine_id?: string;
  fecha?: string; // Default: hoy
}

export interface PrecioResuelto {
  precio: number;
  fuente: NivelPrecio;
  precio_id: string;
  version: number;
  desglose?: {
    base?: number;
    ubicacion?: number;
    sp?: number;
    maquina?: number;
  };
}
```

---

**Continúa en ANALISIS_ARQUITECTURA_CAMINO_PARTE3.md...**
