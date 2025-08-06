-- ================================================
-- CLASS SYSTEM DATABASE SCHEMA
-- Comprehensive schema for dynamic class management with materials, sections, and quizzes
-- ================================================

-- Main classes table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    classname VARCHAR(255) NOT NULL,
    description TEXT,
    exp INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 0,
    durationweeks INTEGER NOT NULL DEFAULT 1,
    teacher VARCHAR(255) NOT NULL,
    energy INTEGER NOT NULL DEFAULT 1,
    level VARCHAR(50) DEFAULT 'Pemula' CHECK (level IN ('Pemula', 'Menengah', 'Lanjutan')),
    status VARCHAR(50) DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Draft', 'Archived')),
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class sections/materials
CREATE TABLE IF NOT EXISTS class_sections (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_order INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL, -- HTML content for the section
    duration_minutes INTEGER DEFAULT 15, -- estimated reading time
    video_url TEXT, -- optional video content
    audio_url TEXT, -- optional audio content
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(class_id, section_order)
);

-- Class quizzes
CREATE TABLE IF NOT EXISTS class_quizzes (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL DEFAULT 'Kuis Final',
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 3,
    time_limit_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES class_quizzes(id) ON DELETE CASCADE,
    question_order INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false', 'essay')),
    correct_answer INTEGER, -- index of correct option (0-based)
    explanation TEXT, -- explanation for the correct answer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(quiz_id, question_order)
);

-- Quiz question options (for multiple choice questions)
CREATE TABLE IF NOT EXISTS quiz_question_options (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL REFERENCES quiz_questions(id) ON DELETE CASCADE,
    option_order INTEGER NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    
    UNIQUE(question_id, option_order)
);

-- User class progress
CREATE TABLE IF NOT EXISTS user_class_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    current_section INTEGER DEFAULT 1,
    completed_sections TEXT DEFAULT '[]', -- JSON array of completed section IDs
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'failed')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, class_id)
);

-- User quiz attempts
CREATE TABLE IF NOT EXISTS user_quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_id INTEGER NOT NULL REFERENCES class_quizzes(id) ON DELETE CASCADE,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
    answers TEXT, -- JSON object with question_id: answer_index
    passed BOOLEAN DEFAULT FALSE,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(user_id, quiz_id, attempt_number)
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_classes_level_status ON classes(level, status);
CREATE INDEX IF NOT EXISTS idx_class_sections_class_order ON class_sections(class_id, section_order);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_order ON quiz_questions(quiz_id, question_order);
CREATE INDEX IF NOT EXISTS idx_question_options_question_order ON quiz_question_options(question_id, option_order);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_class ON user_class_progress(user_id, class_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_attempts_user_quiz ON user_quiz_attempts(user_id, quiz_id);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_class_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Classes policies (readable by all authenticated users)
CREATE POLICY "Classes are viewable by authenticated users" ON classes
    FOR SELECT USING (auth.role() = 'authenticated' AND status = 'Aktif');

CREATE POLICY "Admins can manage classes" ON classes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Class sections policies
CREATE POLICY "Class sections are viewable by authenticated users" ON class_sections
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = class_sections.class_id 
            AND classes.status = 'Aktif'
        )
    );

CREATE POLICY "Admins can manage class sections" ON class_sections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Quiz policies
CREATE POLICY "Quizzes are viewable by authenticated users" ON class_quizzes
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM classes 
            WHERE classes.id = class_quizzes.class_id 
            AND classes.status = 'Aktif'
        )
    );

CREATE POLICY "Admins can manage quizzes" ON class_quizzes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Quiz questions policies
CREATE POLICY "Quiz questions are viewable by authenticated users" ON quiz_questions
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM class_quizzes cq
            JOIN classes c ON c.id = cq.class_id
            WHERE cq.id = quiz_questions.quiz_id 
            AND c.status = 'Aktif'
        )
    );

CREATE POLICY "Admins can manage quiz questions" ON quiz_questions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- Quiz options policies
CREATE POLICY "Quiz options are viewable by authenticated users" ON quiz_question_options
    FOR SELECT USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM quiz_questions qq
            JOIN class_quizzes cq ON cq.id = qq.quiz_id
            JOIN classes c ON c.id = cq.class_id
            WHERE qq.id = quiz_question_options.question_id 
            AND c.status = 'Aktif'
        )
    );

CREATE POLICY "Admins can manage quiz options" ON quiz_question_options
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.is_admin = true
        )
    );

