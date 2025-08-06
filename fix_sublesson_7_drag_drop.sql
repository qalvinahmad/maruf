-- Script untuk memperbaiki semua drag and drop questions di SubLesson 7
-- Jalankan ini di Supabase SQL Editor

-- 1. Hapus data lama untuk semua drag and drop questions di SubLesson 7
DELETE FROM drag_and_drop_choices 
WHERE question_id IN (
    SELECT id FROM questions 
    WHERE sublesson_id = 7 
    AND question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
);

DELETE FROM drag_and_drop_blanks 
WHERE question_id IN (
    SELECT id FROM questions 
    WHERE sublesson_id = 7 
    AND question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
);

-- 2. Insert choices dan answers berdasarkan order_sequence untuk SubLesson 7

-- Untuk order_sequence = 1 (question 821): "Lengkapi kalimat berikut dengan kata yang tepat"
-- Template: "Huruf Ba keluar dari ___"
INSERT INTO drag_and_drop_choices (question_id, choice_text)
SELECT 821, choice FROM (VALUES ('mulut'), ('hidung'), ('telinga'), ('mata')) AS choices(choice);

INSERT INTO drag_and_drop_blanks (question_id, blank_index, correct_answer) 
VALUES (821, 1, 'mulut');

-- Untuk order_sequence = 2 (question 822): "Isi titik-titik dengan huruf yang sesuai"
-- Template: "Huruf ___ berbentuk seperti perahu"
INSERT INTO drag_and_drop_choices (question_id, choice_text)
SELECT 822, choice FROM (VALUES ('Jim'), ('Ba'), ('Ta'), ('Alif')) AS choices(choice);

INSERT INTO drag_and_drop_blanks (question_id, blank_index, correct_answer) 
VALUES (822, 1, 'Jim');

-- Untuk order_sequence = 3 (question 823): "Pilih kata yang tepat untuk melengkapi kalimat"
-- Template: "Bunyi huruf Ta adalah ___"
INSERT INTO drag_and_drop_choices (question_id, choice_text)
SELECT 823, choice FROM (VALUES ('Ta'), ('Ba'), ('Ma'), ('Na')) AS choices(choice);

INSERT INTO drag_and_drop_blanks (question_id, blank_index, correct_answer) 
VALUES (823, 1, 'Ta');

-- Untuk order_sequence = 4 (question 824): "Seret huruf ke tempat yang kosong"
-- Template: "Huruf ___ memiliki titik di bawah"
INSERT INTO drag_and_drop_choices (question_id, choice_text)
SELECT 824, choice FROM (VALUES ('Jim'), ('Ba'), ('Ya'), ('Ta')) AS choices(choice);

INSERT INTO drag_and_drop_blanks (question_id, blank_index, correct_answer) 
VALUES (824, 1, 'Jim');

-- Untuk order_sequence = 5 (question 825): "Lengkapi kata dengan huruf yang benar"
-- Template: "Bunyi huruf ___ adalah Ma"
INSERT INTO drag_and_drop_choices (question_id, choice_text)
SELECT 825, choice FROM (VALUES ('Mim'), ('Ba'), ('Ta'), ('Na')) AS choices(choice);

INSERT INTO drag_and_drop_blanks (question_id, blank_index, correct_answer) 
VALUES (825, 1, 'Mim');

-- 3. Verifikasi semua questions di SubLesson 7
SELECT 
    q.id as question_id,
    q.question_text,
    q.order_sequence,
    q.sublesson_id,
    COUNT(DISTINCT ddc.id) as choices_count,
    COUNT(DISTINCT ddb.id) as blanks_count,
    STRING_AGG(DISTINCT ddc.choice_text, ', ' ORDER BY ddc.choice_text) as choices,
    STRING_AGG(DISTINCT ddb.correct_answer, ', ') as correct_answers
FROM questions q
LEFT JOIN drag_and_drop_choices ddc ON q.id = ddc.question_id
LEFT JOIN drag_and_drop_blanks ddb ON q.id = ddb.question_id
WHERE q.sublesson_id = 7 
  AND q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
GROUP BY q.id, q.question_text, q.order_sequence, q.sublesson_id
ORDER BY q.order_sequence;
