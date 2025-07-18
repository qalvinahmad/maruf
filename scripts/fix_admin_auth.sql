-- Script untuk menambahkan admin yang sudah ada ke auth.users
-- Jalankan di SQL Editor Supabase sebagai admin

-- Pertama, cek admin yang ada di admin_profiles tapi tidak di auth.users
SELECT 
    ap.id,
    ap.email,
    ap.full_name,
    ap.is_active,
    CASE 
        WHEN au.id IS NULL THEN 'Not in auth.users'
        ELSE 'In auth.users'
    END as auth_status
FROM admin_profiles ap
LEFT JOIN auth.users au ON ap.email = au.email
WHERE ap.email = '111202013071@mhs.dinus.ac.id';

-- Jika admin tidak ada di auth.users, kita perlu membuat akun auth
-- Ini hanya bisa dilakukan melalui Supabase Dashboard -> Authentication -> Users -> Add User
-- Atau menggunakan Admin API

-- Untuk development, kita bisa menggunakan fungsi berikut (jika memiliki akses admin):
-- Catatan: Ganti password_hash dengan password yang di-hash atau gunakan Dashboard

-- Alternatif: Update admin_profiles dengan ID yang valid dari auth.users
-- Jika admin sudah membuat akun auth tetapi belum terhubung dengan admin_profiles

-- Contoh: Update admin_profiles dengan ID dari auth.users yang sudah ada
-- UPDATE admin_profiles 
-- SET id = (SELECT id FROM auth.users WHERE email = '111202013071@mhs.dinus.ac.id')
-- WHERE email = '111202013071@mhs.dinus.ac.id';

-- Verifikasi koneksi
SELECT 
    ap.id as admin_profile_id,
    ap.email as admin_email,
    ap.full_name,
    ap.is_active,
    au.id as auth_user_id,
    au.email as auth_email,
    au.created_at as auth_created_at,
    au.email_confirmed_at
FROM admin_profiles ap
JOIN auth.users au ON ap.id = au.id
WHERE ap.email = '111202013071@mhs.dinus.ac.id';
