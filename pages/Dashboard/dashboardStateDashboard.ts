// /pages/Dashboard/dashboardStateDashboard.ts
import { atom } from 'jotai'

export interface DashboardStats {
  totalWordsLearned: number
  currentStreak: number
  longestStreak: number
  totalTimeSpent: number
  averageQuizScore: number
  lastActiveDate: string
  weeklyGoal: number
  monthlyGoal: number
  todayWordsLearned: number
  todayTimeSpent: number
}

export const dashboardStatsAtom = atom<DashboardStats>({
  totalWordsLearned: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalTimeSpent: 0,
  averageQuizScore: 0,
  lastActiveDate: '',
  weeklyGoal: 50,
  monthlyGoal: 200,
  todayWordsLearned: 0,
  todayTimeSpent: 0
})

export const dashboardLoadingAtom = atom<boolean>(false)