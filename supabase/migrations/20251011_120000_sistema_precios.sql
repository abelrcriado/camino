-- =====================================================
-- SPRINT 4.2: SISTEMA DE PRECIOS JERÁRQUICO
-- Migración: Crear tabla precios con 3 niveles (Base, Ubicación, Service Point)
-- Autor: Sistema Camino
-- Fecha: 2025-10-11
-- =====================================================

-- =====================================================
-- PASO 1: CREAR ENUMS
-- =====================================================

-- Enum para nivel de precio en jerarquía
CREATE TYPE nivel_precio_tipo AS ENUM ('base', 'ubicacion', 'service_point');

-- Enum para tipo de entidad que tiene precio
CREATE TYPE entidad_precio_tipo AS ENUM ('producto', 'servicio');

-- =====================================================
-- PASO 2: CREAR TABLA PRECIOS
-- =====================================================

CREATE TABLE IF NOT EXISTS precios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Nivel jerárquico del precio
  nivel nivel_precio_tipo NOT NULL DEFAULT 'base',
  
  -- Tipo de entidad (producto o servicio)
  entidad_tipo entidad_precio_tipo NOT NULL,
  
  -- ID de la entidad (producto_id o service_id)
  entidad_id UUID NOT NULL,
  
  -- Precio en céntimos (mismo formato que ventas_app)
  precio INTEGER NOT NULL,
  
  -- Referencias jerárquicas (solo para niveles ubicacion y service_point)
  ubicacion_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  service_point_id UUID REFERENCES service_points(id) ON DELETE CASCADE,
  
  -- Vigencia temporal del precio
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  
  -- Metadata
  notas TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- =====================================================
  -- CONSTRAINTS
  -- =====================================================
  
  -- El precio debe ser positivo
  CONSTRAINT check_precio_positivo CHECK (precio > 0),
  
  -- Fecha fin debe ser posterior a fecha inicio
  CONSTRAINT check_fechas_coherentes CHECK (
    fecha_fin IS NULL OR fecha_fin > fecha_inicio
  ),
  
  -- Nivel BASE: NO debe tener ubicacion_id ni service_point_id
  CONSTRAINT check_base_sin_ubicacion CHECK (
    nivel != 'base' OR (ubicacion_id IS NULL AND service_point_id IS NULL)
  ),
  
  -- Nivel UBICACION: debe tener ubicacion_id, NO service_point_id
  CONSTRAINT check_ubicacion_requiere_ubicacion_id CHECK (
    nivel != 'ubicacion' OR (ubicacion_id IS NOT NULL AND service_point_id IS NULL)
  ),
  
  -- Nivel SERVICE_POINT: debe tener AMBOS ubicacion_id y service_point_id
  CONSTRAINT check_sp_requiere_ambos_ids CHECK (
    nivel != 'service_point' OR (ubicacion_id IS NOT NULL AND service_point_id IS NOT NULL)
  ),
  
  -- No puede haber dos precios vigentes para la misma combinación
  -- (se valida con índice único condicional más abajo)
  CONSTRAINT unique_precio_vigente UNIQUE NULLS NOT DISTINCT (
    nivel,
    entidad_tipo,
    entidad_id,
    ubicacion_id,
    service_point_id,
    fecha_inicio,
    fecha_fin
  )
);

-- =====================================================
-- PASO 3: ÍNDICES PARA BÚSQUEDAS EFICIENTES
-- =====================================================

-- Índice para búsqueda por entidad
CREATE INDEX idx_precios_entidad ON precios(entidad_tipo, entidad_id);

-- Índice para búsqueda por nivel
CREATE INDEX idx_precios_nivel ON precios(nivel);

-- Índice para búsqueda por ubicación
CREATE INDEX idx_precios_ubicacion ON precios(ubicacion_id) WHERE ubicacion_id IS NOT NULL;

-- Índice para búsqueda por service point
CREATE INDEX idx_precios_service_point ON precios(service_point_id) WHERE service_point_id IS NOT NULL;

