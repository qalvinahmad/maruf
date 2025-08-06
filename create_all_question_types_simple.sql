-- SIMPLE VERSION: SQL untuk menambahkan semua jenis soal ke semua sublesson
-- Versi yang lebih sederhana dan bebas syntax error

-- ===================================
-- STEP 1: Setup Database Structure
-- ===================================

-- Tambahkan kolom yang diperlukan
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS instruction TEXT,
ADD COLUMN IF NOT EXISTS sentence_template TEXT;

-- Insert question types
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
-- STEP 2: Insert Basic Questions for All Sublessons
-- ===================================

-- Get question type IDs first
DO $$
DECLARE
    drag_drop_id integer;
    true_false_id integer;
    short_answer_id integer;
    fill_blank_id integer;
    voice_input_id integer;
    sublesson_record RECORD;
BEGIN
    -- Get question type IDs
    SELECT id INTO drag_drop_id FROM question_types WHERE type_key = 'drag_and_drop';
    SELECT id INTO true_false_id FROM question_types WHERE type_key = 'true_false';
    SELECT id INTO short_answer_id FROM question_types WHERE type_key = 'short_answer';
    SELECT id INTO fill_blank_id FROM question_types WHERE type_key = 'fill_in_blank';
    SELECT id INTO voice_input_id FROM question_types WHERE type_key = 'voice_input';

    -- Loop through all sublessons
    FOR sublesson_record IN SELECT id FROM roadmap_sub_lessons ORDER BY level_id, order_sequence
    LOOP
        -- Insert drag and drop questions
        INSERT INTO questions (sublesson_id, question_text, question_type_id, order_sequence, instruction, sentence_template, created_at, updated_at)
        VALUES 
        (sublesson_record.id, 'Lengkapi kalimat berikut dengan kata yang tepat', drag_drop_id, 1, 'Seret kata ke tempat kosong', 'Huruf Ba keluar dari ___', NOW(), NOW()),
        (sublesson_record.id, 'Isi titik-titik dengan huruf yang sesuai', drag_drop_id, 2, 'Seret kata ke tempat kosong', 'Huruf ___ berbentuk seperti perahu', NOW(), NOW()),
        (sublesson_record.id, 'Pilih kata yang tepat untuk melengkapi kalimat', drag_drop_id, 3, 'Seret kata ke tempat kosong', 'Bunyi huruf Ta adalah ___', NOW(), NOW());
        
        -- Insert true/false questions
        INSERT INTO questions (sublesson_id, question_text, question_type_id, order_sequence, created_at, updated_at)
        VALUES 
        (sublesson_record.id, 'Huruf Alif adalah huruf pertama dalam abjad Arab', true_false_id, 4, NOW(), NOW()),
        (sublesson_record.id, 'Huruf Ba memiliki titik di atas', true_false_id, 5, NOW(), NOW()),
        (sublesson_record.id, 'Huruf Jim berbentuk seperti perahu', true_false_id, 6, NOW(), NOW());
        
        -- Insert short answer questions
        INSERT INTO questions (sublesson_id, question_text, question_type_id, order_sequence, created_at, updated_at)
        VALUES 
        (sublesson_record.id, 'Sebutkan huruf Arab yang keluar dari mulut', short_answer_id, 7, NOW(), NOW()),
        (sublesson_record.id, 'Tuliskan bunyi huruf Ta dalam bahasa Indonesia', short_answer_id, 8, NOW(), NOW()),
        (sublesson_record.id, 'Sebutkan nama huruf yang berbentuk seperti perahu', short_answer_id, 9, NOW(), NOW());
        
        -- Insert fill in blank questions
        INSERT INTO questions (sublesson_id, question_text, question_type_id, order_sequence, sentence_template, created_at, updated_at)
        VALUES 
        (sublesson_record.id, 'Lengkapi kalimat berikut', fill_blank_id, 10, 'Huruf ___ adalah huruf pertama dalam abjad Arab', NOW(), NOW()),
        (sublesson_record.id, 'Isi bagian yang kosong', fill_blank_id, 11, 'Bunyi huruf Ba adalah ___', NOW(), NOW()),
        (sublesson_record.id, 'Lengkapi pernyataan ini', fill_blank_id, 12, 'Huruf Jim memiliki ___ di bawah', NOW(), NOW());
        
        -- Insert voice input questions
        INSERT INTO questions (sublesson_id, question_text, question_type_id, order_sequence, created_at, updated_at)
        VALUES 
        (sublesson_record.id, 'Ucapkan huruf berikut dengan benar', voice_input_id, 13, NOW(), NOW()),
        (sublesson_record.id, 'Lafalkan bunyi huruf ini', voice_input_id, 14, NOW(), NOW()),
        (sublesson_record.id, 'Ucapkan nama huruf yang ditampilkan', voice_input_id, 15, NOW(), NOW());
        
    END LOOP;
END $$;

-- ===================================
-- STEP 3: Insert Question Options
-- ===================================

-- True/False options - TRUE options
INSERT INTO question_options (question_id, option_text, is_correct, order_sequence)
SELECT 
    q.id,
    'true',
    CASE 
        WHEN q.question_text LIKE '%Huruf Alif adalah huruf pertama%' THEN true
        WHEN q.question_text LIKE '%Huruf Ba memiliki titik di atas%' THEN false  
        WHEN q.question_text LIKE '%Huruf Jim berbentuk seperti perahu%' THEN true
        ELSE false 
    END,
    1
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.type_key = 'true_false';

