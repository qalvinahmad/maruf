-- Create roadmap_levels table
CREATE TABLE roadmap_levels (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    level TEXT NOT NULL,
    duration TEXT NOT NULL,
    status TEXT DEFAULT 'locked',
    color TEXT NOT NULL,
    lessons_total INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    order_sequence INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_roadmap_progress table
CREATE TABLE user_roadmap_progress (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    roadmap_id INTEGER REFERENCES roadmap_levels(id),
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'locked',  -- locked, active, completed
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, roadmap_id)
);

-- Insert initial roadmap data
INSERT INTO roadmap_levels (
    title, 
    description, 
    level, 
    duration, 
    status, 
    color, 
    lessons_total, 
    lessons_completed, 
    points, 
    order_sequence
) VALUES 
(
    'Pengenalan Huruf Hijaiyah',
    'Belajar mengenal bentuk dan bunyi dasar huruf hijaiyah dengan metode interaktif',
    'Dasar',
    '2-3 minggu',
    'active',
    'emerald',
    12,
    10,
    150,
    1
),
(
    'Harakat & Tanda Baca',
    'Mempelajari harakat fathah, kasrah, dhammah, dan tanda baca lainnya untuk membaca dengan tepat',
    'Menengah',
    '3-4 minggu',
    'locked',
    'blue',
    16,
    0,
    200,
    2
),
(
    'Tajwid Dasar',
    'Belajar aturan dasar membaca Al-Quran dengan benar sesuai kaidah tajwid',
    'Lanjutan',
    '5-6 minggu',
    'locked',
    'purple',
    24,
    0,
    300,
    3
),
(
    'Praktik Membaca Surah Pendek',
    'Latihan membaca surah-surah pendek dengan tajwid yang benar dan lancar',
    'Mahir',
    '6-8 minggu',
    'locked',
    'orange',
    20,
    0,
    400,
    4
);
