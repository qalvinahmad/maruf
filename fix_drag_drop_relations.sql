-- Script untuk memperbaiki relasi drag and drop questions
-- Menghapus data lama dan membuat ulang dengan relasi yang benar

-- ===================================
-- STEP 1: Clean Up Old Data
-- ===================================

-- Delete existing drag and drop data
DELETE FROM drag_and_drop_blanks WHERE question_id IN (
    SELECT id FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
);

DELETE FROM drag_and_drop_choices WHERE question_id IN (
    SELECT id FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
);

DELETE FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

DELETE FROM drag_and_drop_questions WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

-- ===================================
-- STEP 2: Setup Question Type
-- ===================================

-- Insert question type untuk drag_and_drop
INSERT INTO question_types (type_key, label, description)
VALUES ('drag_and_drop', 'Drag and Drop', 'Questions where users drag choices to fill blanks')
ON CONFLICT (type_key) DO NOTHING;

-- ===================================
-- STEP 3: Insert Questions ke Table "questions"
-- ===================================

-- Template data untuk semua sublesson
WITH sublesson_data AS (
    SELECT id as sublesson_id
    FROM roadmap_sub_lessons 
    ORDER BY level_id, order_sequence
),
question_templates AS (
    SELECT * FROM (VALUES
        (1, 'Lengkapi kalimat berikut dengan kata yang tepat'),
        (2, 'Isi titik-titik dengan huruf yang sesuai'),
        (3, 'Pilih kata yang tepat untuk melengkapi kalimat'),
        (4, 'Seret huruf ke tempat yang kosong'),
        (5, 'Lengkapi kata dengan huruf yang benar')
    ) AS t(order_seq, question_text)
)
INSERT INTO questions (
    sublesson_id, 
    question_text, 
    question_type_id, 
    order_sequence,
    created_at,
    updated_at
)
SELECT 
    sd.sublesson_id,
    qt.question_text,
    (SELECT id FROM question_types WHERE type_key = 'drag_and_drop'),
    qt.order_seq,
    NOW(),
    NOW()
FROM sublesson_data sd
CROSS JOIN question_templates qt;

-- ===================================
-- STEP 4: Insert Detail ke "drag_and_drop_questions"
-- ===================================

-- Template sentence untuk drag and drop (tanpa question_id reference)
INSERT INTO drag_and_drop_questions (
    question_type_id,
    instruction,
    sentence_template,
    created_at,
    updated_at
)
VALUES 
((SELECT id FROM question_types WHERE type_key = 'drag_and_drop'), 'Seret kata ke tempat kosong', 'Huruf Ba keluar dari ___', NOW(), NOW()),
((SELECT id FROM question_types WHERE type_key = 'drag_and_drop'), 'Seret kata ke tempat kosong', 'Huruf ___ berbentuk seperti perahu', NOW(), NOW()),
((SELECT id FROM question_types WHERE type_key = 'drag_and_drop'), 'Seret kata ke tempat kosong', 'Bunyi huruf Ta adalah ___', NOW(), NOW()),
((SELECT id FROM question_types WHERE type_key = 'drag_and_drop'), 'Seret kata ke tempat kosong', 'Huruf ___ memiliki titik di bawah', NOW(), NOW()),
((SELECT id FROM question_types WHERE type_key = 'drag_and_drop'), 'Seret kata ke tempat kosong', 'Bunyi huruf ___ adalah Ma', NOW(), NOW());

-- ===================================
-- STEP 5: Insert Choices ke "drag_and_drop_choices"
-- ===================================

-- Insert choices langsung ke question_id yang sesuai berdasarkan order_sequence
WITH question_mapping AS (
    SELECT 
        q.id as question_id,
        q.order_sequence,
        q.sublesson_id
    FROM questions q
    WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
)
INSERT INTO drag_and_drop_choices (question_id, choice_text)
-- Choices untuk order_sequence = 1 (Huruf Ba keluar dari ___)
SELECT qm.question_id, 'mulut' FROM question_mapping qm WHERE qm.order_sequence = 1
UNION ALL
SELECT qm.question_id, 'hidung' FROM question_mapping qm WHERE qm.order_sequence = 1
UNION ALL
SELECT qm.question_id, 'telinga' FROM question_mapping qm WHERE qm.order_sequence = 1
UNION ALL
SELECT qm.question_id, 'mata' FROM question_mapping qm WHERE qm.order_sequence = 1

UNION ALL

-- Choices untuk order_sequence = 2 (Huruf ___ berbentuk seperti perahu)
SELECT qm.question_id, 'Jim' FROM question_mapping qm WHERE qm.order_sequence = 2
UNION ALL
SELECT qm.question_id, 'Ba' FROM question_mapping qm WHERE qm.order_sequence = 2
UNION ALL
SELECT qm.question_id, 'Ta' FROM question_mapping qm WHERE qm.order_sequence = 2
UNION ALL
SELECT qm.question_id, 'Alif' FROM question_mapping qm WHERE qm.order_sequence = 2

UNION ALL

-- Choices untuk order_sequence = 3 (Bunyi huruf Ta adalah ___)
SELECT qm.question_id, 'Ta' FROM question_mapping qm WHERE qm.order_sequence = 3
UNION ALL
SELECT qm.question_id, 'Ba' FROM question_mapping qm WHERE qm.order_sequence = 3
UNION ALL
SELECT qm.question_id, 'Ma' FROM question_mapping qm WHERE qm.order_sequence = 3
UNION ALL
SELECT qm.question_id, 'Na' FROM question_mapping qm WHERE qm.order_sequence = 3