-- True/False options - FALSE options
INSERT INTO question_options (question_id, option_text, is_correct, order_sequence)
SELECT 
    q.id,
    'false',
    CASE 
        WHEN q.question_text LIKE '%Huruf Alif adalah huruf pertama%' THEN false
        WHEN q.question_text LIKE '%Huruf Ba memiliki titik di atas%' THEN true
        WHEN q.question_text LIKE '%Huruf Jim berbentuk seperti perahu%' THEN false
        ELSE true 
    END,
    2
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.type_key = 'true_false';

-- Short Answer options (correct answers)
INSERT INTO question_options (question_id, option_text, is_correct, order_sequence)
SELECT 
    q.id,
    CASE 
        WHEN q.question_text LIKE '%huruf Arab yang keluar dari mulut%' THEN 'Ba'
        WHEN q.question_text LIKE '%bunyi huruf Ta%' THEN 'Ta'
        WHEN q.question_text LIKE '%berbentuk seperti perahu%' THEN 'Jim'
        ELSE 'Answer'
    END,
    true,
    1
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.type_key = 'short_answer';

-- Voice Input options (target sounds)
INSERT INTO question_options (question_id, option_text, is_correct, order_sequence)
SELECT 
    q.id,
    CASE 
        WHEN q.order_sequence = 13 THEN 'Ba'
        WHEN q.order_sequence = 14 THEN 'Ta'
        WHEN q.order_sequence = 15 THEN 'Jim'
        ELSE 'Sound'
    END,
    true,
    1
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.type_key = 'voice_input';

-- ===================================
-- STEP 4: Insert Drag Drop Choices
-- ===================================

-- Choices for "Huruf Ba keluar dari ___"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT q.id, 'mulut', 1 FROM questions q WHERE q.sentence_template = 'Huruf Ba keluar dari ___'
UNION ALL
SELECT q.id, 'hidung', 2 FROM questions q WHERE q.sentence_template = 'Huruf Ba keluar dari ___'
UNION ALL
SELECT q.id, 'telinga', 3 FROM questions q WHERE q.sentence_template = 'Huruf Ba keluar dari ___'
UNION ALL
SELECT q.id, 'mata', 4 FROM questions q WHERE q.sentence_template = 'Huruf Ba keluar dari ___';

-- Choices for "Huruf ___ berbentuk seperti perahu"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT q.id, 'Jim', 1 FROM questions q WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu'
UNION ALL
SELECT q.id, 'Ba', 2 FROM questions q WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu'
UNION ALL
SELECT q.id, 'Ta', 3 FROM questions q WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu'
UNION ALL
SELECT q.id, 'Alif', 4 FROM questions q WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu';

-- Choices for "Bunyi huruf Ta adalah ___"
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT q.id, 'Ta', 1 FROM questions q WHERE q.sentence_template = 'Bunyi huruf Ta adalah ___'
UNION ALL
SELECT q.id, 'Ba', 2 FROM questions q WHERE q.sentence_template = 'Bunyi huruf Ta adalah ___'
UNION ALL
SELECT q.id, 'Ma', 3 FROM questions q WHERE q.sentence_template = 'Bunyi huruf Ta adalah ___'
UNION ALL
SELECT q.id, 'Na', 4 FROM questions q WHERE q.sentence_template = 'Bunyi huruf Ta adalah ___';

-- ===================================
-- STEP 5: Insert Correct Answers
-- ===================================

-- Drag and Drop answers
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
    END,
    CASE 
        WHEN q.sentence_template = 'Huruf Ba keluar dari ___' THEN 'Huruf Ba (ب) diucapkan dengan bibir'
        WHEN q.sentence_template = 'Huruf ___ berbentuk seperti perahu' THEN 'Huruf Jim (ج) berbentuk seperti perahu'
        WHEN q.sentence_template = 'Bunyi huruf Ta adalah ___' THEN 'Huruf Ta (ت) diucapkan "Ta"'
        WHEN q.sentence_template = 'Huruf ___ adalah huruf pertama dalam abjad Arab' THEN 'Alif adalah huruf pertama'
        WHEN q.sentence_template = 'Bunyi huruf Ba adalah ___' THEN 'Ba adalah bunyi huruf Ba'
        WHEN q.sentence_template = 'Huruf Jim memiliki ___ di bawah' THEN 'Jim memiliki titik di bawah'
    END
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.type_key IN ('drag_and_drop', 'fill_in_blank')
AND q.sentence_template IS NOT NULL;

-- ===================================
-- STEP 6: Verification Queries
-- ===================================

-- Count total questions created
SELECT 
    COUNT(*) as total_questions_created,
    COUNT(DISTINCT sublesson_id) as sublessons_affected
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.type_key IN ('drag_and_drop', 'true_false', 'short_answer', 'fill_in_blank', 'voice_input');

-- Count by question type
SELECT 
    qt.type_key,
    COUNT(q.id) as question_count,
    COUNT(DISTINCT q.sublesson_id) as sublessons_count
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE qt.type_key IN ('drag_and_drop', 'true_false', 'short_answer', 'fill_in_blank', 'voice_input')
GROUP BY qt.type_key
ORDER BY qt.type_key;

-- Sample drag and drop questions with choices
SELECT 
    rsl.title as sublesson_title,
    q.question_text,
    q.sentence_template,
    STRING_AGG(ddc.choice_text, ', ' ORDER BY ddc.order_sequence) as choices,
    dda.correct_answer
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
JOIN roadmap_sub_lessons rsl ON q.sublesson_id = rsl.id
LEFT JOIN drag_drop_choices ddc ON q.id = ddc.question_id
LEFT JOIN drag_drop_answers dda ON q.id = dda.question_id
WHERE qt.type_key = 'drag_and_drop'
GROUP BY rsl.id, rsl.title, q.id, q.question_text, q.sentence_template, dda.correct_answer
ORDER BY rsl.id, q.order_sequence
LIMIT 5;
