BEGIN;

-- Drop existing constraints and table
DROP TABLE IF EXISTS admin_profiles CASCADE;

-- Create admin_profiles table with proper UUID handling
CREATE TABLE admin_profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    admin_level TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_user
        FOREIGN KEY (id)
        REFERENCES auth.users (id)
        ON DELETE CASCADE
        DEFERRABLE INITIALLY IMMEDIATE
);

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON admin_profiles;

-- Create new policies
CREATE POLICY "Allow insert for authenticated users"
ON admin_profiles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow select for authenticated users"
ON admin_profiles FOR SELECT
TO authenticated
USING (true);

COMMIT;
