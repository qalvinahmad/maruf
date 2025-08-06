-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT TRUE,
  admin_level TEXT DEFAULT 'basic' CHECK (admin_level IN ('basic', 'advanced', 'super')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for admin_profiles
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_profiles
CREATE POLICY "Admins can view all admin profiles"
  ON admin_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap 
      WHERE ap.id = auth.uid() AND ap.is_admin = true
    )
  );

CREATE POLICY "Admins can insert admin profiles"
  ON admin_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles ap 
      WHERE ap.id = auth.uid() AND ap.is_admin = true
    )
  );

CREATE POLICY "Admins can update admin profiles"
  ON admin_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap 
      WHERE ap.id = auth.uid() AND ap.is_admin = true
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_is_admin ON admin_profiles(is_admin);
