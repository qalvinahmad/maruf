-- Enable RLS
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_verifications ENABLE ROW LEVEL SECURITY;

-- Enable service role to bypass RLS
ALTER TABLE teacher_profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE teacher_verifications FORCE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Teachers can view their own profile" ON teacher_profiles;
DROP POLICY IF EXISTS "Service role can create teacher profiles" ON teacher_profiles;
DROP POLICY IF EXISTS "Teachers can update their own profile" ON teacher_profiles;
DROP POLICY IF EXISTS "Teachers can view their own verification" ON teacher_verifications;
DROP POLICY IF EXISTS "Service role can create verifications" ON teacher_verifications;
DROP POLICY IF EXISTS "Admins can view all verifications" ON teacher_verifications;

-- Create new policies for teacher_profiles
CREATE POLICY "Enable read for users" ON teacher_profiles
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Enable insert for service" ON teacher_profiles
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Enable update for users" ON teacher_profiles
    FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Create new policies for teacher_verifications
CREATE POLICY "Enable read for own verification" ON teacher_verifications
    FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "Enable insert for service" ON teacher_verifications
    FOR INSERT 
    WITH CHECK (true);

CREATE POLICY "Enable admin read all" ON teacher_verifications
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM admin_profiles
            WHERE admin_profiles.id = auth.uid()
            AND admin_profiles.is_active = true
        )
    );

-- Grant necessary permissions
GRANT ALL ON teacher_profiles TO service_role;
GRANT ALL ON teacher_verifications TO service_role;

-- Stored procedure for creating teacher profile
CREATE OR REPLACE FUNCTION create_teacher_profile(
  user_id uuid,
  user_email text,
  user_full_name text,
  user_teaching_exp text,
  user_institution text,
  user_specialization text,
  user_certifications text,
  user_credentials jsonb,
  user_documents jsonb
) RETURNS void AS $$
BEGIN
  -- Insert teacher profile
  INSERT INTO teacher_profiles (
    id,
    email,
    full_name,
    teaching_experience,
    institution,
    specialization,
    certifications,
    is_verified,
    status
  ) VALUES (
    user_id,
    user_email,
    user_full_name,
    user_teaching_exp,
    user_institution,
    user_specialization,
    user_certifications,
    false,
    'pending'
  );

  -- Insert verification record
  INSERT INTO teacher_verifications (
    id,
    full_name,
    email,
    institution,
    registration_date,
    status,
    credentials,
    documents
  ) VALUES (
    user_id,
    user_full_name,
    user_email,
    user_institution,
    NOW(),
    'pending',
    user_credentials,
    user_documents
  );
END;
$$ LANGUAGE plpgsql;
