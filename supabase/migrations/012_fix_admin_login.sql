-- Update admin_profiles table structure
ALTER TABLE admin_profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin',
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_profiles_role ON admin_profiles(role);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON admin_profiles(email);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Allow insert for authenticated users" ON admin_profiles;

-- Create new policies
CREATE POLICY "Enable read access for authenticated users"
ON admin_profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR 
  EXISTS (
    SELECT 1 FROM admin_profiles ap 
    WHERE ap.id = auth.uid() AND ap.role = 'admin'
  )
);

CREATE POLICY "Enable insert for registration"
ON admin_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Function to validate admin on login
CREATE OR REPLACE FUNCTION check_admin_status(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles
    WHERE id = user_id 
    AND role = 'admin' 
    AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
