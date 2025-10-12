-- Migration: Create workshops table aligned with Workshop DTO
-- Created: 2025-10-10 12:04:00
-- Purpose: Workshop-specific details aligned with src/dto/workshop.dto.ts

CREATE TABLE IF NOT EXISTS workshops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_point_id UUID NOT NULL REFERENCES service_points(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    specialties TEXT[], -- Array of specialties
    contact_phone TEXT NOT NULL,
    contact_email TEXT,
    website_url TEXT,
    capacity INTEGER DEFAULT 1,
    equipment JSONB,
    certifications TEXT[],
    average_rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    
    -- Note: service_type constraint will be enforced at application level
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workshops_service_point_id ON workshops(service_point_id);
CREATE INDEX IF NOT EXISTS idx_workshops_specialties ON workshops USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_workshops_average_rating ON workshops(average_rating);
CREATE INDEX IF NOT EXISTS idx_workshops_capacity ON workshops(capacity);

-- Create trigger for updated_at
CREATE TRIGGER trigger_workshops_updated_at
    BEFORE UPDATE ON workshops
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE workshops IS 'Workshop-specific details and capabilities';
COMMENT ON COLUMN workshops.specialties IS 'Array of workshop specialties (e.g., bike_repair, maintenance, etc.)';
COMMENT ON COLUMN workshops.capacity IS 'Maximum concurrent customers/bikes';
COMMENT ON COLUMN workshops.equipment IS 'JSON with available equipment and tools';
COMMENT ON COLUMN workshops.certifications IS 'Array of professional certifications';