-- =====================================================
-- Migración: Trigger automático para registrar ventas
-- Sprint 6.5 - Sistema de Historial de Ventas
-- Fecha: 2025-10-15
-- =====================================================

-- Función para registrar transacción cuando el stock se reduce
CREATE OR REPLACE FUNCTION log_vending_transaction()
RETURNS TRIGGER AS $$
DECLARE
  v_precio INTEGER;
  v_cantidad INTEGER;
BEGIN
  -- Solo registrar si stock_disponible se reduce
  IF NEW.stock_disponible < OLD.stock_disponible THEN
    v_cantidad := OLD.stock_disponible - NEW.stock_disponible;
    
    -- Obtener precio del slot (usar precio_override si existe, sino usar precio del producto)
    -- Por ahora usamos precio_override o 0 si no existe
    -- En producción, se debe obtener el precio del producto si precio_override es NULL
    v_precio := COALESCE(NEW.precio_override, 0);
    
    -- Si el precio es 0, significa que no hay precio_override y se debe obtener del producto
    -- Por simplicidad, registramos con el precio que tengamos
    IF v_precio = 0 THEN
      -- Intentar obtener precio del producto desde tabla productos
      SELECT COALESCE(precio_centimos, 0) INTO v_precio
      FROM productos
      WHERE id = NEW.producto_id;
    END IF;
    
    -- Registrar transacción
    INSERT INTO vending_transactions (
      slot_id,
      machine_id,
      producto_id,
      cantidad,
      precio_unitario,
      precio_total,
      metodo_pago,
      stock_antes,
      stock_despues
    ) VALUES (
      NEW.id,
      NEW.machine_id,
      NEW.producto_id,
      v_cantidad,
      v_precio,
      v_precio * v_cantidad,
      'unknown', -- Por defecto 'unknown', puede ser actualizado por hardware/app
      OLD.stock_disponible,
      NEW.stock_disponible
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentario de la función
COMMENT ON FUNCTION log_vending_transaction() IS 
'Registra automáticamente una transacción cuando el stock_disponible de un slot se reduce';

-- Trigger que se ejecuta después de actualizar stock_disponible
CREATE TRIGGER trigger_log_vending_transaction
AFTER UPDATE OF stock_disponible ON vending_machine_slots
FOR EACH ROW
EXECUTE FUNCTION log_vending_transaction();

-- Comentario del trigger
COMMENT ON TRIGGER trigger_log_vending_transaction ON vending_machine_slots IS 
'Trigger que registra ventas automáticamente cuando se reduce el stock disponible';
