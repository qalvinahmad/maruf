-- ================================================
-- ADD PRONUNCIATION TESTS FOR EXISTING EVENTS
-- Script untuk menambahkan pronunciation tests ke event yang sudah ada
-- ================================================

-- First, let's add pronunciation tests for Isra Mi'raj event
DO $$
DECLARE
    isra_miraj_event_id UUID;
BEGIN
    -- Find Isra Mi'raj event
    SELECT id INTO isra_miraj_event_id FROM events WHERE title ILIKE '%Isra Mi%raj%' LIMIT 1;
    
    IF isra_miraj_event_id IS NOT NULL THEN
        -- Insert pronunciation tests for Isra Mi'raj themed verses
        INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) VALUES
        (isra_miraj_event_id, 1, 'سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا', 'Subhanallazi asra bi\'abdihi lailan', 'Maha Suci Allah yang telah memperjalankan hamba-Nya pada suatu malam', 'subhana allazi asra bi\'abdihi lailan', 'Menengah'),
        (isra_miraj_event_id, 2, 'مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى', 'minal masjidil harami ilal masjidil aqsha', 'dari Masjidil Haram ke Masjidil Aqsha', 'mina al-masjidi al-harami ila al-masjidi al-aqsa', 'Sulit'),
        (isra_miraj_event_id, 3, 'الَّذِي بَارَكْنَا حَوْلَهُ', 'allazi barakna hawlahu', 'yang telah Kami berkahi sekelilingnya', 'allazi barakna hawlahu', 'Mudah'),
        (isra_miraj_event_id, 4, 'لِنُرِيَهُ مِنْ آيَاتِنَا', 'linuriyahu min ayatina', 'agar Kami perlihatkan kepadanya sebahagian dari tanda-tanda (kebesaran) Kami', 'linuriyahu min ayatina', 'Menengah'),
        (isra_miraj_event_id, 5, 'إِنَّهُ هُوَ السَّمِيعُ الْبَصِيرُ', 'innahu huwas samii\'ul bashiir', 'Sesungguhnya Dia adalah Maha Mendengar lagi Maha Melihat', 'innahu huwa as-samii\'u al-bashiru', 'Mudah')
        ON CONFLICT (event_id, test_order) DO NOTHING;
        
        -- Add reward
        INSERT INTO event_rewards (event_id, min_score, xp_reward, points_reward, badge_reward) VALUES
        (isra_miraj_event_id, 70, 60, 40, 'Pengingat Isra Mi\'raj')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Add pronunciation tests for Nisfu Sya'ban event
DO $$
DECLARE
    nisfu_syaban_event_id UUID;
BEGIN
    -- Find Nisfu Sya'ban event
    SELECT id INTO nisfu_syaban_event_id FROM events WHERE title ILIKE '%Nisfu Sya%ban%' LIMIT 1;
    
    IF nisfu_syaban_event_id IS NOT NULL THEN
        -- Insert pronunciation tests for night prayer themed verses
        INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) VALUES
        (nisfu_syaban_event_id, 1, 'وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ', 'wa minal layli fatahajjad bihi nafilatan laka', 'Dan pada sebahagian malam hari bersembahyang tahajudlah kamu sebagai suatu ibadah tambahan bagimu', 'wa mina al-layli fa-tahajjad bihi nafilatan laka', 'Sulit'),
        (nisfu_syaban_event_id, 2, 'عَسَىٰ أَن يَبْعَثَكَ رَبُّكَ مَقَامًا مَّحْمُودًا', 'asa an yab\'athaka rabbuka maqaman mahmuda', 'mudah-mudahan Tuhan-mu mengangkat kamu ke tempat yang terpuji', 'asa an yab\'athaka rabbuka maqaman mahmuda', 'Menengah'),
        (nisfu_syaban_event_id, 3, 'وَقُل رَّبِّ اغْفِرْ وَارْحَمْ', 'wa qur rabbi ighfir warham', 'dan berdoalah: Ya Tuhanku, ampunilah dan rahmatilah', 'wa qul rabbi ighfir wa-rham', 'Mudah'),
        (nisfu_syaban_event_id, 4, 'وَأَنتَ خَيْرُ الرَّاحِمِينَ', 'wa anta khayru ar-rahimiin', 'dan Engkau adalah Pemberi rahmat yang paling baik', 'wa anta khayru ar-rahimina', 'Mudah')
        ON CONFLICT (event_id, test_order) DO NOTHING;
        
        -- Add reward
        INSERT INTO event_rewards (event_id, min_score, xp_reward, points_reward, badge_reward) VALUES
        (nisfu_syaban_event_id, 70, 55, 35, 'Pencinta Malam')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Add pronunciation tests for Ramadan Challenge event
