-- Script sederhana untuk memperbaiki drag and drop question ID 823
-- Jalankan query ini satu per satu di Supabase SQL Editor

-- 1. Hapus data lama untuk question 823
DELETE FROM drag_and_drop_choices WHERE question_id = 823;
DELETE FROM drag_and_drop_blanks WHERE question_id = 823;

-- 2. Insert choices untuk question 823 (order_sequence = 3: "Bunyi huruf Ta adalah ___")
INSERT INTO drag_and_drop_choices (question_id, choice_text) VALUES
(823, 'Ta'),
(823, 'Ba'),
(823, 'Ma'),
(823, 'Na');

-- 3. Insert correct answer untuk question 823
INSERT INTO drag_and_drop_blanks (question_id, blank_index, correct_answer) VALUES
(823, 1, 'Ta');

-- 4. Verifikasi hasil
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
WHERE q.id = 823
GROUP BY q.id, q.question_text, q.order_sequence, q.sublesson_id;

-- 5. Lihat choices yang tersedia untuk question 823
SELECT * FROM drag_and_drop_choices WHERE question_id = 823;

-- 6. Lihat blank/correct answer untuk question 823
SELECT * FROM drag_and_drop_blanks WHERE question_id = 823;
