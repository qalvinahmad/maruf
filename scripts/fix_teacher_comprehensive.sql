-- Script komprehensif untuk memperbaiki masalah teacher login
-- Jalankan di SQL Editor Supabase

-- 1. Backup semua data teacher
SELECT 'BACKUP teacher_verifications:' as step;
SELECT * FROM teacher_verifications;

SELECT 'BACKUP teacher_profiles:' as step;
SELECT * FROM teacher_profiles;

-- 2. Disable RLS sementara untuk kemudahan
ALTER TABLE teacher_verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Clean up duplicate teacher_verifications
-- Hapus duplikat, simpan yang terbaru
WITH ranked_verifications AS (
  SELECT *,
    ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) as rn
  FROM teacher_verifications
)
DELETE FROM teacher_verifications 
WHERE id IN (
  SELECT id FROM ranked_verifications WHERE rn > 1
);

-- 4. Update status verified untuk email yang sudah ada auth user
UPDATE teacher_verifications 
SET status = 'verified',
    verification_date = CASE 
      WHEN verification_date IS NULL THEN NOW() 
      ELSE verification_date 
    END,
    updated_at = NOW()
WHERE email IN ('qalvinahmad@gmail.com', '111202013071@mhs.dinus.ac.id')
  AND status != 'verified';

-- 5. Update teacher_profiles status juga
UPDATE teacher_profiles 
SET is_verified = true,
    status = 'verified',
    updated_at = NOW()
WHERE email IN ('qalvinahmad@gmail.com', '111202013071@mhs.dinus.ac.id')
  AND (is_verified = false OR status != 'verified');

-- 6. Pastikan data konsisten antara verifications dan profiles
-- Jika ada di verifications tapi tidak di profiles, buat profile
INSERT INTO teacher_profiles (
  id, email, full_name, institution, teaching_experience, 
  specialization, certifications, is_verified, status, created_at, updated_at
)
SELECT 
  tv.id,
  tv.email,
  tv.full_name,
  tv.institution,
  COALESCE(tv.credentials->>'teaching_experience', 'N/A'),
  COALESCE((tv.credentials->'specializations'->>0), 'N/A'),
  COALESCE(tv.credentials->>'certifications', 'N/A'),
  CASE WHEN tv.status = 'verified' THEN true ELSE false END,
  tv.status,
  tv.created_at,
  NOW()
FROM teacher_verifications tv
LEFT JOIN teacher_profiles tp ON tv.email = tp.email
WHERE tp.email IS NULL;

-- 7. Enable RLS kembali
ALTER TABLE teacher_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- 8. Create simple policies jika belum ada
-- Drop existing policies first
DROP POLICY IF EXISTS "teacher_verifications_select_policy" ON teacher_verifications;
DROP POLICY IF EXISTS "teacher_verifications_select_anon_policy" ON teacher_verifications;
DROP POLICY IF EXISTS "teacher_verifications_insert_policy" ON teacher_verifications;
DROP POLICY IF EXISTS "teacher_verifications_update_policy" ON teacher_verifications;

DROP POLICY IF EXISTS "teacher_profiles_select_policy" ON teacher_profiles;
DROP POLICY IF EXISTS "teacher_profiles_insert_policy" ON teacher_profiles;
DROP POLICY IF EXISTS "teacher_profiles_update_policy" ON teacher_profiles;

-- Create new simple policies
CREATE POLICY "teacher_verifications_select_all" 
ON teacher_verifications FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "teacher_verifications_select_anon" 
ON teacher_verifications FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "teacher_verifications_insert_all" 
ON teacher_verifications FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "teacher_verifications_update_all" 
ON teacher_verifications FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

CREATE POLICY "teacher_profiles_select_all" 
ON teacher_profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "teacher_profiles_insert_all" 
ON teacher_profiles FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "teacher_profiles_update_all" 
ON teacher_profiles FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 9. Verifikasi hasil akhir
SELECT 'FINAL VERIFICATION:' as step;

SELECT 'teacher_verifications after cleanup:' as table_name;
SELECT id, email, full_name, status, verification_date, created_at, updated_at 
FROM teacher_verifications 
ORDER BY email, created_at;

SELECT 'teacher_profiles after cleanup:' as table_name;
SELECT id, email, full_name, is_verified, status, created_at, updated_at 
FROM teacher_profiles 
ORDER BY email, created_at;

-- 10. Test query untuk login
SELECT 'LOGIN TEST QUERIES:' as step;

-- Test untuk qalvinahmad@gmail.com
SELECT 'Test for qalvinahmad@gmail.com:' as test;
SELECT 
  tv.email,
  tv.status as verification_status,
  tp.is_verified as profile_verified,
  tp.status as profile_status
FROM teacher_verifications tv
LEFT JOIN teacher_profiles tp ON tv.email = tp.email
WHERE tv.email = 'qalvinahmad@gmail.com';

-- Test untuk 111202013071@mhs.dinus.ac.id
SELECT 'Test for 111202013071@mhs.dinus.ac.id:' as test;
SELECT 
  tv.email,
  tv.status as verification_status,
  tp.is_verified as profile_verified,
  tp.status as profile_status
FROM teacher_verifications tv
LEFT JOIN teacher_profiles tp ON tv.email = tp.email
WHERE tv.email = '111202013071@mhs.dinus.ac.id';
