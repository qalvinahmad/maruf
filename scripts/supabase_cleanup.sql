-- SUPABASE CONSOLE SCRIPT
-- Copy dan paste script ini ke Supabase SQL Editor

-- Remove duplicate is_verified column from teacher_profiles
-- The verification status should only be managed in teacher_verifications table

-- Step 1: Update teacher_profiles status to match verification status
UPDATE teacher_profiles 
SET status = 'verified'
WHERE email IN (
  SELECT email 
  FROM teacher_verifications 
  WHERE status = 'verified'
);

UPDATE teacher_profiles 
SET status = 'pending'
WHERE email IN (
  SELECT email 
  FROM teacher_verifications 
  WHERE status = 'pending'
);

UPDATE teacher_profiles 
SET status = 'rejected'
WHERE email IN (
  SELECT email 
  FROM teacher_verifications 
  WHERE status = 'rejected'
);

-- Step 2: Remove is_verified column from teacher_profiles
ALTER TABLE teacher_profiles DROP COLUMN IF EXISTS is_verified;

-- Step 3: Verify the changes
SELECT 'teacher_verifications' as table_name, email, status, created_at FROM teacher_verifications
UNION ALL
SELECT 'teacher_profiles' as table_name, email, status, created_at FROM teacher_profiles
ORDER BY email, table_name;
