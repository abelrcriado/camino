-- Migration: Enable required PostgreSQL extensions
-- Created: 2025-10-10 12:00:00
-- Purpose: Enable UUID generation and PostGIS for geolocation features

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geolocation (if needed for service points)
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pgcrypto for additional security functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

COMMENT ON EXTENSION "uuid-ossp" IS 'UUID generation functions';
COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';
COMMENT ON EXTENSION pgcrypto IS 'Cryptographic functions';