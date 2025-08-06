-- Create enum for admin levels
CREATE TYPE admin_level AS ENUM ('basic', 'supervisor', 'super_admin');

-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin' NOT NULL,
    admin_level admin_level DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all profiles
CREATE POLICY "Allow admins to read all profiles"
ON admin_profiles FOR SELECT
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- Allow insert during registration
CREATE POLICY "Allow insert during registration"
ON admin_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Update profiles table to include admin reference
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admin_profiles(id);
