-- COMPREHENSIVE CLOUD DATABASE SETUP SCRIPT
-- Run this script in your Supabase cloud dashboard SQL editor

-- ========================================
-- STEP 1: CREATE ALL TABLES
-- ========================================

-- Create profiles table (if not exists)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  daily_xp INTEGER DEFAULT 0,
  daily_goal INTEGER DEFAULT 50,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content JSONB,
  level INTEGER DEFAULT 1,
  xp_reward INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_lessons table to track progress
CREATE TABLE IF NOT EXISTS user_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  progress INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- Create recordings table for user voice recordings
CREATE TABLE IF NOT EXISTS recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  duration INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory table for shop items
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  item_type TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shop_items table
CREATE TABLE IF NOT EXISTS shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  daily_flash_sale BOOLEAN DEFAULT FALSE,
  flash_sale_price INTEGER,
  flash_sale_ends_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create purchases table
CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  item_id UUID REFERENCES shop_items ON DELETE CASCADE,
  price_paid INTEGER NOT NULL,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create avatars table
CREATE TABLE IF NOT EXISTS avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  name TEXT NOT NULL,
  parts JSONB DEFAULT '{}',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_content table
CREATE TABLE IF NOT EXISTS learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  difficulty_level INTEGER DEFAULT 1,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teacher_profiles table
CREATE TABLE IF NOT EXISTS teacher_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teacher_verifications table
CREATE TABLE IF NOT EXISTS teacher_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  institution TEXT NOT NULL,
  phone TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin_profiles table
CREATE TABLE IF NOT EXISTS admin_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT TRUE,
  admin_level TEXT DEFAULT 'basic' CHECK (admin_level IN ('basic', 'advanced', 'super')),
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- STEP 2: CREATE INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_teacher_profiles_email ON teacher_profiles(email);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_verifications_email ON teacher_verifications(email);
CREATE INDEX IF NOT EXISTS idx_teacher_verifications_status ON teacher_verifications(status);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_email ON admin_profiles(email);
CREATE INDEX IF NOT EXISTS idx_admin_profiles_is_admin ON admin_profiles(is_admin);

-- ========================================
-- STEP 3: ENABLE RLS AND CREATE POLICIES
-- ========================================

-- Enable RLS on main tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

-- Disable RLS for teacher tables (as per our fixes)
ALTER TABLE teacher_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_verifications DISABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 4: DROP EXISTING CONFLICTING POLICIES
-- ========================================

-- Drop all existing policies on profiles table to avoid conflicts
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON ' || quote_ident(pol.schemaname) || '.' || quote_ident(pol.tablename);
    END LOOP;
END $$;

-- ========================================
-- STEP 5: CREATE CLEAN RLS POLICIES
-- ========================================

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Public read access for lessons
CREATE POLICY "Anyone can view lessons"
  ON lessons FOR SELECT
  USING (true);

-- Users can manage their own lesson progress
CREATE POLICY "Users can view own lesson progress"
  ON user_lessons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress"
  ON user_lessons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress"
  ON user_lessons FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can manage their own recordings
CREATE POLICY "Users can view own recordings"
  ON recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recordings"
  ON recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Public read access for shop items
CREATE POLICY "Anyone can view shop items"
  ON shop_items FOR SELECT
  USING (true);

-- Users can view their own inventory and purchases
CREATE POLICY "Users can view own inventory"
  ON inventory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own inventory"
  ON inventory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own inventory"
  ON inventory FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own purchases"
  ON purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can make purchases"
  ON purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can manage their own avatars
CREATE POLICY "Users can view own avatars"
  ON avatars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own avatars"
  ON avatars FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avatars"
  ON avatars FOR UPDATE
  USING (auth.uid() = user_id);

-- Public read access for events and content
CREATE POLICY "Anyone can view events"
  ON events FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view published learning content"
  ON learning_content FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can view testimonials"
  ON testimonials FOR SELECT
  USING (true);

-- Admin policies
CREATE POLICY "Admins can view all admin profiles"
  ON admin_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap 
      WHERE ap.id = auth.uid() AND ap.is_admin = true
    )
  );

CREATE POLICY "Admins can insert admin profiles"
  ON admin_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_profiles ap 
      WHERE ap.id = auth.uid() AND ap.is_admin = true
    )
  );

CREATE POLICY "Admins can update admin profiles"
  ON admin_profiles FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admin_profiles ap 
      WHERE ap.id = auth.uid() AND ap.is_admin = true
    )
  );

