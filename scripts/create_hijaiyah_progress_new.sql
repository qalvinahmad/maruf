-- Alternatif: Buat tabel baru dengan schema yang benar
-- Jika tidak bisa mengubah tabel yang ada, gunakan script ini

-- 1. Buat tabel baru dengan schema yang benar
CREATE TABLE IF NOT EXISTS hijaiyah_progress_new (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    letter_id INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 2. Tambahkan unique constraint
ALTER TABLE hijaiyah_progress_new 
ADD CONSTRAINT hijaiyah_progress_new_user_letter_unique 
UNIQUE (user_id, letter_id);

-- 3. Tambahkan foreign key ke auth.users (menggunakan UUID)
ALTER TABLE hijaiyah_progress_new 
ADD CONSTRAINT hijaiyah_progress_new_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Tambahkan foreign key ke hijaiyah_letters jika tabel tersebut ada
-- ALTER TABLE hijaiyah_progress_new 
-- ADD CONSTRAINT hijaiyah_progress_new_letter_id_fkey 
-- FOREIGN KEY (letter_id) REFERENCES hijaiyah_letters(id) ON DELETE CASCADE;

-- 5. Migrasikan data dari tabel lama jika ada (dan jika user_id bisa dikonversi)
-- INSERT INTO hijaiyah_progress_new (user_id, letter_id, is_completed, completed_at)
-- SELECT 
--     user_id::text::uuid, 
--     letter_id, 
--     is_completed, 
--     completed_at 
-- FROM hijaiyah_progress 
-- WHERE user_id::text ~ '^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$';

-- 6. Rename tabel (hanya lakukan jika yakin)
-- DROP TABLE hijaiyah_progress;
-- ALTER TABLE hijaiyah_progress_new RENAME TO hijaiyah_progress;

-- 7. ATAU gunakan nama baru dan update kode aplikasi untuk menggunakan 'hijaiyah_progress_new'
