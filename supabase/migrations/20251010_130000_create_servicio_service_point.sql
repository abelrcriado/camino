-- Migración 4: Crear tabla intermedia servicio_service_point
-- Relación N:M entre services y service_points
-- Un servicio puede estar disponible en múltiples puntos de servicio
-- Un punto de servicio puede ofrecer múltiples servicios

-- 1. Crear tabla intermedia
CREATE TABLE IF NOT EXISTS servicio_service_point (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign Keys
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    service_point_id UUID NOT NULL REFERENCES service_points(id) ON DELETE CASCADE,
    
    -- Configuración específica de la asignación
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0, -- Orden de visualización
    configuracion JSONB, -- Configuración específica para este SP (horarios, precios, etc.)
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint: un servicio solo puede estar asignado una vez al mismo SP
    CONSTRAINT unique_service_sp UNIQUE(service_id, service_point_id)
);

-- 2. Crear índices para performance
CREATE INDEX idx_servicio_sp_service_id ON servicio_service_point(service_id);
CREATE INDEX idx_servicio_sp_service_point_id ON servicio_service_point(service_point_id);
CREATE INDEX idx_servicio_sp_is_active ON servicio_service_point(is_active);
CREATE INDEX idx_servicio_sp_priority ON servicio_service_point(priority);

-- 3. Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_servicio_sp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_servicio_sp_updated_at
    BEFORE UPDATE ON servicio_service_point
    FOR EACH ROW
    EXECUTE FUNCTION update_servicio_sp_updated_at();

-- 4. Comentarios para documentación
COMMENT ON TABLE servicio_service_point IS 'Tabla intermedia N:M entre services y service_points. Permite que un servicio esté disponible en múltiples puntos de servicio.';
COMMENT ON COLUMN servicio_service_point.configuracion IS 'Configuración específica del servicio para este punto (ej: horarios personalizados, precios locales, capacidad)';
COMMENT ON COLUMN servicio_service_point.priority IS 'Orden de visualización del servicio en este punto (0 = más prioritario)';
COMMENT ON COLUMN servicio_service_point.is_active IS 'Indica si la asignación está activa (permite deshabilitar temporalmente sin eliminar)';
