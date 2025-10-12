-- =====================================================
-- MIGRACIÓN 2.2: Funciones y vistas para caminos
-- =====================================================
-- Descripción: Crear funciones de estadísticas y vistas enriquecidas
-- Fecha: 2025-10-10
-- Sprint: 1.1 - Jerarquía de Entidades
-- =====================================================

-- =====================================================
-- FUNCIÓN: get_camino_stats
-- =====================================================
-- Descripción: Obtiene estadísticas completas de un camino
-- Parámetros: p_camino_id UUID - ID del camino
-- Retorna: JSON con estadísticas
-- NOTA: Esta función se creará en 20251010_120500_functions_service_points.sql
-- porque requiere service_points.location_id que se añade en migración 3

-- CREATE OR REPLACE FUNCTION get_camino_stats(p_camino_id UUID)
-- RETURNS JSONB AS $$
-- DECLARE
--   result JSONB;
--   camino_data RECORD;
--   ubicaciones_count INTEGER;
--   service_points_count INTEGER;
--   usuarios_count INTEGER;
-- BEGIN
--   -- Obtener datos del camino
--   SELECT * INTO camino_data
--   FROM caminos
--   WHERE id = p_camino_id;
-- 
--   -- Verificar que existe
--   IF NOT FOUND THEN
--     RETURN jsonb_build_object(
--       'error', 'Camino no encontrado',
--       'camino_id', p_camino_id
--     );
--   END IF;
-- 
--   -- Contar ubicaciones
--   SELECT COUNT(*) INTO ubicaciones_count
--   FROM locations
--   WHERE camino_id = p_camino_id;
-- 
--   -- Contar service points
--   SELECT COUNT(*) INTO service_points_count
--   FROM service_points sp
--   INNER JOIN locations l ON sp.location_id = l.id
--   WHERE l.camino_id = p_camino_id;
-- 
--   -- Contar usuarios (asumiendo que hay relación a través de bookings/service points)
--   SELECT COUNT(DISTINCT u.id) INTO usuarios_count
--   FROM usuarios u
--   INNER JOIN bookings b ON u.id = b.user_id
--   INNER JOIN service_points sp ON b.service_point_id = sp.id
--   INNER JOIN locations l ON sp.location_id = l.id
--   WHERE l.camino_id = p_camino_id;
-- 
--   -- Construir resultado
--   result := jsonb_build_object(
--     'camino', jsonb_build_object(
--       'id', camino_data.id,
--       'nombre', camino_data.nombre,
--       'codigo', camino_data.codigo,
--       'zona_operativa', camino_data.zona_operativa,
--       'region', camino_data.region,
--       'estado_operativo', camino_data.estado_operativo
--     ),
--     'estadisticas', jsonb_build_object(
--       'ubicaciones', ubicaciones_count,
--       'service_points', service_points_count,
--       'usuarios_unicos', usuarios_count
--     ),
--     'generado_en', NOW()
--   );
-- 
--   RETURN result;
-- END;
-- $$ LANGUAGE plpgsql;
-- 
-- COMMENT ON FUNCTION get_camino_stats IS 'Obtiene estadísticas completas de un camino: ubicaciones, service points, usuarios';

-- =====================================================
-- VISTA: v_ubicaciones_full
-- =====================================================
-- Descripción: Vista enriquecida de ubicaciones con datos del camino

-- Vista para consultar ubicaciones con información del camino
-- NOTA: Esta vista se creará después de la migración 3 (alter_service_points)
-- porque requiere el campo service_points.location_id
-- Ver: 20251010_120500_functions_service_points.sql

-- CREATE OR REPLACE VIEW v_ubicaciones_full AS
-- SELECT 
--   l.id,
--   l.city AS ciudad,
--   l.province AS provincia,
--   l.postal_code AS codigo_postal,
--   l.country AS pais,
--   l.latitude,
--   l.longitude,
--   l.is_active AS activa,
--   l.camino_id,
--   c.nombre AS camino_nombre,
--   c.codigo AS camino_codigo,
--   c.estado_operativo AS camino_estado,
--   (SELECT COUNT(*) FROM service_points sp WHERE sp.location_id = l.id) AS total_service_points,
--   l.created_at,
--   l.updated_at
-- FROM locations l
-- LEFT JOIN caminos c ON l.camino_id = c.id
-- ORDER BY c.nombre, l.province, l.city;
-- 
-- COMMENT ON VIEW v_ubicaciones_full IS 'Vista completa de ubicaciones con información del camino asociado y conteo de service points';


-- =====================================================
-- FUNCIÓN: get_ubicaciones_by_camino
-- =====================================================
-- Descripción: Obtiene todas las ubicaciones de un camino
-- Parámetros: p_camino_codigo VARCHAR - Código del camino (ej: 'CSF')
-- Retorna: TABLE con ubicaciones

CREATE OR REPLACE FUNCTION get_ubicaciones_by_camino(p_camino_codigo VARCHAR)
RETURNS TABLE (
  location_id UUID,
  ciudad VARCHAR,
  provincia VARCHAR,
  camino_nombre VARCHAR,
  service_points_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.city,
    l.province,
    c.nombre,
    COUNT(sp.id) AS sp_count
  FROM locations l
  INNER JOIN caminos c ON l.camino_id = c.id
  LEFT JOIN service_points sp ON sp.location_id = l.id
  WHERE c.codigo = p_camino_codigo
  GROUP BY l.id, l.city, l.province, c.nombre
  ORDER BY l.city;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_ubicaciones_by_camino IS 'Obtiene todas las ubicaciones de un camino por su código';

-- =====================================================
-- FUNCIÓN: get_all_caminos_summary
-- =====================================================
-- Descripción: Resumen de todos los caminos con estadísticas básicas
-- Retorna: TABLE con resumen

CREATE OR REPLACE FUNCTION get_all_caminos_summary()
RETURNS TABLE (
  camino_id UUID,
  nombre VARCHAR,
  codigo VARCHAR,
  estado_operativo VARCHAR,
  ubicaciones_count BIGINT,
  service_points_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.nombre,
    c.codigo,
    c.estado_operativo,
    COUNT(DISTINCT l.id) AS ubicaciones,
    COUNT(DISTINCT sp.id) AS service_points
  FROM caminos c
  LEFT JOIN locations l ON l.camino_id = c.id
  LEFT JOIN service_points sp ON sp.location_id = l.id
  GROUP BY c.id, c.nombre, c.codigo, c.estado_operativo
  ORDER BY c.codigo;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_all_caminos_summary IS 'Resumen de todos los caminos con contadores de ubicaciones y service points';

-- =====================================================
-- Ejemplos de uso
-- =====================================================

-- Ejemplo 1: Obtener estadísticas de un camino
-- SELECT get_camino_stats((SELECT id FROM caminos WHERE codigo = 'CSF'));

-- Ejemplo 2: Ver todas las ubicaciones con información del camino
-- SELECT * FROM v_ubicaciones_full WHERE camino_codigo = 'CSF';

-- Ejemplo 3: Obtener ubicaciones por código de camino
-- SELECT * FROM get_ubicaciones_by_camino('CSF');

-- Ejemplo 4: Resumen de todos los caminos
-- SELECT * FROM get_all_caminos_summary();

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
