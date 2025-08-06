-- Add last_login column to admin_profiles table
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
