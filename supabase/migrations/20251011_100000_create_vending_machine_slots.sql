-- ============================================================================
-- Sprint 3.2: Vending Machine Slots
-- Migración: Crear tabla vending_machine_slots
-- Fecha: 2025-10-11
-- ============================================================================

-- Descripción:
-- Esta migración crea la tabla vending_machine_slots para gestionar
-- el inventario granular de productos en máquinas vending.
-- Cada slot representa una posición física en la máquina con control
-- de stock disponible y reservado.

-- ============================================================================
-- 1. CREAR TABLA VENDING_MACHINE_SLOTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS vending_machine_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id UUID NOT NULL REFERENCES vending_machines(id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  
  -- Capacidad y stock
  capacidad_maxima INTEGER NOT NULL DEFAULT 10,
  stock_disponible INTEGER NOT NULL DEFAULT 0,
  stock_reservado INTEGER NOT NULL DEFAULT 0,
  
  -- Configuración del slot
  precio_override BIGINT, -- Precio en centavos si difiere del precio general del producto
  activo BOOLEAN NOT NULL DEFAULT true,
  notas TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_machine_slot UNIQUE (machine_id, slot_number),
  CONSTRAINT check_slot_number CHECK (slot_number > 0),
  CONSTRAINT check_capacidad CHECK (capacidad_maxima > 0),
  CONSTRAINT check_stock_disponible CHECK (stock_disponible >= 0),
  CONSTRAINT check_stock_reservado CHECK (stock_reservado >= 0),
  CONSTRAINT check_stock_total CHECK (stock_disponible + stock_reservado <= capacidad_maxima),
  CONSTRAINT check_precio_override CHECK (precio_override IS NULL OR precio_override > 0)
);

-- ============================================================================
-- 2. CREAR ÍNDICES
-- ============================================================================

CREATE INDEX idx_vms_machine_id ON vending_machine_slots(machine_id);
CREATE INDEX idx_vms_producto_id ON vending_machine_slots(producto_id);
CREATE INDEX idx_vms_activo ON vending_machine_slots(activo);
CREATE INDEX idx_vms_stock_bajo ON vending_machine_slots(machine_id, stock_disponible) 
  WHERE stock_disponible < (capacidad_maxima / 2);

-- ============================================================================
-- 3. COMENTARIOS
-- ============================================================================

COMMENT ON TABLE vending_machine_slots IS 'Slots (posiciones) de productos en máquinas vending con control de stock disponible y reservado';
COMMENT ON COLUMN vending_machine_slots.machine_id IS 'ID de la máquina vending a la que pertenece el slot';
COMMENT ON COLUMN vending_machine_slots.slot_number IS 'Número del slot en la máquina (ej: 1, 2, 3...)';
COMMENT ON COLUMN vending_machine_slots.producto_id IS 'ID del producto asignado al slot (NULL si vacío)';
COMMENT ON COLUMN vending_machine_slots.capacidad_maxima IS 'Capacidad máxima del slot';
COMMENT ON COLUMN vending_machine_slots.stock_disponible IS 'Stock libre para venta inmediata';
COMMENT ON COLUMN vending_machine_slots.stock_reservado IS 'Stock bloqueado por reservas pendientes';
COMMENT ON COLUMN vending_machine_slots.precio_override IS 'Precio específico para este slot (en centavos), sobreescribe precio general';
COMMENT ON COLUMN vending_machine_slots.activo IS 'Indica si el slot está activo para ventas';

-- ============================================================================
-- 4. TRIGGER UPDATED_AT
-- ============================================================================

CREATE TRIGGER trigger_vending_machine_slots_updated_at
  BEFORE UPDATE ON vending_machine_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON vending_machine_slots TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON vending_machine_slots TO service_role;
GRANT SELECT ON vending_machine_slots TO anon;

-- ============================================================================
-- FIN MIGRACIÓN
-- ============================================================================
