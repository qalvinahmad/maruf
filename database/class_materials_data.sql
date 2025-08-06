-- ================================================
-- CLASS MATERIALS AND CONTENT
-- Complete content for classes 1 and 2 with detailed sections, quizzes, and questions
-- ================================================

-- ================================================
-- CLASS 1: TAJWID DASAR
-- ================================================

-- Sections for Tajwid Dasar
INSERT INTO class_sections (class_id, section_order, title, content, duration_minutes) VALUES
(1, 1, 'Pengertian dan Sejarah Tajwid', '
<h3>Apa itu Ilmu Tajwid?</h3>
<p>Tajwid secara bahasa berasal dari kata <strong>"jawwada-yujawwidu-tajwiidan"</strong> yang artinya <em>membaguskan</em> atau <em>memperindah</em>. Secara istilah, tajwid adalah ilmu yang mempelajari cara membaca Al-Quran dengan baik dan benar sesuai dengan kaidah yang telah ditetapkan.</p>

<h4>Tujuan Mempelajari Tajwid:</h4>
<ul>
  <li>Menjaga kemurnian bacaan Al-Quran</li>
  <li>Menghindari kesalahan dalam pengucapan</li>
  <li>Memperindah bacaan Al-Quran</li>
  <li>Mendapatkan pahala yang berlipat</li>
</ul>

<h4>Sejarah Perkembangan Tajwid</h4>
<p>Ilmu tajwid mulai dikembangkan pada abad ke-4 Hijriah ketika Islam menyebar ke berbagai negara dan banyak non-Arab yang masuk Islam. Para ulama khawatir akan terjadinya kesalahan dalam membaca Al-Quran.</p>

<div class="info-box bg-blue-50 p-4 rounded-lg border border-blue-200 my-4">
  <h5 class="font-semibold text-blue-800 mb-2">🔍 Tahukah Anda?</h5>
  <p class="text-blue-700">Imam Ali bin Abi Thalib r.a. adalah orang pertama yang meletakkan dasar-dasar ilmu tajwid.</p>
</div>

<h4>Hukum Mempelajari Tajwid</h4>
<p>Para ulama sepakat bahwa hukum mempelajari tajwid adalah <strong>fardhu kifayah</strong> (wajib kolektif), sedangkan mengamalkannya dalam membaca Al-Quran adalah <strong>fardhu ain</strong> (wajib individual).</p>
', 10),

(1, 2, 'Makharijul Huruf (Tempat Keluarnya Huruf)', '
<h3>Pengertian Makharijul Huruf</h3>
<p>Makharijul huruf adalah tempat-tempat keluarnya huruf-huruf hijaiyah ketika diucapkan. Setiap huruf memiliki tempat keluar (makhraj) yang berbeda-beda.</p>

<h4>Pembagian Makharijul Huruf</h4>
<p>Terdapat <strong>5 makhraj utama</strong> yang terbagi menjadi <strong>17 makhraj khusus</strong>:</p>

<h5>1. Al-Jauf (الجوف) - Rongga Mulut dan Tenggorokan</h5>
<div class="bg-green-50 p-3 rounded mb-3">
  <p><strong>Huruf:</strong> ا - و - ي (huruf mad)</p>
  <p><strong>Cara:</strong> Udara keluar dari rongga mulut tanpa ada hambatan</p>
</div>

<h5>2. Al-Halq (الحلق) - Tenggorokan</h5>
<div class="bg-yellow-50 p-3 rounded mb-3">
  <p><strong>Pangkal tenggorokan:</strong> ء - ه</p>
  <p><strong>Tengah tenggorokan:</strong> ع - ح</p>
  <p><strong>Ujung tenggorokan:</strong> غ - خ</p>
</div>

<h5>3. Al-Lisan (اللسان) - Lidah</h5>
<div class="bg-purple-50 p-3 rounded mb-3">
  <p><strong>Pangkal lidah:</strong> ق - ك</p>
  <p><strong>Tengah lidah:</strong> ج - ش - ي</p>
  <p><strong>Ujung lidah:</strong> ل - ن - ر - ط - د - ت - ص - ز - س - ث - ذ - ظ - ض</p>
</div>

<h5>4. Asy-Syafatan (الشفتان) - Bibir</h5>
<div class="bg-red-50 p-3 rounded mb-3">
  <p><strong>Bibir bawah + gigi atas:</strong> ف</p>
  <p><strong>Kedua bibir:</strong> ب - م - و</p>
</div>

<h5>5. Al-Khaisyum (الخيشوم) - Hidung</h5>
<div class="bg-gray-50 p-3 rounded mb-3">
  <p><strong>Fungsi:</strong> Untuk ghunnah (dengung) pada huruf ن dan م</p>
</div>

<div class="practice-box bg-orange-50 p-4 rounded-lg border border-orange-200 my-4">
  <h5 class="font-semibold text-orange-800 mb-2">💪 Latihan</h5>
  <p class="text-orange-700">Ucapkan setiap huruf dengan memperhatikan tempat keluarnya. Rasakan perbedaan posisi lidah, bibir, dan tenggorokan saat mengucapkan huruf yang berbeda.</p>
</div>
', 15),

(1, 3, 'Sifatul Huruf (Sifat-sifat Huruf)', '
<h3>Pengertian Sifatul Huruf</h3>
<p>Sifatul huruf adalah cara pengucapan huruf-huruf hijaiyah yang membedakan karakter bunyi antara satu huruf dengan huruf lainnya meskipun keluar dari makhraj yang sama.</p>

<h4>Pembagian Sifatul Huruf</h4>

<h5>1. Sifat yang Memiliki Lawan (Sifat Mutadhaddah)</h5>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
  <div class="bg-blue-50 p-4 rounded-lg">
    <h6 class="font-semibold text-blue-800">Hams (Berbisik)</h6>
    <p class="text-sm text-blue-700">Huruf: ف ح ث ه ش خ ص س ك ت</p>
    <p class="text-xs text-blue-600">Nafas keluar saat mengucapkan huruf</p>
  </div>
  <div class="bg-green-50 p-4 rounded-lg">
    <h6 class="font-semibold text-green-800">Jahr (Tegas)</h6>
    <p class="text-sm text-green-700">Huruf selain hams</p>
    <p class="text-xs text-green-600">Nafas tertahan saat mengucapkan huruf</p>
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
  <div class="bg-purple-50 p-4 rounded-lg">
    <h6 class="font-semibold text-purple-800">Syiddah (Kuat)</h6>
    <p class="text-sm text-purple-700">Huruf: أ ج د ق ط ب ك</p>
    <p class="text-xs text-purple-600">Bunyi tertahan sempurna</p>
  </div>
  <div class="bg-yellow-50 p-4 rounded-lg">
    <h6 class="font-semibold text-yellow-800">Rakhawah (Lemah)</h6>
    <p class="text-sm text-yellow-700">Huruf selain syiddah dan mutawassithah</p>
    <p class="text-xs text-yellow-600">Bunyi mengalir lancar</p>
  </div>
</div>

<h5>2. Sifat yang Tidak Memiliki Lawan (Sifat Ghairu Mutadhaddah)</h5>
<div class="space-y-3">
  <div class="bg-red-50 p-3 rounded">
    <strong>Qalqalah:</strong> ق ط ب ج د - bunyi memantul
  </div>
  <div class="bg-indigo-50 p-3 rounded">
    <strong>Ghunnah:</strong> ن م - bunyi berdengung
  </div>
  <div class="bg-pink-50 p-3 rounded">
    <strong>Madd:</strong> ا و ي - bunyi panjang
  </div>
</div>

<div class="warning-box bg-amber-50 p-4 rounded-lg border border-amber-200 my-4">
  <h5 class="font-semibold text-amber-800 mb-2">⚠️ Penting</h5>
  <p class="text-amber-700">Memahami sifat huruf sangat penting untuk mengucapkan huruf dengan benar dan membedakan huruf yang memiliki makhraj sama.</p>
</div>
', 12),

(1, 4, 'Hukum-hukum Bacaan Dasar', '
<h3>Hukum Bacaan dalam Tajwid</h3>
<p>Setelah memahami makhraj dan sifat huruf, kita perlu mempelajari hukum-hukum bacaan yang sering dijumpai dalam Al-Quran.</p>

<h4>1. Hukum Nun Sukun dan Tanwin</h4>
<div class="space-y-3">
  <div class="bg-blue-50 p-4 rounded-lg">
    <h5 class="font-semibold text-blue-800">Izhhar (الإظهار)</h5>
    <p class="text-blue-700"><strong>Huruf:</strong> ء ه ع ح غ خ</p>
    <p class="text-sm text-blue-600">Dibaca jelas tanpa dengung</p>
    <p class="text-xs text-blue-500">Contoh: مِنْ أَهْلِ - أَنْعَمْتَ</p>
  </div>
  
  <div class="bg-green-50 p-4 rounded-lg">
    <h5 class="font-semibold text-green-800">Idgham (الإدغام)</h5>
    <p class="text-green-700"><strong>Huruf:</strong> ي ر م ل و ن</p>
    <p class="text-sm text-green-600">Dilebur dengan huruf setelahnya</p>
    <p class="text-xs text-green-500">Contoh: مِنْ رَبِّكُمْ - مِنْ لَدُنْ</p>
  </div>
  
  <div class="bg-yellow-50 p-4 rounded-lg">
    <h5 class="font-semibold text-yellow-800">Iqlab (الإقلاب)</h5>
    <p class="text-yellow-700"><strong>Huruf:</strong> ب</p>
    <p class="text-sm text-yellow-600">Diubah menjadi mim dengan ghunnah</p>
    <p class="text-xs text-yellow-500">Contoh: مِنْ بَعْدِ - أَنْبِئْهُمْ</p>
  </div>
  
  <div class="bg-purple-50 p-4 rounded-lg">
    <h5 class="font-semibold text-purple-800">Ikhfa (الإخفاء)</h5>
    <p class="text-purple-700"><strong>Huruf:</strong> 15 huruf sisanya</p>
    <p class="text-sm text-purple-600">Dibaca samar dengan ghunnah</p>
    <p class="text-xs text-purple-500">Contoh: مِنْ قَبْلُ - عَنْ تَرَاضٍ</p>
  </div>
</div>

<h4>2. Hukum Mim Sukun</h4>
<div class="space-y-3">
  <div class="bg-red-50 p-4 rounded-lg">
    <h5 class="font-semibold text-red-800">Ikhfa Syafawi</h5>
    <p class="text-red-700">Mim sukun + ب = dibaca samar</p>
    <p class="text-xs text-red-500">Contoh: يَعْتَصِمْ بِاللهِ</p>
  </div>
  
  <div class="bg-green-50 p-4 rounded-lg">
    <h5 class="font-semibold text-green-800">Idgham Mitslain</h5>
    <p class="text-green-700">Mim sukun + م = dilebur dengan ghunnah</p>
    <p class="text-xs text-green-500">Contoh: لَهُمْ مَا</p>
  </div>
  
  <div class="bg-blue-50 p-4 rounded-lg">
    <h5 class="font-semibold text-blue-800">Izhhar Syafawi</h5>
    <p class="text-blue-700">Mim sukun + selain ب dan م = dibaca jelas</p>
    <p class="text-xs text-blue-500">Contoh: هُمْ فِيهَا</p>
  </div>
</div>

<div class="practice-box bg-orange-50 p-4 rounded-lg border border-orange-200 my-4">
  <h5 class="font-semibold text-orange-800 mb-2">🎯 Tips Belajar</h5>
  <ul class="text-orange-700 text-sm space-y-1">
    <li>• Hafalkan huruf-huruf setiap hukum</li>
    <li>• Latihan dengan contoh-contoh dari Al-Quran</li>
    <li>• Dengarkan qiraat dari qari terkenal</li>
    <li>• Praktik langsung dengan guru</li>
  </ul>
</div>
', 18);

-- Quiz for Tajwid Dasar
INSERT INTO class_quizzes (class_id, title, description, passing_score) VALUES
(1, 'Kuis Tajwid Dasar', 'Ujian pemahaman dasar-dasar ilmu tajwid', 70);

-- Quiz questions for Tajwid Dasar
INSERT INTO quiz_questions (quiz_id, question_order, question_text, correct_answer, explanation) VALUES
((SELECT id FROM class_quizzes WHERE class_id = 1), 1, 'Apa arti tajwid secara bahasa?', 1, 'Tajwid berasal dari kata jawwada yang artinya membaguskan atau memperindah'),
((SELECT id FROM class_quizzes WHERE class_id = 1), 2, 'Berapa jumlah makhraj utama dalam huruf hijaiyah?', 0, 'Terdapat 5 makhraj utama: Al-Jauf, Al-Halq, Al-Lisan, Asy-Syafatan, dan Al-Khaisyum'),
((SELECT id FROM class_quizzes WHERE class_id = 1), 3, 'Huruf ق termasuk dalam makhraj...', 2, 'Huruf ق keluar dari pangkal lidah (Al-Lisan)'),
((SELECT id FROM class_quizzes WHERE class_id = 1), 4, 'Hukum nun sukun bertemu dengan huruf خ adalah...', 0, 'Huruf خ termasuk huruf izhhar, sehingga nun sukun dibaca jelas'),
((SELECT id FROM class_quizzes WHERE class_id = 1), 5, 'Sifat huruf ب adalah...', 2, 'Huruf ب memiliki sifat jahr (tegas) dan syiddah (kuat), serta qalqalah');

-- Quiz options for Tajwid Dasar
INSERT INTO quiz_question_options (question_id, option_order, option_text, is_correct) VALUES
-- Question 1
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 1), 0, 'Mempersulit', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 1), 1, 'Membaguskan', true),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 1), 2, 'Mempercepat', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 1), 3, 'Memperlambat', false),

