-- Sample data untuk testing drag and drop questions
-- Pastikan data ini dijalankan di Supabase SQL Editor

-- STEP 1: Tambahkan kolom yang diperlukan ke table questions jika belum ada
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS instruction TEXT,
ADD COLUMN IF NOT EXISTS sentence_template TEXT;

-- STEP 2: Insert question type untuk drag_and_drop jika belum ada
INSERT INTO question_types (type_key, label, description)
VALUES ('drag_and_drop', 'Drag and Drop', 'Questions where users drag choices to fill blanks')
ON CONFLICT (type_key) DO NOTHING;

-- STEP 3: Hapus questions lama untuk drag_and_drop (jika ada) untuk clean start
DELETE FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- STEP 4: Insert sample drag and drop questions untuk SEMUA SUBLESSON
-- Template ini akan membuat 3 soal untuk setiap sublesson yang ada

WITH sublesson_data AS (
    SELECT id as sublesson_id, title as sublesson_title
    FROM roadmap_sub_lessons 
    ORDER BY level_id, order_sequence
)
INSERT INTO questions (
    sublesson_id, 
    question_text, 
    question_type_id, 
    order_sequence,
    instruction,
    sentence_template,
    created_at,
    updated_at
)
SELECT 
    sd.sublesson_id,
    CASE 
        WHEN question_num = 1 THEN 'Lengkapi kalimat berikut dengan kata yang tepat'
        WHEN question_num = 2 THEN 'Isi titik-titik dengan huruf yang sesuai'
        WHEN question_num = 3 THEN 'Pilih kata yang tepat untuk melengkapi kalimat'
    END as question_text,
    (SELECT id FROM question_types WHERE type_key = 'drag_and_drop') as question_type_id,
    question_num as order_sequence,
    'Seret kata ke tempat kosong' as instruction,
    CASE 
        WHEN question_num = 1 THEN 'Huruf Ba keluar dari ___'
        WHEN question_num = 2 THEN 'Huruf ___ berbentuk seperti perahu'
        WHEN question_num = 3 THEN 'Bunyi huruf Ta adalah ___'
    END as sentence_template,
    NOW() as created_at,
    NOW() as updated_at
FROM sublesson_data sd
CROSS JOIN (SELECT 1 as question_num UNION SELECT 2 UNION SELECT 3) nums;

-- STEP 5: Insert choices untuk semua drag and drop questions yang baru dibuat
-- Choices untuk pattern "Huruf Ba keluar dari ___"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT 
    q.id,
    choice,
    ROW_NUMBER() OVER (ORDER BY choice)
FROM questions q
CROSS JOIN (
    VALUES 
    ('mulut'),
    ('hidung'), 
    ('telinga'),
    ('mata')
) AS choices(choice)
WHERE q.sentence_template = 'Huruf Ba keluar dari ___'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- Choices untuk pattern "Huruf ___ berbentuk seperti perahu"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT 
    q.id,
    choice,
    ROW_NUMBER() OVER (ORDER BY choice)
FROM questions q
CROSS JOIN (
    VALUES 
    ('Jim'),
    ('Ba'),
    ('Ta'),
    ('Alif')
) AS choices(choice)
WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- Choices untuk pattern "Bunyi huruf Ta adalah ___"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT 
    q.id,
    choice,
    ROW_NUMBER() OVER (ORDER BY choice)
FROM questions q
CROSS JOIN (
    VALUES 
    ('Ta'),
    ('Ba'),
    ('Ma'),
    ('Na')
) AS choices(choice)
WHERE q.sentence_template = 'Bunyi huruf Ta adalah ___'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- STEP 6: Insert correct answers untuk semua drag and drop questions
-- Jawaban untuk "Huruf Ba keluar dari ___" adalah "mulut"
INSERT INTO drag_drop_answers (question_id, correct_answer, explanation)
SELECT 
    q.id,
    'mulut',
    'Huruf Ba (ب) diucapkan dengan bibir dan keluar dari mulut'
FROM questions q
WHERE q.sentence_template = 'Huruf Ba keluar dari ___'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- Jawaban untuk "Huruf ___ berbentuk seperti perahu" adalah "Jim"
INSERT INTO drag_drop_answers (question_id, correct_answer, explanation)
SELECT 
    q.id,
    'Jim',
    'Huruf Jim (ج) memiliki bentuk seperti perahu dengan titik di bawah'
FROM questions q
WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- Jawaban untuk "Bunyi huruf Ta adalah ___" adalah "Ta"
INSERT INTO drag_drop_answers (question_id, correct_answer, explanation)
SELECT 
    q.id,
    'Ta',
    'Huruf Ta (ت) diucapkan dengan bunyi "Ta"'
FROM questions q
WHERE q.sentence_template = 'Bunyi huruf Ta adalah ___'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- STEP 7: Verifikasi data yang telah diinsert untuk semua sublesson
SELECT 
    rsl.title as sublesson_title,
    rsl.id as sublesson_id,
    q.id as question_id,
    q.question_text,
    q.instruction,
    q.sentence_template,
    qt.type_key,
    ARRAY_AGG(ddc.choice_text ORDER BY ddc.order_sequence) as choices,
    dda.correct_answer
