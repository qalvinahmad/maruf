-- Create test_results table for storing detailed test statistics
CREATE TABLE IF NOT EXISTS test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  letter_id INTEGER, -- NULL for comprehensive tests
  test_type VARCHAR(50) NOT NULL DEFAULT 'comprehensive', -- 'letter_specific' or 'comprehensive'
  score DECIMAL(5,2) NOT NULL, -- Percentage score (0.00 to 100.00)
  questions_answered INTEGER NOT NULL,
  correct_answers INTEGER NOT NULL,
  time_taken INTEGER, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for test_results
ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

-- RLS policies for test_results
CREATE POLICY "Users can view their own test results"
  ON test_results FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own test results"
  ON test_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own test results"
  ON test_results FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable RLS for favorite_letters if it exists
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
CREATE INDEX IF NOT EXISTS idx_test_results_user_id ON test_results(user_id);
CREATE INDEX IF NOT EXISTS idx_test_results_letter_id ON test_results(letter_id);
CREATE INDEX IF NOT EXISTS idx_test_results_test_type ON test_results(test_type);
CREATE INDEX IF NOT EXISTS idx_test_results_completed_at ON test_results(completed_at);

CREATE INDEX IF NOT EXISTS idx_favorite_letters_user_id ON favorite_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_letters_letter_id ON favorite_letters(letter_id);
