# PANDUAN MEMPERBAIKI LOGIN GURU

## 🔴 MASALAH YANG DITEMUKAN:
1. **Email tersimpan salah** - Email `qalvinahmad@gmail.com` tersimpan sebagai `111202013071@mhs.dinus.ac.id`
2. **Status verifikasi pending** - Teacher belum diverifikasi oleh admin
3. **Tidak ada navigasi** - Tidak ada link antara login dan register

## 🚨 LANGKAH PERBAIKAN - LAKUKAN SEGERA:

### 1. Jalankan Script SQL untuk Perbaikan Data
Buka **Supabase Dashboard > SQL Editor** dan jalankan:

```sql
-- Fix email dan verifikasi teacher
UPDATE teacher_verifications 
SET email = 'qalvinahmad@gmail.com',
    status = 'verified',
    verification_date = NOW(),
    updated_at = NOW()
WHERE email = '111202013071@mhs.dinus.ac.id';

-- Cek hasilnya
SELECT * FROM teacher_verifications WHERE email = 'qalvinahmad@gmail.com';
```

### 2. Setelah Script SQL Berhasil:

#### Opsi A - Menggunakan Tools Debug:
1. Buka halaman login teacher
2. Masukkan email: `qalvinahmad@gmail.com`
3. Klik **"Debug: Cek Data Teacher"** untuk melihat status
4. Jika belum verified, klik **"Debug: Verifikasi Teacher"**
5. Login dengan:
   - Email: `qalvinahmad@gmail.com`
   - Password: `[password saat registrasi]`
   - Kode Guru: `T123`

#### Opsi B - Manual via SQL:
```sql
-- Langsung update status menjadi verified
UPDATE teacher_verifications 
SET status = 'verified',
    verification_date = NOW(),
    updated_at = NOW()
WHERE email = 'qalvinahmad@gmail.com';
```

### 3. Jika Masih Tidak Bisa Login:

#### Buat Auth User Baru:
1. **Supabase Dashboard > Authentication > Users**
2. **Add User** dengan:
   - Email: `qalvinahmad@gmail.com`
   - Password: `[password baru]`
   - ✅ Email Confirmed
   - ✅ Auto Confirm User

#### Update Data Teacher:
```sql
-- Update teacher_verifications dengan auth user ID yang benar
UPDATE teacher_verifications 
SET id = (SELECT id FROM auth.users WHERE email = 'qalvinahmad@gmail.com'),
    status = 'verified',
    verification_date = NOW(),
    updated_at = NOW()
WHERE email = 'qalvinahmad@gmail.com';
```

## 🔧 PERBAIKAN KODE YANG TELAH DILAKUKAN:

### 1. AuthContext.js
- ✅ Perbaikan validasi teacher verifikasi
- ✅ Auto-create teacher profile jika belum ada
- ✅ Pesan error yang lebih informatif
- ✅ Pengecekan status verifikasi yang lebih baik

### 2. loginTeacher.jsx
- ✅ Tambahan tools debug
- ✅ Error handling yang lebih spesifik
- ✅ Navigasi ke halaman register
- ✅ Informasi kode guru

### 3. registerTeacher.jsx
- ✅ Navigasi ke halaman login
- ✅ Perbaikan UI dan UX

### 4. Database
- ✅ Script untuk fix data yang salah
- ✅ RLS policies yang lebih sederhana
- ✅ Struktur teacher_profiles yang benar

## 📋 CARA TESTING:

1. **Test Tools Debug**:
   - Masukkan email: `qalvinahmad@gmail.com`
   - Klik "Debug: Cek Data Teacher"
   - Harusnya muncul data teacher verification

2. **Test Verifikasi**:
   - Klik "Debug: Verifikasi Teacher"
   - Status harusnya berubah menjadi verified

3. **Test Login**:
   - Email: `qalvinahmad@gmail.com`
   - Password: `[password saat registrasi]`
   - Kode Guru: `T123`
   - Harusnya berhasil login

## 🎯 NAVIGASI YANG DITAMBAHKAN:

### Login Teacher Page:
- ✅ Link "Belum memiliki akun guru? Daftar di sini"
- ✅ Link "Kembali ke login user"

### Register Teacher Page:
- ✅ Link "Sudah memiliki akun guru? Login di sini"
- ✅ Link "Kembali ke halaman login utama"

## 🛡️ KEAMANAN:
- Kode guru: `T123` (untuk testing)
- RLS policies yang aman
- Validasi email yang proper

## 📊 DATA YANG DIPERBAIKI:
- Email: `111202013071@mhs.dinus.ac.id` → `qalvinahmad@gmail.com`
- Status: `pending` → `verified`
- Verification date: Updated to current

## 🚨 SETELAH BERHASIL:
1. **Hapus tombol debug** dari production
2. **Verifikasi RLS policies** berfungsi dengan baik
3. **Test dengan user baru** untuk memastikan flow registrasi bekerja
4. **Ganti kode guru** untuk production

---

**PRIORITAS TINGGI**: Jalankan script SQL untuk memperbaiki data email yang salah terlebih dahulu!