FROM questions q
LEFT JOIN question_types qt ON q.question_type_id = qt.id
LEFT JOIN drag_drop_choices ddc ON q.id = ddc.question_id
LEFT JOIN drag_drop_answers dda ON q.id = dda.question_id
LEFT JOIN roadmap_sub_lessons rsl ON q.sublesson_id = rsl.id
WHERE qt.type_key = 'drag_and_drop'
GROUP BY rsl.title, rsl.id, q.id, q.question_text, q.instruction, q.sentence_template, qt.type_key, dda.correct_answer, q.order_sequence
ORDER BY rsl.id, q.order_sequence;

-- STEP 8: Count total questions created per sublesson
SELECT 
    rsl.title as sublesson_title,
    rsl.id as sublesson_id,
    COUNT(q.id) as total_drag_drop_questions
FROM roadmap_sub_lessons rsl
LEFT JOIN questions q ON rsl.id = q.sublesson_id AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
GROUP BY rsl.id, rsl.title
ORDER BY rsl.id; 
(
    1,
    'Lengkapi kalimat berikut dengan kata yang tepat',
    (SELECT id FROM question_types WHERE type_key = 'drag_and_drop'),
    1,
    'Seret kata ke tempat kosong',
    'Huruf Ba keluar dari ___',
    NOW(),
    NOW()
),
(
    1,
    'Isi titik-titik dengan huruf yang sesuai',
    (SELECT id FROM question_types WHERE type_key = 'drag_and_drop'),
    2,
    'Seret kata ke tempat kosong',
    'Huruf ___ berbentuk seperti perahu',
    NOW(),
    NOW()
),
(
    1,
    'Pilih kata yang tepat untuk melengkapi kalimat',
    (SELECT id FROM question_types WHERE type_key = 'drag_and_drop'),
    3,
    'Seret kata ke tempat kosong',
    'Bunyi huruf Ta adalah ___',
    NOW(),
    NOW()
);

-- 4. Insert choices untuk drag and drop questions
-- Untuk question pertama: "Huruf Ba keluar dari ___"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT 
    q.id,
    choice,
    ROW_NUMBER() OVER (ORDER BY choice)
FROM questions q
CROSS JOIN (
    VALUES 
    ('mulut'),
    ('hidung'), 
    ('telinga'),
    ('mata')
) AS choices(choice)
WHERE q.sentence_template = 'Huruf Ba keluar dari ___'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- Untuk question kedua: "Huruf ___ berbentuk seperti perahu"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT 
    q.id,
    choice,
    ROW_NUMBER() OVER (ORDER BY choice)
FROM questions q
CROSS JOIN (
    VALUES 
    ('Jim'),
    ('Ba'),
    ('Ta'),
    ('Alif')
) AS choices(choice)
WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- Untuk question ketiga: "Bunyi huruf Ta adalah ___"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT 
    q.id,
    choice,
    ROW_NUMBER() OVER (ORDER BY choice)
FROM questions q
CROSS JOIN (
    VALUES 
    ('Ta'),
    ('Ba'),
    ('Ma'),
    ('Na')
) AS choices(choice)
WHERE q.sentence_template = 'Bunyi huruf Ta adalah ___'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- 5. Insert correct answers untuk drag and drop questions
-- Jawaban untuk "Huruf Ba keluar dari ___" adalah "mulut"
INSERT INTO drag_drop_answers (question_id, correct_answer, explanation)
SELECT 
    q.id,
    'mulut',
    'Huruf Ba (ب) diucapkan dengan bibir dan keluar dari mulut'
FROM questions q
WHERE q.sentence_template = 'Huruf Ba keluar dari ___'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- Jawaban untuk "Huruf ___ berbentuk seperti perahu" adalah "Jim"
INSERT INTO drag_drop_answers (question_id, correct_answer, explanation)
SELECT 
    q.id,
    'Jim',
    'Huruf Jim (ج) memiliki bentuk seperti perahu dengan titik di bawah'
FROM questions q
WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- Jawaban untuk "Bunyi huruf Ta adalah ___" adalah "Ta"
INSERT INTO drag_drop_answers (question_id, correct_answer, explanation)
SELECT 
    q.id,
    'Ta',
    'Huruf Ta (ت) diucapkan dengan bunyi "Ta"'
FROM questions q
WHERE q.sentence_template = 'Bunyi huruf Ta adalah ___'
AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- 6. Verifikasi data yang telah diinsert
SELECT 
    q.id as question_id,
    q.question_text,
    q.instruction,
    q.sentence_template,
    qt.type_key,
    ARRAY_AGG(ddc.choice_text ORDER BY ddc.order_sequence) as choices,
    dda.correct_answer
FROM questions q
LEFT JOIN question_types qt ON q.question_type_id = qt.id
LEFT JOIN drag_drop_choices ddc ON q.id = ddc.question_id
LEFT JOIN drag_drop_answers dda ON q.id = dda.question_id
WHERE qt.type_key = 'drag_and_drop'
AND q.sublesson_id = 1
GROUP BY q.id, q.question_text, q.instruction, q.sentence_template, qt.type_key, dda.correct_answer
ORDER BY q.order_sequence;
