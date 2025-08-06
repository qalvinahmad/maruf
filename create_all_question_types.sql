-- Advanced SQL untuk menambahkan SEMUA JENIS SOAL ke SEMUA SUBLESSON
-- Jalankan script ini di Supabase SQL Editor

-- ===================================
-- STEP 1: Setup Kolom dan Question Types
-- ===================================

-- Tambahkan kolom yang diperlukan
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS instruction TEXT,
ADD COLUMN IF NOT EXISTS sentence_template TEXT;

-- Insert semua question types yang diperlukan
INSERT INTO question_types (type_key, label, description)
VALUES 
('multiple_choice', 'Multiple Choice', 'Questions with multiple options to choose from'),
('true_false', 'True/False', 'Questions with true or false answers'),
('short_answer', 'Short Answer', 'Questions requiring text input'),
('fill_in_blank', 'Fill in the Blank', 'Questions with blanks to fill'),
('drag_and_drop', 'Drag and Drop', 'Questions where users drag choices to fill blanks'),
('voice_input', 'Voice Input', 'Questions requiring voice/speech input')
ON CONFLICT (type_key) DO NOTHING;

-- ===================================
-- STEP 2: Bersihkan Data Lama (Optional)
-- ===================================

-- Uncomment baris di bawah jika ingin menghapus semua soal lama
-- DELETE FROM questions WHERE question_type_id IN (SELECT id FROM question_types WHERE type_key IN ('drag_and_drop', 'true_false', 'short_answer', 'fill_in_blank', 'voice_input'));

-- ===================================
-- STEP 3: Insert Questions untuk Semua Sublesson
-- ===================================

-- Template data soal yang akan digunakan
WITH question_templates AS (
    SELECT * FROM (VALUES
        -- DRAG AND DROP QUESTIONS
        ('drag_and_drop', 1, 'Lengkapi kalimat berikut dengan kata yang tepat', 'Seret kata ke tempat kosong', 'Huruf Ba keluar dari ___'),
        ('drag_and_drop', 2, 'Isi titik-titik dengan huruf yang sesuai', 'Seret kata ke tempat kosong', 'Huruf ___ berbentuk seperti perahu'),
        ('drag_and_drop', 3, 'Pilih kata yang tepat untuk melengkapi kalimat', 'Seret kata ke tempat kosong', 'Bunyi huruf Ta adalah ___'),
        
        -- TRUE FALSE QUESTIONS
        ('true_false', 4, 'Huruf Alif adalah huruf pertama dalam abjad Arab', NULL, NULL),
        ('true_false', 5, 'Huruf Ba memiliki titik di atas', NULL, NULL),
        ('true_false', 6, 'Huruf Jim berbentuk seperti perahu', NULL, NULL),
        
        -- SHORT ANSWER QUESTIONS
        ('short_answer', 7, 'Sebutkan huruf Arab yang keluar dari mulut', NULL, NULL),
        ('short_answer', 8, 'Tuliskan bunyi huruf Ta dalam bahasa Indonesia', NULL, NULL),
        ('short_answer', 9, 'Sebutkan nama huruf yang berbentuk seperti perahu', NULL, NULL),
        
        -- FILL IN BLANK QUESTIONS
        ('fill_in_blank', 10, 'Lengkapi kalimat berikut', NULL, 'Huruf ___ adalah huruf pertama dalam abjad Arab'),
        ('fill_in_blank', 11, 'Isi bagian yang kosong', NULL, 'Bunyi huruf Ba adalah ___'),
        ('fill_in_blank', 12, 'Lengkapi pernyataan ini', NULL, 'Huruf Jim memiliki ___ di bawah'),
        
        -- VOICE INPUT QUESTIONS
        ('voice_input', 13, 'Ucapkan huruf berikut dengan benar', NULL, NULL),
        ('voice_input', 14, 'Lafalkan bunyi huruf ini', NULL, NULL),
        ('voice_input', 15, 'Ucapkan nama huruf yang ditampilkan', NULL, NULL)
    ) AS t(question_type, order_seq, question_text, instruction, sentence_template)
),
sublesson_data AS (
    SELECT id as sublesson_id, title as sublesson_title, level_id
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
    qt.question_text,
    (SELECT id FROM question_types WHERE type_key = qt.question_type) as question_type_id,
    qt.order_seq,
    qt.instruction,
    qt.sentence_template,
    NOW() as created_at,
    NOW() as updated_at
FROM sublesson_data sd
CROSS JOIN question_templates qt;

-- ===================================
-- STEP 4: Insert Question Options untuk Multiple Choice & True/False
-- ===================================

-- Options untuk TRUE/FALSE questions
INSERT INTO question_options (question_id, option_text, is_correct, order_sequence)
SELECT 
    q.id,
    'true' as option_text,
    CASE 
        WHEN q.question_text LIKE '%Huruf Alif adalah huruf pertama%' THEN true
        WHEN q.question_text LIKE '%Huruf Ba memiliki titik di atas%' THEN false  
        WHEN q.question_text LIKE '%Huruf Jim berbentuk seperti perahu%' THEN true
        ELSE false 
    END as is_correct,
    1 as order_sequence
FROM questions q
WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'true_false')

UNION ALL

SELECT 
    q.id,
    'false' as option_text,
    CASE 
        WHEN q.question_text LIKE '%Huruf Alif adalah huruf pertama%' THEN false
        WHEN q.question_text LIKE '%Huruf Ba memiliki titik di atas%' THEN true
        WHEN q.question_text LIKE '%Huruf Jim berbentuk seperti perahu%' THEN false
        ELSE true 
    END as is_correct,
    2 as order_sequence
FROM questions q
WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'true_false');

