-- Script untuk memperbaiki data teacher yang salah
-- Dan mengupdate status verifikasi untuk testing

-- 1. Backup data teacher yang ada
SELECT 'Backup teacher verifications:' as step;
SELECT * FROM teacher_verifications;

-- 2. Update email yang salah menjadi email yang benar
UPDATE teacher_verifications 
SET email = 'qalvinahmad@gmail.com',
    updated_at = NOW()
WHERE email = '111202013071@mhs.dinus.ac.id';

-- 3. Untuk testing, set status menjadi verified
UPDATE teacher_verifications 
SET status = 'verified',
    verification_date = NOW(),
    updated_at = NOW()
WHERE email = 'qalvinahmad@gmail.com';

-- 4. Pastikan RLS policies tidak menghalangi
ALTER TABLE teacher_verifications DISABLE ROW LEVEL SECURITY;

-- 5. Verifikasi perubahan
SELECT 'After update:' as step;
SELECT id, email, full_name, status, institution, teaching_experience, specialization, certifications, created_at, updated_at 
FROM teacher_verifications 
WHERE email = 'qalvinahmad@gmail.com';

-- 6. Enable RLS kembali
ALTER TABLE teacher_verifications ENABLE ROW LEVEL SECURITY;

-- 7. Create simple policies untuk teacher_verifications
DROP POLICY IF EXISTS "Enable read for own verification" ON teacher_verifications;
DROP POLICY IF EXISTS "Enable insert for service" ON teacher_verifications;
DROP POLICY IF EXISTS "Enable admin read all" ON teacher_verifications;

CREATE POLICY "teacher_verifications_select_policy" 
ON teacher_verifications FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "teacher_verifications_select_anon_policy" 
ON teacher_verifications FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "teacher_verifications_insert_policy" 
ON teacher_verifications FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "teacher_verifications_update_policy" 
ON teacher_verifications FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 8. Jika tabel teacher_profiles tidak ada, buat struktur dasarnya
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    institution TEXT,
    teaching_experience TEXT,
    specialization TEXT,
    certifications TEXT,
    is_verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Enable RLS untuk teacher_profiles
ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;

-- 10. Create simple policies untuk teacher_profiles
CREATE POLICY "teacher_profiles_select_policy" 
ON teacher_profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "teacher_profiles_insert_policy" 
ON teacher_profiles FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "teacher_profiles_update_policy" 
ON teacher_profiles FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 11. Test final query
SELECT 'Final test:' as step;
SELECT count(*) as total_teacher_verifications FROM teacher_verifications;
SELECT count(*) as verified_teachers FROM teacher_verifications WHERE status = 'verified';
