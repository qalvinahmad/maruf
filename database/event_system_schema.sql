-- ================================================
-- EVENT SYSTEM DATABASE SCHEMA
-- Comprehensive schema for dynamic event management
-- ================================================

-- Main events table (already exists, but adding columns if needed)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Acara', 'Program', 'Sistem', 'Fitur')),
    status VARCHAR(50) NOT NULL DEFAULT 'Dijadwalkan' CHECK (status IN ('Aktif', 'Dijadwalkan', 'Selesai', 'Dibatalkan')),
    date DATE NOT NULL,
    time TIME,
    location VARCHAR(255),
    capacity INTEGER,
    speaker VARCHAR(255),
    speaker_title VARCHAR(255),
    tags TEXT, -- comma-separated tags
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event pronunciation tests table - for pronunciation test events
CREATE TABLE IF NOT EXISTS event_pronunciation_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    test_order INTEGER NOT NULL, -- order of the test (1, 2, 3, etc.)
    arabic_text TEXT NOT NULL,
    transliteration TEXT NOT NULL,
    translation TEXT NOT NULL,
    expected_sound TEXT NOT NULL, -- phonetic representation for comparison
    difficulty VARCHAR(20) NOT NULL DEFAULT 'Mudah' CHECK (difficulty IN ('Mudah', 'Menengah', 'Sulit')),
    audio_example_url TEXT, -- optional audio example
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, test_order)
);

-- Event user participation/results
CREATE TABLE IF NOT EXISTS event_user_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    overall_score INTEGER NOT NULL DEFAULT 0 CHECK (overall_score >= 0 AND overall_score <= 100),
    total_tests INTEGER NOT NULL DEFAULT 0,
    completed_tests INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- Individual test results for each user
CREATE TABLE IF NOT EXISTS event_test_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_result_id UUID NOT NULL REFERENCES event_user_results(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES event_pronunciation_tests(id) ON DELETE CASCADE,
    user_transcription TEXT,
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    audio_blob_url TEXT, -- URL to stored audio file
    attempt_number INTEGER NOT NULL DEFAULT 1,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_result_id, test_id, attempt_number)
);

-- Event rewards and achievements
CREATE TABLE IF NOT EXISTS event_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    min_score INTEGER NOT NULL DEFAULT 70,
    xp_reward INTEGER NOT NULL DEFAULT 0,
    points_reward INTEGER NOT NULL DEFAULT 0,
    badge_reward VARCHAR(255),
    special_reward TEXT, -- JSON for special items/achievements
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event registrations (for scheduled events)
CREATE TABLE IF NOT EXISTS event_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    registration_status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (registration_status IN ('registered', 'attended', 'no_show', 'cancelled')),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(event_id, user_id)
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_events_date_status ON events(date, status);
CREATE INDEX IF NOT EXISTS idx_events_type_status ON events(type, status);
CREATE INDEX IF NOT EXISTS idx_pronunciation_tests_event ON event_pronunciation_tests(event_id, test_order);
CREATE INDEX IF NOT EXISTS idx_user_results_event_user ON event_user_results(event_id, user_id);
CREATE INDEX IF NOT EXISTS idx_user_results_status ON event_user_results(status);
CREATE INDEX IF NOT EXISTS idx_test_details_result ON event_test_details(event_result_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event_user ON event_registrations(event_id, user_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_pronunciation_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_user_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_test_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Events policies (readable by all authenticated users)
CREATE POLICY "Events are viewable by authenticated users" ON events
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage events" ON events
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Pronunciation tests policies
CREATE POLICY "Pronunciation tests are viewable by authenticated users" ON event_pronunciation_tests
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage pronunciation tests" ON event_pronunciation_tests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- User results policies (users can only see their own results)
CREATE POLICY "Users can view their own event results" ON event_user_results
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own event results" ON event_user_results
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own event results" ON event_user_results
    FOR UPDATE USING (user_id = auth.uid());

-- Test details policies
CREATE POLICY "Users can view their own test details" ON event_test_details
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM event_user_results 
            WHERE event_user_results.id = event_test_details.event_result_id 
            AND event_user_results.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert their own test details" ON event_test_details
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM event_user_results 
            WHERE event_user_results.id = event_test_details.event_result_id 
            AND event_user_results.user_id = auth.uid()
        )
    );

-- Rewards policies
CREATE POLICY "Rewards are viewable by authenticated users" ON event_rewards
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage rewards" ON event_rewards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Registration policies
CREATE POLICY "Users can view their own registrations" ON event_registrations
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can register for events" ON event_registrations
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own registrations" ON event_registrations
    FOR UPDATE USING (user_id = auth.uid());

-- ================================================
-- FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pronunciation_tests_updated_at BEFORE UPDATE ON event_pronunciation_tests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate overall score when test details are updated
CREATE OR REPLACE FUNCTION calculate_event_overall_score()
RETURNS TRIGGER AS $$
DECLARE
    total_score INTEGER;
    test_count INTEGER;
    avg_score INTEGER;
