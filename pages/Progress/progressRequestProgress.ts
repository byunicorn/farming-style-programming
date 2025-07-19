// /pages/Progress/progressRequestProgress.ts
import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'react-hot-toast'
import { progressDataAtom, progressStatsAtom, progressLoadingAtom } from './progressStateProgress'

export const useProgressData = () => {
  const [progressData, setProgressData] = useAtom(progressDataAtom)
  const [stats, setStats] = useAtom(progressStatsAtom)
  const [loading, setLoading] = useAtom(progressLoadingAtom)

  const fetchProgressData = async (days: number = 30) => {
    setLoading(true)
    try {
      // Fetch progress history
      const historyResponse = await fetch(`${process.env.API_DOMAIN}/api/progress/history?days=${days}`)
      const historyData = await historyResponse.json()

      // Fetch user statistics
      const statsResponse = await fetch(`${process.env.API_DOMAIN}/api/progress/stats`)
      const statsData = await statsResponse.json()

      if (historyResponse.ok && statsResponse.ok) {
        setProgressData(historyData)
        
        // Calculate this week and month words
        const now = new Date()
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay())
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        const thisWeekWords = historyData
          .filter((day: any) => new Date(day.date) >= weekStart)
          .reduce((sum: number, day: any) => sum + (day.wordsLearned?.length || 0), 0)

        const thisMonthWords = historyData
          .filter((day: any) => new Date(day.date) >= monthStart)
          .reduce((sum: number, day: any) => sum + (day.wordsLearned?.length || 0), 0)

        setStats({
          ...statsData,
          thisWeekWords,
          thisMonthWords
        })
      } else {
        throw new Error('Failed to fetch progress data')
      }
    } catch (error) {
      console.error('Error fetching progress data:', error)
      toast.error('Failed to load progress data')
    } finally {
      setLoading(false)
    }
  }

  const updateGoals = async (weeklyGoal: number, monthlyGoal: number) => {
    try {
      const response = await fetch(`${process.env.API_DOMAIN}/api/progress/goals`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          weeklyGoal,
          monthlyGoal
        })
      })

      if (response.ok) {
        setStats(prev => ({
          ...prev,
          weeklyGoal,
          monthlyGoal
        }))
        toast.success('Goals updated successfully!')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update goals')
      }
    } catch (error) {
      console.error('Error updating goals:', error)
      toast.error('Failed to update goals')
    }
  }

  const addDailyProgress = async (wordsLearned: string[], timeSpent: number, notes: string = '') => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const response = await fetch(`${process.env.API_DOMAIN}/api/progress/daily`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: today,
          wordsLearned,
          timeSpent,
          notes
        })
      })

      if (response.ok) {
        // Refresh progress data
        await fetchProgressData()
        toast.success('Progress updated!')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update progress')
      }
    } catch (error) {
      console.error('Error updating daily progress:', error)
      toast.error('Failed to update progress')
    }
  }

  const refreshData = () => {
    fetchProgressData()
  }

  useEffect(() => {
    fetchProgressData()
  }, [])

  return {
    progressData,
    stats,
    loading,
    fetchProgressData,
    updateGoals,
    addDailyProgress,
    refreshData
  }
}