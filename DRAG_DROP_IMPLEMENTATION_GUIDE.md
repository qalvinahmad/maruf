# 🎯 DRAG AND DROP QUESTIONS IMPLEMENTATION

## ✅ **UPDATED FOR NEW DATABASE STRUCTURE**

Kode telah diupdate untuk menggunakan struktur database terbaru dengan table terpisah:

### 📊 **Database Structure yang Digunakan:**

1. **`questions`** - Main questions table
   - `id`, `sublesson_id`, `question_text`, `order_sequence`, `question_type_id`

2. **`drag_and_drop_questions`** - Details untuk drag and drop
   - `id`, `instruction`, `sentence_template`, `question_type_id`

3. **`drag_drop_choices`** - Pilihan untuk drag and drop
   - `id`, `question_id`, `choice_text`

4. **`drag_drop_blanks`** - Jawaban yang benar
   - `id`, `question_id`, `blank_index`, `correct_answer`

---

## 🚀 **Setup Instructions**

### **1. Jalankan SQL Script**
Gunakan file: `drag_drop_questions_all_sublessons.sql`

```sql
-- Script ini akan:
-- ✅ Insert question type 'drag_and_drop'
-- ✅ Create 5 drag drop questions per sublesson
-- ✅ Add choices untuk setiap question
-- ✅ Add correct answers
```

### **2. Template Questions yang Dibuat:**

**Question 1:** "Lengkapi kalimat berikut dengan kata yang tepat"
- Sentence Template: "Huruf Ba keluar dari ___"
- Choices: ["mulut", "hidung", "telinga", "mata"]
- Correct Answer: "mulut"

**Question 2:** "Isi titik-titik dengan huruf yang sesuai"
- Sentence Template: "Huruf ___ berbentuk seperti perahu"
- Choices: ["Jim", "Ba", "Ta", "Alif"]
- Correct Answer: "Jim"

**Question 3:** "Pilih kata yang tepat untuk melengkapi kalimat"
- Sentence Template: "Bunyi huruf Ta adalah ___"
- Choices: ["Ta", "Ba", "Ma", "Na"]
- Correct Answer: "Ta"

**Question 4:** "Seret huruf ke tempat yang kosong"
- Sentence Template: "Huruf ___ memiliki titik di bawah"
- Choices: ["Jim", "Ba", "Ya", "Ta"]
- Correct Answer: "Jim"

**Question 5:** "Lengkapi kata dengan huruf yang benar"
- Sentence Template: "Bunyi huruf ___ adalah Ma"
- Choices: ["Mim", "Ba", "Ta", "Na"]
- Correct Answer: "Mim"

---

## 🔧 **Code Updates Made**

### **1. Database Query Updated:**
```javascript
// OLD - Using single table approach
drag_drop_answers (
  id,
  correct_answer,
  explanation
)

// NEW - Using separate tables
drag_drop_choices (
  id,
  choice_text
),
drag_drop_blanks (
  id,
  blank_index,
  correct_answer
)
```

### **2. Added Drag Drop Details Fetch:**
```javascript
// Fetch drag and drop details separately
const { data: dragDropDetails } = await supabase
  .from('drag_and_drop_questions')
  .select('id, instruction, sentence_template, question_type_id');

// Merge with main questions
const enrichedQuestions = questionsData.map(question => {
  if (question.question_types?.type_key === 'drag_and_drop') {
    const dragDropDetail = dragDropDetails?.find(dd => 
      dd.question_type_id === question.question_type_id
    );
    return {
      ...question,
      instruction: dragDropDetail?.instruction,
      sentence_template: dragDropDetail?.sentence_template
    };
  }
  return question;
});
```

### **3. Updated Validation Logic:**
```javascript
// Updated to use drag_drop_blanks instead of drag_drop_answers
case 'drag_and_drop':
  const correctDragDrop = currentQuestionData.drag_drop_blanks?.[0]?.correct_answer;
  isAnswerCorrect = selectedChoices[0] === correctDragDrop;
  break;
```

---

## 🎨 **UI Features**

### **Drag and Drop Interface:**
- 🎯 **Drop Zone**: Visual placeholder dalam kalimat dengan "___"
- 🎨 **Draggable Choices**: Grid layout yang responsive
- 📝 **Instruction Banner**: Menampilkan "Seret kata ke tempat kosong"
- ✅ **Visual Feedback**: Highlight untuk jawaban benar/salah
- 🔄 **Clear Selection**: Button untuk reset pilihan

### **Responsive Design:**
- **Desktop**: 3 columns grid untuk choices
- **Tablet**: 2 columns grid
- **Mobile**: 1 column dengan touch-friendly buttons

---

## 📊 **Expected Results**

Setelah menjalankan SQL script:

### **Per Sublesson:**
- ✅ 5 drag and drop questions
- ✅ 4 choices per question (total 20 choices per sublesson)
- ✅ 1 correct answer per question

### **Total (jika ada 10 sublessons):**
- ✅ 50 drag and drop questions
- ✅ 200 choices
- ✅ 50 correct answers

---

## 🔍 **Verification Queries**

SQL script includes verification queries:

```sql
-- Count total questions per sublesson
SELECT 
    rsl.title as sublesson_title,
    COUNT(q.id) as drag_drop_questions_count
FROM roadmap_sub_lessons rsl
LEFT JOIN questions q ON rsl.id = q.sublesson_id
WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
GROUP BY rsl.id, rsl.title;

-- Sample questions with details
SELECT 
    rsl.title,
    q.question_text,
    ddq.sentence_template,
    STRING_AGG(ddc.choice_text, ', ') as choices,
    ddb.correct_answer
FROM questions q
JOIN roadmap_sub_lessons rsl ON q.sublesson_id = rsl.id
LEFT JOIN drag_and_drop_questions ddq ON ddq.question_type_id = q.question_type_id
LEFT JOIN drag_drop_choices ddc ON ddc.question_id = q.id
LEFT JOIN drag_drop_blanks ddb ON ddb.question_id = q.id
WHERE q.question_type_id = (SELECT id FROM question_types WHERE type_key = 'drag_and_drop')
GROUP BY rsl.title, q.question_text, ddq.sentence_template, ddb.correct_answer
LIMIT 10;
```

---

## 🚀 **Testing**

### **1. Run SQL Script:**
Copy `drag_drop_questions_all_sublessons.sql` to Supabase SQL Editor and execute.

### **2. Test Application:**
```
http://localhost:3001/dashboard/lesson/1/1
```

### **3. Expected Behavior:**
- ✅ Questions load with drag and drop interface
- ✅ Sentence templates display with blanks
- ✅ Choices are clickable and selectable
- ✅ Validation works correctly
- ✅ Visual feedback for correct/incorrect answers

---

## 📁 **Files Updated:**

1. **`drag_drop_questions_all_sublessons.sql`** - Database setup script
2. **`pages/dashboard/lesson/[levelId]/[subLessonId].jsx`** - React component updated for new DB structure

---

## ✅ **Status: READY FOR TESTING**

Implementasi drag and drop questions sudah selesai dan siap untuk ditest dengan struktur database yang baru! 🎉

**Test URL:** `http://localhost:3001/dashboard/lesson/1/1`
