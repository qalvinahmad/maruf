-- Script untuk memperbaiki masalah admin login
-- Jalankan dalam urutan ini di SQL Editor Supabase

-- 1. Backup data admin yang ada
SELECT 'Backup admin data:' as step;
SELECT * FROM admin_profiles;

-- 2. Temporarily disable RLS untuk memperbaiki masalah
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Hapus semua policy yang bermasalah
DROP POLICY IF EXISTS "Allow admins to read profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Allow authenticated insert" ON admin_profiles;
DROP POLICY IF EXISTS "Allow authenticated insert to admin_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Allow public read for admin_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON admin_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admin_profiles;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Allow insert during registration" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_select_policy" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_insert_policy" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_update_policy" ON admin_profiles;
DROP POLICY IF EXISTS "admin_profiles_public_read" ON admin_profiles;

-- 4. Pastikan data admin ada (insert or update)
INSERT INTO admin_profiles (id, email, full_name, role, admin_level, is_active, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  '111202013071@mhs.dinus.ac.id',
  'Testing',
  'admin',
  'basic',
  true,
  '2025-06-02 18:37:00.678+00',
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 5. Aktifkan kembali RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Buat policy yang sederhana dan tidak rekursif
CREATE POLICY "Allow select for all authenticated users" 
ON admin_profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow select for anonymous users" 
ON admin_profiles FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow insert for all authenticated users" 
ON admin_profiles FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Allow update for all authenticated users" 
ON admin_profiles FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- 7. Verifikasi hasil
SELECT 'Final verification:' as step;
SELECT id, email, full_name, is_active, created_at, updated_at FROM admin_profiles;

-- 8. Test policy dengan membaca data
SELECT 'Policy test:' as step;
SELECT count(*) as total_admin_profiles FROM admin_profiles;
SELECT count(*) as active_admin_profiles FROM admin_profiles WHERE is_active = true;
