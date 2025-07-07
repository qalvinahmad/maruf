-- Drop existing table and policies
DROP TABLE IF EXISTS admin_profiles CASCADE;

-- Create new admin_profiles table with proper constraints
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    admin_level TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT admin_profiles_id_fkey 
        FOREIGN KEY (id) 
        REFERENCES auth.users(id) 
        ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create simplified policies
CREATE POLICY "Enable all operations for authenticated users"
ON admin_profiles
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
