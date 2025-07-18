-- Alternative: Remove status column and use is_verified only
-- This script removes the status column from teacher_profiles and uses is_verified boolean

BEGIN;

-- Add is_verified column if it doesn't exist
ALTER TABLE teacher_profiles 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Update is_verified based on verification status
UPDATE teacher_profiles 
SET is_verified = TRUE
WHERE email IN (
  SELECT email 
  FROM teacher_verifications 
  WHERE status = 'verified'
);

-- Drop the status column with constraint issues
ALTER TABLE teacher_profiles DROP COLUMN IF EXISTS status;

COMMIT;

-- Verify the changes
SELECT 
    email, 
    full_name,
    is_verified,
    created_at,
    updated_at
FROM teacher_profiles
ORDER BY email;
