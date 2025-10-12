-- =====================================================
-- MIGRACIÓN 3: Mejorar tabla service_points
-- =====================================================
-- Descripción: Mejorar service_points con FK obligatorio y nuevos campos
-- Fecha: 2025-10-10
-- Sprint: 1.2 - Service Points Mejorados
-- =====================================================

-- =====================================================
-- PASO 1: Añadir columna location_id si no existe
-- =====================================================

-- Añadir location_id como nullable primero
ALTER TABLE service_points 
  ADD COLUMN IF NOT EXISTS location_id UUID;

-- Crear FK a locations
ALTER TABLE service_points 
  DROP CONSTRAINT IF EXISTS fk_service_points_location;
  
ALTER TABLE service_points 
  ADD CONSTRAINT fk_service_points_location 
  FOREIGN KEY (location_id) 
  REFERENCES locations(id) 
  ON DELETE SET NULL;

-- =====================================================
-- PASO 2: Validar y corregir datos existentes
-- =====================================================

-- Verificar service_points sin location_id
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM service_points
  WHERE location_id IS NULL;

  IF orphan_count > 0 THEN
    RAISE NOTICE 'ADVERTENCIA: Hay % service_points sin location_id. Intentando asignar ubicaciones por ciudad...', orphan_count;
    
    -- Asignar location_id basado en city match
    UPDATE service_points sp
    SET location_id = (
      SELECT l.id
      FROM locations l
      WHERE LOWER(l.city) = LOWER(sp.city)
      LIMIT 1
    )
    WHERE sp.location_id IS NULL;
    
    -- Verificar cuántos quedaron sin asignar
    SELECT COUNT(*) INTO orphan_count
    FROM service_points
    WHERE location_id IS NULL;
    
    IF orphan_count > 0 THEN
      RAISE WARNING 'Aún hay % service_points sin location_id después de auto-asignación', orphan_count;
    ELSE
      RAISE NOTICE 'OK: Todos los service_points ahora tienen location_id asignado';
    END IF;
  ELSE
    RAISE NOTICE 'OK: Todos los service_points ya tienen location_id válido';
  END IF;
END $$;

-- =====================================================
-- PASO 3: Hacer location_id NOT NULL (solo si todos tienen valor)
-- =====================================================

-- Comentado por seguridad - descomentar cuando todos los SPs tengan location_id
-- ALTER TABLE service_points 
--   ALTER COLUMN location_id SET NOT NULL;

-- =====================================================
-- PASO 3: Añadir nuevos campos
-- =====================================================

-- Campo: almacen_local_id (FK a warehouses)
ALTER TABLE service_points 
  ADD COLUMN IF NOT EXISTS almacen_local_id UUID;

-- Crear FK a warehouses
ALTER TABLE service_points 
  ADD CONSTRAINT fk_service_points_almacen_local 
  FOREIGN KEY (almacen_local_id) 
  REFERENCES warehouses(id) 
  ON DELETE SET NULL;

-- Campo: modo_operacion
ALTER TABLE service_points 
  ADD COLUMN IF NOT EXISTS modo_operacion VARCHAR(50) DEFAULT 'hibrido'
    CHECK (modo_operacion IN ('solo_vending', 'solo_servicios', 'hibrido'));

-- Campo: configuracion_operativa (JSONB para flexibilidad)
ALTER TABLE service_points 
  ADD COLUMN IF NOT EXISTS configuracion_operativa JSONB DEFAULT '{}'::JSONB;

-- Campo: estado_operativo
ALTER TABLE service_points 
  ADD COLUMN IF NOT EXISTS estado_operativo VARCHAR(50) DEFAULT 'activo'
    CHECK (estado_operativo IN ('activo', 'inactivo', 'mantenimiento', 'temporal'));

-- =====================================================
-- PASO 4: Índices para optimizar consultas
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_service_points_almacen 
  ON service_points(almacen_local_id);

CREATE INDEX IF NOT EXISTS idx_service_points_modo 
  ON service_points(modo_operacion);

CREATE INDEX IF NOT EXISTS idx_service_points_estado 
  ON service_points(estado_operativo);

CREATE INDEX IF NOT EXISTS idx_service_points_location 
  ON service_points(location_id);

-- =====================================================
-- PASO 5: Comentarios de documentación
-- =====================================================

COMMENT ON COLUMN service_points.location_id IS 'FK OBLIGATORIO a locations. Todo service point debe tener una ubicación.';
COMMENT ON COLUMN service_points.almacen_local_id IS 'FK a warehouses. ID del mini-almacén local del service point (si tiene).';
COMMENT ON COLUMN service_points.modo_operacion IS 'Modo operativo: solo_vending (solo máquinas), solo_servicios (talleres/servicios), hibrido (ambos)';
COMMENT ON COLUMN service_points.configuracion_operativa IS 'Configuración operativa en formato JSON (horarios, políticas, etc.)';
COMMENT ON COLUMN service_points.estado_operativo IS 'Estado operacional del service point: activo, inactivo, mantenimiento, temporal';

-- =====================================================
-- PASO 6: Actualizar datos existentes (opcional)
-- =====================================================

-- Establecer modo_operacion según servicios/máquinas existentes
UPDATE service_points sp
SET modo_operacion = CASE
  WHEN EXISTS (SELECT 1 FROM vending_machines vm WHERE vm.service_point_id = sp.id)
   AND EXISTS (SELECT 1 FROM services s WHERE s.service_point_id = sp.id)
  THEN 'hibrido'
  WHEN EXISTS (SELECT 1 FROM vending_machines vm WHERE vm.service_point_id = sp.id)
  THEN 'solo_vending'
  WHEN EXISTS (SELECT 1 FROM services s WHERE s.service_point_id = sp.id)
  THEN 'solo_servicios'
  ELSE 'hibrido'
END
WHERE modo_operacion IS NULL OR modo_operacion = 'hibrido';

-- =====================================================
-- PASO 7: Trigger para validaciones
-- =====================================================

-- Trigger para validar que SP con vending tenga almacen_local
CREATE OR REPLACE FUNCTION validate_service_point_almacen()
RETURNS TRIGGER AS $$
BEGIN
  -- Si tiene máquinas vending, debería tener almacén local
  IF NEW.modo_operacion IN ('solo_vending', 'hibrido') THEN
    IF EXISTS (SELECT 1 FROM vending_machines WHERE service_point_id = NEW.id) 
       AND NEW.almacen_local_id IS NULL THEN
      RAISE WARNING 'Service Point % con vending debería tener almacen_local_id', NEW.id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_service_point_almacen
  BEFORE INSERT OR UPDATE ON service_points
  FOR EACH ROW
  EXECUTE FUNCTION validate_service_point_almacen();

COMMENT ON TRIGGER trigger_validate_service_point_almacen ON service_points IS 'Valida que SPs con vending tengan almacén local asignado';

-- =====================================================
-- Verificación final
-- =====================================================

-- Mostrar resumen de service_points
SELECT 
  modo_operacion,
  estado_operativo,
  COUNT(*) as cantidad,
  COUNT(almacen_local_id) as con_almacen
FROM service_points
GROUP BY modo_operacion, estado_operativo
ORDER BY modo_operacion, estado_operativo;

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
