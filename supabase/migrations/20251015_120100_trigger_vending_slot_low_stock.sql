-- ============================================================================
-- Sprint 7: Alerts System
-- Migración: Trigger para alertas de stock bajo en vending machine slots
-- Fecha: 2025-10-15
-- ============================================================================

-- Descripción:
-- Esta migración crea un trigger que genera automáticamente alertas cuando
-- el stock disponible de un slot cae por debajo del umbral crítico (< 3 unidades).

-- ============================================================================
-- 1. FUNCIÓN: check_vending_slot_low_stock
-- ============================================================================

CREATE OR REPLACE FUNCTION check_vending_slot_low_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_machine_name TEXT;
  v_producto_nombre TEXT;
BEGIN
  -- Solo generar alerta si el stock disponible es bajo (< 3)
  -- Y si cambió desde un nivel normal a bajo
  IF NEW.stock_disponible < 3 AND (OLD IS NULL OR OLD.stock_disponible >= 3) THEN
    
    -- Obtener nombre de la máquina para el mensaje
    SELECT vm.nombre INTO v_machine_name
    FROM vending_machines vm
    WHERE vm.id = NEW.machine_id;
    
    -- Obtener nombre del producto si está asignado
    IF NEW.producto_id IS NOT NULL THEN
      SELECT p.nombre INTO v_producto_nombre
      FROM productos p
      WHERE p.id = NEW.producto_id;
    END IF;
    
    -- Crear la alerta
    INSERT INTO alerts (
      tipo,
      severidad,
      mensaje,
      entidad_tipo,
      entidad_id,
      accion_requerida
    ) VALUES (
      'low_stock_vending',
      CASE 
        WHEN NEW.stock_disponible = 0 THEN 'critical'
        ELSE 'warning'
      END,
      CASE 
        WHEN NEW.stock_disponible = 0 THEN
          'Stock vacío en ' || COALESCE(v_machine_name, 'máquina') || 
          ' - Slot ' || NEW.slot_number ||
          CASE WHEN v_producto_nombre IS NOT NULL 
            THEN ' (' || v_producto_nombre || ')'
            ELSE '' 
          END
        ELSE
          'Stock bajo en ' || COALESCE(v_machine_name, 'máquina') || 
          ' - Slot ' || NEW.slot_number || ': ' || NEW.stock_disponible || 
          ' unidades restantes' ||
          CASE WHEN v_producto_nombre IS NOT NULL 
            THEN ' (' || v_producto_nombre || ')'
            ELSE '' 
          END
      END,
      'vending_slot',
      NEW.id,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_vending_slot_low_stock IS 'Genera alerta automática cuando stock disponible en slot < 3 unidades';

-- ============================================================================
-- 2. TRIGGER: trigger_vending_slot_low_stock
-- ============================================================================

CREATE TRIGGER trigger_vending_slot_low_stock
  AFTER INSERT OR UPDATE OF stock_disponible ON vending_machine_slots
  FOR EACH ROW
  EXECUTE FUNCTION check_vending_slot_low_stock();

COMMENT ON TRIGGER trigger_vending_slot_low_stock ON vending_machine_slots 
IS 'Genera alertas automáticas de stock bajo en slots de vending machines';

-- ============================================================================
-- FIN MIGRACIÓN
-- ============================================================================