-- ========================================
-- STEP 6: INSERT SAMPLE DATA
-- ========================================

-- Insert sample teacher verifications (keep existing verified teachers)
INSERT INTO teacher_verifications (email, full_name, institution, phone, status, verified_at) VALUES
  ('qalvinahmad@gmail.com', 'Alvin Ahmad', 'Universitas Dinus', '+62812345678', 'verified', NOW()),
  ('111202013071@mhs.dinus.ac.id', 'Teacher Demo', 'Universitas Dinus', '+62812345679', 'verified', NOW())
ON CONFLICT (email) DO UPDATE SET
  status = EXCLUDED.status,
  verified_at = EXCLUDED.verified_at;

-- Insert sample shop items
INSERT INTO shop_items (name, description, price, category, is_available) VALUES
  ('Basic Avatar', 'Avatar dasar untuk memulai pembelajaran', 100, 'avatar', true),
  ('Premium Theme', 'Tema premium untuk dashboard', 500, 'theme', true),
  ('Extra Lives', 'Tambahan nyawa untuk latihan', 200, 'powerup', true),
  ('Double XP Boost', 'Gandakan XP selama 1 hari', 300, 'powerup', true),
  ('Study Streak Shield', 'Lindungi streak belajar Anda', 400, 'powerup', true)
ON CONFLICT DO NOTHING;

-- Insert sample lessons
INSERT INTO lessons (title, description, content, level, xp_reward) VALUES
  ('Pengenalan Bahasa Inggris', 'Pelajaran dasar bahasa Inggris', '{"sections": [{"title": "Hello World", "content": "Basic greetings"}]}', 1, 10),
  ('Vocabulary Dasar', 'Kosakata bahasa Inggris yang sering digunakan', '{"sections": [{"title": "Common Words", "content": "Everyday vocabulary"}]}', 1, 15),
  ('Grammar Fundamentals', 'Tata bahasa dasar bahasa Inggris', '{"sections": [{"title": "Basic Grammar", "content": "Grammar rules"}]}', 2, 20),
  ('Speaking Practice', 'Latihan berbicara bahasa Inggris', '{"sections": [{"title": "Pronunciation", "content": "Speaking exercises"}]}', 2, 25),
  ('Advanced Conversation', 'Percakapan tingkat lanjut', '{"sections": [{"title": "Complex Dialogues", "content": "Advanced speaking"}]}', 3, 30)
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, event_date, location, is_active) VALUES
  ('English Speaking Contest', 'Lomba pidato bahasa Inggris tingkat nasional', '2025-08-15 10:00:00+00', 'Jakarta Convention Center', true),
  ('Teacher Training Workshop', 'Workshop pelatihan untuk guru bahasa Inggris', '2025-07-20 09:00:00+00', 'Universitas Dinus', true),
  ('Student Exchange Program', 'Program pertukaran pelajar ke luar negeri', '2025-09-01 08:00:00+00', 'Online', true)
ON CONFLICT DO NOTHING;

-- Insert sample testimonials
INSERT INTO testimonials (user_name, content, rating, is_featured) VALUES
  ('Sari Dewi', 'Platform pembelajaran yang sangat membantu meningkatkan kemampuan bahasa Inggris saya!', 5, true),
  ('Ahmad Rizki', 'Fitur voice recording sangat bagus untuk latihan pronunciation.', 4, true),
  ('Maya Putri', 'Dashboard yang user-friendly dan metode pembelajaran yang menyenangkan.', 5, false),
  ('Budi Santoso', 'Terima kasih Shine, sekarang saya lebih percaya diri berbahasa Inggris.', 4, false)
ON CONFLICT DO NOTHING;

-- Insert sample learning content
INSERT INTO learning_content (title, content, category, difficulty_level, is_published) VALUES
  ('Tips Belajar Bahasa Inggris Efektif', 'Artikel tentang cara belajar bahasa Inggris yang efektif dan menyenangkan.', 'tips', 1, true),
  ('Common English Idioms', 'Kumpulan idiom bahasa Inggris yang sering digunakan dalam percakapan sehari-hari.', 'vocabulary', 2, true),
  ('Business English Essentials', 'Panduan lengkap bahasa Inggris untuk dunia bisnis dan profesional.', 'business', 3, true),
  ('English Grammar Guide', 'Panduan lengkap tata bahasa Inggris dari dasar hingga advanced.', 'grammar', 2, true)
ON CONFLICT DO NOTHING;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

-- This will display in the SQL editor
SELECT 'Cloud database setup completed successfully!' AS status,
       'All tables, policies, and sample data have been created.' AS message;
