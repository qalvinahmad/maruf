-- Script untuk memperbaiki schema hijaiyah_progress
-- Jalankan script ini di Supabase SQL Editor

-- 1. Cek struktur tabel saat ini
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hijaiyah_progress' 
ORDER BY ordinal_position;

-- 2. Cek constraint yang ada (termasuk foreign key)
SELECT 
    constraint_name, 
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'hijaiyah_progress';

-- 3. Cek detail foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'hijaiyah_progress';

-- 4. Cek apakah ada data yang ada
SELECT COUNT(*) as total_records FROM hijaiyah_progress;

-- 5. Jika ada data, backup terlebih dahulu
-- CREATE TABLE hijaiyah_progress_backup AS SELECT * FROM hijaiyah_progress;

-- 6. STEP BY STEP FIX: 

-- 6a. Drop ALL constraints terlebih dahulu (foreign key dan unique)
ALTER TABLE hijaiyah_progress DROP CONSTRAINT IF EXISTS hijaiyah_progress_user_id_fkey;
ALTER TABLE hijaiyah_progress DROP CONSTRAINT IF EXISTS hijaiyah_progress_user_letter_unique;

-- 6b. Ubah tipe data user_id dari integer ke uuid
-- HATI-HATI: Ini akan menghapus data yang ada jika tidak bisa dikonversi
-- Pastikan tidak ada data penting atau backup terlebih dahulu
ALTER TABLE hijaiyah_progress ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;

-- 6c. Tambahkan kembali unique constraint
ALTER TABLE hijaiyah_progress 
ADD CONSTRAINT hijaiyah_progress_user_letter_unique 
UNIQUE (user_id, letter_id);

-- 6d. Tambahkan kembali foreign key constraint ke auth.users (yang menggunakan UUID)
ALTER TABLE hijaiyah_progress 
ADD CONSTRAINT hijaiyah_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. Verifikasi perubahan
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hijaiyah_progress' 
ORDER BY ordinal_position;

-- 8. Cek constraint yang ada setelah perubahan
SELECT 
    constraint_name, 
    constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'hijaiyah_progress';

-- 9. Verifikasi foreign key constraint baru
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'hijaiyah_progress';
