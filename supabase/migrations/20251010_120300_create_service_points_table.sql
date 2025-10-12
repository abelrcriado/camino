-- Migration: Create service points table (base for workshops and vending machines)
-- Created: 2025-10-10 12:03:00
-- Purpose: Core service points that can be workshops or vending machine locations

CREATE TABLE IF NOT EXISTS service_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    partner_id UUID REFERENCES partners(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    location GEOGRAPHY(POINT, 4326),
    service_type TEXT NOT NULL, -- 'workshop', 'vending_machine', 'mixed'
    status TEXT DEFAULT 'active',
    contact_phone TEXT,
    contact_email TEXT,
    opening_hours JSONB,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_service_points_partner_id ON service_points(partner_id);
CREATE INDEX IF NOT EXISTS idx_service_points_service_type ON service_points(service_type);
CREATE INDEX IF NOT EXISTS idx_service_points_status ON service_points(status);
CREATE INDEX IF NOT EXISTS idx_service_points_city ON service_points(city);
CREATE INDEX IF NOT EXISTS idx_service_points_location ON service_points USING GIST (location);

-- Create trigger for updated_at
CREATE TRIGGER trigger_service_points_updated_at
    BEFORE UPDATE ON service_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update location from lat/lng
CREATE OR REPLACE FUNCTION update_service_point_location()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_service_points_location
    BEFORE INSERT OR UPDATE ON service_points
    FOR EACH ROW
    EXECUTE FUNCTION update_service_point_location();

-- Add comments
COMMENT ON TABLE service_points IS 'Physical service locations (workshops, vending machines, etc.)';
COMMENT ON COLUMN service_points.service_type IS 'Type: workshop, vending_machine, mixed';
COMMENT ON COLUMN service_points.opening_hours IS 'JSON with opening hours per day of week';
COMMENT ON COLUMN service_points.features IS 'JSON with available features/services';