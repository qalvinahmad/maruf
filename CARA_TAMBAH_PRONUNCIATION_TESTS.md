# 📝 CARA MENAMBAHKAN PRONUNCIATION TESTS KE EVENT

## 🎯 Masalah
Event menampilkan pesan "Belum Ada Soal Tes" karena tidak memiliki pronunciation tests di database.

## ✅ Solusi 1: Melalui Supabase Dashboard (Tercepat)

### 1. Login ke Supabase Dashboard
- Buka https://app.supabase.io
- Login ke project Anda

### 2. Buka Table Editor
- Klik "Table Editor" di sidebar
- Pilih tabel `event_pronunciation_tests`

### 3. Tambah Data Soal Tes
Klik "Insert" dan tambahkan data berikut:

**Untuk Event: "Peringatan Isra Mi'raj"**
```
event_id: [ID_EVENT_ISRA_MIRAJ]
test_order: 1
arabic_text: سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا
transliteration: Subhanallazi asra bi'abdihi lailan
translation: Maha Suci Allah yang telah memperjalankan hamba-Nya pada suatu malam
expected_sound: subhana allazi asra bi'abdihi lailan
difficulty: Menengah
```

**Untuk Event: "Ramadan Challenge"**
```
event_id: [ID_EVENT_RAMADAN]
test_order: 1
arabic_text: يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ
transliteration: ya ayyuhal lazina amanu kutiba 'alaykumus shiyam
translation: Hai orang-orang yang beriman, diwajibkan atas kamu berpuasa
expected_sound: ya ayyuha allazina amanu kutiba 'alaykumu as-siyamu
difficulty: Menengah
```

### 4. Tambah Reward (Opsional)
Di tabel `event_rewards`, tambahkan:
```
event_id: [ID_EVENT]
min_score: 70
xp_reward: 50
points_reward: 30
badge_reward: Master [NAMA_EVENT]
```

## ✅ Solusi 2: Melalui SQL Script

### 1. Jalankan Script SQL
Di Supabase SQL Editor, jalankan file `database/add_pronunciation_tests.sql`

### 2. Atau gunakan script khusus:
```sql
-- Contoh untuk Isra Mi'raj
INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) 
SELECT 
    id,
    1,
    'سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا',
    'Subhanallazi asra bi''abdihi lailan',
    'Maha Suci Allah yang telah memperjalankan hamba-Nya pada suatu malam',
    'subhana allazi asra bi''abdihi lailan',
    'Menengah'
FROM events 
WHERE title ILIKE '%Isra Mi%raj%'
ON CONFLICT (event_id, test_order) DO NOTHING;
```

## ✅ Solusi 3: Melalui API (Untuk Developer)

### 1. POST Request
```bash
curl -X POST http://localhost:3001/api/events/[EVENT_ID]/tests \
  -H "Content-Type: application/json" \
  -d '{
    "test_order": 1,
    "arabic_text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "transliteration": "Bismillahir-Rahmanir-Rahim",
    "translation": "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang",
    "expected_sound": "bismillahi ar-rahmani ar-rahimi",
    "difficulty": "Mudah"
  }'
```

## 🔍 Cara Mendapatkan Event ID

### Via Supabase Dashboard:
1. Buka tabel `events`
2. Salin ID event yang ingin ditambahkan tests
3. Gunakan ID tersebut di field `event_id`

### Via Browser:
1. Buka halaman event yang bermasalah
2. Lihat URL: `/dashboard/event/[EVENT_ID]`
3. Copy EVENT_ID dari URL

## 📋 Template Lengkap untuk Semua Event

