-- Drop existing tables and policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON admin_profiles;
DROP TABLE IF EXISTS admin_profiles CASCADE;

-- Create new admin_profiles table without immediate foreign key
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    admin_level TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key after table creation
ALTER TABLE admin_profiles
    ADD CONSTRAINT admin_profiles_id_fkey 
    FOREIGN KEY (id) 
    REFERENCES auth.users(id) 
    ON DELETE CASCADE 
    DEFERRABLE INITIALLY DEFERRED;

-- Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Enable all operations for authenticated users"
ON admin_profiles
FOR ALL
USING (true)
WITH CHECK (true);
