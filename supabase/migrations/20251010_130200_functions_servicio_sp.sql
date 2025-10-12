-- Migración 6: Funciones para gestionar relación N:M entre services y service_points

-- =============================================================================
-- FUNCIÓN 1: Asignar servicio a service point
-- =============================================================================
CREATE OR REPLACE FUNCTION assign_service_to_sp(
    p_service_id UUID,
    p_service_point_id UUID,
    p_priority INTEGER DEFAULT 0,
    p_configuracion JSONB DEFAULT '{}'::jsonb
) RETURNS TABLE (
    id UUID,
    service_id UUID,
    service_point_id UUID,
    is_active BOOLEAN,
    priority INTEGER,
    configuracion JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    -- Validar que el servicio existe
    IF NOT EXISTS (SELECT 1 FROM services WHERE services.id = p_service_id) THEN
        RAISE EXCEPTION 'Servicio con id % no existe', p_service_id;
    END IF;

    -- Validar que el service point existe
    IF NOT EXISTS (SELECT 1 FROM service_points WHERE service_points.id = p_service_point_id) THEN
        RAISE EXCEPTION 'Service point con id % no existe', p_service_point_id;
    END IF;

    -- Insertar o actualizar la asignación
    RETURN QUERY
    INSERT INTO servicio_service_point (
        service_id,
        service_point_id,
        is_active,
        priority,
        configuracion
    ) VALUES (
        p_service_id,
        p_service_point_id,
        TRUE,
        p_priority,
        p_configuracion
    )
    ON CONFLICT (service_id, service_point_id) 
    DO UPDATE SET
        is_active = TRUE,
        priority = EXCLUDED.priority,
        configuracion = EXCLUDED.configuracion,
        updated_at = NOW()
    RETURNING 
        servicio_service_point.id,
        servicio_service_point.service_id,
        servicio_service_point.service_point_id,
        servicio_service_point.is_active,
        servicio_service_point.priority,
        servicio_service_point.configuracion,
        servicio_service_point.created_at,
        servicio_service_point.updated_at;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION assign_service_to_sp IS 'Asigna un servicio a un service point. Si ya existe la asignación, la actualiza y reactiva.';

-- =============================================================================
-- FUNCIÓN 2: Desasignar servicio de service point
-- =============================================================================
CREATE OR REPLACE FUNCTION unassign_service_from_sp(
    p_service_id UUID,
    p_service_point_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_affected INTEGER;
BEGIN
    -- Marcar como inactivo en lugar de eliminar (soft delete)
    UPDATE servicio_service_point
    SET is_active = FALSE, updated_at = NOW()
    WHERE service_id = p_service_id 
      AND service_point_id = p_service_point_id;
    
    GET DIAGNOSTICS v_affected = ROW_COUNT;
    
    IF v_affected = 0 THEN
        RAISE EXCEPTION 'No existe asignación entre servicio % y service point %', p_service_id, p_service_point_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION unassign_service_from_sp IS 'Desactiva (soft delete) la asignación entre un servicio y service point.';

-- =============================================================================
-- FUNCIÓN 3: Obtener todos los servicios de un service point
-- =============================================================================
CREATE OR REPLACE FUNCTION get_services_by_sp(
    p_service_point_id UUID,
    p_only_active BOOLEAN DEFAULT TRUE
) RETURNS TABLE (
    service_id UUID,
    service_name VARCHAR,
    service_description TEXT,
    service_type_code VARCHAR,
    service_type_name VARCHAR,
    assignment_priority INTEGER,
    assignment_config JSONB,
    assignment_active BOOLEAN,
    assignment_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.id as service_id,
        s.name as service_name,
        s.description as service_description,
        st.code as service_type_code,
        st.name as service_type_name,
        ssp.priority as assignment_priority,
        ssp.configuracion as assignment_config,
        ssp.is_active as assignment_active,
        ssp.created_at as assignment_created_at
    FROM servicio_service_point ssp
    INNER JOIN services s ON s.id = ssp.service_id
    INNER JOIN service_types st ON st.id = s.service_type_id
    WHERE ssp.service_point_id = p_service_point_id
      AND (NOT p_only_active OR ssp.is_active = TRUE)
    ORDER BY ssp.priority DESC, s.name ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_services_by_sp IS 'Obtiene todos los servicios asignados a un service point con detalles completos.';

-- =============================================================================
-- FUNCIÓN 4: Obtener todos los service points de un servicio
-- =============================================================================
CREATE OR REPLACE FUNCTION get_sps_by_service(
    p_service_id UUID,
    p_only_active BOOLEAN DEFAULT TRUE
) RETURNS TABLE (
    service_point_id UUID,
    service_point_nombre VARCHAR,
    location_id UUID,
    location_nombre VARCHAR,
    camino_id UUID,
    camino_nombre VARCHAR,
    assignment_priority INTEGER,
    assignment_config JSONB,
    assignment_active BOOLEAN,
    assignment_created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        sp.id as service_point_id,
        sp.nombre as service_point_nombre,
        l.id as location_id,
        l.nombre as location_nombre,
        c.id as camino_id,
        c.nombre as camino_nombre,
        ssp.priority as assignment_priority,
        ssp.configuracion as assignment_config,
        ssp.is_active as assignment_active,
        ssp.created_at as assignment_created_at
    FROM servicio_service_point ssp
    INNER JOIN service_points sp ON sp.id = ssp.service_point_id
    LEFT JOIN locations l ON l.id = sp.location_id
    LEFT JOIN caminos c ON c.id = l.camino_id
    WHERE ssp.service_id = p_service_id
      AND (NOT p_only_active OR ssp.is_active = TRUE)
    ORDER BY ssp.priority DESC, sp.nombre ASC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_sps_by_service IS 'Obtiene todos los service points donde está disponible un servicio con contexto completo (location + camino).';

-- =============================================================================
-- FUNCIÓN 5: Verificar si servicio está disponible en service point
-- =============================================================================
CREATE OR REPLACE FUNCTION is_service_available_at_sp(
    p_service_id UUID,
    p_service_point_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM servicio_service_point 
        WHERE service_id = p_service_id 
          AND service_point_id = p_service_point_id
          AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION is_service_available_at_sp IS 'Verifica si un servicio específico está disponible (activo) en un service point.';

-- =============================================================================
-- Notas informativas
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Funciones creadas exitosamente:';
    RAISE NOTICE '   - assign_service_to_sp()';
    RAISE NOTICE '   - unassign_service_from_sp()';
    RAISE NOTICE '   - get_services_by_sp()';
    RAISE NOTICE '   - get_sps_by_service()';
    RAISE NOTICE '   - is_service_available_at_sp()';
END $$;
