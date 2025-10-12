-- Migration: Create bookings table aligned with Booking DTO
-- Created: 2025-10-10 12:06:00  
-- Purpose: Booking management aligned with src/dto/booking.dto.ts

CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_point_id UUID REFERENCES service_points(id) ON DELETE SET NULL,
    workshop_id UUID REFERENCES workshops(id) ON DELETE SET NULL,
    service_type TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    estimated_cost INTEGER, -- in cents
    actual_cost INTEGER, -- in cents  
    payment_status TEXT DEFAULT 'pending',
    bike_details JSONB,
    service_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure end_time is after start_time
    CONSTRAINT check_booking_time_order CHECK (end_time > start_time),
    
    -- Ensure at least one of service_point_id or workshop_id is provided
    CONSTRAINT check_booking_location CHECK (
        service_point_id IS NOT NULL OR workshop_id IS NOT NULL
    )
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_service_point_id ON bookings(service_point_id);
CREATE INDEX IF NOT EXISTS idx_bookings_workshop_id ON bookings(workshop_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON bookings(service_type);

-- Create trigger for updated_at
CREATE TRIGGER trigger_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE bookings IS 'Service bookings aligned with Booking DTO';
COMMENT ON COLUMN bookings.status IS 'Booking status: pending, confirmed, completed, cancelled';
COMMENT ON COLUMN bookings.payment_status IS 'Payment status: pending, paid, refunded';
COMMENT ON COLUMN bookings.estimated_cost IS 'Estimated cost in cents';
COMMENT ON COLUMN bookings.actual_cost IS 'Final cost in cents';
COMMENT ON COLUMN bookings.bike_details IS 'JSON with bike information';
COMMENT ON COLUMN bookings.service_details IS 'JSON with service-specific details';