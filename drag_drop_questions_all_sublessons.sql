-- SQL untuk menambahkan DRAG AND DROP questions ke semua sublesson
-- Sesuai dengan struktur database terbaru

-- ===================================
-- STEP 1: Setup Question Type
-- ===================================

-- Insert question type untuk drag_and_drop
INSERT INTO question_types (type_key, label, description)
VALUES ('drag_and_drop', 'Drag and Drop', 'Questions where users drag choices to fill blanks')
ON CONFLICT (type_key) DO NOTHING;

-- ===================================
-- STEP 2: Bersihkan Data Lama (Optional)
-- ===================================

-- Uncomment jika ingin hapus data lama
-- DELETE FROM questions WHERE question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');

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

-- Template sentence untuk drag and drop (satu record per template)
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

-- Map questions dengan drag_and_drop_questions berdasarkan order_sequence
WITH question_mapping AS (
    SELECT 
        q.id as question_id,
        q.order_sequence,
        q.sublesson_id
    FROM questions q
    WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
)
-- Insert choices untuk setiap question
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

-- Sample questions dengan details
SELECT 
    rsl.title as sublesson_title,
    q.id as question_id,
    q.question_text,
    ddq.instruction,
    ddq.sentence_template,
    STRING_AGG(DISTINCT ddc.choice_text, ', ') as choices,
    ddb.correct_answer
FROM questions q
JOIN roadmap_sub_lessons rsl ON q.sublesson_id = rsl.id
LEFT JOIN drag_and_drop_questions ddq ON ddq.question_type_id = q.question_type_id
LEFT JOIN drag_and_drop_choices ddc ON ddc.question_id = q.id
LEFT JOIN drag_and_drop_blanks ddb ON ddb.question_id = q.id
WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
GROUP BY rsl.id, rsl.title, q.id, q.question_text, q.order_sequence, ddq.instruction, ddq.sentence_template, ddb.correct_answer
ORDER BY rsl.id, q.order_sequence
LIMIT 10;

-- Total summary
SELECT 
    'drag_and_drop' as question_type,
    COUNT(q.id) as total_questions,
    COUNT(DISTINCT q.sublesson_id) as sublessons_with_questions,
    COUNT(DISTINCT ddc.id) as total_choices,
    COUNT(DISTINCT ddb.id) as total_blanks
FROM questions q
LEFT JOIN drag_and_drop_choices ddc ON ddc.question_id = q.id
LEFT JOIN drag_and_drop_blanks ddb ON ddb.question_id = q.id
WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop');