DO $$
DECLARE
    ramadan_event_id UUID;
BEGIN
    -- Find Ramadan Challenge event
    SELECT id INTO ramadan_event_id FROM events WHERE title ILIKE '%Ramadan%Challenge%' LIMIT 1;
    
    IF ramadan_event_id IS NOT NULL THEN
        -- Insert pronunciation tests for Ramadan themed verses
        INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) VALUES
        (ramadan_event_id, 1, 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ', 'ya ayyuhal lazina amanu kutiba \'alaykumus shiyam', 'Hai orang-orang yang beriman, diwajibkan atas kamu berpuasa', 'ya ayyuha allazina amanu kutiba \'alaykumu as-siyamu', 'Menengah'),
        (ramadan_event_id, 2, 'كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ', 'kama kutiba \'alal lazina min qablikum', 'sebagaimana diwajibkan atas orang-orang sebelum kamu', 'kama kutiba \'ala allazina min qablikum', 'Sulit'),
        (ramadan_event_id, 3, 'لَعَلَّكُمْ تَتَّقُونَ', 'la\'allakum tattaqun', 'agar kamu bertakwa', 'la\'allakum tattaquna', 'Mudah'),
        (ramadan_event_id, 4, 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ', 'shahru ramadhanal lazi unzila fihil qur\'an', 'Bulan Ramadhan, bulan yang di dalamnya diturunkan Al Quran', 'shahru ramadhana allazi unzila fihi al-qur\'anu', 'Menengah'),
        (ramadan_event_id, 5, 'هُدًى لِّلنَّاسِ وَبَيِّنَاتٍ مِّنَ الْهُدَىٰ وَالْفُرْقَانِ', 'hudan linnaasi wa bayyinatin minal huda wal furqan', 'petunjuk bagi manusia dan penjelasan-penjelasan mengenai petunjuk itu dan pembeda (antara yang hak dan yang bathil)', 'hudan li-an-nasi wa bayyinatin mina al-huda wa-al-furqani', 'Sulit')
        ON CONFLICT (event_id, test_order) DO NOTHING;
        
        -- Add reward
        INSERT INTO event_rewards (event_id, min_score, xp_reward, points_reward, badge_reward) VALUES
        (ramadan_event_id, 70, 75, 50, 'Juara Ramadan')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Add pronunciation tests for Dzulhijjah event
DO $$
DECLARE
    dzulhijjah_event_id UUID;
BEGIN
    -- Find Dzulhijjah event
    SELECT id INTO dzulhijjah_event_id FROM events WHERE title ILIKE '%Dzulhijjah%' LIMIT 1;
    
    IF dzulhijjah_event_id IS NOT NULL THEN
        -- Insert pronunciation tests for Hajj themed verses
        INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) VALUES
        (dzulhijjah_event_id, 1, 'وَأَذِّن فِي النَّاسِ بِالْحَجِّ', 'wa azzin fin naasi bil hajj', 'Dan berserulah kepada manusia untuk mengerjakan haji', 'wa azzin fi an-nasi bi-al-hajji', 'Menengah'),
        (dzulhijjah_event_id, 2, 'يَأْتُوكَ رِجَالًا وَعَلَىٰ كُلِّ ضَامِرٍ', 'ya\'tuka rijalan wa \'ala kulli dhamirin', 'niscaya mereka akan datang kepadamu dengan berjalan kaki, dan mengendarai unta yang kurus', 'ya\'tuka rijalan wa \'ala kulli dhamirin', 'Sulit'),
        (dzulhijjah_event_id, 3, 'يَأْتِينَ مِن كُلِّ فَجٍّ عَمِيقٍ', 'ya\'tiina min kulli fajjin \'amiiq', 'yang datang dari setiap penjuru jalan yang jauh', 'ya\'tiina min kulli fajjin \'amiqin', 'Menengah'),
        (dzulhijjah_event_id, 4, 'لِيَشْهَدُوا مَنَافِعَ لَهُمْ', 'liyashhadu manafi\'a lahum', 'supaya mereka menyaksikan berbagai manfaat bagi mereka', 'li-yashhadu manafi\'a lahum', 'Mudah')
        ON CONFLICT (event_id, test_order) DO NOTHING;
        
        -- Add reward
        INSERT INTO event_rewards (event_id, min_score, xp_reward, points_reward, badge_reward) VALUES
        (dzulhijjah_event_id, 70, 65, 45, 'Pengingat Haji')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Add pronunciation tests for Quran Competition event