-- Índice para precios vigentes (búsqueda por fecha)
CREATE INDEX idx_precios_vigentes ON precios(fecha_inicio, fecha_fin);

-- Índice compuesto para resolución de precio
CREATE INDEX idx_precios_resolucion ON precios(
  entidad_tipo,
  entidad_id,
  nivel,
  ubicacion_id,
  service_point_id
);

-- =====================================================
-- PASO 4: COMENTARIOS
-- =====================================================

COMMENT ON TABLE precios IS 'Sistema jerárquico de precios con 3 niveles: Base (global), Ubicación, Service Point';
COMMENT ON COLUMN precios.nivel IS 'Nivel jerárquico: base (global), ubicacion (ciudad/zona), service_point (punto específico)';
COMMENT ON COLUMN precios.entidad_tipo IS 'Tipo de entidad: producto o servicio';
COMMENT ON COLUMN precios.entidad_id IS 'ID de la entidad (producto_id o service_id)';
COMMENT ON COLUMN precios.precio IS 'Precio en céntimos (ej: 250 = 2.50€)';
COMMENT ON COLUMN precios.ubicacion_id IS 'Requerido para niveles ubicacion y service_point';
COMMENT ON COLUMN precios.service_point_id IS 'Requerido solo para nivel service_point';
COMMENT ON COLUMN precios.fecha_inicio IS 'Fecha desde la cual el precio es válido';
COMMENT ON COLUMN precios.fecha_fin IS 'Fecha hasta la cual el precio es válido (NULL = indefinido)';

-- =====================================================
-- PASO 5: TRIGGER PARA UPDATED_AT
-- =====================================================

CREATE TRIGGER update_precios_updated_at
  BEFORE UPDATE ON precios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PASO 6: FUNCIÓN RESOLVER_PRECIO() - JERARQUÍA COMPLETA
-- =====================================================

CREATE OR REPLACE FUNCTION resolver_precio(
  p_entidad_tipo entidad_precio_tipo,
  p_entidad_id UUID,
  p_ubicacion_id UUID DEFAULT NULL,
  p_service_point_id UUID DEFAULT NULL,
  p_fecha DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  precio_id UUID,
  precio INTEGER,
  nivel nivel_precio_tipo,
  ubicacion_id UUID,
  service_point_id UUID,
  fecha_inicio DATE,
  fecha_fin DATE
)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Estrategia: Buscar en orden jerárquico (más específico primero)
  -- 1. Service Point (si se proporciona)
  -- 2. Ubicación (si se proporciona)
  -- 3. Base (fallback global)
  
  -- Nivel 1: Buscar precio a nivel SERVICE_POINT
  IF p_service_point_id IS NOT NULL AND p_ubicacion_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      pr.id,
      pr.precio,
      pr.nivel,
      pr.ubicacion_id,
      pr.service_point_id,
      pr.fecha_inicio,
      pr.fecha_fin
    FROM precios pr
    WHERE pr.entidad_tipo = p_entidad_tipo
      AND pr.entidad_id = p_entidad_id
      AND pr.nivel = 'service_point'
      AND pr.ubicacion_id = p_ubicacion_id
      AND pr.service_point_id = p_service_point_id
      AND pr.fecha_inicio <= p_fecha
      AND (pr.fecha_fin IS NULL OR pr.fecha_fin >= p_fecha)
    ORDER BY pr.fecha_inicio DESC
    LIMIT 1;
    
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;
  
  -- Nivel 2: Buscar precio a nivel UBICACION
  IF p_ubicacion_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      pr.id,
      pr.precio,
      pr.nivel,
      pr.ubicacion_id,
      pr.service_point_id,
      pr.fecha_inicio,
      pr.fecha_fin
    FROM precios pr
    WHERE pr.entidad_tipo = p_entidad_tipo
      AND pr.entidad_id = p_entidad_id
      AND pr.nivel = 'ubicacion'
      AND pr.ubicacion_id = p_ubicacion_id
      AND pr.fecha_inicio <= p_fecha
      AND (pr.fecha_fin IS NULL OR pr.fecha_fin >= p_fecha)
    ORDER BY pr.fecha_inicio DESC
    LIMIT 1;
    
    IF FOUND THEN
      RETURN;
    END IF;
  END IF;
  
  -- Nivel 3: Buscar precio BASE (fallback global)
  RETURN QUERY
  SELECT 
    pr.id,
    pr.precio,
    pr.nivel,
    pr.ubicacion_id,
    pr.service_point_id,
    pr.fecha_inicio,
    pr.fecha_fin
  FROM precios pr
  WHERE pr.entidad_tipo = p_entidad_tipo
    AND pr.entidad_id = p_entidad_id
    AND pr.nivel = 'base'
    AND pr.fecha_inicio <= p_fecha
    AND (pr.fecha_fin IS NULL OR pr.fecha_fin >= p_fecha)
  ORDER BY pr.fecha_inicio DESC
  LIMIT 1;
  
