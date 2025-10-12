-- =====================================================
-- MIGRACIÓN 2: Mejorar tabla locations con FK a caminos
-- =====================================================
-- Descripción: Añadir relación entre locations y caminos
-- Fecha: 2025-10-10
-- Sprint: 1.1 - Jerarquía de Entidades
-- =====================================================

-- Añadir columna camino_id a locations
ALTER TABLE locations 
  ADD COLUMN IF NOT EXISTS camino_id UUID;

-- Crear FK a caminos
ALTER TABLE locations 
  ADD CONSTRAINT fk_locations_camino 
  FOREIGN KEY (camino_id) 
  REFERENCES caminos(id) 
  ON DELETE SET NULL;

-- Índice para optimizar consultas por camino
CREATE INDEX IF NOT EXISTS idx_locations_camino ON locations(camino_id);

-- Comentarios de documentación
COMMENT ON COLUMN locations.camino_id IS 'FK a caminos. Indica a qué camino pertenece esta ubicación.';

-- =====================================================
-- Actualizar datos existentes (opcional - ejecutar si hay datos)
-- =====================================================
-- NOTA: Este bloque asigna las locations existentes a caminos
-- Ejecutar solo después de poblar la tabla caminos con seed data

-- Ejemplo de actualización (descomentar después de seed):
-- UPDATE locations 
-- SET camino_id = (SELECT id FROM caminos WHERE codigo = 'CSF' LIMIT 1)
-- WHERE city ILIKE '%santiago%' OR city ILIKE '%galicia%';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
