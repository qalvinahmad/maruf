# Question Management Debug Guide

## Current Status
The QuestionManagement component has been enhanced with comprehensive data fetching and fallback mechanisms to properly display correct answers for True/False and Voice Input questions.

## Key Enhancements Made

### 1. Enhanced Data Fetching in `fetchQuestions`
- **Multiple Strategy Approach**: Uses 4 different strategies to find specialized question data
- **True/False Questions**: Fetches from `true_false_questions` table
- **Voice Input Questions**: Fetches from `voice_input_questions` table
- **Comprehensive Logging**: Added detailed console logging to track data retrieval

#### Fetch Strategies for Voice Input:
1. Exact `question_text` match
2. Similar `question_text` match (case insensitive)
3. Match by `sublesson_id` and `order_sequence`
4. Most recent voice input question

#### Fetch Strategies for True/False:
1. Exact `question` match
2. Similar `question` match (case insensitive)
3. Match by `question_type_id`
4. Most recent true/false question

### 2. Enhanced Answer Display in `renderQuestionDetails`
- **Multiple Fallback Sources**: Checks various data sources for answers
- **Debug Information**: Shows data source in UI for troubleshooting
- **Comprehensive Logging**: Detailed console output for debugging

#### True/False Answer Sources (in priority order):
1. `question.true_false_data.correct_answer`
2. `question.question_options` (correct option)
3. `question.question_options` (boolean-like option)
4. `question.correct_answer` (direct property)

#### Voice Input Answer Sources (in priority order):
1. `question.voice_input_data.expected_answer`
2. `question.question_options` (correct option)
3. `question.question_options` (first option as fallback)

## Database Tables Expected

### true_false_questions
- `id`
- `question`
- `correct_answer` (boolean)
- `question_type_id`
- `created_at`
- `updated_at`

### voice_input_questions
- `id`
- `question_text`
- `instruction`
- `expected_answer`
- `tolerance_level`
- `model`
- `sublesson_id`
- `order_sequence`
- `created_at`
- `updated_at`

## Testing Steps

1. **Open Browser Console**: Navigate to http://localhost:3002
2. **Go to Question Management**: Access the teacher dashboard
3. **Check Console Logs**: Look for debugging information when viewing question details
4. **Verify Data Sources**: Check which data source is being used for answers

## Debug Console Commands

```javascript
// Check if specialized tables exist and have data
console.log('Checking true_false_questions table...');
// This will be logged automatically when viewing true/false questions

console.log('Checking voice_input_questions table...');
// This will be logged automatically when viewing voice input questions
```

## Expected Console Output

When clicking on a True/False question detail:
```
Fetching true/false data for question: [ID] [Question Text]
Found true/false data by [strategy]: [Data Object]
Debugging true/false answer for question: [ID]
Available data sources: {true_false_data: ..., question_options: ..., direct_correct_answer: ...}
Found answer from [source]: [Answer]
Final true/false answer: [Answer] from source: [source]
```

When clicking on a Voice Input question detail:
```
Fetching voice data for question: [ID] [Question Text]
Found voice data by [strategy]: [Data Object]
Debugging voice input answer for question: [ID]
Available voice data sources: {voice_input_data: ..., question_options: ...}
Found answer from [source]: [Answer]
Final voice input answer: [Answer] from source: [source]
```

## Troubleshooting

### If True/False answers still show "Tidak diketahui":
1. Check console for "No true/false data found for question: [ID]"
2. Verify `true_false_questions` table exists and has matching records
3. Check if question text matches exactly in the database
4. Ensure `correct_answer` field is boolean type

### If Voice Input answers still show "Tidak ada jawaban yang diharapkan":
1. Check console for "No voice data found for question: [ID]"
2. Verify `voice_input_questions` table exists and has matching records
3. Check if `expected_answer` field is populated
4. Ensure question text or sublesson/order matches

### Data Not Matching:
- Check if the question was created using the new form system
- Verify foreign key relationships are correct
- Check if there are duplicate entries with different IDs

## Current Server Info
- Running on: http://localhost:3002
- Environment: Development with Turbopack
- Toast notifications: Enabled for all operations
- Debug logging: Enabled in console

## Next Steps if Issues Persist
1. Check database directly via Supabase dashboard
2. Verify table relationships and constraints
3. Check if data was inserted correctly via the forms
4. Ensure question type IDs match between tables