UNION ALL

-- Choices untuk order_sequence = 4 (Huruf ___ memiliki titik di bawah)
SELECT qm.question_id, 'Jim' FROM question_mapping qm WHERE qm.order_sequence = 4
UNION ALL
SELECT qm.question_id, 'Ba' FROM question_mapping qm WHERE qm.order_sequence = 4
UNION ALL
SELECT qm.question_id, 'Ya' FROM question_mapping qm WHERE qm.order_sequence = 4
UNION ALL
SELECT qm.question_id, 'Ta' FROM question_mapping qm WHERE qm.order_sequence = 4

UNION ALL

-- Choices untuk order_sequence = 5 (Bunyi huruf ___ adalah Ma)
SELECT qm.question_id, 'Mim' FROM question_mapping qm WHERE qm.order_sequence = 5
UNION ALL
SELECT qm.question_id, 'Ba' FROM question_mapping qm WHERE qm.order_sequence = 5
UNION ALL
SELECT qm.question_id, 'Ta' FROM question_mapping qm WHERE qm.order_sequence = 5
UNION ALL
SELECT qm.question_id, 'Na' FROM question_mapping qm WHERE qm.order_sequence = 5;

-- ===================================
-- STEP 6: Insert Correct Answers ke "drag_and_drop_blanks"
-- ===================================

WITH question_mapping AS (
    SELECT 
        q.id as question_id,
        q.order_sequence,
        q.sublesson_id
    FROM questions q
    WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
)
INSERT INTO drag_and_drop_blanks (question_id, blank_index, correct_answer)
-- Answers untuk order_sequence = 1 (Huruf Ba keluar dari ___)
SELECT qm.question_id, 1, 'mulut' FROM question_mapping qm WHERE qm.order_sequence = 1

UNION ALL

-- Answers untuk order_sequence = 2 (Huruf ___ berbentuk seperti perahu)
SELECT qm.question_id, 1, 'Jim' FROM question_mapping qm WHERE qm.order_sequence = 2

UNION ALL

-- Answers untuk order_sequence = 3 (Bunyi huruf Ta adalah ___)
SELECT qm.question_id, 1, 'Ta' FROM question_mapping qm WHERE qm.order_sequence = 3

UNION ALL

-- Answers untuk order_sequence = 4 (Huruf ___ memiliki titik di bawah)
SELECT qm.question_id, 1, 'Jim' FROM question_mapping qm WHERE qm.order_sequence = 4

UNION ALL

-- Answers untuk order_sequence = 5 (Bunyi huruf ___ adalah Ma)
SELECT qm.question_id, 1, 'Mim' FROM question_mapping qm WHERE qm.order_sequence = 5;

-- ===================================
-- STEP 7: Verifikasi Data
-- ===================================

-- Count total questions created per sublesson
SELECT 
    rsl.title as sublesson_title,
    rsl.id as sublesson_id,
    COUNT(q.id) as drag_drop_questions_count
FROM roadmap_sub_lessons rsl
LEFT JOIN questions q ON rsl.id = q.sublesson_id
WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
GROUP BY rsl.id, rsl.title
ORDER BY rsl.id;

-- Test specific question untuk SubLesson ID 7
SELECT 
    q.id as question_id,
    q.question_text,
    q.order_sequence,
    ddq.instruction,
    ddq.sentence_template,
    CASE q.order_sequence
        WHEN 1 THEN 'mulut, hidung, telinga, mata'
        WHEN 2 THEN 'Jim, Ba, Ta, Alif'
        WHEN 3 THEN 'Ta, Ba, Ma, Na'
        WHEN 4 THEN 'Jim, Ba, Ya, Ta'
        WHEN 5 THEN 'Mim, Ba, Ta, Na'
    END as expected_choices,
    CASE q.order_sequence
        WHEN 1 THEN 'mulut'
        WHEN 2 THEN 'Jim'
        WHEN 3 THEN 'Ta'
        WHEN 4 THEN 'Jim'
        WHEN 5 THEN 'Mim'
    END as expected_correct_answer
FROM questions q
LEFT JOIN drag_and_drop_questions ddq ON ddq.question_type_id = q.question_type_id
    AND ddq.id = (
        SELECT id FROM drag_and_drop_questions ddq2 
        WHERE ddq2.question_type_id = q.question_type_id 
        ORDER BY ddq2.id 
        OFFSET (q.order_sequence - 1) 
        LIMIT 1
    )
WHERE q.sublesson_id = 7 
  AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
ORDER BY q.order_sequence;

-- Total summary
SELECT 
    'drag_and_drop' as question_type,
    (SELECT COUNT(*) FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')) as total_questions,
    (SELECT COUNT(DISTINCT sublesson_id) FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')) as sublessons_with_questions,
    (SELECT COUNT(*) FROM drag_and_drop_choices) as total_choices,
    (SELECT COUNT(*) FROM drag_and_drop_blanks) as total_blanks;

-- Debug query untuk melihat masalah
SELECT 
    'Questions per sublesson' as info,
    COUNT(*) as total_rows
FROM questions 
WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

SELECT 
    'drag_and_drop_questions templates' as info,
    COUNT(*) as total_templates
FROM drag_and_drop_questions;

-- Check if there are duplicate questions
SELECT 
    sublesson_id,
    order_sequence,
    COUNT(*) as question_count
FROM questions 
WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
GROUP BY sublesson_id, order_sequence
HAVING COUNT(*) > 1
ORDER BY sublesson_id, order_sequence
LIMIT 10;
