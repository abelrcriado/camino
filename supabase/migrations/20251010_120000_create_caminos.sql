-- =====================================================
-- MIGRACIÓN 1: Crear tabla caminos
-- =====================================================
-- Descripción: Crear tabla principal de caminos como entidad independiente
-- Fecha: 2025-10-10
-- Sprint: 1.1 - Jerarquía de Entidades
-- =====================================================

-- Crear tabla caminos
CREATE TABLE IF NOT EXISTS caminos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(150) NOT NULL,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  zona_operativa VARCHAR(100),
  region VARCHAR(100),
  estado_operativo VARCHAR(50) DEFAULT 'activo' 
    CHECK (estado_operativo IN ('activo', 'inactivo', 'mantenimiento', 'planificado')),
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_caminos_codigo ON caminos(codigo);
CREATE INDEX idx_caminos_estado ON caminos(estado_operativo);
CREATE INDEX idx_caminos_region ON caminos(region);
CREATE INDEX idx_caminos_zona ON caminos(zona_operativa);

-- Comentarios de documentación
COMMENT ON TABLE caminos IS 'Tabla principal de caminos. Representa las rutas/divisiones de negocio del sistema Camino.';
COMMENT ON COLUMN caminos.id IS 'Identificador único del camino (UUID)';
COMMENT ON COLUMN caminos.nombre IS 'Nombre completo del camino (ej: "Camino de Santiago Francés")';
COMMENT ON COLUMN caminos.codigo IS 'Código único del camino (ej: "CSF", "CN", "CVDP")';
COMMENT ON COLUMN caminos.zona_operativa IS 'Zona geográfica de operación (ej: "Norte de España", "Galicia")';
COMMENT ON COLUMN caminos.region IS 'Región administrativa (ej: "Galicia", "Castilla y León")';
COMMENT ON COLUMN caminos.estado_operativo IS 'Estado operacional: activo, inactivo, mantenimiento, planificado';
COMMENT ON COLUMN caminos.descripcion IS 'Descripción extendida del camino';

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_caminos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_caminos_updated_at
  BEFORE UPDATE ON caminos
  FOR EACH ROW
  EXECUTE FUNCTION update_caminos_updated_at();

-- Política RLS (Row Level Security) - deshabilitada inicialmente
-- ALTER TABLE caminos ENABLE ROW LEVEL SECURITY;

COMMENT ON TRIGGER trigger_update_caminos_updated_at ON caminos IS 'Actualiza automáticamente el campo updated_at en cada UPDATE';

-- =====================================================
-- FIN DE MIGRACIÓN
-- =====================================================
