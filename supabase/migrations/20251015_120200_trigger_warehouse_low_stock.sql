-- ============================================================================
-- Sprint 7: Alerts System
-- Migración: Trigger para alertas de stock bajo en warehouse
-- Fecha: 2025-10-15
-- ============================================================================

-- Descripción:
-- Esta migración crea un trigger que genera automáticamente alertas cuando
-- el stock en warehouse cae por debajo del stock mínimo definido.

-- ============================================================================
-- 1. VERIFICAR ESTRUCTURA DE TABLA WAREHOUSE
-- ============================================================================

-- Nota: Este trigger asume que existe una tabla de inventario de warehouse.
-- Si no existe warehouse_inventory, este trigger usará warehouse_stock.
-- Adaptación según la estructura real de la base de datos.

-- ============================================================================
-- 2. FUNCIÓN: check_warehouse_low_stock
-- ============================================================================

CREATE OR REPLACE FUNCTION check_warehouse_low_stock()
RETURNS TRIGGER AS $$
DECLARE
  v_warehouse_name TEXT;
  v_product_name TEXT;
  v_min_stock INTEGER;
BEGIN
  -- Determinar el stock mínimo según la estructura de la tabla
  -- Asumimos que puede ser min_stock_alert o stock_minimo
  IF TG_TABLE_NAME = 'warehouse_stock' THEN
    v_min_stock := COALESCE(NEW.min_stock_alert, 10);
  ELSE
    v_min_stock := COALESCE(NEW.stock_minimo, 10);
  END IF;
  
  -- Solo generar alerta si el stock total es bajo
  -- Y si cambió desde un nivel normal a bajo
  IF NEW.total_stock < v_min_stock AND (OLD IS NULL OR OLD.total_stock >= v_min_stock) THEN
    
    -- Obtener nombre del warehouse
    BEGIN
      SELECT w.nombre INTO v_warehouse_name
      FROM warehouses w
      WHERE w.id = NEW.warehouse_id;
    EXCEPTION WHEN OTHERS THEN
      v_warehouse_name := 'Almacén';
    END;
    
    -- Obtener nombre del producto
    BEGIN
      SELECT p.nombre INTO v_product_name
      FROM productos p
      WHERE p.id = NEW.product_id;
    EXCEPTION WHEN OTHERS THEN
      v_product_name := 'Producto';
    END;
    
    -- Crear la alerta
    INSERT INTO alerts (
      tipo,
      severidad,
      mensaje,
      entidad_tipo,
      entidad_id,
      accion_requerida
    ) VALUES (
      'low_stock_warehouse',
      CASE 
        WHEN NEW.total_stock = 0 THEN 'critical'
        WHEN NEW.total_stock < (v_min_stock * 0.5) THEN 'critical'
        ELSE 'warning'
      END,
      CASE 
        WHEN NEW.total_stock = 0 THEN
          'Stock crítico en ' || COALESCE(v_warehouse_name, 'almacén') || ': ' ||
          COALESCE(v_product_name, 'producto') || ' - AGOTADO (0 unidades)'
        ELSE
          'Stock bajo en ' || COALESCE(v_warehouse_name, 'almacén') || ': ' ||
          COALESCE(v_product_name, 'producto') || ' - ' || NEW.total_stock || 
          ' / ' || v_min_stock || ' mínimo requerido'
      END,
      'warehouse_inventory',
      NEW.id,
      true
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_warehouse_low_stock IS 'Genera alerta automática cuando stock en warehouse < stock_minimo';

-- ============================================================================
-- 3. TRIGGER: trigger_warehouse_low_stock (warehouse_stock table)
-- ============================================================================

-- Este trigger se aplica a warehouse_stock si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'warehouse_stock'
  ) THEN
    CREATE TRIGGER trigger_warehouse_stock_low_stock
      AFTER INSERT OR UPDATE OF total_stock ON warehouse_stock
      FOR EACH ROW
      EXECUTE FUNCTION check_warehouse_low_stock();
    
    RAISE NOTICE 'Trigger creado para tabla warehouse_stock';
  END IF;
END $$;

-- ============================================================================
-- 4. TRIGGER: trigger_warehouse_inventory_low_stock (si existe otra tabla)
-- ============================================================================

-- Este trigger se aplica a warehouse_inventory si existe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'warehouse_inventory'
  ) THEN
    CREATE TRIGGER trigger_warehouse_inventory_low_stock
      AFTER INSERT OR UPDATE OF total_stock ON warehouse_inventory
      FOR EACH ROW
      EXECUTE FUNCTION check_warehouse_low_stock();
    
    RAISE NOTICE 'Trigger creado para tabla warehouse_inventory';
  END IF;
END $$;

-- ============================================================================
-- FIN MIGRACIÓN
-- ============================================================================
