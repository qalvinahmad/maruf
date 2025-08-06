-- Remove duplicate is_verified column from teacher_profiles
-- The verification status should only be managed in teacher_verifications table

BEGIN;

-- Remove is_verified column from teacher_profiles
ALTER TABLE teacher_profiles DROP COLUMN IF EXISTS is_verified;

-- Update teacher_profiles status to match verification status
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

COMMIT;

-- Verify the changes
SELECT 'teacher_verifications' as table_name, email, status FROM teacher_verifications
UNION ALL
SELECT 'teacher_profiles' as table_name, email, status FROM teacher_profiles
ORDER BY email, table_name;
