-- Test script untuk memverifikasi teacher login
-- Jalankan di SQL Editor Supabase setelah menjalankan fix_teacher_comprehensive.sql

-- 1. Cek data teacher_verifications
SELECT 'TEACHER VERIFICATIONS:' as section;
SELECT 
  id,
  email,
  full_name,
  institution,
  status,
  verification_date,
  created_at,
  updated_at
FROM teacher_verifications
ORDER BY email, created_at;

-- 2. Cek data teacher_profiles
SELECT 'TEACHER PROFILES:' as section;
SELECT 
  id,
  email,
  full_name,
  institution,
  is_verified,
  status,
  created_at,
  updated_at
FROM teacher_profiles
ORDER BY email, created_at;

-- 3. Cek konsistensi data
SELECT 'DATA CONSISTENCY CHECK:' as section;
SELECT 
  tv.email,
  tv.status as verification_status,
  tp.is_verified as profile_verified,
  tp.status as profile_status,
  CASE 
    WHEN tv.status = 'verified' AND tp.is_verified = true AND tp.status = 'verified' THEN 'CAN LOGIN'
    WHEN tv.status = 'verified' AND tp.is_verified = false THEN 'PROFILE NOT VERIFIED'
    WHEN tv.status != 'verified' THEN 'VERIFICATION NOT APPROVED'
    WHEN tp.email IS NULL THEN 'PROFILE MISSING'
    ELSE 'UNKNOWN ISSUE'
  END as login_status
FROM teacher_verifications tv
LEFT JOIN teacher_profiles tp ON tv.email = tp.email
ORDER BY tv.email;

-- 4. Cek auth users yang terdaftar
SELECT 'AUTH USERS:' as section;
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  updated_at
FROM auth.users
WHERE email IN (
  SELECT DISTINCT email FROM teacher_verifications
)
ORDER BY email;

-- 5. Cek RLS policies
SELECT 'RLS POLICIES:' as section;
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('teacher_verifications', 'teacher_profiles')
ORDER BY tablename, policyname;

-- 6. Test login conditions
SELECT 'LOGIN CONDITIONS TEST:' as section;
SELECT 
  tv.email,
  tv.status = 'verified' as verification_ok,
  tp.is_verified = true as profile_verified_ok,
  tp.status = 'verified' as profile_status_ok,
  (tv.status = 'verified' AND tp.is_verified = true AND tp.status = 'verified') as can_login
FROM teacher_verifications tv
JOIN teacher_profiles tp ON tv.email = tp.email
WHERE tv.email IN ('qalvinahmad@gmail.com', '111202013071@mhs.dinus.ac.id')
ORDER BY tv.email;
