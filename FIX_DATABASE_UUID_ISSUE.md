# Fix untuk Error Database: user_id UUID vs Integer

## Masalah
Error yang terjadi: `invalid input syntax for type integer: "dc669bd3-53ba-4163-9ec6-fe47ca7e46cb"`

### Root Cause
- Tabel `hijaiyah_progress` memiliki kolom `user_id` dengan tipe `INTEGER`
- Sistem autentikasi menggunakan `UUID` untuk user ID (seperti di tabel `profiles`)
- Mismatch tipe data menyebabkan error saat query

### Struktur Database Saat Ini
```sql
-- hijaiyah_progress (PROBLEMATIC)
id          INTEGER
user_id     INTEGER  -- ❌ SALAH: Harusnya UUID
letter_id   INTEGER
is_completed BOOLEAN
completed_at TIMESTAMP

-- profiles (CORRECT)
id          UUID     -- ✅ BENAR: Menggunakan UUID
```

## Solusi

### ⚠️ ERROR YANG TERJADI
```
ERROR: 42804: foreign key constraint "hijaiyah_progress_user_id_fkey" cannot be implemented
DETAIL: Key columns "user_id" and "id" are of incompatible types: uuid and integer.
```

**Root Cause:** Ada foreign key constraint yang mencegah perubahan tipe data.

### Solusi 1: Fix Schema Step by Step (RECOMMENDED)
Jalankan script `scripts/fix_step_by_step.sql` SATU PER SATU:

```sql
-- STEP 1: Drop foreign key constraint dulu
ALTER TABLE hijaiyah_progress DROP CONSTRAINT IF EXISTS hijaiyah_progress_user_id_fkey;

-- STEP 2: Drop unique constraint 
ALTER TABLE hijaiyah_progress DROP CONSTRAINT IF EXISTS hijaiyah_progress_user_letter_unique;

-- STEP 3: Ubah tipe data
ALTER TABLE hijaiyah_progress ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;

-- STEP 4: Tambahkan kembali constraints
ALTER TABLE hijaiyah_progress 
ADD CONSTRAINT hijaiyah_progress_user_letter_unique 
UNIQUE (user_id, letter_id);

ALTER TABLE hijaiyah_progress 
ADD CONSTRAINT hijaiyah_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

### Solusi 2: Buat Tabel Baru (SAFE ALTERNATIVE)
Gunakan script `scripts/create_hijaiyah_progress_new.sql`

### Solusi 3: Recreate Table (NUCLEAR OPTION)
Jika tidak ada data penting, gunakan script `scripts/recreate_table_clean.sql`

## Status Implementasi
- ✅ Kode aplikasi sudah diperbaiki dengan error handling
- ⏳ Database schema perlu diperbaiki manual
- ✅ Script SQL sudah disediakan
- ✅ Debugging dan logging ditingkatkan

## Langkah Selanjutnya
1. Jalankan salah satu script SQL di Supabase SQL Editor
2. Test aplikasi untuk memastikan tidak ada error lagi
3. Verifikasi bahwa progress saving berfungsi dengan benar

## Files yang Diubah
- `pages/latihan/comprehensive-test.jsx` - Error handling diperbaiki
- `scripts/fix_hijaiyah_progress_schema.sql` - Script lengkap dengan diagnostik
- `scripts/fix_step_by_step.sql` - Script step by step yang aman
- `scripts/create_hijaiyah_progress_new.sql` - Script alternatif tabel baru  
- `scripts/recreate_table_clean.sql` - Script recreate table (nuclear option)

## Urutan Prioritas Solusi
1. **COBA DULU:** `fix_step_by_step.sql` - Paling aman
2. **JIKA GAGAL:** `create_hijaiyah_progress_new.sql` - Buat tabel baru
3. **OPSI TERAKHIR:** `recreate_table_clean.sql` - Hapus dan buat ulang
