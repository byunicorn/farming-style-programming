# Database Collections for English Vocabulary Book

## Vocabulary Entries Collection
```json
{
  "type": "aipa-db-collection",
  "rawName": "6cc43af3_vocabulary_entries",
  "schema": {
    "_id": "ObjectId",
    "word": "string (required, unique)",
    "pronunciation": "string",
    "partOfSpeech": "string (noun, verb, adjective, etc.)",
    "definition": "string (required)",
    "exampleSentence": "string",
    "difficulty": "string (beginner, intermediate, advanced)",
    "category": "string (academic, business, daily, etc.)",
    "synonyms": "array of strings",
    "antonyms": "array of strings",
    "createdAt": "Date",
    "updatedAt": "Date"
  },
  "association": false
}
```

## Daily Learning Progress Collection
```json
{
  "type": "aipa-db-collection", 
  "rawName": "6cc43af3_daily_progress",
  "schema": {
    "_id": "ObjectId",
    "date": "string (YYYY-MM-DD)",
    "wordsLearned": "array of ObjectId (vocabulary_entries)",
    "wordsReviewed": "array of ObjectId (vocabulary_entries)",
    "timeSpent": "number (minutes)",
    "quizScore": "number (0-100)",
    "streakCount": "number",
    "notes": "string",
    "createdAt": "Date",
    "updatedAt": "Date"
  },
  "association": false
}
```

## User Learning Statistics Collection
```json
{
  "type": "aipa-db-collection",
  "rawName": "6cc43af3_user_stats", 
  "schema": {
    "_id": "ObjectId",
    "totalWordsLearned": "number",
    "currentStreak": "number",
    "longestStreak": "number",
    "totalTimeSpent": "number (minutes)",
    "averageQuizScore": "number",
    "lastActiveDate": "string (YYYY-MM-DD)",
    "weeklyGoal": "number (words per week)",
    "monthlyGoal": "number (words per month)",
    "createdAt": "Date",
    "updatedAt": "Date"
  },
  "association": false
}
```

## Word Learning Status Collection
```json
{
  "type": "aipa-db-collection",
  "rawName": "6cc43af3_word_status",
  "schema": {
    "_id": "ObjectId",
    "wordId": "ObjectId (vocabulary_entries)",
    "status": "string (new, learning, reviewing, mastered)",
    "correctAnswers": "number",
    "totalAttempts": "number",
    "lastReviewDate": "Date",
    "nextReviewDate": "Date",
    "difficultyLevel": "number (1-5)",
    "masteryScore": "number (0-100)",
    "createdAt": "Date",
    "updatedAt": "Date"
  },
  "association": false
}
```