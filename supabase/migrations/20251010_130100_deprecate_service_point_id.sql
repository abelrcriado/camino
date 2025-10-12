-- Migración 5: Deprecar service_point_id en tabla services
-- Mantener columna por compatibilidad pero marcarla como deprecated
-- La relación N:M ahora se maneja a través de servicio_service_point

-- 1. Agregar comentario de deprecación
COMMENT ON COLUMN services.service_point_id IS 'DEPRECATED: Usar tabla servicio_service_point para asignaciones. Mantenido solo para compatibilidad temporal.';

-- 2. Crear índice en service_type_id si no existe (para queries por tipo)
CREATE INDEX IF NOT EXISTS idx_services_service_type_id ON services(service_type_id);

-- 3. Crear índice en status para filtrado
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

-- 4. Agregar constraint check para status si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'services_status_check'
    ) THEN
        ALTER TABLE services 
        ADD CONSTRAINT services_status_check 
        CHECK (status IN ('active', 'inactive', 'maintenance', 'draft'));
    END IF;
END $$;

-- 5. Nota informativa
DO $$
BEGIN
    RAISE NOTICE '✅ Migración completada: services.service_point_id marcado como DEPRECATED';
    RAISE NOTICE '📌 Usar servicio_service_point para nuevas asignaciones';
    RAISE NOTICE '⚠️  service_point_id se eliminará en versión futura';
END $$;