-- User progress policies (users can only see their own progress)
CREATE POLICY "Users can view their own class progress" ON user_class_progress
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own class progress" ON user_class_progress
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own class progress" ON user_class_progress
    FOR UPDATE USING (user_id = auth.uid());

-- User quiz attempts policies
CREATE POLICY "Users can view their own quiz attempts" ON user_quiz_attempts
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own quiz attempts" ON user_quiz_attempts
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own quiz attempts" ON user_quiz_attempts
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
CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_sections_updated_at BEFORE UPDATE ON class_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate class progress percentage
CREATE OR REPLACE FUNCTION calculate_class_progress()
RETURNS TRIGGER AS $$
DECLARE
    total_sections INTEGER;
    completed_count INTEGER;
    new_percentage INTEGER;
BEGIN
    -- Get total sections for the class
    SELECT COUNT(*) INTO total_sections
    FROM class_sections cs
    JOIN classes c ON c.id = cs.class_id
    WHERE cs.class_id = (
        SELECT class_id FROM user_class_progress 
        WHERE id = COALESCE(NEW.id, OLD.id)
    );
    
    -- Count completed sections
    SELECT array_length(
        string_to_array(
            trim(both '[]' from NEW.completed_sections), 
            ','
        ), 
        1
    ) INTO completed_count;
    
    -- Handle empty array case
    IF completed_count IS NULL THEN
        completed_count := 0;
    END IF;
    
    -- Calculate percentage
    IF total_sections > 0 THEN
        new_percentage := (completed_count * 100) / total_sections;
    ELSE
        new_percentage := 0;
    END IF;
    
    -- Update progress
    NEW.progress_percentage := new_percentage;
    
    -- Update status based on progress
    IF new_percentage >= 100 THEN
        NEW.status := 'completed';
        NEW.completed_at := NOW();
    ELSIF new_percentage > 0 THEN
        NEW.status := 'in_progress';
    ELSE
        NEW.status := 'not_started';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-calculate progress
CREATE TRIGGER calculate_progress_trigger 
    BEFORE INSERT OR UPDATE ON user_class_progress
    FOR EACH ROW EXECUTE FUNCTION calculate_class_progress();

-- ================================================
-- SAMPLE DATA INSERTION
-- ================================================

-- Insert the 5 classes
INSERT INTO classes (id, classname, description, exp, points, durationweeks, teacher, energy, level) VALUES
(1, 'Tajwid Dasar', 'Mempelajari dasar-dasar ilmu tajwid untuk membaca Al-Quran dengan benar sesuai kaidah yang telah ditetapkan.', 100, 50, 4, 'Ustadzah Fatimah Zahra', 1, 'Pemula'),
(2, 'Hukum Nun Sukun & Tanwin', 'Memahami dan menerapkan hukum nun sukun dan tanwin dalam bacaan Al-Quran dengan benar.', 130, 65, 5, 'Ustadz Ali Maulana', 3, 'Menengah'),
(3, 'Ghunnah dan Idgham', 'Menguasai teknik ghunnah dan berbagai jenis idgham dalam tajwid Al-Quran.', 140, 70, 6, 'Ustadz Abdul Karim', 4, 'Menengah'),
(4, 'Tafsir Juz Amma', 'Memahami makna dan tafsir surat-surat dalam Juz Amma dengan detail dan aplikasinya dalam kehidupan.', 160, 80, 8, 'Ustadzah Salma Luthfi', 5, 'Lanjutan'),
(5, 'Tilawah Tartil dan Tahsin', 'Meningkatkan kualitas tilawah dengan teknik tartil dan tahsin yang benar untuk bacaan yang indah.', 150, 75, 6, 'Ustadz Ridwan Habib', 1, 'Lanjutan')
ON CONFLICT (id) DO UPDATE SET
    classname = EXCLUDED.classname,
    description = EXCLUDED.description,
    exp = EXCLUDED.exp,
    points = EXCLUDED.points,
    durationweeks = EXCLUDED.durationweeks,
    teacher = EXCLUDED.teacher,
    energy = EXCLUDED.energy,
    level = EXCLUDED.level;

COMMENT ON TABLE classes IS 'Main classes table with complete course information';
COMMENT ON TABLE class_sections IS 'Individual sections/lessons within each class';
COMMENT ON TABLE class_quizzes IS 'Quizzes for each class to test understanding';
COMMENT ON TABLE quiz_questions IS 'Questions for each quiz';
COMMENT ON TABLE quiz_question_options IS 'Multiple choice options for quiz questions';
COMMENT ON TABLE user_class_progress IS 'Tracks user progress through classes';
COMMENT ON TABLE user_quiz_attempts IS 'Records user quiz attempts and scores';
