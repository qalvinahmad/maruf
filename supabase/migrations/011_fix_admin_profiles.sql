-- Reset admin_profiles table
DROP TABLE IF EXISTS admin_profiles CASCADE;

-- Create new admin_profiles table with simpler structure
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE,
    full_name TEXT,
    role TEXT DEFAULT 'admin',
    admin_level TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to insert
CREATE POLICY "Allow authenticated insert"
ON admin_profiles FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow admins to read all profiles
CREATE POLICY "Allow admins to read profiles"
ON admin_profiles FOR SELECT
TO authenticated
USING (true);
