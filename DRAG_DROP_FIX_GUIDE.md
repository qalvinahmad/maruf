# FIX DRAG AND DROP QUESTIONS - PANDUAN LENGKAP

## Masalah
Soal drag and drop dengan ID 823 (dan kemungkinan soal drag and drop lainnya) tidak memiliki pilihan jawaban karena masalah dalam relasi database.

## Penyebab
1. **Database Structure Issue**: Data `drag_and_drop_choices` dan `drag_and_drop_blanks` tidak terhubung dengan benar ke tabel `questions`
2. **Frontend Query Issue**: Frontend mencoba mengambil data drag and drop dari relasi yang salah
3. **Missing Data**: Question ID 823 tidak memiliki entries di tabel `drag_and_drop_choices`

## Solusi

### 1. Perbaikan Database (Jalankan di Supabase SQL Editor)

#### A. Perbaikan Cepat untuk Question 823
```sql
-- Jalankan script: fix_question_823.sql
-- Atau copy-paste query ini ke Supabase SQL Editor:

DELETE FROM drag_and_drop_choices WHERE question_id = 823;
DELETE FROM drag_and_drop_blanks WHERE question_id = 823;

INSERT INTO drag_and_drop_choices (question_id, choice_text) VALUES
(823, 'Ta'),
(823, 'Ba'),
(823, 'Ma'),
(823, 'Na');

INSERT INTO drag_and_drop_blanks (question_id, blank_index, correct_answer) VALUES
(823, 1, 'Ta');
```

#### B. Perbaikan Komprehensif untuk SubLesson 7
```sql
-- Jalankan script: fix_sublesson_7_drag_drop.sql
-- Script ini akan memperbaiki semua soal drag and drop di SubLesson 7
```

### 2. Perbaikan Frontend

#### Perubahan di `[subLessonId].jsx`:

1. **Fetch Query Update**: ✅ Sudah diperbaiki
   - Mengambil data langsung dari `drag_and_drop_choices` dan `drag_and_drop_blanks` berdasarkan `question_id`
   - Tidak lagi bergantung pada relasi yang salah melalui `drag_and_drop_questions`

2. **Render Function Update**: ✅ Sudah diperbaiki
   - Menambahkan pengecekan jika tidak ada choices
   - Menampilkan pesan error yang informatif
   - Menambahkan debug information

## Struktur Data yang Benar

### Questions Table
```
id | sublesson_id | question_text | question_type_id | order_sequence
823| 7           | "Pilih kata..." | 6              | 3
```

### Drag Drop Choices Table
```
id | question_id | choice_text
-- | 823        | 'Ta'
-- | 823        | 'Ba'
-- | 823        | 'Ma'
-- | 823        | 'Na'
```

### Drag Drop Blanks Table
```
id | question_id | blank_index | correct_answer
-- | 823        | 1          | 'Ta'
```

## Mapping Template berdasarkan Order Sequence

- **Order 1**: "Huruf Ba keluar dari ___" → Choices: mulut, hidung, telinga, mata → Answer: mulut
- **Order 2**: "Huruf ___ berbentuk seperti perahu" → Choices: Jim, Ba, Ta, Alif → Answer: Jim
- **Order 3**: "Bunyi huruf Ta adalah ___" → Choices: Ta, Ba, Ma, Na → Answer: Ta ← **Ini Question 823**
- **Order 4**: "Huruf ___ memiliki titik di bawah" → Choices: Jim, Ba, Ya, Ta → Answer: Jim
- **Order 5**: "Bunyi huruf ___ adalah Ma" → Choices: Mim, Ba, Ta, Na → Answer: Mim

## Cara Menjalankan Perbaikan

1. **Step 1**: Buka Supabase Dashboard → SQL Editor
2. **Step 2**: Copy-paste isi file `fix_sublesson_7_drag_drop.sql`
3. **Step 3**: Run query
4. **Step 4**: Verify dengan query terakhir di script
5. **Step 5**: Test di frontend - refresh halaman lesson

## Verifikasi Perbaikan

Setelah menjalankan script SQL, jalankan query ini untuk memastikan:

```sql
SELECT 
    q.id as question_id,
    q.question_text,
    q.order_sequence,
    COUNT(DISTINCT ddc.id) as choices_count,
    COUNT(DISTINCT ddb.id) as blanks_count,
    STRING_AGG(DISTINCT ddc.choice_text, ', ' ORDER BY ddc.choice_text) as choices
FROM questions q
LEFT JOIN drag_and_drop_choices ddc ON q.id = ddc.question_id
LEFT JOIN drag_and_drop_blanks ddb ON q.id = ddb.question_id
WHERE q.sublesson_id = 7 
  AND q.question_type_id = 6
GROUP BY q.id, q.question_text, q.order_sequence
ORDER BY q.order_sequence;
```

**Expected Result**: Setiap question harus memiliki 4 choices dan 1 blank.

## Files yang Telah Diperbaiki

- ✅ `[subLessonId].jsx` - Fetch query dan render function
- ✅ `fix_question_823.sql` - Perbaikan cepat untuk question 823
- ✅ `fix_sublesson_7_drag_drop.sql` - Perbaikan komprehensif SubLesson 7
- ✅ `fix_drag_drop_specific.sql` - Script perbaikan umum

## Next Steps

1. Jalankan script SQL untuk memperbaiki data
2. Test di browser - refresh halaman lesson
3. Jika masih ada masalah, cek console log untuk debug information
4. Ulangi perbaikan untuk SubLesson lain jika diperlukan

## Debug Information

Frontend sekarang akan menampilkan debug info jika tidak ada choices:
- Question ID yang bermasalah
- Jumlah choices yang ditemukan
- Error message yang jelas

Console log juga akan menampilkan informasi lengkap tentang data yang diambil dari database.
