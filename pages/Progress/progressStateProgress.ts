// /pages/Progress/progressStateProgress.ts
import { atom } from 'jotai'

export interface DailyProgress {
  date: string
  wordsLearned: string[]
  wordsReviewed: string[]
  timeSpent: number
  quizScore: number
  streakCount: number
  notes: string
}

export interface ProgressStats {
  totalWordsLearned: number
  currentStreak: number
  longestStreak: number
  totalTimeSpent: number
  averageQuizScore: number
  lastActiveDate: string
  weeklyGoal: number
  monthlyGoal: number
  thisWeekWords: number
  thisMonthWords: number
}

export const progressDataAtom = atom<DailyProgress[]>([])

export const progressStatsAtom = atom<ProgressStats>({
  totalWordsLearned: 0,
  currentStreak: 0,
  longestStreak: 0,
  totalTimeSpent: 0,
  averageQuizScore: 0,
  lastActiveDate: '',
  weeklyGoal: 50,
  monthlyGoal: 200,
  thisWeekWords: 0,
  thisMonthWords: 0
})

export const progressLoadingAtom = atom<boolean>(false)