-- Script untuk memastikan admin sudah ada di auth.users
-- Jalankan di SQL Editor Supabase

-- Cek apakah admin sudah ada di auth.users
SELECT 
    ap.id,
    ap.email,
    ap.full_name,
    ap.is_active,
    au.email as auth_email,
    au.created_at as auth_created_at,
    au.email_confirmed_at
FROM admin_profiles ap
LEFT JOIN auth.users au ON ap.id = au.id
WHERE ap.email = '111202013071@mhs.dinus.ac.id';

-- Jika admin tidak ada di auth.users, kita perlu membuat akun auth untuk admin tersebut
-- Ini biasanya dilakukan melalui Supabase Dashboard atau menggunakan Admin API

-- Untuk sementara, kita bisa menggunakan UUID yang baru untuk admin profile
-- dan menghubungkannya dengan auth.users setelah login pertama

-- Update admin_profiles jika diperlukan
UPDATE admin_profiles 
SET 
    is_active = true,
    updated_at = NOW()
WHERE email = '111202013071@mhs.dinus.ac.id';

-- Verifikasi data admin
SELECT * FROM admin_profiles WHERE email = '111202013071@mhs.dinus.ac.id';
