-- Add Fill-in-Blank Questions for All 13 SubLessons
-- This script adds comprehensive fill-in-blank questions across all sublessons

-- First, ensure required columns exist
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS instruction TEXT,
ADD COLUMN IF NOT EXISTS sentence_template TEXT,
ADD COLUMN IF NOT EXISTS order_sequence INTEGER;

-- Ensure fill_in_blank question type exists
INSERT INTO question_types (type_key, label, description)
VALUES ('fill_in_blank', 'Fill in the Blank', 'Questions with blanks to fill')
ON CONFLICT (type_key) DO NOTHING;

-- Get the question_type_id for fill_in_blank
DO $$
DECLARE
    fill_blank_id integer;
BEGIN
    SELECT id INTO fill_blank_id FROM question_types WHERE type_key = 'fill_in_blank';

    -- Add questions to the questions table
    INSERT INTO questions (sublesson_id, question_text, question_type_id, sentence_template, order_sequence, created_at, updated_at) VALUES

    -- SubLesson 1: Alif, Ba, Ta (Basic Letters)
    (1, 'Lengkapi kalimat tentang huruf pertama', fill_blank_id, 'Huruf _____ adalah huruf pertama dalam abjad Arab.', 1, NOW(), NOW()),
    (1, 'Lengkapi kalimat tentang bentuk Alif', fill_blank_id, 'Huruf _____ memiliki bentuk seperti garis lurus vertikal.', 2, NOW(), NOW()),
    (1, 'Lengkapi kalimat tentang kata "بابا"', fill_blank_id, 'Kata "بابا" (papa) dimulai dengan huruf _____.', 3, NOW(), NOW()),

    -- SubLesson 2: Tha, Jim, Haa (Continuing Letters)
    (2, 'Lengkapi kalimat tentang huruf dengan titik di atas', fill_blank_id, 'Huruf _____ memiliki titik di atasnya dan tertulis seperti "ث".', 1, NOW(), NOW()),
    (2, 'Lengkapi kalimat tentang huruf melengkung', fill_blank_id, 'Huruf _____ memiliki bentuk melengkung dengan titik di bawahnya.', 2, NOW(), NOW()),
    (2, 'Lengkapi kalimat tentang kata "جميل"', fill_blank_id, 'Kata "جميل" (indah) dimulai dengan huruf _____.', 3, NOW(), NOW()),

    -- SubLesson 3: Khaa, Dal, Dzal (Distinctive Letters)
    (3, 'Lengkapi kalimat tentang huruf "خ"', fill_blank_id, 'Huruf _____ tertulis seperti "خ" dan memiliki bunyi "kh".', 1, NOW(), NOW()),
    (3, 'Lengkapi kalimat tentang huruf setengah lingkaran', fill_blank_id, 'Huruf _____ memiliki bentuk seperti setengah lingkaran.', 2, NOW(), NOW()),
    (3, 'Lengkapi kalimat tentang huruf dengan titik di atas Dal', fill_blank_id, 'Huruf _____ sama seperti Dal tetapi memiliki titik di atasnya.', 3, NOW(), NOW()),

    -- SubLesson 4: Ra, Zay, Sin (Flowing Letters)
    (4, 'Lengkapi kalimat tentang huruf melengkung ke bawah', fill_blank_id, 'Huruf _____ memiliki bentuk yang melengkung ke bawah.', 1, NOW(), NOW()),
    (4, 'Lengkapi kalimat tentang huruf seperti Ra dengan titik', fill_blank_id, 'Huruf _____ sama seperti Ra tetapi memiliki titik di atasnya.', 2, NOW(), NOW()),
    (4, 'Lengkapi kalimat tentang huruf dengan tiga gigi', fill_blank_id, 'Huruf _____ memiliki tiga gigi kecil di atasnya.', 3, NOW(), NOW()),

    -- SubLesson 5: Syin, Shad, Dhad (Complex Letters)
    (5, 'Lengkapi kalimat tentang huruf seperti Sin dengan titik', fill_blank_id, 'Huruf _____ seperti Sin tetapi memiliki tiga titik di atasnya.', 1, NOW(), NOW()),
    (5, 'Lengkapi kalimat tentang huruf tebal "ص"', fill_blank_id, 'Huruf _____ adalah huruf tebal yang tertulis "ص".', 2, NOW(), NOW()),
    (5, 'Lengkapi kalimat tentang huruf tebal "ض"', fill_blank_id, 'Huruf _____ adalah huruf tebal yang tertulis "ض".', 3, NOW(), NOW()),

    -- SubLesson 6: Tha, Zhaa, Ain (Emphatic Letters)
    (6, 'Lengkapi kalimat tentang huruf tebal "ط"', fill_blank_id, 'Huruf _____ adalah huruf tebal yang tertulis "ط".', 1, NOW(), NOW()),
    (6, 'Lengkapi kalimat tentang huruf tebal "ظ"', fill_blank_id, 'Huruf _____ adalah huruf tebal yang tertulis "ظ".', 2, NOW(), NOW()),
    (6, 'Lengkapi kalimat tentang huruf unik "ع"', fill_blank_id, 'Huruf _____ memiliki bentuk yang unik dan tertulis "ع".', 3, NOW(), NOW()),

    -- SubLesson 7: Ghain, Fa, Qaf (Distinctive Sounds)
    (7, 'Lengkapi kalimat tentang huruf seperti Ain dengan titik', fill_blank_id, 'Huruf _____ seperti Ain tetapi memiliki titik di atasnya.', 1, NOW(), NOW()),
    (7, 'Lengkapi kalimat tentang huruf dengan lingkaran', fill_blank_id, 'Huruf _____ memiliki bentuk lingkaran dengan garis di atasnya.', 2, NOW(), NOW()),
    (7, 'Lengkapi kalimat tentang huruf dengan dua titik "ق"', fill_blank_id, 'Huruf _____ memiliki dua titik di atasnya dan tertulis "ق".', 3, NOW(), NOW()),

    -- SubLesson 8: Kaf, Lam, Mim (Common Letters)
    (8, 'Lengkapi kalimat tentang huruf "ك"', fill_blank_id, 'Huruf _____ memiliki bentuk seperti "ك" dan bunyi "k".', 1, NOW(), NOW()),
    (8, 'Lengkapi kalimat tentang huruf panjang "ل"', fill_blank_id, 'Huruf _____ memiliki bentuk panjang ke atas seperti "ل".', 2, NOW(), NOW()),
    (8, 'Lengkapi kalimat tentang huruf bulat "م"', fill_blank_id, 'Huruf _____ memiliki bentuk bulat dan tertulis "م".', 3, NOW(), NOW()),

    -- SubLesson 9: Nun, Waw, Ha (Flowing Letters)
    (9, 'Lengkapi kalimat tentang huruf dengan titik "ن"', fill_blank_id, 'Huruf _____ memiliki titik di atasnya dan tertulis "ن".', 1, NOW(), NOW()),
    (9, 'Lengkapi kalimat tentang huruf vokal "و"', fill_blank_id, 'Huruf _____ memiliki bentuk seperti "و" dan dapat menjadi vokal.', 2, NOW(), NOW()),
    (9, 'Lengkapi kalimat tentang ta marbutah', fill_blank_id, 'Huruf _____ di akhir kata tertulis "ة" yang disebut ta marbutah.', 3, NOW(), NOW()),

    -- SubLesson 10: Hamzah, Ya, Alif Maqsurah (Special Letters)
    (10, 'Lengkapi kalimat tentang tanda "ء"', fill_blank_id, 'Tanda _____ adalah tanda yang tertulis seperti "ء".', 1, NOW(), NOW()),
    (10, 'Lengkapi kalimat tentang huruf dengan dua titik bawah', fill_blank_id, 'Huruf _____ memiliki dua titik di bawahnya dan tertulis "ي".', 2, NOW(), NOW()),
    (10, 'Lengkapi kalimat tentang alif khusus', fill_blank_id, 'Alif _____ adalah alif yang tertulis seperti "ى".', 3, NOW(), NOW()),

    -- SubLesson 11: Fathah, Kasrah, Dhammah (Short Vowels)
    (11, 'Lengkapi kalimat tentang harakat di atas', fill_blank_id, 'Harakat _____ tertulis seperti garis miring di atas huruf.', 1, NOW(), NOW()),
    (11, 'Lengkapi kalimat tentang harakat di bawah', fill_blank_id, 'Harakat _____ tertulis seperti garis miring di bawah huruf.', 2, NOW(), NOW()),
    (11, 'Lengkapi kalimat tentang harakat seperti waw kecil', fill_blank_id, 'Harakat _____ tertulis seperti huruf waw kecil di atas huruf.', 3, NOW(), NOW()),

    -- SubLesson 12: Sukun, Tasydid, Tanwin (Special Marks)
    (12, 'Lengkapi kalimat tentang tanda tanpa harakat', fill_blank_id, 'Tanda _____ menunjukkan bahwa huruf tidak berharakat.', 1, NOW(), NOW()),
    (12, 'Lengkapi kalimat tentang tanda huruf ganda', fill_blank_id, 'Tanda _____ menunjukkan bahwa huruf dibaca ganda.', 2, NOW(), NOW()),
    (12, 'Lengkapi kalimat tentang nun sakinah', fill_blank_id, 'Tanda _____ adalah nun sakinah yang ditambahkan di akhir kata.', 3, NOW(), NOW()),

    -- SubLesson 13: Reading Practice (Complete Words)
    (13, 'Lengkapi kalimat tentang kata "الله"', fill_blank_id, 'Kata "الله" dibaca _____ dan artinya Allah.', 1, NOW(), NOW()),
    (13, 'Lengkapi kalimat tentang kata "بِسْمِ"', fill_blank_id, 'Kata "بِسْمِ" dibaca _____ dan artinya "dengan nama".', 2, NOW(), NOW()),
    (13, 'Lengkapi kalimat tentang kata "الرَّحْمَن"', fill_blank_id, 'Kata "الرَّحْمَن" dibaca _____ dan artinya "Yang Maha Pengasih".', 3, NOW(), NOW());

    -- First, add entries to fill_in_blank_questions table for each question
    INSERT INTO fill_in_blank_questions (sentence_template)
    SELECT sentence_template FROM questions WHERE question_type_id = fill_blank_id;

    -- Now add the corresponding answers to fill_in_blank_answers table using fill_in_blank_questions.id
    -- SubLesson 1 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Alif' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Huruf _____ adalah huruf pertama dalam abjad Arab.' AND q.question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Alif' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Huruf _____ memiliki bentuk seperti garis lurus vertikal.' AND q.question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Ba' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Kata "بابا" (papa) dimulai dengan huruf _____.' AND q.question_type_id = fill_blank_id;

    -- SubLesson 2 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Tha' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Huruf _____ memiliki titik di atasnya dan tertulis seperti "ث".' AND q.question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Jim' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Huruf _____ memiliki bentuk melengkung dengan titik di bawahnya.' AND q.question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Jim' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Kata "جميل" (indah) dimulai dengan huruf _____.' AND q.question_type_id = fill_blank_id;

    -- SubLesson 3 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Khaa' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Huruf _____ tertulis seperti "خ" dan memiliki bunyi "kh".' AND q.question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Dal' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Huruf _____ memiliki bentuk seperti setengah lingkaran.' AND q.question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Dzal' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Huruf _____ sama seperti Dal tetapi memiliki titik di atasnya.' AND q.question_type_id = fill_blank_id;

    -- SubLesson 4 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Ra' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Huruf _____ memiliki bentuk yang melengkung ke bawah.' AND q.question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Zay' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Huruf _____ sama seperti Ra tetapi memiliki titik di atasnya.' AND q.question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT fq.id, 1, 'Sin' FROM fill_in_blank_questions fq 
    JOIN questions q ON q.sentence_template = fq.sentence_template 
    WHERE q.sentence_template = 'Huruf _____ memiliki tiga gigi kecil di atasnya.' AND q.question_type_id = fill_blank_id;

    -- SubLesson 5 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Syin' FROM questions WHERE sentence_template = 'Huruf _____ seperti Sin tetapi memiliki tiga titik di atasnya.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Shad' FROM questions WHERE sentence_template = 'Huruf _____ adalah huruf tebal yang tertulis "ص".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Dhad' FROM questions WHERE sentence_template = 'Huruf _____ adalah huruf tebal yang tertulis "ض".' AND question_type_id = fill_blank_id;

    -- SubLesson 6 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Tha' FROM questions WHERE sentence_template = 'Huruf _____ adalah huruf tebal yang tertulis "ط".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Zhaa' FROM questions WHERE sentence_template = 'Huruf _____ adalah huruf tebal yang tertulis "ظ".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Ain' FROM questions WHERE sentence_template = 'Huruf _____ memiliki bentuk yang unik dan tertulis "ع".' AND question_type_id = fill_blank_id;

    -- SubLesson 7 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Ghain' FROM questions WHERE sentence_template = 'Huruf _____ seperti Ain tetapi memiliki titik di atasnya.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Fa' FROM questions WHERE sentence_template = 'Huruf _____ memiliki bentuk lingkaran dengan garis di atasnya.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Qaf' FROM questions WHERE sentence_template = 'Huruf _____ memiliki dua titik di atasnya dan tertulis "ق".' AND question_type_id = fill_blank_id;

    -- SubLesson 8 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Kaf' FROM questions WHERE sentence_template = 'Huruf _____ memiliki bentuk seperti "ك" dan bunyi "k".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Lam' FROM questions WHERE sentence_template = 'Huruf _____ memiliki bentuk panjang ke atas seperti "ل".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Mim' FROM questions WHERE sentence_template = 'Huruf _____ memiliki bentuk bulat dan tertulis "م".' AND question_type_id = fill_blank_id;

    -- SubLesson 9 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Nun' FROM questions WHERE sentence_template = 'Huruf _____ memiliki titik di atasnya dan tertulis "ن".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Waw' FROM questions WHERE sentence_template = 'Huruf _____ memiliki bentuk seperti "و" dan dapat menjadi vokal.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Ha' FROM questions WHERE sentence_template = 'Huruf _____ di akhir kata tertulis "ة" yang disebut ta marbutah.' AND question_type_id = fill_blank_id;

    -- SubLesson 10 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Hamzah' FROM questions WHERE sentence_template = 'Tanda _____ adalah tanda yang tertulis seperti "ء".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Ya' FROM questions WHERE sentence_template = 'Huruf _____ memiliki dua titik di bawahnya dan tertulis "ي".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Maqsurah' FROM questions WHERE sentence_template = 'Alif _____ adalah alif yang tertulis seperti "ى".' AND question_type_id = fill_blank_id;

    -- SubLesson 11 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Fathah' FROM questions WHERE sentence_template = 'Harakat _____ tertulis seperti garis miring di atas huruf.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Kasrah' FROM questions WHERE sentence_template = 'Harakat _____ tertulis seperti garis miring di bawah huruf.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Dhammah' FROM questions WHERE sentence_template = 'Harakat _____ tertulis seperti huruf waw kecil di atas huruf.' AND question_type_id = fill_blank_id;

    -- SubLesson 12 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Sukun' FROM questions WHERE sentence_template = 'Tanda _____ menunjukkan bahwa huruf tidak berharakat.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Tasydid' FROM questions WHERE sentence_template = 'Tanda _____ menunjukkan bahwa huruf dibaca ganda.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Tanwin' FROM questions WHERE sentence_template = 'Tanda _____ adalah nun sakinah yang ditambahkan di akhir kata.' AND question_type_id = fill_blank_id;

    -- SubLesson 13 Answers
    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Allah' FROM questions WHERE sentence_template = 'Kata "الله" dibaca _____ dan artinya Allah.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Bismi' FROM questions WHERE sentence_template = 'Kata "بِسْمِ" dibaca _____ dan artinya "dengan nama".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, blank_index, correct_answer) 
    SELECT id, 1, 'Ar-Rahman' FROM questions WHERE sentence_template = 'Kata "الرَّحْمَن" dibaca _____ dan artinya "Yang Maha Pengasih".' AND question_type_id = fill_blank_id;

END $$;

-- Verify the insertions
SELECT 
    q.id,
    q.sublesson_id,
    q.question_text,
    qt.type_key as question_type,
    fib.correct_answer
FROM questions q
LEFT JOIN question_types qt ON q.question_type_id = qt.id
LEFT JOIN fill_in_blank_answers fib ON q.id = fib.question_id
WHERE qt.type_key = 'fill_in_blank'
ORDER BY q.sublesson_id, q.id;
