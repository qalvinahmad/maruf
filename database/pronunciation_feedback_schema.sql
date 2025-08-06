-- Tabel untuk menyimpan feedback koreksi bacaan Al-Quran
CREATE TABLE pronunciation_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  letter_id INTEGER,
  test_session_id UUID,
  
  -- Audio data
  audio_url TEXT,
  audio_duration DECIMAL(5,2),
  
  -- Pronunciation analysis
  recorded_text TEXT,
  expected_text TEXT,
  confidence_score DECIMAL(5,2), -- 0-100
  pronunciation_accuracy DECIMAL(5,2), -- 0-100
  
  -- Detailed feedback
  makhraj_analysis JSONB, -- Detail analisis makhraj (tempat keluarnya huruf)
  sifat_analysis JSONB,  -- Detail analisis sifat huruf
  tajwid_rules_applied JSONB, -- Aturan tajwid yang diterapkan
  
  -- Error detection
  detected_errors JSONB, -- Array of error objects
  correction_suggestions JSONB, -- Saran perbaikan
  
  -- AI Processing info
  ai_model_used VARCHAR(100),
  processing_time_ms INTEGER,
  api_response_raw JSONB,
  
  -- Quality metrics
  audio_quality_score DECIMAL(5,2),
  background_noise_level DECIMAL(5,2),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexing
  CONSTRAINT pronunciation_feedback_confidence_check CHECK (confidence_score >= 0 AND confidence_score <= 100),
  CONSTRAINT pronunciation_feedback_accuracy_check CHECK (pronunciation_accuracy >= 0 AND pronunciation_accuracy <= 100)
);

-- Tabel untuk menyimpan template koreksi makhraj
CREATE TABLE makhraj_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  letter_arabic CHAR(1) NOT NULL,
  letter_latin VARCHAR(20) NOT NULL,
  makhraj_name VARCHAR(100) NOT NULL,
  makhraj_description TEXT,
  
  -- Audio characteristics
  expected_frequency_range JSONB, -- {min: 100, max: 500}
  expected_phonemes JSONB, -- Array of expected phoneme patterns
  
  -- Common errors
  common_mistakes JSONB, -- Array of common pronunciation mistakes
  correction_tips JSONB, -- Tips for improvement
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(letter_arabic)
);

-- Tabel untuk tracking improvement progress
CREATE TABLE pronunciation_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  letter_id INTEGER,
  
  -- Progress metrics
  average_accuracy DECIMAL(5,2),
  improvement_rate DECIMAL(5,2),
  total_attempts INTEGER DEFAULT 0,
  successful_attempts INTEGER DEFAULT 0,
  
  -- Timeline data
  first_attempt_at TIMESTAMP WITH TIME ZONE,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  mastery_achieved_at TIMESTAMP WITH TIME ZONE,
  
  -- Weak areas
  weak_areas JSONB, -- Areas that need improvement
  strong_areas JSONB, -- Areas where user excels
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, letter_id)
);

-- Indexes for performance
CREATE INDEX idx_pronunciation_feedback_user_id ON pronunciation_feedback(user_id);
CREATE INDEX idx_pronunciation_feedback_letter_id ON pronunciation_feedback(letter_id);
CREATE INDEX idx_pronunciation_feedback_created_at ON pronunciation_feedback(created_at);
CREATE INDEX idx_pronunciation_progress_user_id ON pronunciation_progress(user_id);

-- RLS Policies
ALTER TABLE pronunciation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE makhraj_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE pronunciation_progress ENABLE ROW LEVEL SECURITY;

-- Users can only access their own feedback
CREATE POLICY "Users can view own pronunciation feedback" ON pronunciation_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pronunciation feedback" ON pronunciation_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pronunciation feedback" ON pronunciation_feedback
  FOR UPDATE USING (auth.uid() = user_id);

-- Makhraj templates are readable by all authenticated users
CREATE POLICY "Makhraj templates are readable by authenticated users" ON makhraj_templates
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can modify makhraj templates
CREATE POLICY "Only admins can modify makhraj templates" ON makhraj_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Users can access their own progress
CREATE POLICY "Users can view own pronunciation progress" ON pronunciation_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pronunciation progress" ON pronunciation_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pronunciation progress" ON pronunciation_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert sample makhraj templates
INSERT INTO makhraj_templates (letter_arabic, letter_latin, makhraj_name, makhraj_description, expected_frequency_range, expected_phonemes, common_mistakes, correction_tips) VALUES
('ا', 'Alif', 'Al-Jawf', 'Rongga mulut dan tenggorokan', '{"min": 200, "max": 800}', '["a:", "æ"]', '["Terlalu pendek", "Tidak jelas"]', '["Buka mulut lebar", "Panjangkan suara"]'),
('ب', 'Ba', 'Asy-Syafatan', 'Dua bibir', '{"min": 100, "max": 400}', '["b"]', '["Kurang eksplosif", "Tidak jelas penutupan bibir"]', '["Tutup bibir rapat", "Lepaskan dengan eksplosif"]'),
('ت', 'Ta', 'Ujung lidah dengan pangkal gigi atas', 'Ujung lidah menempel pada pangkal gigi atas', '{"min": 2000, "max": 4000}', '["t"]', '["Terlalu lemah", "Posisi lidah salah"]', '["Tekan ujung lidah ke gigi atas", "Lepaskan dengan cepat"]'),
('ث', 'Tsa', 'Ujung lidah dengan ujung gigi atas', 'Ujung lidah menyentuh ujung gigi atas', '{"min": 3000, "max": 8000}', '["θ"]', '["Mirip dengan huruf Sin", "Tidak ada hembusan"]', '["Keluarkan ujung lidah sedikit", "Berikan hembusan udara"]'),
('ج', 'Jim', 'Tengah lidah dengan langit-langit', 'Tengah lidah menempel pada langit-langit keras', '{"min": 500, "max": 2000}', '["dʒ"]', '["Terlalu keras", "Tidak ada getar"]', '["Lembut dengan getaran", "Gunakan tengah lidah"]');
