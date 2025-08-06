-- Drop and recreate admin_profiles table with proper structure
DROP TABLE IF EXISTS admin_profiles;

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

-- Simple insert policy for registration
CREATE POLICY "Allow insert for authenticated users"
ON admin_profiles FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Allow read access to own profile
CREATE POLICY "Allow users to read own profile"
ON admin_profiles FOR SELECT
USING (auth.uid() = id);

-- Allow admin to read all profiles
CREATE POLICY "Allow admins to read all profiles"
ON admin_profiles FOR SELECT
USING (EXISTS (
    SELECT 1 FROM admin_profiles ap
    WHERE ap.id = auth.uid() AND ap.role = 'admin'
));
