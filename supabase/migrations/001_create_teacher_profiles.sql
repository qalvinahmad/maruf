-- Create required tables
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    teaching_experience TEXT,
    institution TEXT,
    specialization TEXT,
    certifications TEXT,
    is_verified BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
    ON public.teacher_profiles
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated insert access"
    ON public.teacher_profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);
