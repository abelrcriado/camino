-- =====================================================
-- SPRINT 3.1: FUNCIONES Y VISTA PRODUCTOS
-- Migración: Funciones de negocio para productos
-- Autor: Sistema Camino
-- Fecha: 2025-10-10
-- =====================================================

-- =====================================================
-- FUNCIÓN: get_producto_con_stock
-- Obtiene producto con información básica (sin stock por ahora)
-- Nota: Integración completa de stock en Sprint 5
-- =====================================================

CREATE OR REPLACE FUNCTION get_producto_con_stock(p_producto_id UUID DEFAULT NULL)
RETURNS TABLE (
  producto_id UUID,
  sku VARCHAR,
  nombre VARCHAR,
  descripcion TEXT,
  category_id UUID,
  category_name VARCHAR,
  marca VARCHAR,
  modelo VARCHAR,
  precio_venta BIGINT,
  unidad_medida VARCHAR,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as producto_id,
    p.sku,
    p.nombre,
    p.descripcion,
    p.category_id,
    pc.name as category_name,
    p.marca,
    p.modelo,
    p.precio_venta,
    p.unidad_medida::VARCHAR,
    p.is_active,
    p.created_at,
    p.updated_at
  FROM productos p
  LEFT JOIN product_categories pc ON p.category_id = pc.id
  WHERE (p_producto_id IS NULL OR p.id = p_producto_id)
    AND p.is_active = true;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_producto_con_stock IS 'Obtiene productos (stock se integrará en Sprint 5)';

-- =====================================================
-- FUNCIÓN: check_producto_disponible
-- Verifica si un producto existe y está activo
-- Nota: Integración completa de stock en Sprint 5
-- =====================================================

CREATE OR REPLACE FUNCTION check_producto_disponible(
  p_producto_id UUID,
  p_cantidad INTEGER DEFAULT 1,
  p_warehouse_id UUID DEFAULT NULL,
  p_service_point_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  producto_activo BOOLEAN;
BEGIN
  -- Por ahora solo verifica si el producto existe y está activo
  SELECT is_active INTO producto_activo
  FROM productos
  WHERE id = p_producto_id;
  
  RETURN COALESCE(producto_activo, false);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION check_producto_disponible IS 'Verifica disponibilidad de producto (stock se integrará en Sprint 5)';

-- =====================================================
-- FUNCIÓN: get_productos_perecederos_proximos_caducar
-- Lista productos perecederos próximos a caducar
-- Nota: Integración con inventario real en Sprint 5
-- =====================================================

CREATE OR REPLACE FUNCTION get_productos_perecederos_proximos_caducar(
  p_dias_umbral INTEGER DEFAULT 30
)
RETURNS TABLE (
  producto_id UUID,
  sku VARCHAR,
  nombre VARCHAR,
  meses_caducidad INTEGER,
  dias_caducidad INTEGER,
  dias_restantes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as producto_id,
    p.sku,
    p.nombre,
    p.meses_caducidad,
    p.dias_caducidad,
    CASE
      WHEN p.dias_caducidad IS NOT NULL THEN p.dias_caducidad
      WHEN p.meses_caducidad IS NOT NULL THEN p.meses_caducidad * 30
      ELSE 0
    END as dias_restantes
  FROM productos p
  WHERE p.perecedero = true
    AND p.is_active = true
    AND (
      p.dias_caducidad <= p_dias_umbral OR
      (p.meses_caducidad * 30) <= p_dias_umbral
    )
  ORDER BY dias_restantes ASC;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_productos_perecederos_proximos_caducar IS 'Lista productos perecederos próximos a caducar según umbral de días';

-- =====================================================
-- VISTA: v_productos_inventario
-- Vista denormalizada de productos con info completa
-- Nota: Stock se agregará en Sprint 5
-- =====================================================

CREATE OR REPLACE VIEW v_productos_inventario AS
SELECT
  p.id as producto_id,
  p.sku,
  p.nombre,
  p.descripcion,
  
  -- Categorización
  pc.id as category_id,
  pc.name as category_name,
  psc.id as subcategory_id,
  psc.name as subcategory_name,
  
  -- Especificaciones
  p.marca,
  p.modelo,
  p.especificaciones,
  
  -- Precios (convertir de centavos a euros para display)
  (p.costo_base::DECIMAL / 100) as costo_base_euros,
  (p.precio_venta::DECIMAL / 100) as precio_venta_euros,
  p.tasa_iva,
  p.margen_beneficio,
  
  -- Dimensiones
  p.peso_gramos,
  p.dimensiones,
  p.unidad_medida::VARCHAR as unidad_medida,
  
  -- Caducidad
  p.requiere_refrigeracion,
  p.meses_caducidad,
  p.dias_caducidad,
  p.perecedero,
  
  -- Código de barras
  p.codigo_barras,
  
  -- Proveedor
  p.proveedor_nombre,
  p.proveedor_codigo,
  
  -- Multimedia
  p.imagenes,
  p.tags,
  
  -- Estado
  p.is_active,
  
  -- Timestamps
  p.created_at,
  p.updated_at
FROM productos p
LEFT JOIN product_categories pc ON p.category_id = pc.id
LEFT JOIN product_subcategories psc ON p.subcategory_id = psc.id;

COMMENT ON VIEW v_productos_inventario IS 'Vista denormalizada de productos (stock se agregará en Sprint 5)';

-- =====================================================
-- GRANTS
-- =====================================================

-- Permisos para funciones
GRANT EXECUTE ON FUNCTION get_producto_con_stock TO authenticated;
GRANT EXECUTE ON FUNCTION check_producto_disponible TO authenticated;
GRANT EXECUTE ON FUNCTION get_productos_perecederos_proximos_caducar TO authenticated;

-- Permisos para vista
GRANT SELECT ON v_productos_inventario TO authenticated;
GRANT SELECT ON v_productos_inventario TO anon;
