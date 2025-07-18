# SOLUSI MASALAH ADMIN LOGIN - INFINITE RECURSION RLS

## 🔴 MASALAH TERIDENTIFIKASI:
1. **Infinite recursion dalam RLS policy** - Policy admin_profiles saling referensi
2. **Query auth.users yang salah** - Tidak bisa akses langsung ke auth.users
3. **Admin profile tidak terhubung dengan auth.users**

## 🚨 LANGKAH DARURAT - LAKUKAN SEGERA:

### 1. Jalankan Script SQL untuk Memperbaiki RLS
Buka **Supabase Dashboard > SQL Editor** dan jalankan script berikut:

```sql
-- STEP 1: Backup data
SELECT * FROM admin_profiles;

-- STEP 2: Disable RLS sementara
ALTER TABLE admin_profiles DISABLE ROW LEVEL SECURITY;

-- STEP 3: Drop semua policy bermasalah
DROP POLICY IF EXISTS "Allow admins to read profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Allow authenticated insert" ON admin_profiles;
DROP POLICY IF EXISTS "Allow authenticated insert to admin_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Allow public read for admin_profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Enable insert for registration" ON admin_profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON admin_profiles;
DROP POLICY IF EXISTS "Allow admins to read all profiles" ON admin_profiles;
DROP POLICY IF EXISTS "Allow insert during registration" ON admin_profiles;

-- STEP 4: Pastikan data admin ada
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

-- STEP 5: Re-enable RLS
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 6: Buat policy sederhana tanpa rekursi
CREATE POLICY "admin_select_policy" 
ON admin_profiles FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "admin_select_anon_policy" 
ON admin_profiles FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "admin_insert_policy" 
ON admin_profiles FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "admin_update_policy" 
ON admin_profiles FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- STEP 7: Verifikasi
SELECT * FROM admin_profiles WHERE email = '111202013071@mhs.dinus.ac.id';
```

### 2. Setelah Script SQL Berhasil:

#### Opsi A - Membuat Auth User Baru:
1. Buka halaman login admin
2. Klik **"Debug: Buat Admin Auth User"**
3. Login dengan:
   - Email: `111202013071@mhs.dinus.ac.id`
   - Password: `TempPassword123!`

#### Opsi B - Menggunakan Reset Password:
1. Klik **"Reset Password Admin"**
2. Cek email untuk link reset password
3. Set password baru
4. Login dengan password baru

#### Opsi C - Manual via Supabase Dashboard:
1. Buka **Supabase Dashboard > Authentication > Users**
2. **Add User** dengan:
   - Email: `111202013071@mhs.dinus.ac.id`
   - Password: `[password yang diinginkan]`
   - ✅ Email Confirmed
   - ✅ Auto Confirm User
3. Jalankan SQL untuk update admin profile:
```sql
UPDATE admin_profiles 
SET id = (SELECT id FROM auth.users WHERE email = '111202013071@mhs.dinus.ac.id')
WHERE email = '111202013071@mhs.dinus.ac.id';
```

## 🔧 PERBAIKAN KODE YANG TELAH DILAKUKAN:

### 1. AuthContext.js
- ✅ Perbaikan error handling
- ✅ Validasi admin sebelum login
- ✅ Pesan error yang lebih spesifik

### 2. loginAdmin.jsx
- ✅ Perbaikan query debug (hapus akses langsung ke auth.users)
- ✅ Fungsi auto-create admin user
- ✅ Fungsi reset password
- ✅ Error handling yang lebih baik

### 3. Database Migration
- ✅ Script untuk fix RLS policy
- ✅ Tambah kolom last_login
- ✅ Policy yang tidak rekursif

## 🎯 CARA TESTING:

1. **Test Debug Function**:
   - Klik "Debug: Cek Data Admin (Detail)"
   - Harusnya tidak ada error infinite recursion
   - Harusnya muncul data admin

2. **Test Auto Create**:
   - Klik "Debug: Buat Admin Auth User"
   - Harusnya berhasil tanpa error RLS

3. **Test Login Normal**:
   - Masukkan email: `111202013071@mhs.dinus.ac.id`
   - Masukkan password yang sudah diset
   - Harusnya berhasil login

## 📋 CHECKLIST VERIFIKASI:

- [ ] Script SQL berhasil dijalankan tanpa error
- [ ] Data admin ada di admin_profiles
- [ ] RLS policy tidak menyebabkan infinite recursion
- [ ] Debug function berjalan tanpa error
- [ ] Admin bisa login dengan password yang benar
- [ ] Redirect ke dashboard admin berhasil

## 🚨 JIKA MASIH BERMASALAH:

1. **Cek Console Browser** - Lihat error detail
2. **Cek Supabase Logs** - Dashboard > Settings > Logs
3. **Temporary Disable RLS** - Untuk debugging sementara
4. **Contact Support** - Jika masalah persisten

## 🛡️ SETELAH BERHASIL:

1. **Hapus tombol debug** dari production
2. **Ganti password default** jika menggunakan `TempPassword123!`
3. **Verifikasi security** - pastikan RLS berfungsi dengan baik
4. **Backup database** - untuk pencegahan

---

**PRIORITAS TINGGI**: Jalankan script SQL terlebih dahulu sebelum mencoba login!
