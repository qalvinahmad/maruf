-- OPSI TERAKHIR: Gunakan tabel baru dan ganti nama di aplikasi
-- Jika masih ada masalah dengan tabel lama, buat tabel baru dan ubah kode

-- 1. Buat tabel dengan nama yang sama tapi drop yang lama dulu
DROP TABLE IF EXISTS hijaiyah_progress CASCADE;

-- 2. Buat tabel baru dengan schema yang benar
CREATE TABLE hijaiyah_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    letter_id INTEGER NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- 3. Tambahkan unique constraint
ALTER TABLE hijaiyah_progress 
ADD CONSTRAINT hijaiyah_progress_user_letter_unique 
UNIQUE (user_id, letter_id);

-- 4. Tambahkan foreign key ke auth.users
ALTER TABLE hijaiyah_progress 
ADD CONSTRAINT hijaiyah_progress_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 5. Verifikasi
SELECT 
    column_name, 
    data_type, 
    is_nullable 
FROM information_schema.columns 
WHERE table_name = 'hijaiyah_progress' 
ORDER BY ordinal_position;

-- 6. Test insert dengan data dummy
-- INSERT INTO hijaiyah_progress (user_id, letter_id, is_completed) 
-- VALUES ('dc669bd3-53ba-4163-9ec6-fe47ca7e46cb', 1, true);
