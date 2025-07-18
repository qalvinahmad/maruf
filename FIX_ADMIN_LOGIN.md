# Panduan Mengatasi Masalah Login Admin

## Masalah
Admin dengan email `111202013071@mhs.dinus.ac.id` sudah ada di tabel `admin_profiles` tetapi tidak bisa login karena tidak ada di `auth.users`.

## Analisis Masalah
Data admin yang diberikan:
```json
{
  "id": "e9d5e3ef-6a95-4079-aff8-9fd9ab5ee531",
  "email": "111202013071@mhs.dinus.ac.id",
  "full_name": "Testing",
  "role": "admin",
  "admin_level": "basic",
  "is_active": true,
  "created_at": "2025-06-02 18:37:00.678+00",
  "updated_at": "2025-06-05 14:09:33.173792+00",
  "last_login": "2025-06-02 18:37:00.678+00"
}
```

Admin ini ada di tabel `admin_profiles` tetapi kemungkinan tidak ada di `auth.users` Supabase.

## Solusi Cepat (Development)
1. Buka halaman login admin
2. Klik tombol **"Debug: Cek Data Admin"** untuk memverifikasi data
3. Jika admin tidak ada di auth.users, klik tombol **"Debug: Buat Admin Auth User"**
4. Sistem akan membuat user auth dengan password default: `TempPassword123!`
5. Login dengan kredensial tersebut

## Solusi Manual (Production)

### Langkah 1: Verifikasi Data Admin
1. Buka Supabase Dashboard
2. Masuk ke SQL Editor
3. Jalankan query berikut:
```sql
SELECT 
    ap.id,
    ap.email,
    ap.full_name,
    ap.is_active,
    au.email as auth_email,
    au.email_confirmed_at
FROM admin_profiles ap
LEFT JOIN auth.users au ON ap.id = au.id
WHERE ap.email = '111202013071@mhs.dinus.ac.id';
```

### Langkah 2: Tambahkan User ke Auth
1. Masuk ke Supabase Dashboard
2. Buka menu **Authentication** > **Users**
3. Klik **Add User**
4. Isi data berikut:
   - Email: `111202013071@mhs.dinus.ac.id`
   - Password: `[password yang diinginkan]`
   - Email Confirm: `checked` (agar email langsung terverifikasi)
   - Auto Confirm User: `checked`

### Langkah 3: Update Admin Profile
Setelah user dibuat di auth, update admin_profiles dengan ID yang baru:
```sql
UPDATE admin_profiles 
SET id = (SELECT id FROM auth.users WHERE email = '111202013071@mhs.dinus.ac.id')
WHERE email = '111202013071@mhs.dinus.ac.id';
```

### Langkah 4: Verifikasi Koneksi
```sql
SELECT 
    ap.id as admin_profile_id,
    ap.email as admin_email,
    ap.full_name,
    ap.is_active,
    au.id as auth_user_id,
    au.email as auth_email,
    au.email_confirmed_at
FROM admin_profiles ap
JOIN auth.users au ON ap.id = au.id
WHERE ap.email = '111202013071@mhs.dinus.ac.id';
```

### Langkah 5: Test Login
Setelah langkah-langkah di atas, admin seharusnya bisa login dengan:
- Email: `111202013071@mhs.dinus.ac.id`
- Password: `[password yang diset di step 2]`

## Perbaikan Kode
Kode telah diperbaiki dengan:
- ✅ Error handling yang lebih baik
- ✅ Validasi admin profile sebelum login
- ✅ Pesan error yang lebih informatif
- ✅ Debugging tools untuk membantu troubleshooting
- ✅ Fungsi untuk membuat admin auth user otomatis
- ✅ Penambahan kolom `last_login` ke tabel admin_profiles

## Migrasi Database
Jalankan migrasi berikut untuk menambahkan kolom `last_login`:
```sql
-- Add last_login column to admin_profiles table
ALTER TABLE admin_profiles ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
```

## Catatan Penting
- Pastikan kolom `is_active` di admin_profiles bernilai `true`
- Pastikan email di auth.users sudah terverifikasi
- Hapus tombol debug setelah masalah teratasi
- Ganti password default setelah login pertama
- Untuk production, jangan gunakan tombol debug, gunakan Supabase Dashboard

## Troubleshooting
Jika masih mengalami masalah:
1. Cek console browser untuk error logs
2. Pastikan RLS policies memungkinkan akses ke admin_profiles
3. Verifikasi koneksi database
4. Pastikan Supabase URL dan API key sudah benar
