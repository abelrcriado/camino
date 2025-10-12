-- Migration: Update partners table to match DTO
-- Created: 2025-10-10 12:02:30
-- Purpose: Add missing columns to existing partners table

-- Add missing columns
ALTER TABLE partners 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS tax_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS contact_person TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5, 4) DEFAULT 0.1000;

-- Create missing indexes
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_partners_city ON partners(city);
CREATE INDEX IF NOT EXISTS idx_partners_business_type ON partners(business_type);

-- Add comments
COMMENT ON COLUMN partners.commission_rate IS 'Commission rate as decimal (0.1000 = 10%)';
COMMENT ON COLUMN partners.status IS 'Partner status: active, inactive, suspended';