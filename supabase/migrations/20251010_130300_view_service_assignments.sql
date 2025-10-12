-- Migración 7: Vista completa de asignaciones servicio-service_point
-- Incluye toda la información relacionada: service, service_type, service_point, location, camino

CREATE OR REPLACE VIEW v_service_assignments_full AS
SELECT 
    -- Datos de la asignación
    ssp.id as assignment_id,
    ssp.is_active as assignment_active,
    ssp.priority as assignment_priority,
    ssp.configuracion as assignment_config,
    ssp.created_at as assignment_created_at,
    ssp.updated_at as assignment_updated_at,
    
    -- Datos del servicio
    s.id as service_id,
    s.name as service_name,
    s.code as service_code,
    s.description as service_description,
    s.configuration as service_configuration,
    s.status as service_status,
    s.operational_since as service_operational_since,
    s.total_uses as service_total_uses,
    s.average_rating as service_average_rating,
    s.requires_inventory as service_requires_inventory,
    
    -- Datos del tipo de servicio
    st.id as service_type_id,
    st.code as service_type_code,
    st.name as service_type_name,
    st.description as service_type_description,
    st.category as service_type_category,
    st.icon as service_type_icon,
    
    -- Datos del service point
    sp.id as service_point_id,
    sp.name as service_point_name,
    sp.description as service_point_description,
    sp.service_type as service_point_type,
    sp.status as service_point_status,
    sp.estado_operativo as service_point_estado_operativo,
    sp.modo_operacion as service_point_modo_operacion,
    sp.almacen_local_id as service_point_almacen_id,
    sp.address as service_point_address,
    sp.city as service_point_city,
    
    -- Datos de la location
    l.id as location_id,
    l.city as location_city,
    l.province as location_province,
    l.postal_code as location_postal_code,
    l.country as location_country,
    l.latitude as location_latitude,
    l.longitude as location_longitude,
    l.is_active as location_is_active,
    
    -- Datos del camino
    c.id as camino_id,
    c.nombre as camino_nombre,
    c.codigo as camino_codigo,
    c.zona_operativa as camino_zona_operativa,
    c.region as camino_region,
    c.estado_operativo as camino_estado_operativo

FROM servicio_service_point ssp
INNER JOIN services s ON s.id = ssp.service_id
INNER JOIN service_types st ON st.id = s.service_type_id
INNER JOIN service_points sp ON sp.id = ssp.service_point_id
LEFT JOIN locations l ON l.id = sp.location_id
LEFT JOIN caminos c ON c.id = l.camino_id

ORDER BY 
    c.nombre ASC,
    l.city ASC,
    sp.name ASC,
    ssp.priority DESC,
    s.name ASC;

COMMENT ON VIEW v_service_assignments_full IS 'Vista completa de asignaciones servicio-service_point con toda la información relacionada (service, type, point, location, camino)';

-- Índices sugeridos para optimizar queries a través de la vista
-- Ya existen estos índices de migraciones anteriores:
-- - idx_ssp_service_id
-- - idx_ssp_service_point_id
-- - idx_ssp_is_active
-- - idx_ssp_priority

-- Crear índices adicionales si son necesarios
CREATE INDEX IF NOT EXISTS idx_service_points_location_id ON service_points(location_id);
CREATE INDEX IF NOT EXISTS idx_locations_camino_id ON locations(camino_id);

-- Nota informativa
DO $$
BEGIN
    RAISE NOTICE '✅ Vista v_service_assignments_full creada exitosamente';
    RAISE NOTICE '📊 Incluye: servicio + tipo + service_point + location + camino';
    RAISE NOTICE '🔍 Optimizada con índices en todas las FK';
END $$;
