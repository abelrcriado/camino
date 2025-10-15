-- Migration: Add commission fields to payments table for Stripe Connect
-- Created: 2025-10-15 11:58:17
-- Purpose: Enable automatic payment split with commission tracking

-- Add new columns for commission tracking
ALTER TABLE payments ADD COLUMN IF NOT EXISTS commission_percentage DECIMAL(5,4);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS partner_amount INTEGER;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS stripe_transfer_id VARCHAR(255);

-- Add comments
COMMENT ON COLUMN payments.commission_percentage IS 'Commission percentage applied (e.g., 0.15 for 15%)';
COMMENT ON COLUMN payments.partner_amount IS 'Amount transferred to partner in cents';
COMMENT ON COLUMN payments.stripe_transfer_id IS 'Stripe transfer ID for tracking splits';

-- Create indexes for reporting queries
CREATE INDEX IF NOT EXISTS idx_payments_commission_percentage ON payments(commission_percentage);
CREATE INDEX IF NOT EXISTS idx_payments_partner_amount ON payments(partner_amount);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_transfer_id ON payments(stripe_transfer_id);

-- Add check constraint to ensure partner_amount doesn't exceed total amount
ALTER TABLE payments ADD CONSTRAINT IF NOT EXISTS check_partner_amount_valid 
  CHECK (partner_amount IS NULL OR partner_amount <= amount);