DO $$
DECLARE
    competition_event_id UUID;
BEGIN
    -- Find Quran Competition event
    SELECT id INTO competition_event_id FROM events WHERE title ILIKE '%Kompetisi%Membaca%' LIMIT 1;
    
    IF competition_event_id IS NOT NULL THEN
        -- Insert pronunciation tests for competition preparation
        INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) VALUES
        (competition_event_id, 1, 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا', 'wa rattilil qur\'ana tartiila', 'dan bacalah Al Quran itu dengan perlahan-lahan', 'wa rattili al-qur\'ana tartiilan', 'Mudah'),
        (competition_event_id, 2, 'الَّذِينَ آتَيْنَاهُمُ الْكِتَابَ يَتْلُونَهُ حَقَّ تِلَاوَتِهِ', 'allazina ataynahumul kitaba yatlunahu haqqa tilawatihi', 'Orang-orang yang telah Kami berikan Al Kitab kepadanya, mereka membacanya dengan bacaan yang sebenarnya', 'allazina ataynahumu al-kitaba yatlunahu haqqa tilawatihi', 'Sulit'),
        (competition_event_id, 3, 'أُولَٰئِكَ يُؤْمِنُونَ بِهِ', 'ula\'ika yu\'minuna bihi', 'mereka itu beriman kepadanya', 'ula\'ika yu\'minuna bihi', 'Mudah'),
        (competition_event_id, 4, 'وَمَن يَكْفُرْ بِهِ فَأُولَٰئِكَ هُمُ الْخَاسِرُونَ', 'wa man yakfur bihi fa ula\'ika humul khasirun', 'Dan barangsiapa yang ingkar kepadanya, maka mereka itulah orang-orang yang rugi', 'wa man yakfur bihi fa-ula\'ika humu al-khasiruna', 'Menengah'),
        (competition_event_id, 5, 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ', 'inna hazal qur\'ana yahdi lillatii hiya aqwam', 'Sesungguhnya Al Quran ini memberikan petunjuk kepada (jalan) yang lebih lurus', 'inna haza al-qur\'ana yahdi li-allati hiya aqwamu', 'Sulit'),
        (competition_event_id, 6, 'وَيُبَشِّرُ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ', 'wa yubashshirul mu\'miniinal lazina ya\'malunash shalihaat', 'dan memberi kabar gembira kepada orang-orang mukmin yang mengerjakan amal saleh', 'wa yubashshiru al-mu\'mininaal lazina ya\'maluna as-salihati', 'Sulit')
        ON CONFLICT (event_id, test_order) DO NOTHING;
        
        -- Add reward
        INSERT INTO event_rewards (event_id, min_score, xp_reward, points_reward, badge_reward) VALUES
        (competition_event_id, 80, 100, 75, 'Juara Tilawah')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Update event types and status if needed
UPDATE events 
SET type = 'Program'
WHERE title ILIKE '%Kompetisi%' AND type != 'Program';

UPDATE events 
SET status = 'Aktif'
WHERE title IN (
    'Peringatan Isra Mi''raj',
    'Aktivitas Nisfu Sya''ban', 
    'Ramadan Challenge: 30 Modul dalam 30 Hari',
    'Aktivitas Khusus 10 Hari Pertama Dzulhijjah'
) AND status != 'Aktif';

-- Add some helpful comments
COMMENT ON TABLE event_pronunciation_tests IS 'Updated with tests for all existing events - no more empty test events!';
