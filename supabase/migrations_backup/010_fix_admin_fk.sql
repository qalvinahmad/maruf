BEGIN;

-- Drop existing constraints and recreate table
DROP TABLE IF EXISTS admin_profiles CASCADE;

CREATE TABLE admin_profiles (
    id UUID NOT NULL,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    admin_level TEXT DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT admin_profiles_pkey PRIMARY KEY (id)
);

-- Add deferred foreign key constraint
ALTER TABLE admin_profiles
    ADD CONSTRAINT fk_user
    FOREIGN KEY (id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE
    DEFERRABLE INITIALLY DEFERRED;

-- Simple RLS policy
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations for authenticated users"
    ON admin_profiles
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

COMMIT;
