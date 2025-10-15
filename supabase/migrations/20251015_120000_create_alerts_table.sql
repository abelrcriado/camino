-- ============================================================================
-- Sprint 7: Alerts System
-- Migración: Crear tabla alerts para notificaciones de stock bajo y otros eventos
-- Fecha: 2025-10-15
-- ============================================================================

-- Descripción:
-- Esta migración crea la tabla alerts para gestionar notificaciones automáticas
-- del sistema, incluyendo alertas de stock bajo en vending machines y warehouse.

-- ============================================================================
-- 1. CREAR TABLA ALERTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Clasificación de la alerta
  tipo VARCHAR(50) NOT NULL, -- 'low_stock_vending', 'low_stock_warehouse', 'machine_offline', etc.
  severidad VARCHAR(20) NOT NULL, -- 'info', 'warning', 'critical'
  
  -- Contenido de la alerta
  mensaje TEXT NOT NULL,
  
  -- Referencia a la entidad que generó la alerta
  entidad_tipo VARCHAR(50), -- 'vending_slot', 'warehouse_inventory', etc.
  entidad_id UUID,
  
  -- Estado de la alerta
  leida BOOLEAN NOT NULL DEFAULT false,
  accion_requerida BOOLEAN NOT NULL DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT check_tipo_valido CHECK (tipo IN (
    'low_stock_vending',
    'low_stock_warehouse',
    'machine_offline',
    'machine_maintenance',
    'stock_critical',
    'restock_needed'
  )),
  CONSTRAINT check_severidad_valida CHECK (severidad IN ('info', 'warning', 'critical'))
);

-- ============================================================================
-- 2. CREAR ÍNDICES
-- ============================================================================

CREATE INDEX idx_alerts_tipo ON alerts(tipo);
CREATE INDEX idx_alerts_severidad ON alerts(severidad);
CREATE INDEX idx_alerts_leida ON alerts(leida);
CREATE INDEX idx_alerts_entidad ON alerts(entidad_tipo, entidad_id);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX idx_alerts_no_leidas ON alerts(leida) WHERE leida = false;

-- ============================================================================
-- 3. COMENTARIOS
-- ============================================================================

COMMENT ON TABLE alerts IS 'Alertas y notificaciones del sistema (stock bajo, máquinas offline, etc.)';
COMMENT ON COLUMN alerts.tipo IS 'Tipo de alerta: low_stock_vending, low_stock_warehouse, machine_offline, etc.';
COMMENT ON COLUMN alerts.severidad IS 'Nivel de severidad: info, warning, critical';
COMMENT ON COLUMN alerts.mensaje IS 'Mensaje descriptivo de la alerta';
COMMENT ON COLUMN alerts.entidad_tipo IS 'Tipo de entidad que generó la alerta: vending_slot, warehouse_inventory, etc.';
COMMENT ON COLUMN alerts.entidad_id IS 'UUID de la entidad que generó la alerta';
COMMENT ON COLUMN alerts.leida IS 'Indica si la alerta ha sido leída por un usuario';
COMMENT ON COLUMN alerts.accion_requerida IS 'Indica si la alerta requiere acción inmediata';

-- ============================================================================
-- 4. TRIGGER UPDATED_AT
-- ============================================================================

CREATE TRIGGER trigger_alerts_updated_at
  BEFORE UPDATE ON alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. GRANT PERMISSIONS
-- ============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON alerts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON alerts TO service_role;
GRANT SELECT ON alerts TO anon;

-- ============================================================================
-- FIN MIGRACIÓN
-- ============================================================================
