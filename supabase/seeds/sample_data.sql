-- Insert sample teacher verifications (already verified from production)
INSERT INTO teacher_verifications (email, full_name, institution, phone, status, verified_at) VALUES
  ('qalvinahmad@gmail.com', 'Alvin Ahmad', 'Universitas Dinus', '+62812345678', 'verified', NOW()),
  ('111202013071@mhs.dinus.ac.id', 'Teacher Demo', 'Universitas Dinus', '+62812345679', 'verified', NOW())
ON CONFLICT (email) DO NOTHING;

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