BEGIN
    -- Calculate average score for the event result
    SELECT 
        COALESCE(AVG(score), 0)::INTEGER,
        COUNT(*)
    INTO avg_score, test_count
    FROM event_test_details 
    WHERE event_result_id = COALESCE(NEW.event_result_id, OLD.event_result_id);
    
    -- Update the overall score in event_user_results
    UPDATE event_user_results 
    SET 
        overall_score = avg_score,
        completed_tests = test_count,
        status = CASE 
            WHEN test_count >= (
                SELECT COUNT(*) 
                FROM event_pronunciation_tests 
                WHERE event_id = event_user_results.event_id
            ) THEN 'completed'
            ELSE 'in_progress'
        END,
        completed_at = CASE 
            WHEN test_count >= (
                SELECT COUNT(*) 
                FROM event_pronunciation_tests 
                WHERE event_id = event_user_results.event_id
            ) THEN NOW()
            ELSE completed_at
        END
    WHERE id = COALESCE(NEW.event_result_id, OLD.event_result_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to auto-calculate overall score
CREATE TRIGGER calculate_overall_score_trigger 
    AFTER INSERT OR UPDATE OR DELETE ON event_test_details
    FOR EACH ROW EXECUTE FUNCTION calculate_event_overall_score();

-- ================================================
-- SAMPLE DATA FOR TESTING
-- ================================================

-- Insert sample event
INSERT INTO events (title, description, type, status, date, time, speaker, speaker_title) VALUES
('Tes Pengucapan Al-Fatihah', 'Event khusus untuk menguji kemampuan pengucapan Surah Al-Fatihah dengan benar. Dapatkan feedback real-time menggunakan teknologi AI.', 'Program', 'Aktif', CURRENT_DATE, '10:00:00', 'Ustadz Ahmad Rahman', 'Ahli Tajwid dan Qiroah')
ON CONFLICT DO NOTHING;

-- Get the event ID for sample data
DO $$
DECLARE
    sample_event_id UUID;
BEGIN
    SELECT id INTO sample_event_id FROM events WHERE title = 'Tes Pengucapan Al-Fatihah' LIMIT 1;
    
    IF sample_event_id IS NOT NULL THEN
        -- Insert pronunciation tests for Al-Fatihah
        INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) VALUES
        (sample_event_id, 1, 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'Bismillahir-Rahmanir-Rahim', 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang', 'bismillahi ar-rahmani ar-rahimi', 'Mudah'),
        (sample_event_id, 2, 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', 'Alhamdulillahi Rabbil-Alameen', 'Segala puji bagi Allah, Tuhan seluruh alam', 'alhamdu lillahi rabbi al-alamina', 'Mudah'),
        (sample_event_id, 3, 'الرَّحْمَٰنِ الرَّحِيمِ', 'Ar-Rahmanir-Rahim', 'Yang Maha Pengasih lagi Maha Penyayang', 'ar-rahmani ar-rahimi', 'Mudah'),
        (sample_event_id, 4, 'مَالِكِ يَوْمِ الدِّينِ', 'Maliki Yaumid-Din', 'Yang menguasai hari pembalasan', 'maliki yawmi ad-dini', 'Menengah'),
        (sample_event_id, 5, 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', 'Iyyaka Na\'budu wa Iyyaka Nasta\'een', 'Hanya kepada-Mu kami menyembah dan hanya kepada-Mu kami meminta pertolongan', 'iyyaka na\'budu wa iyyaka nasta\'inu', 'Sulit'),
        (sample_event_id, 6, 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 'Ihdinash-Shiratal-Mustaqeem', 'Tunjukilah kami jalan yang lurus', 'ihdina as-sirata al-mustaqima', 'Menengah'),
        (sample_event_id, 7, 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', 'Shiratallazina An\'amta Alaihim Ghairil-Maghdubi Alaihim wa Ladh-Dhalleen', '(yaitu) jalan orang-orang yang telah Engkau beri nikmat, bukan (jalan) mereka yang dimurkai dan bukan (pula jalan) mereka yang sesat', 'sirata allazina an\'amta \'alayhim ghayri al-maghdubi \'alayhim wa la ad-dallina', 'Sulit')
        ON CONFLICT DO NOTHING;
        
        -- Insert reward structure
        INSERT INTO event_rewards (event_id, min_score, xp_reward, points_reward, badge_reward) VALUES
        (sample_event_id, 70, 50, 30, 'Pembaca Al-Fatihah')
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- ================================================
-- HELPFUL VIEWS FOR QUERYING
-- ================================================

-- View for event details with test count
CREATE OR REPLACE VIEW event_details AS
SELECT 
    e.*,
    COUNT(ept.id) as total_tests,
    er.xp_reward,
    er.points_reward,
    er.badge_reward,
    er.min_score as passing_score
FROM events e
LEFT JOIN event_pronunciation_tests ept ON e.id = ept.event_id
LEFT JOIN event_rewards er ON e.id = er.event_id
GROUP BY e.id, er.xp_reward, er.points_reward, er.badge_reward, er.min_score;

-- View for user event progress
CREATE OR REPLACE VIEW user_event_progress AS
SELECT 
    eur.*,
    e.title as event_title,
    e.type as event_type,
    (SELECT COUNT(*) FROM event_pronunciation_tests WHERE event_id = eur.event_id) as total_tests_available,
    CASE 
        WHEN eur.status = 'completed' AND eur.overall_score >= COALESCE(er.min_score, 70) THEN true
        ELSE false
    END as passed
FROM event_user_results eur
JOIN events e ON eur.event_id = e.id
LEFT JOIN event_rewards er ON e.id = er.event_id;

COMMENT ON TABLE events IS 'Main events table storing all event information';
COMMENT ON TABLE event_pronunciation_tests IS 'Pronunciation test questions for each event';
COMMENT ON TABLE event_user_results IS 'User participation and overall results for events';
COMMENT ON TABLE event_test_details IS 'Individual test results for each pronunciation test';
COMMENT ON TABLE event_rewards IS 'Reward structure for completing events';
COMMENT ON TABLE event_registrations IS 'Event registration tracking';
