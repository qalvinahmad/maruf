-- SCRIPT SEDERHANA: Step by Step Fix untuk hijaiyah_progress
-- Jalankan script ini SATU PER SATU di Supabase SQL Editor

-- STEP 1: Cek constraint yang ada
SELECT 
    constraint_name, 
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'hijaiyah_progress';

-- STEP 2: Drop foreign key constraint terlebih dahulu
ALTER TABLE hijaiyah_progress DROP CONSTRAINT IF EXISTS hijaiyah_progress_user_id_fkey;

-- STEP 3: Drop unique constraint 
ALTER TABLE hijaiyah_progress DROP CONSTRAINT IF EXISTS hijaiyah_progress_user_letter_unique;

-- STEP 4: Backup data (jika ada)
-- CREATE TABLE hijaiyah_progress_backup AS SELECT * FROM hijaiyah_progress;

-- STEP 5: Ubah tipe data user_id
ALTER TABLE hijaiyah_progress ALTER COLUMN user_id TYPE uuid USING user_id::text::uuid;

-- STEP 6: Tambahkan kembali unique constraint
ALTER TABLE hijaiyah_progress 
ADD CONSTRAINT hijaiyah_progress_user_letter_unique 
UNIQUE (user_id, letter_id);

-- STEP 7: Tambahkan kembali foreign key constraint ke auth.users
ALTER TABLE hijaiyah_progress 
ADD CONSTRAINT hijaiyah_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- STEP 8: Verifikasi hasil
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hijaiyah_progress' 
ORDER BY ordinal_position;
