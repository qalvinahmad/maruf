-- SIMPLE VERSION: Add Fill-in-Blank Questions without sentence_template
-- Use this if the main version fails due to missing columns

-- First, ensure fill_in_blank question type exists
INSERT INTO question_types (type_key, label, description)
VALUES ('fill_in_blank', 'Fill in the Blank', 'Questions with blanks to fill')
ON CONFLICT (type_key) DO NOTHING;

-- Get the question_type_id for fill_in_blank and add questions
DO $$
DECLARE
    fill_blank_id integer;
BEGIN
    SELECT id INTO fill_blank_id FROM question_types WHERE type_key = 'fill_in_blank';

    -- Add questions to the questions table (basic structure only)
    INSERT INTO questions (sublesson_id, question_text, question_type_id) VALUES

    -- SubLesson 1: Alif, Ba, Ta (Basic Letters)
    (1, 'Huruf _____ adalah huruf pertama dalam abjad Arab.', fill_blank_id),
    (1, 'Huruf _____ memiliki bentuk seperti garis lurus vertikal.', fill_blank_id),
    (1, 'Kata "بابا" (papa) dimulai dengan huruf _____.', fill_blank_id),

    -- SubLesson 2: Tha, Jim, Haa (Continuing Letters)
    (2, 'Huruf _____ memiliki titik di atasnya dan tertulis seperti "ث".', fill_blank_id),
    (2, 'Huruf _____ memiliki bentuk melengkung dengan titik di bawahnya.', fill_blank_id),
    (2, 'Kata "جميل" (indah) dimulai dengan huruf _____.', fill_blank_id),

    -- SubLesson 3: Khaa, Dal, Dzal (Distinctive Letters)
    (3, 'Huruf _____ tertulis seperti "خ" dan memiliki bunyi "kh".', fill_blank_id),
    (3, 'Huruf _____ memiliki bentuk seperti setengah lingkaran.', fill_blank_id),
    (3, 'Huruf _____ sama seperti Dal tetapi memiliki titik di atasnya.', fill_blank_id),

    -- SubLesson 4: Ra, Zay, Sin (Flowing Letters)
    (4, 'Huruf _____ memiliki bentuk yang melengkung ke bawah.', fill_blank_id),
    (4, 'Huruf _____ sama seperti Ra tetapi memiliki titik di atasnya.', fill_blank_id),
    (4, 'Huruf _____ memiliki tiga gigi kecil di atasnya.', fill_blank_id),

    -- SubLesson 5: Syin, Shad, Dhad (Complex Letters)
    (5, 'Huruf _____ seperti Sin tetapi memiliki tiga titik di atasnya.', fill_blank_id),
    (5, 'Huruf _____ adalah huruf tebal yang tertulis "ص".', fill_blank_id),
    (5, 'Huruf _____ adalah huruf tebal yang tertulis "ض".', fill_blank_id),

    -- SubLesson 6: Tha, Zhaa, Ain (Emphatic Letters)
    (6, 'Huruf _____ adalah huruf tebal yang tertulis "ط".', fill_blank_id),
    (6, 'Huruf _____ adalah huruf tebal yang tertulis "ظ".', fill_blank_id),
    (6, 'Huruf _____ memiliki bentuk yang unik dan tertulis "ع".', fill_blank_id),

    -- SubLesson 7: Ghain, Fa, Qaf (Distinctive Sounds)
    (7, 'Huruf _____ seperti Ain tetapi memiliki titik di atasnya.', fill_blank_id),
    (7, 'Huruf _____ memiliki bentuk lingkaran dengan garis di atasnya.', fill_blank_id),
    (7, 'Huruf _____ memiliki dua titik di atasnya dan tertulis "ق".', fill_blank_id),

    -- SubLesson 8: Kaf, Lam, Mim (Common Letters)
    (8, 'Huruf _____ memiliki bentuk seperti "ك" dan bunyi "k".', fill_blank_id),
    (8, 'Huruf _____ memiliki bentuk panjang ke atas seperti "ل".', fill_blank_id),
    (8, 'Huruf _____ memiliki bentuk bulat dan tertulis "م".', fill_blank_id),

    -- SubLesson 9: Nun, Waw, Ha (Flowing Letters)
    (9, 'Huruf _____ memiliki titik di atasnya dan tertulis "ن".', fill_blank_id),
    (9, 'Huruf _____ memiliki bentuk seperti "و" dan dapat menjadi vokal.', fill_blank_id),
    (9, 'Huruf _____ di akhir kata tertulis "ة" yang disebut ta marbutah.', fill_blank_id),

    -- SubLesson 10: Hamzah, Ya, Alif Maqsurah (Special Letters)
    (10, 'Tanda _____ adalah tanda yang tertulis seperti "ء".', fill_blank_id),
    (10, 'Huruf _____ memiliki dua titik di bawahnya dan tertulis "ي".', fill_blank_id),
    (10, 'Alif _____ adalah alif yang tertulis seperti "ى".', fill_blank_id),

    -- SubLesson 11: Fathah, Kasrah, Dhammah (Short Vowels)
    (11, 'Harakat _____ tertulis seperti garis miring di atas huruf.', fill_blank_id),
    (11, 'Harakat _____ tertulis seperti garis miring di bawah huruf.', fill_blank_id),
    (11, 'Harakat _____ tertulis seperti huruf waw kecil di atas huruf.', fill_blank_id),

    -- SubLesson 12: Sukun, Tasydid, Tanwin (Special Marks)
    (12, 'Tanda _____ menunjukkan bahwa huruf tidak berharakat.', fill_blank_id),
    (12, 'Tanda _____ menunjukkan bahwa huruf dibaca ganda.', fill_blank_id),
    (12, 'Tanda _____ adalah nun sakinah yang ditambahkan di akhir kata.', fill_blank_id),

    -- SubLesson 13: Reading Practice (Complete Words)
    (13, 'Kata "الله" dibaca _____ dan artinya Allah.', fill_blank_id),
    (13, 'Kata "بِسْمِ" dibaca _____ dan artinya "dengan nama".', fill_blank_id),
    (13, 'Kata "الرَّحْمَن" dibaca _____ dan artinya "Yang Maha Pengasih".', fill_blank_id);

    -- Now add the corresponding answers to fill_in_blank_answers table
    -- SubLesson 1 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Alif', ARRAY['الف', 'ا'] FROM questions WHERE question_text = 'Huruf _____ adalah huruf pertama dalam abjad Arab.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Alif', ARRAY['الف', 'ا'] FROM questions WHERE question_text = 'Huruf _____ memiliki bentuk seperti garis lurus vertikal.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Ba', ARRAY['ب', 'باء'] FROM questions WHERE question_text = 'Kata "بابا" (papa) dimulai dengan huruf _____.' AND question_type_id = fill_blank_id;

    -- SubLesson 2 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Tha', ARRAY['ث', 'ثاء'] FROM questions WHERE question_text = 'Huruf _____ memiliki titik di atasnya dan tertulis seperti "ث".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Jim', ARRAY['ج', 'جيم'] FROM questions WHERE question_text = 'Huruf _____ memiliki bentuk melengkung dengan titik di bawahnya.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Jim', ARRAY['ج', 'جيم'] FROM questions WHERE question_text = 'Kata "جميل" (indah) dimulai dengan huruf _____.' AND question_type_id = fill_blank_id;

    -- SubLesson 3 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Khaa', ARRAY['خ', 'خاء'] FROM questions WHERE question_text = 'Huruf _____ tertulis seperti "خ" dan memiliki bunyi "kh".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Dal', ARRAY['د', 'دال'] FROM questions WHERE question_text = 'Huruf _____ memiliki bentuk seperti setengah lingkaran.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Dzal', ARRAY['ذ', 'ذال'] FROM questions WHERE question_text = 'Huruf _____ sama seperti Dal tetapi memiliki titik di atasnya.' AND question_type_id = fill_blank_id;

    -- SubLesson 4 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Ra', ARRAY['ر', 'راء'] FROM questions WHERE question_text = 'Huruf _____ memiliki bentuk yang melengkung ke bawah.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Zay', ARRAY['ز', 'زاي'] FROM questions WHERE question_text = 'Huruf _____ sama seperti Ra tetapi memiliki titik di atasnya.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Sin', ARRAY['س', 'سين'] FROM questions WHERE question_text = 'Huruf _____ memiliki tiga gigi kecil di atasnya.' AND question_type_id = fill_blank_id;

    -- SubLesson 5 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Syin', ARRAY['ش', 'شين'] FROM questions WHERE question_text = 'Huruf _____ seperti Sin tetapi memiliki tiga titik di atasnya.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Shad', ARRAY['ص', 'صاد'] FROM questions WHERE question_text = 'Huruf _____ adalah huruf tebal yang tertulis "ص".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Dhad', ARRAY['ض', 'ضاد'] FROM questions WHERE question_text = 'Huruf _____ adalah huruf tebal yang tertulis "ض".' AND question_type_id = fill_blank_id;

    -- SubLesson 6 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Tha', ARRAY['ط', 'طاء'] FROM questions WHERE question_text = 'Huruf _____ adalah huruf tebal yang tertulis "ط".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Zhaa', ARRAY['ظ', 'ظاء'] FROM questions WHERE question_text = 'Huruf _____ adalah huruf tebal yang tertulis "ظ".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Ain', ARRAY['ع', 'عين'] FROM questions WHERE question_text = 'Huruf _____ memiliki bentuk yang unik dan tertulis "ع".' AND question_type_id = fill_blank_id;

    -- SubLesson 7 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Ghain', ARRAY['غ', 'غين'] FROM questions WHERE question_text = 'Huruf _____ seperti Ain tetapi memiliki titik di atasnya.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Fa', ARRAY['ف', 'فاء'] FROM questions WHERE question_text = 'Huruf _____ memiliki bentuk lingkaran dengan garis di atasnya.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Qaf', ARRAY['ق', 'قاف'] FROM questions WHERE question_text = 'Huruf _____ memiliki dua titik di atasnya dan tertulis "ق".' AND question_type_id = fill_blank_id;

    -- SubLesson 8 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Kaf', ARRAY['ك', 'كاف'] FROM questions WHERE question_text = 'Huruf _____ memiliki bentuk seperti "ك" dan bunyi "k".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Lam', ARRAY['ل', 'لام'] FROM questions WHERE question_text = 'Huruf _____ memiliki bentuk panjang ke atas seperti "ل".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Mim', ARRAY['م', 'ميم'] FROM questions WHERE question_text = 'Huruf _____ memiliki bentuk bulat dan tertulis "م".' AND question_type_id = fill_blank_id;

    -- SubLesson 9 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Nun', ARRAY['ن', 'نون'] FROM questions WHERE question_text = 'Huruf _____ memiliki titik di atasnya dan tertulis "ن".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Waw', ARRAY['و', 'واو'] FROM questions WHERE question_text = 'Huruf _____ memiliki bentuk seperti "و" dan dapat menjadi vokal.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Ha', ARRAY['ه', 'هاء', 'Ta Marbutah'] FROM questions WHERE question_text = 'Huruf _____ di akhir kata tertulis "ة" yang disebut ta marbutah.' AND question_type_id = fill_blank_id;

    -- SubLesson 10 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Hamzah', ARRAY['ء', 'همزة'] FROM questions WHERE question_text = 'Tanda _____ adalah tanda yang tertulis seperti "ء".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Ya', ARRAY['ي', 'ياء'] FROM questions WHERE question_text = 'Huruf _____ memiliki dua titik di bawahnya dan tertulis "ي".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Maqsurah', ARRAY['مقصورة', 'Maksura'] FROM questions WHERE question_text = 'Alif _____ adalah alif yang tertulis seperti "ى".' AND question_type_id = fill_blank_id;

    -- SubLesson 11 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Fathah', ARRAY['فتحة', 'Fat-hah'] FROM questions WHERE question_text = 'Harakat _____ tertulis seperti garis miring di atas huruf.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Kasrah', ARRAY['كسرة', 'Kas-rah'] FROM questions WHERE question_text = 'Harakat _____ tertulis seperti garis miring di bawah huruf.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Dhammah', ARRAY['ضمة', 'Dham-mah'] FROM questions WHERE question_text = 'Harakat _____ tertulis seperti huruf waw kecil di atas huruf.' AND question_type_id = fill_blank_id;

    -- SubLesson 12 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Sukun', ARRAY['سكون', 'Su-kun'] FROM questions WHERE question_text = 'Tanda _____ menunjukkan bahwa huruf tidak berharakat.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Tasydid', ARRAY['تشديد', 'Shaddah'] FROM questions WHERE question_text = 'Tanda _____ menunjukkan bahwa huruf dibaca ganda.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Tanwin', ARRAY['تنوين', 'Tan-win'] FROM questions WHERE question_text = 'Tanda _____ adalah nun sakinah yang ditambahkan di akhir kata.' AND question_type_id = fill_blank_id;

    -- SubLesson 13 Answers
    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Allah', ARRAY['الله', 'Al-lah'] FROM questions WHERE question_text = 'Kata "الله" dibaca _____ dan artinya Allah.' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Bismi', ARRAY['بسم', 'Bis-mi'] FROM questions WHERE question_text = 'Kata "بِسْمِ" dibaca _____ dan artinya "dengan nama".' AND question_type_id = fill_blank_id;

    INSERT INTO fill_in_blank_answers (question_id, correct_answer, alternative_answers) 
    SELECT id, 'Ar-Rahman', ARRAY['الرحمن', 'Rahman'] FROM questions WHERE question_text = 'Kata "الرَّحْمَن" dibaca _____ dan artinya "Yang Maha Pengasih".' AND question_type_id = fill_blank_id;

END $$;

-- Verify the insertions
SELECT 
    q.id,
    q.sublesson_id,
    q.question_text,
    qt.type_key as question_type,
    fib.correct_answer,
    fib.alternative_answers
FROM questions q
LEFT JOIN question_types qt ON q.question_type_id = qt.id
LEFT JOIN fill_in_blank_answers fib ON q.id = fib.question_id
WHERE qt.type_key = 'fill_in_blank'
ORDER BY q.sublesson_id, q.id;
