-- First remove existing policies and constraints
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_admin_id_fkey;

-- Now drop and recreate admin_profiles with cascade
DROP TABLE IF EXISTS admin_profiles CASCADE;

-- Recreate admin_profiles table
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    admin_level TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reset RLS policies
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Allow insert for authenticated users"
ON admin_profiles FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to read own profile"
ON admin_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Allow admins to read all profiles"
ON admin_profiles FOR SELECT
USING (EXISTS (
    SELECT 1 FROM admin_profiles ap
    WHERE ap.id = auth.uid() AND ap.role = 'admin'
));

-- Recreate foreign key on profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS admin_id UUID REFERENCES admin_profiles(id);

-- Recreate admin policies on profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
));

CREATE POLICY "Admins can update profiles"
ON profiles FOR UPDATE
USING (EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE admin_profiles.id = auth.uid()
));
