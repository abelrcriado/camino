-- Migration: Create vending machines table aligned with VendingMachine DTO  
-- Created: 2025-10-10 12:05:00
-- Purpose: Vending machine details aligned with src/dto/vending_machine.dto.ts

CREATE TABLE IF NOT EXISTS vending_machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_point_id UUID NOT NULL REFERENCES service_points(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    model TEXT,
    serial_number TEXT UNIQUE,
    status TEXT DEFAULT 'active',
    capacity INTEGER DEFAULT 0,
    current_stock INTEGER DEFAULT 0,
    last_refill_date TIMESTAMP WITH TIME ZONE,
    next_maintenance_date TIMESTAMP WITH TIME ZONE,
    total_sales INTEGER DEFAULT 0,
    total_revenue BIGINT DEFAULT 0, -- in cents
    configuration JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure stock doesn't exceed capacity
    CONSTRAINT check_stock_capacity CHECK (current_stock <= capacity)
    
    -- Note: service_type constraint will be enforced at application level
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vending_machines_service_point_id ON vending_machines(service_point_id);
CREATE INDEX IF NOT EXISTS idx_vending_machines_status ON vending_machines(status);
CREATE INDEX IF NOT EXISTS idx_vending_machines_serial_number ON vending_machines(serial_number);
CREATE INDEX IF NOT EXISTS idx_vending_machines_next_maintenance ON vending_machines(next_maintenance_date);

-- Create trigger for updated_at
CREATE TRIGGER trigger_vending_machines_updated_at
    BEFORE UPDATE ON vending_machines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE vending_machines IS 'Vending machine details and inventory status';
COMMENT ON COLUMN vending_machines.status IS 'Machine status: active, inactive, maintenance, out_of_order';
COMMENT ON COLUMN vending_machines.total_revenue IS 'Total revenue in cents to avoid decimal precision issues';
COMMENT ON COLUMN vending_machines.configuration IS 'JSON with machine configuration (slots, products, etc.)';