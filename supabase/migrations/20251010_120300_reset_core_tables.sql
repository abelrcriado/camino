-- Migration: Reset core tables for alignment
-- Created: 2025-10-10 12:03:00
-- Purpose: Drop and recreate tables that need complete restructuring

-- Drop tables in dependency order
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS workshops CASCADE;  
DROP TABLE IF EXISTS vending_machines CASCADE;
DROP TABLE IF EXISTS service_points CASCADE;

-- Note: We'll recreate these with the aligned structure
SELECT 'Core tables dropped successfully' as status;