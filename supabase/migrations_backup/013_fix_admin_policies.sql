-- Fix admin_profiles RLS policies and remove infinite recursion
-- This migration will reset all policies for admin_profiles table

-- Drop all existing policies for admin_profiles
DROP POLICY IF EXISTS "Allow admins to read profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Allow authenticated insert" ON admin_profiles;
DROP POLICY IF EXISTS "Allow authenticated insert to admin_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Allow public read for admin_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON admin_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admin_profiles;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Allow insert during registration" ON admin_profiles;

-- Temporarily disable RLS to fix data
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;

-- Clean up and restructure if needed
-- First, let's check if the admin record exists
INSERT INTO admin_profiles (id, email, full_name, role, admin_level, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '111202013071@mhs.dinus.ac.id',
  'Testing',
  'admin',
  'basic',
  true,
  '2025-06-02 18:37:00.678+00',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- Re-enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create simple, safe policies without recursion
CREATE POLICY "admin_profiles_select_policy" 
ON admin_profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "admin_profiles_insert_policy" 
ON admin_profiles FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "admin_profiles_update_policy" 
ON admin_profiles FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Create a simple public read policy for login checks
CREATE POLICY "admin_profiles_public_read" 
ON admin_profiles FOR SELECT 
TO anon 
USING (true);
