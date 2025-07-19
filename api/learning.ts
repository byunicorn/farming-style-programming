// /api/learning.ts
import { Hono } from 'hono'

const learningApp = new Hono()

// Get words for learning session
learningApp.get('/learning/words', async (c) => {
  try {
    const difficulty = c.req.query('difficulty') || 'beginner'
    const limit = parseInt(c.req.query('limit') || '10')
    
    // Get words that haven't been learned or need review
    const words = await db.collection('6cc43af3_vocabulary_entries')
      .aggregate([
        { $match: { difficulty } },
        {
          $lookup: {
            from: '6cc43af3_word_status',
            localField: '_id',
            foreignField: 'wordId',
            as: 'status'
          }
        },
        {
          $match: {
            $or: [
              { status: { $size: 0 } }, // New words
              { 'status.status': { $in: ['new', 'learning'] } },
              { 'status.nextReviewDate': { $lte: new Date() } }
            ]
          }
        },
        { $limit: limit },
        { $sort: { createdAt: 1 } }
      ])
      .toArray()

    return c.json(words)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Submit learning session result
learningApp.post('/learning/submit', async (c) => {
  try {
    const body = await c.req.json()
    const { wordId, correct, timeSpent } = body

    if (!wordId) {
      return c.json({ error: 'Word ID is required' }, 400)
    }

    // Get or create word status
    let wordStatus = await db.collection('6cc43af3_word_status').findOne({ 
      wordId: new mongo.ObjectId(wordId) 
    })

    if (!wordStatus) {
      wordStatus = {
        wordId: new mongo.ObjectId(wordId),
        status: 'new',
        correctAnswers: 0,
        totalAttempts: 0,
        lastReviewDate: new Date(),
        nextReviewDate: new Date(),
        difficultyLevel: 1,
        masteryScore: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    // Update statistics
    wordStatus.totalAttempts += 1
    if (correct) {
      wordStatus.correctAnswers += 1
    }

    // Calculate mastery score
    wordStatus.masteryScore = Math.round((wordStatus.correctAnswers / wordStatus.totalAttempts) * 100)

    // Update status based on performance
    if (wordStatus.masteryScore >= 90 && wordStatus.totalAttempts >= 3) {
      wordStatus.status = 'mastered'
    } else if (wordStatus.masteryScore >= 70) {
      wordStatus.status = 'reviewing'
    } else {
      wordStatus.status = 'learning'
    }

    // Set next review date using spaced repetition
    const nextReviewDays = calculateNextReviewDays(wordStatus.masteryScore, wordStatus.totalAttempts)
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays)
    wordStatus.nextReviewDate = nextReviewDate
    wordStatus.lastReviewDate = new Date()
    wordStatus.updatedAt = new Date()

    // Update or insert word status
    await db.collection('6cc43af3_word_status').updateOne(
      { wordId: new mongo.ObjectId(wordId) },
      { $set: wordStatus },
      { upsert: true }
    )

    return c.json({ 
      message: 'Learning result submitted successfully',
      wordStatus 
    })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Get quiz questions
learningApp.get('/learning/quiz', async (c) => {
  try {
    const difficulty = c.req.query('difficulty') || 'beginner'
    const count = parseInt(c.req.query('count') || '10')

    // Get random words for quiz
    const words = await db.collection('6cc43af3_vocabulary_entries')
      .aggregate([
        { $match: { difficulty } },
        { $sample: { size: count } }
      ])
      .toArray()

    // Generate quiz questions
    const questions = await Promise.all(words.map(async (word) => {
      // Get random wrong answers from other words
      const wrongAnswers = await db.collection('6cc43af3_vocabulary_entries')
        .aggregate([
          { $match: { _id: { $ne: word._id }, difficulty } },
          { $sample: { size: 3 } },
          { $project: { definition: 1 } }
        ])
        .toArray()

      const options = [
        word.definition,
        ...wrongAnswers.map(w => w.definition)
      ].sort(() => Math.random() - 0.5)

      return {
        _id: word._id,
        word: word.word,
        options,
        correctAnswer: word.definition,
        partOfSpeech: word.partOfSpeech
      }
    }))

    return c.json(questions)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Submit quiz results
learningApp.post('/learning/quiz/submit', async (c) => {
  try {
    const body = await c.req.json()
    const { answers, timeSpent } = body

    if (!answers || !Array.isArray(answers)) {
      return c.json({ error: 'Answers array is required' }, 400)
    }

    let correctCount = 0
    const results = []

    for (const answer of answers) {
      const { wordId, selectedAnswer } = answer
      
      const word = await db.collection('6cc43af3_vocabulary_entries').findOne({
        _id: new mongo.ObjectId(wordId)
      })

      const isCorrect = word && selectedAnswer === word.definition
      if (isCorrect) correctCount++

      results.push({
        wordId,
        correct: isCorrect,
        selectedAnswer,
        correctAnswer: word?.definition
      })

      // Update word learning status
      if (word) {
        await updateWordStatus(wordId, isCorrect)
      }
    }

    const score = Math.round((correctCount / answers.length) * 100)

    // Update daily progress
    const today = new Date().toISOString().split('T')[0]
    await db.collection('6cc43af3_daily_progress').updateOne(
      { date: today },
      {
        $set: {
          quizScore: score,
          updatedAt: new Date()
        },
        $inc: {
          timeSpent: timeSpent || 0
        },
        $setOnInsert: {
          date: today,
          wordsLearned: [],
          wordsReviewed: [],
          streakCount: 1,
          notes: '',
          createdAt: new Date()
        }
      },
      { upsert: true }
    )

    return c.json({
      score,
      correctCount,
      totalQuestions: answers.length,
      results
    })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Helper function to calculate next review days using spaced repetition
function calculateNextReviewDays(masteryScore: number, attempts: number): number {
  if (masteryScore >= 90) {
    return Math.min(30, attempts * 3) // Max 30 days for mastered words
  } else if (masteryScore >= 70) {
    return Math.min(7, attempts) // Max 7 days for good performance
  } else if (masteryScore >= 50) {
    return 2 // 2 days for moderate performance
  } else {
    return 1 // 1 day for poor performance
  }
}

// Helper function to update word status
async function updateWordStatus(wordId: string, correct: boolean) {
  let wordStatus = await db.collection('6cc43af3_word_status').findOne({ 
    wordId: new mongo.ObjectId(wordId) 
  })

  if (!wordStatus) {
    wordStatus = {
      wordId: new mongo.ObjectId(wordId),
      status: 'new',
      correctAnswers: 0,
      totalAttempts: 0,
      lastReviewDate: new Date(),
      nextReviewDate: new Date(),
      difficultyLevel: 1,
      masteryScore: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  wordStatus.totalAttempts += 1
  if (correct) {
    wordStatus.correctAnswers += 1
  }

  wordStatus.masteryScore = Math.round((wordStatus.correctAnswers / wordStatus.totalAttempts) * 100)

  if (wordStatus.masteryScore >= 90 && wordStatus.totalAttempts >= 3) {
    wordStatus.status = 'mastered'
  } else if (wordStatus.masteryScore >= 70) {
    wordStatus.status = 'reviewing'
  } else {
    wordStatus.status = 'learning'
  }

  const nextReviewDays = calculateNextReviewDays(wordStatus.masteryScore, wordStatus.totalAttempts)
  const nextReviewDate = new Date()
  nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays)
  wordStatus.nextReviewDate = nextReviewDate
  wordStatus.lastReviewDate = new Date()
  wordStatus.updatedAt = new Date()

  await db.collection('6cc43af3_word_status').updateOne(
    { wordId: new mongo.ObjectId(wordId) },
    { $set: wordStatus },
    { upsert: true }
  )
}

export default learningApp