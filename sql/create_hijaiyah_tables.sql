-- Create hijaiyah_progress table for tracking letter learning progress
CREATE TABLE IF NOT EXISTS hijaiyah_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  letter_id INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, letter_id)
);

-- Create favorite_letters table for storing user's favorite letters
CREATE TABLE IF NOT EXISTS favorite_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  letter_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, letter_id)
);

-- Enable RLS for hijaiyah_progress
ALTER TABLE hijaiyah_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for hijaiyah_progress
CREATE POLICY "Users can view their own hijaiyah progress"
  ON hijaiyah_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own hijaiyah progress"
  ON hijaiyah_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hijaiyah progress"
  ON hijaiyah_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable RLS for favorite_letters
ALTER TABLE favorite_letters ENABLE ROW LEVEL SECURITY;

-- RLS policies for favorite_letters
CREATE POLICY "Users can view their own favorite letters"
  ON favorite_letters FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favorite letters"
  ON favorite_letters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorite letters"
  ON favorite_letters FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_hijaiyah_progress_user_id ON hijaiyah_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_hijaiyah_progress_letter_id ON hijaiyah_progress(letter_id);
CREATE INDEX IF NOT EXISTS idx_favorite_letters_user_id ON favorite_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_letters_letter_id ON favorite_letters(letter_id);