-- Options untuk SHORT ANSWER questions
INSERT INTO question_options (question_id, option_text, is_correct, order_sequence)
SELECT 
    q.id,
    CASE 
        WHEN q.question_text LIKE '%huruf Arab yang keluar dari mulut%' THEN 'Ba'
        WHEN q.question_text LIKE '%bunyi huruf Ta%' THEN 'Ta'
        WHEN q.question_text LIKE '%berbentuk seperti perahu%' THEN 'Jim'
        ELSE 'Answer'
    END as option_text,
    true as is_correct,
    1 as order_sequence
FROM questions q
WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'short_answer');

-- Options untuk VOICE INPUT questions
INSERT INTO question_options (question_id, option_text, is_correct, order_sequence)
SELECT 
    q.id,
    CASE 
        WHEN q.order_sequence = 13 THEN 'Ba'
        WHEN q.order_sequence = 14 THEN 'Ta'
        WHEN q.order_sequence = 15 THEN 'Jim'
        ELSE 'Sound'
    END as option_text,
    true as is_correct,
    1 as order_sequence
FROM questions q
WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'voice_input');

-- ===================================
-- STEP 5: Insert Drag Drop Choices
-- ===================================

-- Choices untuk "Huruf Ba keluar dari ___"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT 
    q.id,
    choice,
    ROW_NUMBER() OVER (ORDER BY choice)
FROM questions q
CROSS JOIN (VALUES ('mulut'), ('hidung'), ('telinga'), ('mata')) AS choices(choice)
WHERE q.sentence_template = 'Huruf Ba keluar dari ___';

-- Choices untuk "Huruf ___ berbentuk seperti perahu"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT 
    q.id,
    choice,
    ROW_NUMBER() OVER (ORDER BY choice)
FROM questions q
CROSS JOIN (VALUES ('Jim'), ('Ba'), ('Ta'), ('Alif')) AS choices(choice)
WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu';

-- Choices untuk "Bunyi huruf Ta adalah ___"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT 
    q.id,
    choice,
    ROW_NUMBER() OVER (ORDER BY choice)
FROM questions q
CROSS JOIN (VALUES ('Ta'), ('Ba'), ('Ma'), ('Na')) AS choices(choice)
WHERE q.sentence_template = 'Bunyi huruf Ta adalah ___';

-- ===================================
-- STEP 6: Insert Drag Drop Answers
-- ===================================

INSERT INTO drag_drop_answers (question_id, correct_answer, explanation)
SELECT 
    q.id,
    CASE 
        WHEN q.sentence_template = 'Huruf Ba keluar dari ___' THEN 'mulut'
        WHEN q.sentence_template = 'Huruf ___ berbentuk seperti perahu' THEN 'Jim'
        WHEN q.sentence_template = 'Bunyi huruf Ta adalah ___' THEN 'Ta'
        WHEN q.sentence_template = 'Huruf ___ adalah huruf pertama dalam abjad Arab' THEN 'Alif'
        WHEN q.sentence_template = 'Bunyi huruf Ba adalah ___' THEN 'Ba'
        WHEN q.sentence_template = 'Huruf Jim memiliki ___ di bawah' THEN 'titik'
    END as correct_answer,
    CASE 
        WHEN q.sentence_template = 'Huruf Ba keluar dari ___' THEN 'Huruf Ba (ب) diucapkan dengan bibir'
        WHEN q.sentence_template = 'Huruf ___ berbentuk seperti perahu' THEN 'Huruf Jim (ج) berbentuk seperti perahu'
        WHEN q.sentence_template = 'Bunyi huruf Ta adalah ___' THEN 'Huruf Ta (ت) diucapkan "Ta"'
        WHEN q.sentence_template = 'Huruf ___ adalah huruf pertama dalam abjad Arab' THEN 'Alif adalah huruf pertama'
        WHEN q.sentence_template = 'Bunyi huruf Ba adalah ___' THEN 'Ba adalah bunyi huruf Ba'
        WHEN q.sentence_template = 'Huruf Jim memiliki ___ di bawah' THEN 'Jim memiliki titik di bawah'
    END as explanation
FROM questions q
WHERE q.question_type_id IN (
    SELECT id FROM question_types WHERE type_key IN ('drag_and_drop', 'fill_in_blank')
)
AND q.sentence_template IS NOT NULL;

-- ===================================
-- STEP 7: Verifikasi Results
-- ===================================

-- Count questions per type per sublesson
SELECT 
    rsl.title as sublesson_title,
    rsl.id as sublesson_id,
    qt.type_key,
    COUNT(q.id) as question_count
FROM roadmap_sub_lessons rsl
LEFT JOIN questions q ON rsl.id = q.sublesson_id
LEFT JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.type_key IS NOT NULL
GROUP BY rsl.id, rsl.title, qt.type_key
ORDER BY rsl.id, qt.type_key;

-- Detailed view of drag and drop questions
SELECT 
    rsl.title as sublesson_title,
    q.question_text,
    q.sentence_template,
    ARRAY_AGG(DISTINCT ddc.choice_text ORDER BY ddc.choice_text) as choices,
    dda.correct_answer
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
JOIN roadmap_sub_lessons rsl ON q.sublesson_id = rsl.id
LEFT JOIN drag_drop_choices ddc ON q.id = ddc.question_id
LEFT JOIN drag_drop_answers dda ON q.id = dda.question_id
WHERE qt.type_key = 'drag_and_drop'
GROUP BY rsl.id, rsl.title, q.id, q.question_text, q.sentence_template, dda.correct_answer
ORDER BY rsl.id, q.order_sequence
LIMIT 10;

-- Total summary
SELECT 
    qt.type_key,
    COUNT(q.id) as total_questions,
    COUNT(DISTINCT q.sublesson_id) as sublessons_with_questions
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
GROUP BY qt.type_key
ORDER BY qt.type_key;