-- Question 2
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 2), 0, '5', true),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 2), 1, '17', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 2), 2, '7', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 2), 3, '10', false),

-- Question 3
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 3), 0, 'Al-Jauf', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 3), 1, 'Al-Halq', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 3), 2, 'Al-Lisan', true),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 3), 3, 'Asy-Syafatan', false),

-- Question 4
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 4), 0, 'Izhhar', true),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 4), 1, 'Idgham', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 4), 2, 'Iqlab', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 4), 3, 'Ikhfa', false),

-- Question 5
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 5), 0, 'Hams dan Rakhawah', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 5), 1, 'Jahr dan Rakhawah', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 5), 2, 'Jahr, Syiddah, dan Qalqalah', true),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 1) AND question_order = 5), 3, 'Hams dan Syiddah', false);

-- ================================================
-- CLASS 2: HUKUM NUN SUKUN & TANWIN
-- ================================================

-- Sections for Hukum Nun Sukun & Tanwin
INSERT INTO class_sections (class_id, section_order, title, content, duration_minutes) VALUES
(2, 1, 'Pengertian Nun Sukun dan Tanwin', '
<h3>Definisi Nun Sukun</h3>
<p>Nun sukun adalah huruf <strong>ن</strong> yang tidak memiliki harakat (tidak berharakat) dan ditulis dengan tanda sukun (ْ) di atasnya.</p>

<div class="bg-blue-50 p-4 rounded-lg my-4">
  <h4 class="font-semibold text-blue-800 mb-2">Ciri-ciri Nun Sukun:</h4>
  <ul class="text-blue-700 space-y-1">
    <li>• Huruf ن yang bertanda sukun (نْ)</li>
    <li>• Terletak di tengah atau akhir kata</li>
    <li>• Bunyi mati, tidak berharakat</li>
  </ul>
</div>

<h3>Definisi Tanwin</h3>
<p>Tanwin adalah nun sukun tambahan yang dibaca di akhir kata dan ditulis dengan tanda dobel pada harakat terakhir.</p>

<div class="bg-green-50 p-4 rounded-lg my-4">
  <h4 class="font-semibold text-green-800 mb-2">Jenis-jenis Tanwin:</h4>
  <div class="space-y-2 text-green-700">
    <div class="flex items-center gap-3">
      <span class="font-bold text-lg">ً</span>
      <span>Tanwin Fath (Fathatan) - bunyi "an"</span>
    </div>
    <div class="flex items-center gap-3">
      <span class="font-bold text-lg">ٌ</span>
      <span>Tanwin Dhom (Dhommatan) - bunyi "un"</span>
    </div>
    <div class="flex items-center gap-3">
      <span class="font-bold text-lg">ٍ</span>
      <span>Tanwin Jar (Kasratan) - bunyi "in"</span>
    </div>
  </div>
</div>

<h4>Perbedaan Nun Sukun dan Tanwin</h4>
<div class="overflow-x-auto">
  <table class="w-full border-collapse border border-slate-300 my-4">
    <thead>
      <tr class="bg-slate-100">
        <th class="border border-slate-300 p-3 text-left">Aspek</th>
        <th class="border border-slate-300 p-3 text-left">Nun Sukun</th>
        <th class="border border-slate-300 p-3 text-left">Tanwin</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td class="border border-slate-300 p-3 font-semibold">Penulisan</td>
        <td class="border border-slate-300 p-3">نْ dengan sukun</td>
        <td class="border border-slate-300 p-3">Tanda dobel (ً ٌ ٍ)</td>
      </tr>
      <tr class="bg-slate-50">
        <td class="border border-slate-300 p-3 font-semibold">Posisi</td>
        <td class="border border-slate-300 p-3">Tengah atau akhir kata</td>
        <td class="border border-slate-300 p-3">Hanya di akhir kata</td>
      </tr>
      <tr>
        <td class="border border-slate-300 p-3 font-semibold">Waqaf</td>
        <td class="border border-slate-300 p-3">Tetap dibaca</td>
        <td class="border border-slate-300 p-3">Tidak dibaca (hilang)</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="practice-box bg-yellow-50 p-4 rounded-lg border border-yellow-200 my-4">
  <h5 class="font-semibold text-yellow-800 mb-2">📝 Contoh dalam Al-Quran</h5>
  <div class="space-y-2 text-yellow-700">
    <p><strong>Nun Sukun:</strong> مِنْ رَبِّكُمْ - أَنْعَمْتَ - وَالنَّاسِ</p>
    <p><strong>Tanwin:</strong> عَلِيمٌ حَكِيمٌ - غَفُورٌ رَحِيمٌ - هُدًى لِلنَّاسِ</p>
  </div>
</div>
', 8),

(2, 2, 'Hukum Izhhar', '
<h3>Pengertian Izhhar</h3>
<p>Izhhar (الإظهار) secara bahasa artinya <em>"jelas"</em> atau <em>"terang"</em>. Secara istilah, izhhar adalah membaca nun sukun atau tanwin dengan jelas tanpa dengung (ghunnah) ketika bertemu dengan huruf-huruf izhhar.</p>

<h4>Huruf-huruf Izhhar</h4>
<div class="bg-blue-50 p-6 rounded-lg my-4">
  <h5 class="font-semibold text-blue-800 mb-3 text-center">6 Huruf Izhhar</h5>
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
    <div class="bg-white p-3 rounded shadow">
      <div class="text-3xl font-bold text-blue-600 mb-1">ء</div>
      <div class="text-sm text-blue-800">Hamzah</div>
    </div>
    <div class="bg-white p-3 rounded shadow">
      <div class="text-3xl font-bold text-blue-600 mb-1">هـ</div>
      <div class="text-sm text-blue-800">Ha</div>
    </div>
    <div class="bg-white p-3 rounded shadow">
      <div class="text-3xl font-bold text-blue-600 mb-1">ع</div>
      <div class="text-sm text-blue-800">Ain</div>
    </div>
    <div class="bg-white p-3 rounded shadow">
      <div class="text-3xl font-bold text-blue-600 mb-1">ح</div>
      <div class="text-sm text-blue-800">Ha</div>
    </div>
    <div class="bg-white p-3 rounded shadow">
      <div class="text-3xl font-bold text-blue-600 mb-1">غ</div>
      <div class="text-sm text-blue-800">Ghain</div>
    </div>
    <div class="bg-white p-3 rounded shadow">
      <div class="text-3xl font-bold text-blue-600 mb-1">خ</div>
      <div class="text-sm text-blue-800">Kha</div>
    </div>
  </div>
</div>

<h4>Cara Membaca Izhhar</h4>
<div class="bg-green-50 p-4 rounded-lg my-4">
  <ul class="text-green-700 space-y-2">
    <li>• Nun sukun atau tanwin dibaca dengan <strong>jelas</strong></li>
    <li>• <strong>Tidak ada dengung</strong> (ghunnah)</li>
    <li>• Huruf setelahnya dibaca normal</li>
    <li>• Jeda sedikit antara nun dan huruf izhhar</li>
  </ul>
</div>

<h4>Contoh-contoh Izhhar</h4>
<div class="space-y-4">
  <div class="bg-yellow-50 p-4 rounded-lg">
    <h5 class="font-semibold text-yellow-800 mb-2">Nun Sukun + Huruf Izhhar</h5>
    <div class="space-y-2 text-yellow-700">
      <p>• مِنْ أَهْلِ الْكِتَابِ (min ahli) - nun sukun + hamzah</p>
      <p>• أَنْعَمْتَ عَلَيْهِمْ (an\'amta) - nun sukun + ain</p>
      <p>• مِنْ حَيْثُ (min haitsu) - nun sukun + ha</p>
      <p>• مِنْ غَيْرِ (min ghairi) - nun sukun + ghain</p>
    </div>
  </div>
  
  <div class="bg-purple-50 p-4 rounded-lg">
    <h5 class="font-semibold text-purple-800 mb-2">Tanwin + Huruf Izhhar</h5>
    <div class="space-y-2 text-purple-700">
      <p>• رَسُولٌ أَمِينٌ (rasuulun amiin) - tanwin + hamzah</p>
      <p>• عَلِيمٌ حَكِيمٌ (aliimun hakiim) - tanwin + ha</p>
      <p>• غَفُورٌ رَحِيمٌ (ghafuurun rahiim) - tanwin + ha</p>
      <p>• قَوْلٍ عَظِيمٍ (qaulin azhiim) - tanwin + ain</p>
    </div>
  </div>
</div>

<div class="info-box bg-red-50 p-4 rounded-lg border border-red-200 my-4">
  <h5 class="font-semibold text-red-800 mb-2">🎯 Tips Praktis</h5>
  <ul class="text-red-700 space-y-1">
    <li>• Hafalkan 6 huruf izhhar dengan baik</li>
    <li>• Latihan dengan membaca perlahan-lahan</li>
    <li>• Pastikan tidak ada dengung pada nun</li>
    <li>• Berikan jeda tipis antara nun dan huruf izhhar</li>
  </ul>
</div>
', 12),

(2, 3, 'Hukum Idgham', '
<h3>Pengertian Idgham</h3>
<p>Idgham (الإدغام) secara bahasa artinya <em>"memasukkan"</em> atau <em>"meleburkan"</em>. Secara istilah, idgham adalah meleburkan nun sukun atau tanwin ke dalam huruf setelahnya sehingga keduanya menjadi satu bunyi.</p>

<h4>Pembagian Idgham</h4>
<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
  <div class="bg-green-50 p-4 rounded-lg border border-green-200">
    <h5 class="font-semibold text-green-800 mb-3">Idgham Bighunnah</h5>
    <p class="text-green-700 mb-2"><strong>Huruf:</strong> ي ن م و</p>
    <p class="text-sm text-green-600">Dilebur <em>dengan</em> dengung (ghunnah)</p>
    <div class="mt-3 bg-white p-2 rounded text-center">
      <span class="text-2xl font-bold text-green-600">ينمو</span>
    </div>
  </div>
  
  <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
    <h5 class="font-semibold text-blue-800 mb-3">Idgham Bilaghunnah</h5>
    <p class="text-blue-700 mb-2"><strong>Huruf:</strong> ل ر</p>
    <p class="text-sm text-blue-600">Dilebur <em>tanpa</em> dengung (ghunnah)</p>
    <div class="mt-3 bg-white p-2 rounded text-center">
      <span class="text-2xl font-bold text-blue-600">لر</span>
    </div>
  </div>
</div>

<h4>Cara Membaca Idgham</h4>
<div class="bg-yellow-50 p-4 rounded-lg my-4">
  <h5 class="font-semibold text-yellow-800 mb-2">Langkah-langkah:</h5>
  <ol class="text-yellow-700 space-y-1">
    <li>1. Nun sukun/tanwin <strong>tidak dibaca</strong></li>
    <li>2. Huruf setelahnya dibaca <strong>bertasydid</strong></li>
    <li>3. Untuk bighunnah: tambahkan <strong>dengung 2 harakat</strong></li>
    <li>4. Untuk bilaghunnah: <strong>tanpa dengung</strong></li>
  </ol>
</div>

<h4>Contoh-contoh Idgham</h4>
<div class="space-y-4">
  <div class="bg-green-50 p-4 rounded-lg">
    <h5 class="font-semibold text-green-800 mb-2">Idgham Bighunnah</h5>
    <div class="space-y-2 text-green-700">
      <p>• مِنْ يَتَّقِ (mi yattaqi) - nun sukun + ya</p>
      <p>• مَنْ نُصِرَ (man nushira) - nun sukun + nun</p>
      <p>• أَجْرٌ عَظِيمٌ مِنْ (ajrun azhiimum min) - tanwin + mim</p>
      <p>• هُدًى وَمَوْعِظَةٌ (hudaw wa mau\'izhatun) - tanwin + waw</p>
    </div>
  </div>
  
  <div class="bg-blue-50 p-4 rounded-lg">
    <h5 class="font-semibold text-blue-800 mb-2">Idgham Bilaghunnah</h5>
    <div class="space-y-2 text-blue-700">
      <p>• مِنْ رَبِّكُمْ (mir rabbikum) - nun sukun + ra</p>
      <p>• مِنْ لَدُنْ (mil ladun) - nun sukun + lam</p>
      <p>• هُدًى لِلنَّاسِ (hudal linnaas) - tanwin + lam</p>
      <p>• غَفُورٌ رَحِيمٌ (ghafuurur rahiim) - tanwin + ra</p>
    </div>
  </div>
</div>

<div class="warning-box bg-red-50 p-4 rounded-lg border border-red-200 my-4">
  <h5 class="font-semibold text-red-800 mb-2">⚠️ Pengecualian</h5>
  <div class="text-red-700 space-y-2">
    <p><strong>Idgham Naaqis:</strong> Jika nun sukun bertemu ya atau waw dalam satu kata, maka <em>tidak</em> terjadi idgham.</p>
    <p><strong>Contoh:</strong> دُنْيَا (dunya), صِنْوَانٌ (shinwaan), بُنْيَانٌ (bunyaan)</p>
  </div>
</div>
', 15),

(2, 4, 'Hukum Iqlab dan Ikhfa', '
<h3>Hukum Iqlab</h3>
<p>Iqlab (الإقلاب) secara bahasa artinya <em>"membalik"</em> atau <em>"mengubah"</em>. Secara istilah, iqlab adalah mengubah nun sukun atau tanwin menjadi mim ketika bertemu dengan huruf ba (ب).</p>

<div class="bg-blue-50 p-4 rounded-lg my-4">
  <h4 class="font-semibold text-blue-800 mb-2">Huruf Iqlab</h4>
  <div class="text-center">
    <div class="inline-block bg-blue-600 text-white text-4xl font-bold p-4 rounded-lg">ب</div>
    <p class="text-blue-700 mt-2">Hanya huruf <strong>BA</strong></p>
  </div>
</div>

<h4>Cara Membaca Iqlab</h4>
<div class="bg-green-50 p-4 rounded-lg my-4">
  <ol class="text-green-700 space-y-2">
    <li>1. Nun sukun/tanwin <strong>diubah menjadi mim</strong></li>
    <li>2. Dibaca dengan <strong>ghunnah 2 harakat</strong></li>
    <li>3. Bibir <strong>hampir tertutup</strong> (tidak rapat)</li>
    <li>4. Huruf ba setelahnya dibaca normal</li>
  </ol>
</div>

<h4>Contoh Iqlab</h4>
<div class="bg-yellow-50 p-4 rounded-lg my-4">
  <div class="space-y-2 text-yellow-700">
    <p>• مِنْ بَعْدِ (mim ba\'di) - nun sukun + ba</p>
    <p>• أَنْبِئْهُمْ (ambil\'hum) - nun sukun + ba</p>
    <p>• لِينْبِئَ (liyumbi\'a) - nun sukun + ba</p>
    <p>• عَلِيمٌ بِذَاتِ (aliimum bidzaati) - tanwin + ba</p>
  </div>
</div>

<hr class="my-6 border-slate-300">

<h3>Hukum Ikhfa</h3>
<p>Ikhfa (الإخفاء) secara bahasa artinya <em>"menyembunyikan"</em> atau <em>"menyamarkan"</em>. Secara istilah, ikhfa adalah membaca nun sukun atau tanwin secara samar (antara jelas dan lebur) ketika bertemu dengan huruf-huruf ikhfa.</p>

<h4>Huruf-huruf Ikhfa</h4>
<div class="bg-purple-50 p-4 rounded-lg my-4">
  <h5 class="font-semibold text-purple-800 mb-3 text-center">15 Huruf Ikhfa</h5>
  <div class="grid grid-cols-3 md:grid-cols-5 gap-3 text-center">
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ت</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ث</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ج</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">د</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ذ</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ز</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">س</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ش</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ص</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ض</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ط</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ظ</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ف</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ق</span></div>
    <div class="bg-white p-2 rounded shadow"><span class="text-2xl font-bold text-purple-600">ك</span></div>
  </div>
</div>

<h4>Cara Membaca Ikhfa</h4>
<div class="bg-red-50 p-4 rounded-lg my-4">
  <ul class="text-red-700 space-y-2">
    <li>• Nun sukun/tanwin dibaca <strong>samar</strong></li>
    <li>• Dengan <strong>ghunnah 2 harakat</strong></li>
    <li>• Posisi lidah <strong>mendekati</strong> makhraj huruf setelahnya</li>
    <li>• Tidak jelas seperti izhhar, tidak lebur seperti idgham</li>
  </ul>
</div>

<h4>Contoh Ikhfa</h4>
<div class="bg-orange-50 p-4 rounded-lg my-4">
  <div class="space-y-2 text-orange-700">
    <p>• مِنْ تَحْتِهَا (min tahtiha) - nun sukun + ta</p>
    <p>• عَنْ تَرَاضٍ (an taraadhin) - nun sukun + ta</p>
    <p>• مَنْ ذَا (man dza) - nun sukun + dzal</p>
    <p>• كَلِمَةً طَيِّبَةً (kalimatan thayyibatan) - tanwin + tha</p>
  </div>
</div>

<div class="practice-box bg-gray-50 p-4 rounded-lg border border-gray-200 my-4">
  <h5 class="font-semibold text-gray-800 mb-2">📚 Ringkasan 4 Hukum</h5>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
    <div class="bg-blue-100 p-2 rounded">
      <strong class="text-blue-800">Izhhar:</strong> 6 huruf (ء ه ع ح غ خ) - jelas
    </div>
    <div class="bg-green-100 p-2 rounded">
      <strong class="text-green-800">Idgham:</strong> 6 huruf (ي ر م ل و ن) - lebur
    </div>
    <div class="bg-yellow-100 p-2 rounded">
      <strong class="text-yellow-800">Iqlab:</strong> 1 huruf (ب) - jadi mim
    </div>
    <div class="bg-purple-100 p-2 rounded">
      <strong class="text-purple-800">Ikhfa:</strong> 15 huruf sisanya - samar
    </div>
  </div>
</div>
', 20);

-- Quiz for Hukum Nun Sukun & Tanwin
INSERT INTO class_quizzes (class_id, title, description, passing_score) VALUES
(2, 'Kuis Hukum Nun Sukun & Tanwin', 'Ujian pemahaman hukum nun sukun dan tanwin', 75);

-- Quiz questions for Class 2
INSERT INTO quiz_questions (quiz_id, question_order, question_text, correct_answer, explanation) VALUES
((SELECT id FROM class_quizzes WHERE class_id = 2), 1, 'Nun sukun bertemu dengan huruf خ dibaca dengan hukum...', 0, 'Huruf خ termasuk huruf izhhar, sehingga dibaca jelas'),
((SELECT id FROM class_quizzes WHERE class_id = 2), 2, 'Hukum idgham terbagi menjadi berapa jenis?', 1, 'Idgham terbagi menjadi 2 jenis: bighunnah dan bilaghunnah'),
((SELECT id FROM class_quizzes WHERE class_id = 2), 3, 'Huruf iqlab adalah...', 2, 'Hanya huruf ب yang menyebabkan iqlab'),
((SELECT id FROM class_quizzes WHERE class_id = 2), 4, 'Tanwin ketika waqaf akan...', 3, 'Tanwin hilang ketika waqaf (berhenti)'),
((SELECT id FROM class_quizzes WHERE class_id = 2), 5, 'مِنْ يَتَّقِ dibaca dengan hukum...', 1, 'Nun sukun bertemu ya (ي) dibaca idgham bighunnah');

-- Quiz options for Class 2
INSERT INTO quiz_question_options (question_id, option_order, option_text, is_correct) VALUES
-- Question 1
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 1), 0, 'Izhhar', true),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 1), 1, 'Idgham', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 1), 2, 'Iqlab', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 1), 3, 'Ikhfa', false),

-- Question 2
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 2), 0, '1', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 2), 1, '2', true),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 2), 2, '3', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 2), 3, '4', false),

-- Question 3
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 3), 0, 'ف', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 3), 1, 'م', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 3), 2, 'ب', true),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 3), 3, 'و', false),

-- Question 4
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 4), 0, 'Tetap dibaca', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 4), 1, 'Dibaca samar', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 4), 2, 'Dilebur', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 4), 3, 'Hilang', true),

-- Question 5
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 5), 0, 'Izhhar', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 5), 1, 'Idgham bighunnah', true),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 5), 2, 'Iqlab', false),
((SELECT id FROM quiz_questions WHERE quiz_id = (SELECT id FROM class_quizzes WHERE class_id = 2) AND question_order = 5), 3, 'Ikhfa', false);

-- ================================================
-- END OF CLASS 1 & 2 CONTENT
-- ================================================
