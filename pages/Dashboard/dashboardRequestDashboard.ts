// /pages/Dashboard/dashboardRequestDashboard.ts
import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { dashboardStatsAtom, dashboardLoadingAtom } from './dashboardStateDashboard'
import { format } from 'date-fns'

export const useDashboardData = () => {
  const [stats, setStats] = useAtom(dashboardStatsAtom)
  const [loading, setLoading] = useAtom(dashboardLoadingAtom)

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      
      // Fetch user statistics
      const statsResponse = await fetch(`${process.env.API_DOMAIN}/api/progress/stats`)
      const userStats = await statsResponse.json()

      // Fetch today's progress
      const progressResponse = await fetch(`${process.env.API_DOMAIN}/api/progress/daily?date=${today}`)
      const todayProgress = await progressResponse.json()

      setStats({
        ...userStats,
        todayWordsLearned: todayProgress.wordsLearned?.length || 0,
        todayTimeSpent: todayProgress.timeSpent || 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = () => {
    fetchDashboardData()
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return {
    stats,
    loading,
    refreshStats
  }
}