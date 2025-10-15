-- =====================================================
-- Migración: Trigger automático para registrar transacciones
-- Sprint: Sistema de Historial de Ventas
-- Fecha: 2025-10-15
-- Descripción: Registra automáticamente transacciones cuando el stock se reduce
-- =====================================================

-- ============================================================================
-- FUNCIÓN: Registrar transacción cuando stock se reduce
-- ============================================================================

CREATE OR REPLACE FUNCTION log_vending_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_precio DECIMAL(10,2);
  v_cantidad INTEGER;
BEGIN
  -- Solo registrar si el stock disponible se reduce
  IF NEW.stock_disponible < OLD.stock_disponible THEN
    -- Calcular cantidad vendida
    v_cantidad := OLD.stock_disponible - NEW.stock_disponible;
    
    -- Obtener precio del slot (override) o del producto
    IF NEW.precio_override IS NOT NULL THEN
      -- Convertir de centavos a euros
      v_precio := NEW.precio_override / 100.0;
    ELSE
      -- Obtener precio del producto
      SELECT COALESCE(precio_venta, 0) / 100.0 INTO v_precio
      FROM productos
      WHERE id = NEW.producto_id;
      
      -- Si no hay precio, usar 0
      v_precio := COALESCE(v_precio, 0);
    END IF;
    
    -- Registrar la transacción
    INSERT INTO vending_transactions (
      slot_id,
      machine_id,
      producto_id,
      cantidad,
      precio_unitario,
      precio_total,
      metodo_pago,
      stock_antes,
      stock_despues,
      created_at
    ) VALUES (
      NEW.id,
      NEW.machine_id,
      NEW.producto_id,
      v_cantidad,
      v_precio,
      v_precio * v_cantidad,
      'unknown', -- Actualizar con método real desde hardware en el futuro
      OLD.stock_disponible,
      NEW.stock_disponible,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Ejecutar función después de actualizar stock
-- ============================================================================

CREATE TRIGGER trigger_log_vending_transaction
AFTER UPDATE OF stock_disponible ON vending_machine_slots
FOR EACH ROW
EXECUTE FUNCTION log_vending_transaction();

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON FUNCTION log_vending_transaction() IS 
'Registra automáticamente una transacción en vending_transactions cuando el stock disponible de un slot se reduce';

-- ============================================================================
-- FIN MIGRACIÓN
-- ============================================================================
