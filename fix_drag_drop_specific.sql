-- Script khusus untuk memperbaiki masalah drag and drop questions
-- Fokus pada perbaikan relasi dan data yang benar

-- ===================================
-- STEP 1: Cek dan hapus data lama yang bermasalah
-- ===================================

-- Hapus choices dan blanks untuk drag and drop questions yang ada
DELETE FROM drag_and_drop_choices WHERE question_id IN (
    SELECT id FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
);

DELETE FROM drag_and_drop_blanks WHERE question_id IN (
    SELECT id FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
);

-- ===================================
-- STEP 2: Insert sentence templates untuk drag_and_drop_questions
-- ===================================

-- Pastikan ada sentence templates untuk setiap order_sequence
INSERT INTO drag_and_drop_questions (question_type_id, instruction, sentence_template, created_at, updated_at)
SELECT 
    (SELECT id FROM question_types WHERE type_key = 'drag_and_drop'),
    'Seret kata ke tempat kosong',
    CASE 
        WHEN ROW_NUMBER() OVER (ORDER BY id) = 1 THEN 'Huruf Ba keluar dari ___'
        WHEN ROW_NUMBER() OVER (ORDER BY id) = 2 THEN 'Huruf ___ berbentuk seperti perahu'
        WHEN ROW_NUMBER() OVER (ORDER BY id) = 3 THEN 'Bunyi huruf Ta adalah ___'
        WHEN ROW_NUMBER() OVER (ORDER BY id) = 4 THEN 'Huruf ___ memiliki titik di bawah'
        WHEN ROW_NUMBER() OVER (ORDER BY id) = 5 THEN 'Bunyi huruf ___ adalah Ma'
    END,
    NOW(),
    NOW()
FROM (
    SELECT DISTINCT order_sequence as id 
    FROM questions 
    WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
    ORDER BY order_sequence
    LIMIT 5
) templates
ON CONFLICT DO NOTHING;

-- ===================================
-- STEP 3: Insert choices langsung ke questions
-- ===================================

-- Insert choices untuk setiap question berdasarkan order_sequence
WITH question_data AS (
    SELECT 
        q.id as question_id,
        q.order_sequence,
        q.sublesson_id
    FROM questions q
    WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
)
INSERT INTO drag_and_drop_choices (question_id, choice_text)
-- Choices untuk order_sequence = 1 (Huruf Ba keluar dari ___)
SELECT question_id, 'mulut' FROM question_data WHERE order_sequence = 1
UNION ALL
SELECT question_id, 'hidung' FROM question_data WHERE order_sequence = 1
UNION ALL
SELECT question_id, 'telinga' FROM question_data WHERE order_sequence = 1
UNION ALL
SELECT question_id, 'mata' FROM question_data WHERE order_sequence = 1

UNION ALL

-- Choices untuk order_sequence = 2 (Huruf ___ berbentuk seperti perahu)
SELECT question_id, 'Jim' FROM question_data WHERE order_sequence = 2
UNION ALL
SELECT question_id, 'Ba' FROM question_data WHERE order_sequence = 2
UNION ALL
SELECT question_id, 'Ta' FROM question_data WHERE order_sequence = 2
UNION ALL
SELECT question_id, 'Alif' FROM question_data WHERE order_sequence = 2

UNION ALL

-- Choices untuk order_sequence = 3 (Bunyi huruf Ta adalah ___)
SELECT question_id, 'Ta' FROM question_data WHERE order_sequence = 3
UNION ALL
SELECT question_id, 'Ba' FROM question_data WHERE order_sequence = 3
UNION ALL
SELECT question_id, 'Ma' FROM question_data WHERE order_sequence = 3
UNION ALL
SELECT question_id, 'Na' FROM question_data WHERE order_sequence = 3

UNION ALL

-- Choices untuk order_sequence = 4 (Huruf ___ memiliki titik di bawah)
SELECT question_id, 'Jim' FROM question_data WHERE order_sequence = 4
UNION ALL
SELECT question_id, 'Ba' FROM question_data WHERE order_sequence = 4
UNION ALL
SELECT question_id, 'Ya' FROM question_data WHERE order_sequence = 4
UNION ALL
SELECT question_id, 'Ta' FROM question_data WHERE order_sequence = 4

UNION ALL

-- Choices untuk order_sequence = 5 (Bunyi huruf ___ adalah Ma)
SELECT question_id, 'Mim' FROM question_data WHERE order_sequence = 5
UNION ALL
SELECT question_id, 'Ba' FROM question_data WHERE order_sequence = 5
UNION ALL
SELECT question_id, 'Ta' FROM question_data WHERE order_sequence = 5
UNION ALL
SELECT question_id, 'Na' FROM question_data WHERE order_sequence = 5;

-- ===================================
-- STEP 4: Insert correct answers
-- ===================================

WITH question_data AS (
    SELECT 
        q.id as question_id,
        q.order_sequence,
        q.sublesson_id
    FROM questions q
    WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
)
INSERT INTO drag_and_drop_blanks (question_id, blank_index, correct_answer)
-- Answers untuk order_sequence = 1 (Huruf Ba keluar dari ___)
SELECT question_id, 1, 'mulut' FROM question_data WHERE order_sequence = 1

UNION ALL

-- Answers untuk order_sequence = 2 (Huruf ___ berbentuk seperti perahu)
SELECT question_id, 1, 'Jim' FROM question_data WHERE order_sequence = 2

UNION ALL

-- Answers untuk order_sequence = 3 (Bunyi huruf Ta adalah ___)
SELECT question_id, 1, 'Ta' FROM question_data WHERE order_sequence = 3

UNION ALL

-- Answers untuk order_sequence = 4 (Huruf ___ memiliki titik di bawah)
SELECT question_id, 1, 'Jim' FROM question_data WHERE order_sequence = 4

UNION ALL

-- Answers untuk order_sequence = 5 (Bunyi huruf ___ adalah Ma)
SELECT question_id, 1, 'Mim' FROM question_data WHERE order_sequence = 5;

-- ===================================
-- STEP 5: Verifikasi hasil untuk SubLesson ID 7
-- ===================================

-- Cek questions drag and drop di SubLesson 7
SELECT 
    q.id as question_id,
    q.question_text,
    q.order_sequence,
    q.sublesson_id,
    COUNT(ddc.id) as choices_count,
    COUNT(ddb.id) as blanks_count
FROM questions q
LEFT JOIN drag_and_drop_choices ddc ON q.id = ddc.question_id
LEFT JOIN drag_and_drop_blanks ddb ON q.id = ddb.question_id
WHERE q.sublesson_id = 7 
  AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
GROUP BY q.id, q.question_text, q.order_sequence, q.sublesson_id
ORDER BY q.order_sequence;

-- Cek choices untuk question ID 823 (yang bermasalah)
SELECT 
    ddc.id,
    ddc.question_id,
    ddc.choice_text
FROM drag_and_drop_choices ddc
WHERE ddc.question_id = 823;

-- Cek blanks untuk question ID 823
SELECT 
    ddb.id,
    ddb.question_id,
    ddb.blank_index,
    ddb.correct_answer
FROM drag_and_drop_blanks ddb
WHERE ddb.question_id = 823;

-- Cek semua drag and drop questions
SELECT 
    'Total Questions' as info,
    COUNT(*) as count
FROM questions 
WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

SELECT 
    'Total Choices' as info,
    COUNT(*) as count
FROM drag_and_drop_choices;

SELECT 
    'Total Blanks' as info,
    COUNT(*) as count
FROM drag_and_drop_blanks;
