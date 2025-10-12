-- Migration: Create profiles table aligned with User DTO  
-- Created: 2025-10-10 12:01:30
-- Purpose: User profiles table aligned with src/dto/user.dto.ts (avoiding auth.users conflict)

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    preferred_language TEXT DEFAULT 'es',
    role TEXT DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Create trigger for updated_at
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments
COMMENT ON TABLE profiles IS 'User profiles table aligned with User DTO';
COMMENT ON COLUMN profiles.role IS 'User role: admin, user, mechanic, etc.';
COMMENT ON COLUMN profiles.preferred_language IS 'User preferred language code (es, en, etc.)';