-- Create teacher_profiles table
CREATE TABLE teacher_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  teaching_experience TEXT NOT NULL,
  institution TEXT NOT NULL,
  specialization TEXT NOT NULL,
  certifications TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to read their own profile
CREATE POLICY "Users can view own profile" ON teacher_profiles
  FOR SELECT USING (auth.uid() = id);

-- Allow users to insert their own profile during registration
CREATE POLICY "Users can insert own profile" ON teacher_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON teacher_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Allow admins to read all profiles
CREATE POLICY "Admins can view all profiles" ON teacher_profiles
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Allow admins to update verification status
CREATE POLICY "Admins can update verification status" ON teacher_profiles
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION handle_teacher_profile_updated()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
CREATE TRIGGER teacher_profiles_updated
  BEFORE UPDATE ON teacher_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_teacher_profile_updated();

-- Create index for faster queries
CREATE INDEX idx_teacher_profiles_status ON teacher_profiles(status);
CREATE INDEX idx_teacher_profiles_verified ON teacher_profiles(is_verified);
