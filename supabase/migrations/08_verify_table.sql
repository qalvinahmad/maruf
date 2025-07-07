-- Verify table exists and has correct structure
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'teacher_verifications'
);

-- Display table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'teacher_verifications';

-- Count existing records
SELECT count(*) from public.teacher_verifications;

-- Reset RLS for testing
ALTER TABLE public.teacher_verifications DISABLE ROW LEVEL SECURITY;
