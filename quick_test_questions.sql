-- QUICK TEST VERSION: Hanya untuk sublesson_id = 1
-- Jalankan ini untuk testing cepat tanpa error

-- Add missing columns
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS instruction TEXT,
ADD COLUMN IF NOT EXISTS sentence_template TEXT;

-- Add question types
INSERT INTO question_types (type_key, label, description)
VALUES 
('drag_and_drop', 'Drag and Drop', 'Questions where users drag choices to fill blanks'),
('true_false', 'True/False', 'Questions with true or false answers'),
('short_answer', 'Short Answer', 'Questions requiring text input'),
('fill_in_blank', 'Fill in the Blank', 'Questions with blanks to fill'),
('voice_input', 'Voice Input', 'Questions requiring voice/speech input')
ON CONFLICT (type_key) DO NOTHING;

-- Clear old test data
DELETE FROM questions WHERE sublesson_id = 1 AND question_type_id IN (
    SELECT id FROM question_types WHERE type_key IN ('drag_and_drop', 'true_false', 'short_answer', 'fill_in_blank', 'voice_input')
);

-- Insert test questions for sublesson_id = 1
INSERT INTO questions (sublesson_id, question_text, question_type_id, order_sequence, instruction, sentence_template, created_at, updated_at)
VALUES 
-- Drag and Drop
(1, 'Lengkapi kalimat berikut dengan kata yang tepat', (SELECT id FROM question_types WHERE type_key = 'drag_and_drop'), 1, 'Seret kata ke tempat kosong', 'Huruf Ba keluar dari ___', NOW(), NOW()),
(1, 'Isi titik-titik dengan huruf yang sesuai', (SELECT id FROM question_types WHERE type_key = 'drag_and_drop'), 2, 'Seret kata ke tempat kosong', 'Huruf ___ berbentuk seperti perahu', NOW(), NOW()),

-- True/False
(1, 'Huruf Alif adalah huruf pertama dalam abjad Arab', (SELECT id FROM question_types WHERE type_key = 'true_false'), 3, NULL, NULL, NOW(), NOW()),
(1, 'Huruf Ba memiliki titik di atas', (SELECT id FROM question_types WHERE type_key = 'true_false'), 4, NULL, NULL, NOW(), NOW()),

-- Short Answer
(1, 'Sebutkan huruf Arab yang keluar dari mulut', (SELECT id FROM question_types WHERE type_key = 'short_answer'), 5, NULL, NULL, NOW(), NOW()),

-- Fill in Blank
(1, 'Lengkapi kalimat berikut', (SELECT id FROM question_types WHERE type_key = 'fill_in_blank'), 6, NULL, 'Huruf ___ adalah huruf pertama dalam abjad Arab', NOW(), NOW()),

-- Voice Input
(1, 'Ucapkan huruf berikut dengan benar', (SELECT id FROM question_types WHERE type_key = 'voice_input'), 7, NULL, NULL, NOW(), NOW());

-- Add drag drop choices
INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT q.id, 'mulut', 1 FROM questions q WHERE q.sentence_template = 'Huruf Ba keluar dari ___' AND q.sublesson_id = 1
UNION ALL
SELECT q.id, 'hidung', 2 FROM questions q WHERE q.sentence_template = 'Huruf Ba keluar dari ___' AND q.sublesson_id = 1
UNION ALL
SELECT q.id, 'telinga', 3 FROM questions q WHERE q.sentence_template = 'Huruf Ba keluar dari ___' AND q.sublesson_id = 1;

INSERT INTO drag_drop_choices (question_id, choice_text, order_sequence)
SELECT q.id, 'Jim', 1 FROM questions q WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu' AND q.sublesson_id = 1
UNION ALL
SELECT q.id, 'Ba', 2 FROM questions q WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu' AND q.sublesson_id = 1
UNION ALL
SELECT q.id, 'Ta', 3 FROM questions q WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu' AND q.sublesson_id = 1;

-- Add correct answers
INSERT INTO drag_drop_answers (question_id, correct_answer, explanation)
SELECT q.id, 'mulut', 'Huruf Ba keluar dari mulut' FROM questions q WHERE q.sentence_template = 'Huruf Ba keluar dari ___' AND q.sublesson_id = 1
UNION ALL
SELECT q.id, 'Jim', 'Huruf Jim berbentuk seperti perahu' FROM questions q WHERE q.sentence_template = 'Huruf ___ berbentuk seperti perahu' AND q.sublesson_id = 1
UNION ALL
SELECT q.id, 'Alif', 'Alif adalah huruf pertama' FROM questions q WHERE q.sentence_template = 'Huruf ___ adalah huruf pertama dalam abjad Arab' AND q.sublesson_id = 1;

-- Add question options for true/false
INSERT INTO question_options (question_id, option_text, is_correct, order_sequence)
SELECT q.id, 'true', true, 1 FROM questions q WHERE q.question_text = 'Huruf Alif adalah huruf pertama dalam abjad Arab' AND q.sublesson_id = 1
UNION ALL
SELECT q.id, 'false', false, 2 FROM questions q WHERE q.question_text = 'Huruf Alif adalah huruf pertama dalam abjad Arab' AND q.sublesson_id = 1
UNION ALL
SELECT q.id, 'true', false, 1 FROM questions q WHERE q.question_text = 'Huruf Ba memiliki titik di atas' AND q.sublesson_id = 1
UNION ALL
SELECT q.id, 'false', true, 2 FROM questions q WHERE q.question_text = 'Huruf Ba memiliki titik di atas' AND q.sublesson_id = 1;

-- Add question options for short answer and voice
INSERT INTO question_options (question_id, option_text, is_correct, order_sequence)
SELECT q.id, 'Ba', true, 1 FROM questions q WHERE q.question_text = 'Sebutkan huruf Arab yang keluar dari mulut' AND q.sublesson_id = 1
UNION ALL
SELECT q.id, 'Ba', true, 1 FROM questions q WHERE q.question_text = 'Ucapkan huruf berikut dengan benar' AND q.sublesson_id = 1;

-- Verify results
SELECT 
    q.id,
    q.question_text,
    qt.type_key,
    q.sentence_template,
    q.instruction
FROM questions q
JOIN question_types qt ON q.question_type_id = qt.id
WHERE q.sublesson_id = 1
ORDER BY q.order_sequence;
