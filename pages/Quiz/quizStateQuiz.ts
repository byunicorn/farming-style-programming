// /pages/Quiz/quizStateQuiz.ts
import { atom } from 'jotai'

export interface QuizQuestion {
  _id: string
  word: string
  partOfSpeech?: string
  options: string[]
  correctAnswer: string
}

export interface QuizState {
  difficulty: string
  questionCount: number
  completed: boolean
  score: number
  correctCount: number
  totalQuestions: number
}

export const quizQuestionsAtom = atom<QuizQuestion[]>([])

export const quizStateAtom = atom<QuizState>({
  difficulty: 'beginner',
  questionCount: 10,
  completed: false,
  score: 0,
  correctCount: 0,
  totalQuestions: 0
})

export const quizLoadingAtom = atom<boolean>(false)