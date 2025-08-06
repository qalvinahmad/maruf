-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  streak INTEGER DEFAULT 0,
  daily_xp INTEGER DEFAULT 0,
  daily_goal INTEGER DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY Users can view their own profile
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY Users can update their own profile
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS 6745
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'https://api.dicebear.com/7.x/avataaars/svg?seed=' || COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
6745 LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

-- RLS for lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY Lessons are viewable by all users
  ON lessons FOR SELECT
  USING (true);

-- RLS for user_lessons
ALTER TABLE user_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY Users can view their own lesson progress
  ON user_lessons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY Users can update their own lesson progress
  ON user_lessons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY Users can update their own lesson progress
  ON user_lessons FOR UPDATE
  USING (auth.uid() = user_id);