```sql
-- Jalankan script ini di Supabase SQL Editor untuk menambah tests ke semua event

-- Event: Isra Mi'raj
INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) 
SELECT id, 1, 'سُبْحَانَ الَّذِي أَسْرَىٰ بِعَبْدِهِ لَيْلًا', 'Subhanallazi asra bi''abdihi lailan', 'Maha Suci Allah yang telah memperjalankan hamba-Nya pada suatu malam', 'subhana allazi asra bi''abdihi lailan', 'Menengah'
FROM events WHERE title ILIKE '%Isra Mi%raj%'
ON CONFLICT (event_id, test_order) DO NOTHING;

-- Event: Ramadan Challenge
INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) 
SELECT id, 1, 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُتِبَ عَلَيْكُمُ الصِّيَامُ', 'ya ayyuhal lazina amanu kutiba ''alaykumus shiyam', 'Hai orang-orang yang beriman, diwajibkan atas kamu berpuasa', 'ya ayyuha allazina amanu kutiba ''alaykumu as-siyamu', 'Menengah'
FROM events WHERE title ILIKE '%Ramadan%'
ON CONFLICT (event_id, test_order) DO NOTHING;

-- Event: Nisfu Sya'ban
INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) 
SELECT id, 1, 'وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ', 'wa minal layli fatahajjad bihi nafilatan laka', 'Dan pada sebahagian malam hari bersembahyang tahajudlah kamu sebagai suatu ibadah tambahan bagimu', 'wa mina al-layli fa-tahajjad bihi nafilatan laka', 'Sulit'
FROM events WHERE title ILIKE '%Nisfu Sya%ban%'
ON CONFLICT (event_id, test_order) DO NOTHING;

-- Event: Dzulhijjah
INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) 
SELECT id, 1, 'وَأَذِّن فِي النَّاسِ بِالْحَجِّ', 'wa azzin fin naasi bil hajj', 'Dan berserulah kepada manusia untuk mengerjakan haji', 'wa azzin fi an-nasi bi-al-hajji', 'Menengah'
FROM events WHERE title ILIKE '%Dzulhijjah%'
ON CONFLICT (event_id, test_order) DO NOTHING;

-- Event: Kompetisi Membaca
INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) 
SELECT id, 1, 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا', 'wa rattilil qur''ana tartiila', 'dan bacalah Al Quran itu dengan perlahan-lahan', 'wa rattili al-qur''ana tartiilan', 'Mudah'
FROM events WHERE title ILIKE '%Kompetisi%Membaca%'
ON CONFLICT (event_id, test_order) DO NOTHING;

-- Event lainnya (Default Al-Fatihah)
INSERT INTO event_pronunciation_tests (event_id, test_order, arabic_text, transliteration, translation, expected_sound, difficulty) 
SELECT 
    e.id, 
    1, 
    'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 
    'Bismillahir-Rahmanir-Rahim', 
    'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang', 
    'bismillahi ar-rahmani ar-rahimi', 
    'Mudah'
FROM events e
LEFT JOIN event_pronunciation_tests ept ON e.id = ept.event_id
WHERE ept.id IS NULL
ON CONFLICT (event_id, test_order) DO NOTHING;

-- Tambah rewards untuk semua event
INSERT INTO event_rewards (event_id, min_score, xp_reward, points_reward, badge_reward)
SELECT 
    e.id,
    70,
    50,
    30,
    CONCAT('Master ', SPLIT_PART(e.title, ' ', 1))
FROM events e
LEFT JOIN event_rewards er ON e.id = er.event_id
WHERE er.id IS NULL
ON CONFLICT DO NOTHING;
```

## ✅ Verifikasi

Setelah menambahkan tests:
1. Refresh halaman event
2. Tests akan muncul dan bisa dimainkan
3. Pesan "Belum Ada Soal Tes" akan hilang

## 🎯 Hasil Akhir

Setelah setup selesai:
- ✅ Semua event memiliki pronunciation tests
- ✅ User bisa mengikuti tes pronunciation
- ✅ Sistem scoring dan rewards berfungsi
- ✅ Progress tracking tersimpan di database
- ✅ Tidak ada lagi pesan "Belum Ada Soal Tes"
