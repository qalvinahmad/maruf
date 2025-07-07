-- Create roadmap_sub_lessons table
CREATE TABLE roadmap_sub_lessons (
    id SERIAL PRIMARY KEY,
    level_id INTEGER REFERENCES roadmap_levels(id),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'locked',
    order_sequence INTEGER NOT NULL,
    points INTEGER DEFAULT 50,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial sub lessons
INSERT INTO roadmap_sub_lessons (level_id, title, description, status, order_sequence, points) VALUES
(1, 'Mengenal Bentuk Huruf Hijaiyah', 'Belajar mengenali bentuk visual tiap huruf hijaiyah', 'active', 1, 50),
(1, 'Mengenal Bunyi Huruf Hijaiyah', 'Memahami dan melafalkan bunyi masing-masing huruf', 'locked', 2, 75),
(1, 'Latihan Interaktif', 'Berlatih mencocokkan bentuk dan bunyi huruf', 'locked', 3, 100);

-- Create user_sub_lesson_progress table
CREATE TABLE user_sub_lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    sub_lesson_id INTEGER REFERENCES roadmap_sub_lessons(id),
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'not_started',
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, sub_lesson_id)
);
