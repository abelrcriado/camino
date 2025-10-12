-- Migration: Create partners table aligned with Partner DTO
-- Created: 2025-10-10 12:02:00  
-- Purpose: Partner/business management table

CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    address TEXT,
    city TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'España',
    business_type TEXT,
    tax_id TEXT,
    contact_person TEXT,
    website_url TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_partners_email ON partners(email);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_city ON partners(city);
CREATE INDEX IF NOT EXISTS idx_partners_business_type ON partners(business_type);

-- Create trigger for updated_at
CREATE TRIGGER trigger_partners_updated_at
    BEFORE UPDATE ON partners
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE partners IS 'Business partners and service providers';
COMMENT ON COLUMN partners.status IS 'Partner status: active, inactive, suspended';
COMMENT ON COLUMN partners.business_type IS 'Type of business: workshop, vending, mixed, etc.';