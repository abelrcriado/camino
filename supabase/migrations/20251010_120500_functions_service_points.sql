-- =====================================================
-- MIGRACIÓN 3.1: Funciones y vistas para service_points
-- =====================================================
-- Descripción: Crear funciones de jerarquía y vistas enriquecidas
-- Fecha: 2025-10-10
-- Sprint: 1.2 - Service Points Mejorados
-- =====================================================

-- =====================================================
-- FUNCIÓN: get_service_point_hierarchy
-- =====================================================
-- Descripción: Obtiene la jerarquía completa de un service point
-- Camino → Ubicación → Service Point
-- Parámetros: p_service_point_id UUID
-- Retorna: JSONB con jerarquía completa

CREATE OR REPLACE FUNCTION get_service_point_hierarchy(p_service_point_id UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  sp_data RECORD;
  loc_data RECORD;
  camino_data RECORD;
  machines_count INTEGER;
  services_count INTEGER;
BEGIN
  -- Obtener datos del service point
  SELECT * INTO sp_data
  FROM service_points
  WHERE id = p_service_point_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'error', 'Service Point no encontrado',
      'service_point_id', p_service_point_id
    );
  END IF;

  -- Obtener datos de la ubicación
  SELECT * INTO loc_data
  FROM locations
  WHERE id = sp_data.location_id;

  -- Obtener datos del camino
  IF loc_data.camino_id IS NOT NULL THEN
    SELECT * INTO camino_data
    FROM caminos
    WHERE id = loc_data.camino_id;
  END IF;

  -- Contar máquinas vending
  SELECT COUNT(*) INTO machines_count
  FROM vending_machines
  WHERE service_point_id = p_service_point_id;

  -- Contar servicios
  SELECT COUNT(*) INTO services_count
  FROM services
  WHERE service_point_id = p_service_point_id;

  -- Construir jerarquía completa
  result := jsonb_build_object(
    'service_point', jsonb_build_object(
      'id', sp_data.id,
      'name', sp_data.name,
      'modo_operacion', sp_data.modo_operacion,
      'estado_operativo', sp_data.estado_operativo,
      'almacen_local_id', sp_data.almacen_local_id,
      'vending_machines_count', machines_count,
      'services_count', services_count
    ),
    'ubicacion', jsonb_build_object(
      'id', loc_data.id,
      'ciudad', loc_data.city,
      'provincia', loc_data.province,
      'pais', loc_data.country,
      'coordenadas', jsonb_build_object(
        'latitud', loc_data.latitude,
        'longitud', loc_data.longitude
      )
    ),
    'camino', CASE 
      WHEN camino_data IS NOT NULL THEN
        jsonb_build_object(
          'id', camino_data.id,
          'nombre', camino_data.nombre,
          'codigo', camino_data.codigo,
          'zona_operativa', camino_data.zona_operativa,
          'region', camino_data.region
        )
      ELSE NULL
    END,
    'generado_en', NOW()
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_service_point_hierarchy IS 'Obtiene la jerarquía completa: Camino → Ubicación → Service Point';

-- =====================================================
-- VISTA: v_service_points_full
-- =====================================================
-- Descripción: Vista enriquecida de service points con jerarquía completa

CREATE OR REPLACE VIEW v_service_points_full AS
SELECT 
  -- Service Point
  sp.id AS service_point_id,
  sp.name AS sp_nombre,
  sp.modo_operacion,
  sp.estado_operativo AS sp_estado,
  sp.almacen_local_id,
  sp.configuracion_operativa,
  sp.created_at AS sp_fecha_creacion,
  
  -- Ubicación
  l.id AS location_id,
  l.city AS ciudad,
  l.province AS provincia,
  l.country AS pais,
  l.latitude AS latitud,
  l.longitude AS longitud,
  l.postal_code AS codigo_postal,
  
  -- Camino
  c.id AS camino_id,
  c.nombre AS camino_nombre,
  c.codigo AS camino_codigo,
  c.zona_operativa AS camino_zona,
  c.region AS camino_region,
  c.estado_operativo AS camino_estado,
  
  -- Estadísticas
  (SELECT COUNT(*) FROM vending_machines vm WHERE vm.service_point_id = sp.id) AS vending_machines_count,
  (SELECT COUNT(*) FROM services s WHERE s.service_point_id = sp.id) AS services_count,
  (SELECT COUNT(*) FROM workshops w WHERE w.service_point_id = sp.id) AS workshops_count,
  
  -- Almacén local
  w.name AS almacen_local_nombre,
  w.max_stock_capacity AS almacen_capacidad

FROM service_points sp
INNER JOIN locations l ON sp.location_id = l.id
LEFT JOIN caminos c ON l.camino_id = c.id
LEFT JOIN warehouses w ON sp.almacen_local_id = w.id;

COMMENT ON VIEW v_service_points_full IS 'Vista enriquecida con jerarquía completa: SP → Ubicación → Camino';

-- =====================================================
-- FUNCIÓN: get_service_points_by_camino
-- =====================================================
-- Descripción: Obtiene todos los SPs de un camino
-- Parámetros: p_camino_codigo VARCHAR
-- Retorna: TABLE con service points

CREATE OR REPLACE FUNCTION get_service_points_by_camino(p_camino_codigo VARCHAR)
RETURNS TABLE (
  service_point_id UUID,
  sp_nombre VARCHAR,
  ciudad VARCHAR,
  provincia VARCHAR,
  modo_operacion VARCHAR,
  estado VARCHAR,
  machines_count BIGINT,
  services_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    l.city,
    l.province,
    sp.modo_operacion,
    sp.estado_operativo,
    COUNT(DISTINCT vm.id) AS machines,
    COUNT(DISTINCT s.id) AS services
  FROM service_points sp
  INNER JOIN locations l ON sp.location_id = l.id
  INNER JOIN caminos c ON l.camino_id = c.id
  LEFT JOIN vending_machines vm ON vm.service_point_id = sp.id
  LEFT JOIN services s ON s.service_point_id = sp.id
  WHERE c.codigo = p_camino_codigo
  GROUP BY sp.id, sp.name, l.city, l.province, sp.modo_operacion, sp.estado_operativo
  ORDER BY l.city, sp.name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_service_points_by_camino IS 'Obtiene todos los service points de un camino específico';

-- =====================================================
-- FUNCIÓN: get_service_points_by_mode
-- =====================================================
-- Descripción: Filtrar SPs por modo de operación
-- Parámetros: p_modo_operacion VARCHAR
-- Retorna: TABLE con service points

CREATE OR REPLACE FUNCTION get_service_points_by_mode(p_modo_operacion VARCHAR)
RETURNS TABLE (
  service_point_id UUID,
  sp_nombre VARCHAR,
  ciudad VARCHAR,
  camino_codigo VARCHAR,
  estado VARCHAR,
  tiene_almacen BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    l.city,
    c.codigo,
    sp.estado_operativo,
    (sp.almacen_local_id IS NOT NULL) AS tiene_almacen
  FROM service_points sp
  INNER JOIN locations l ON sp.location_id = l.id
  LEFT JOIN caminos c ON l.camino_id = c.id
  WHERE sp.modo_operacion = p_modo_operacion
  ORDER BY c.codigo, l.city, sp.name;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_service_points_by_mode IS 'Filtra service points por modo de operación';

-- =====================================================
-- FUNCIÓN: get_service_points_sin_almacen
-- =====================================================
-- Descripción: SPs que deberían tener almacén pero no lo tienen
-- Retorna: TABLE con service points problema

CREATE OR REPLACE FUNCTION get_service_points_sin_almacen()
RETURNS TABLE (
  service_point_id UUID,
  sp_nombre VARCHAR,
  ciudad VARCHAR,
  modo_operacion VARCHAR,
  machines_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.id,
    sp.name,
    l.city,
    sp.modo_operacion,
    COUNT(vm.id) AS machines
  FROM service_points sp
  INNER JOIN locations l ON sp.location_id = l.id
  LEFT JOIN vending_machines vm ON vm.service_point_id = sp.id
  WHERE sp.almacen_local_id IS NULL
    AND sp.modo_operacion IN ('solo_vending', 'hibrido')
    AND EXISTS (SELECT 1 FROM vending_machines WHERE service_point_id = sp.id)
  GROUP BY sp.id, sp.name, l.city, sp.modo_operacion
  ORDER BY machines DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_service_points_sin_almacen IS 'Detecta service points con vending que deberían tener almacén local';

-- =====================================================
-- Ejemplos de uso
-- =====================================================

-- Ejemplo 1: Jerarquía completa de un SP
-- SELECT get_service_point_hierarchy('UUID-DEL-SP');

-- Ejemplo 2: Ver todos los SPs con jerarquía
-- SELECT * FROM v_service_points_full WHERE camino_codigo = 'CSF';

-- Ejemplo 3: SPs por camino
-- SELECT * FROM get_service_points_by_camino('CSF');

-- Ejemplo 4: SPs solo vending
-- SELECT * FROM get_service_points_by_mode('solo_vending');

-- Ejemplo 5: Detectar problemas de almacén
-- SELECT * FROM get_service_points_sin_almacen();

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
