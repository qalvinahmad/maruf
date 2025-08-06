-- Create sample events data
INSERT INTO events (
  id,
  title,
  type,
  description,
  date,
  time,
  status,
  speaker,
  speaker_title,
  created_at,
  updated_at
) VALUES 
  (
    gen_random_uuid(),
    'Workshop Tajwid Dasar',
    'workshop',
    'Workshop pembelajaran dasar tajwid untuk pemula',
    '2025-08-01',
    '10:00:00',
    'upcoming',
    'Ustadz Ahmad Fauzi',
    'Instruktur Tajwid',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Kompetisi Hijaiyah Challenge',
    'competition',
    'Kompetisi mengenali dan melafalkan huruf hijaiyah',
    '2025-08-05',
    '14:00:00',
    'upcoming',
    'Ustadzah Fatimah',
    'Pembimbing Bahasa Arab',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Seminar Al-Quran Digital',
    'seminar',
    'Seminar tentang teknologi pembelajaran Al-Quran',
    '2025-07-28',
    '19:00:00',
    'ongoing',
    'Dr. Muhammad Ali',
    'Pakar Teknologi Pendidikan',
    now(),
    now()
  ),
  (
    gen_random_uuid(),
    'Ujian Tengah Semester',
    'exam',
    'Ujian tengah semester untuk semua level',
    '2025-07-20',
    '09:00:00',
    'completed',
    'Tim Pengajar',
    'Koordinator Ujian',
    now(),
    now()
  );

-- Add some event registrations
INSERT INTO event_registrations (
  id,
  event_id,
  user_id,
  registration_status,
  registered_at
) 
SELECT 
  gen_random_uuid(),
  e.id,
  u.id,
  'registered',
  now()
FROM events e
CROSS JOIN (
  SELECT id FROM auth.users LIMIT 3
) u
WHERE e.status = 'upcoming';

-- Add some pronunciation tests for events
INSERT INTO event_pronunciation_tests (
  id,
  event_id,
  test_order,
  arabic_text,
  transliteration,
  translation,
  expected_sound,
  difficulty,
  created_at,
  updated_at
)
SELECT 
  gen_random_uuid(),
  e.id,
  gs.test_order,
  gs.arabic_text,
  gs.transliteration,
  gs.translation,
  gs.expected_sound,
  gs.difficulty,
  now(),
  now()
FROM events e
CROSS JOIN (
  VALUES 
    (1, 'ا', 'alif', 'A', '/a/', 'easy'),
    (2, 'ب', 'ba', 'B', '/ba/', 'easy'),
    (3, 'ت', 'ta', 'T', '/ta/', 'easy'),
    (4, 'ث', 'tsa', 'Th', '/θa/', 'medium'),
    (5, 'ج', 'jim', 'J', '/dʒa/', 'medium')
) AS gs(test_order, arabic_text, transliteration, translation, expected_sound, difficulty)
WHERE e.type IN ('competition', 'exam');

-- Add event rewards
INSERT INTO event_rewards (
  id,
  event_id,
  min_score,
  xp_reward,
  points_reward,
  badge_reward,
  special_reward,
  created_at
)
SELECT 
  gen_random_uuid(),
  e.id,
  CASE 
    WHEN e.type = 'competition' THEN 80
    WHEN e.type = 'exam' THEN 70
    ELSE 60
  END,
  CASE 
    WHEN e.type = 'competition' THEN 500
    WHEN e.type = 'exam' THEN 300
    ELSE 200
  END,
  CASE 
    WHEN e.type = 'competition' THEN 1000
    WHEN e.type = 'exam' THEN 600
    ELSE 400
  END,
  CASE 
    WHEN e.type = 'competition' THEN 'competition_winner'
    WHEN e.type = 'exam' THEN 'exam_master'
    ELSE 'participant'
  END,
  CASE 
    WHEN e.type = 'competition' THEN 'Sertifikat Juara Kompetisi'
    WHEN e.type = 'exam' THEN 'Sertifikat Kelulusan'
    ELSE 'Sertifikat Partisipasi'
  END,
  now()
FROM events e;
