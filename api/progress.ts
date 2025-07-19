// /api/progress.ts
import { Hono } from 'hono'

const progressApp = new Hono()

// Get daily progress
progressApp.get('/progress/daily', async (c) => {
  try {
    const date = c.req.query('date') || new Date().toISOString().split('T')[0]
    
    const progress = await db.collection('6cc43af3_daily_progress').findOne({ date })
    
    if (!progress) {
      return c.json({
        date,
        wordsLearned: [],
        wordsReviewed: [],
        timeSpent: 0,
        quizScore: 0,
        streakCount: 0,
        notes: ''
      })
    }

    return c.json(progress)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Update daily progress
progressApp.post('/progress/daily', async (c) => {
  try {
    const body = await c.req.json()
    const { date, wordsLearned, wordsReviewed, timeSpent, quizScore, notes } = body
    
    const today = date || new Date().toISOString().split('T')[0]
    
    // Calculate streak
    const yesterdayDate = new Date(today)
    yesterdayDate.setDate(yesterdayDate.getDate() - 1)
    const yesterday = yesterdayDate.toISOString().split('T')[0]
    
    const yesterdayProgress = await db.collection('6cc43af3_daily_progress').findOne({ date: yesterday })
    const streakCount = yesterdayProgress ? (yesterdayProgress.streakCount || 0) + 1 : 1

    const progressData = {
      date: today,
      wordsLearned: wordsLearned || [],
      wordsReviewed: wordsReviewed || [],
      timeSpent: timeSpent || 0,
      quizScore: quizScore || 0,
      streakCount,
      notes: notes || '',
      updatedAt: new Date()
    }

    const result = await db.collection('6cc43af3_daily_progress').updateOne(
      { date: today },
      { 
        $set: progressData,
        $setOnInsert: { createdAt: new Date() }
      },
      { upsert: true }
    )

    // Update user statistics
    await updateUserStats(wordsLearned, timeSpent, quizScore, streakCount, today)

    return c.json(progressData)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Get progress history
progressApp.get('/progress/history', async (c) => {
  try {
    const days = parseInt(c.req.query('days') || '30')
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    const history = await db.collection('6cc43af3_daily_progress')
      .find({
        date: {
          $gte: startDateStr,
          $lte: endDateStr
        }
      })
      .sort({ date: -1 })
      .toArray()

    return c.json(history)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Get user statistics
progressApp.get('/progress/stats', async (c) => {
  try {
    const stats = await db.collection('6cc43af3_user_stats').findOne({})
    
    if (!stats) {
      const defaultStats = {
        totalWordsLearned: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalTimeSpent: 0,
        averageQuizScore: 0,
        lastActiveDate: '',
        weeklyGoal: 50,
        monthlyGoal: 200,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      await db.collection('6cc43af3_user_stats').insertOne(defaultStats)
      return c.json(defaultStats)
    }

    return c.json(stats)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Update learning goals
progressApp.put('/progress/goals', async (c) => {
  try {
    const body = await c.req.json()
    const { weeklyGoal, monthlyGoal } = body

    const result = await db.collection('6cc43af3_user_stats').updateOne(
      {},
      {
        $set: {
          weeklyGoal: weeklyGoal || 50,
          monthlyGoal: monthlyGoal || 200,
          updatedAt: new Date()
        },
        $setOnInsert: {
          totalWordsLearned: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalTimeSpent: 0,
          averageQuizScore: 0,
          lastActiveDate: '',
          createdAt: new Date()
        }
      },
      { upsert: true }
    )

    return c.json({ message: 'Goals updated successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Helper function to update user statistics
async function updateUserStats(wordsLearned: string[], timeSpent: number, quizScore: number, streakCount: number, date: string) {
  try {
    const stats = await db.collection('6cc43af3_user_stats').findOne({})
    
    const totalWordsLearned = (stats?.totalWordsLearned || 0) + wordsLearned.length
    const totalTimeSpent = (stats?.totalTimeSpent || 0) + timeSpent
    const longestStreak = Math.max(stats?.longestStreak || 0, streakCount)
    
    // Calculate average quiz score
    const allProgress = await db.collection('6cc43af3_daily_progress')
      .find({ quizScore: { $gt: 0 } })
      .toArray()
    
    const totalQuizzes = allProgress.length
    const sumScores = allProgress.reduce((sum, p) => sum + (p.quizScore || 0), 0)
    const averageQuizScore = totalQuizzes > 0 ? Math.round(sumScores / totalQuizzes) : 0

    await db.collection('6cc43af3_user_stats').updateOne(
      {},
      {
        $set: {
          totalWordsLearned,
          currentStreak: streakCount,
          longestStreak,
          totalTimeSpent,
          averageQuizScore,
          lastActiveDate: date,
          updatedAt: new Date()
        },
        $setOnInsert: {
          weeklyGoal: 50,
          monthlyGoal: 200,
          createdAt: new Date()
        }
      },
      { upsert: true }
    )
  } catch (error) {
    console.error('Error updating user stats:', error)
  }
}

export default progressApp