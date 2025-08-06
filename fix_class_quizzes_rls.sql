-- Fix class_quizzes table primary key and RLS issues

-- First, let's check the current structure
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'class_quizzes';

-- Drop existing table if it has issues and recreate with proper structure
DROP TABLE IF EXISTS class_quizzes CASCADE;

-- Create class_quizzes table with auto-incrementing ID
CREATE TABLE class_quizzes (
    id SERIAL PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 3,
    time_limit_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE class_quizzes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for class_quizzes
CREATE POLICY "Teachers can view their class quizzes" 
    ON class_quizzes FOR SELECT 
    USING (
        class_id IN (
            SELECT id FROM classes 
            WHERE teacher = (SELECT username FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Teachers can insert quizzes for their classes" 
    ON class_quizzes FOR INSERT 
    WITH CHECK (
        class_id IN (
            SELECT id FROM classes 
            WHERE teacher = (SELECT username FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Teachers can update their class quizzes" 
    ON class_quizzes FOR UPDATE 
    USING (
        class_id IN (
            SELECT id FROM classes 
            WHERE teacher = (SELECT username FROM users WHERE id = auth.uid())
        )
    );

CREATE POLICY "Teachers can delete their class quizzes" 
    ON class_quizzes FOR DELETE 
    USING (
        class_id IN (
            SELECT id FROM classes 
            WHERE teacher = (SELECT username FROM users WHERE id = auth.uid())
        )
    );

-- Create index for better performance
CREATE INDEX idx_class_quizzes_class_id ON class_quizzes(class_id);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_class_quizzes_updated_at 
    BEFORE UPDATE ON class_quizzes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();