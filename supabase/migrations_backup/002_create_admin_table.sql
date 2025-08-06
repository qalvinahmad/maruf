-- Create admin table
CREATE TABLE admin_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT TRUE,
    admin_level TEXT DEFAULT 'basic',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add is_admin column to profiles table
ALTER TABLE profiles 
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create policies for admin_profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM admin_profiles
        WHERE admin_profiles.id = auth.uid()
    )
);

-- Allow admins to update profiles
CREATE POLICY "Admins can update profiles"
ON profiles FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM admin_profiles
        WHERE admin_profiles.id = auth.uid()
    )
);

-- Add trigger for updated_at
CREATE TRIGGER update_admin_profiles_updated_at
    BEFORE UPDATE ON admin_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