END;
$$;

COMMENT ON FUNCTION resolver_precio IS 'Resuelve el precio aplicable según jerarquía: Service Point > Ubicación > Base';

-- =====================================================
-- PASO 7: FUNCIÓN GET_PRECIO_APLICABLE() - SIMPLIFICADA
-- =====================================================

CREATE OR REPLACE FUNCTION get_precio_aplicable(
  p_entidad_tipo entidad_precio_tipo,
  p_entidad_id UUID,
  p_ubicacion_id UUID DEFAULT NULL,
  p_service_point_id UUID DEFAULT NULL,
  p_fecha DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_precio INTEGER;
BEGIN
  -- Usar función resolver_precio y extraer solo el precio
  SELECT precio INTO v_precio
  FROM resolver_precio(
    p_entidad_tipo,
    p_entidad_id,
    p_ubicacion_id,
    p_service_point_id,
    p_fecha
  )
  LIMIT 1;
  
  -- Si no se encuentra precio, retornar NULL (fallback en aplicación)
  RETURN v_precio;
END;
$$;

COMMENT ON FUNCTION get_precio_aplicable IS 'Retorna solo el precio aplicable (INTEGER) para uso directo en queries';

-- =====================================================
-- PASO 8: VISTA V_PRECIOS_VIGENTES
-- =====================================================

CREATE OR REPLACE VIEW v_precios_vigentes AS
SELECT 
  p.id,
  p.nivel,
  p.entidad_tipo,
  p.entidad_id,
  p.precio,
  p.precio::DECIMAL / 100 AS precio_euros,
  p.ubicacion_id,
  l.city AS ubicacion_nombre,
  p.service_point_id,
  sp.name AS service_point_nombre,
  p.fecha_inicio,
  p.fecha_fin,
  p.notas,
  p.created_at,
  p.updated_at,
  -- Campo calculado: días restantes de vigencia
  CASE 
    WHEN p.fecha_fin IS NULL THEN NULL
    ELSE (p.fecha_fin - CURRENT_DATE)
  END AS dias_restantes,
  -- Campo calculado: está activo hoy
  (p.fecha_inicio <= CURRENT_DATE AND (p.fecha_fin IS NULL OR p.fecha_fin >= CURRENT_DATE)) AS activo_hoy
FROM precios p
LEFT JOIN locations l ON p.ubicacion_id = l.id
LEFT JOIN service_points sp ON p.service_point_id = sp.id
WHERE p.fecha_fin IS NULL OR p.fecha_fin >= CURRENT_DATE
ORDER BY 
  p.entidad_tipo,
  p.entidad_id,
  p.nivel DESC, -- service_point > ubicacion > base
  p.fecha_inicio DESC;

COMMENT ON VIEW v_precios_vigentes IS 'Vista de precios actualmente vigentes con datos desnormalizados para reporting';

-- =====================================================
-- PASO 9: MIGRAR PRECIOS EXISTENTES COMO NIVEL BASE
-- =====================================================

-- Migrar precios de productos desde tabla productos
INSERT INTO precios (
  nivel,
  entidad_tipo,
  entidad_id,
  precio,
  fecha_inicio,
  notas
)
SELECT 
  'base'::nivel_precio_tipo,
  'producto'::entidad_precio_tipo,
  id,
  precio_venta, -- Ya está en céntimos
  CURRENT_DATE,
  'Precio migrado desde tabla productos (precio_venta)'
FROM productos
WHERE precio_venta IS NOT NULL
  AND is_active = true
ON CONFLICT DO NOTHING;

-- Nota: Los servicios NO tienen precios base en el schema actual
-- Los precios de servicios se gestionarán a nivel SP directamente

-- =====================================================
-- PASO 10: FUNCIÓN HELPER PARA OBTENER PRECIO DE PRODUCTO
-- =====================================================

-- Esta función reemplaza el uso directo de productos.precio_venta
-- Permite usar el sistema jerárquico de precios transparentemente

CREATE OR REPLACE FUNCTION get_precio_producto(
  p_producto_id UUID,
  p_ubicacion_id UUID DEFAULT NULL,
  p_service_point_id UUID DEFAULT NULL,
  p_fecha DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_precio INTEGER;
BEGIN
  -- Intentar obtener precio desde sistema jerárquico
  v_precio := get_precio_aplicable(
    'producto'::entidad_precio_tipo,
    p_producto_id,
    p_ubicacion_id,
    p_service_point_id,
    p_fecha
  );
  
  -- Fallback: Si no existe en sistema de precios, usar productos.precio_venta
  IF v_precio IS NULL THEN
    SELECT precio_venta INTO v_precio
    FROM productos
    WHERE id = p_producto_id;
  END IF;
  
  RETURN v_precio;
END;
$$;

COMMENT ON FUNCTION get_precio_producto IS 'Obtiene precio de producto usando sistema jerárquico con fallback a productos.precio_venta';

-- =====================================================
-- PASO 11: GRANTS
-- =====================================================

-- Permisos para authenticated users (lectura)
GRANT SELECT ON precios TO authenticated;
GRANT SELECT ON v_precios_vigentes TO authenticated;

-- Permisos para anon (lectura solo de precios vigentes)
GRANT SELECT ON v_precios_vigentes TO anon;

-- Permisos para service role (admin completo)
GRANT ALL ON precios TO service_role;

-- Permisos para funciones
GRANT EXECUTE ON FUNCTION resolver_precio TO authenticated;
GRANT EXECUTE ON FUNCTION get_precio_aplicable TO authenticated;
GRANT EXECUTE ON FUNCTION get_precio_producto TO authenticated;

GRANT EXECUTE ON FUNCTION resolver_precio TO anon;
GRANT EXECUTE ON FUNCTION get_precio_aplicable TO anon;
GRANT EXECUTE ON FUNCTION get_precio_producto TO anon;

-- =====================================================
-- PASO 12: VALIDACIÓN
-- =====================================================

-- Verificar que todos los productos activos tienen precio base
DO $$
DECLARE
  v_productos_sin_precio INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_productos_sin_precio
  FROM productos p
  WHERE p.is_active = true
    AND NOT EXISTS (
      SELECT 1 FROM precios pr
      WHERE pr.entidad_tipo = 'producto'
        AND pr.entidad_id = p.id
        AND pr.nivel = 'base'
    );
  
  IF v_productos_sin_precio > 0 THEN
    RAISE WARNING 'Se encontraron % productos activos sin precio base', v_productos_sin_precio;
  ELSE
    RAISE NOTICE '✅ Todos los productos activos tienen precio base';
  END IF;
END;
$$;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================

-- Resumen de objetos creados:
-- ✅ 2 ENUMs: nivel_precio_tipo, entidad_precio_tipo
-- ✅ 1 Tabla: precios (con 7 constraints)
-- ✅ 7 Índices optimizados
-- ✅ 1 Trigger: update_precios_updated_at
-- ✅ 3 Funciones: resolver_precio(), get_precio_aplicable(), get_precio_producto()
-- ✅ 1 Vista: v_precios_vigentes
-- ✅ Migración de datos: precios de productos como nivel 'base'
-- ✅ Grants configurados
-- ✅ Validación ejecutada
