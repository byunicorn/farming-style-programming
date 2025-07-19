// /pages/LearningSession/learningStateLearningSession.ts
import { atom } from 'jotai'

export interface LearningWord {
  _id: string
  word: string
  pronunciation?: string
  partOfSpeech?: string
  definition: string
  exampleSentence?: string
  difficulty: string
  category: string
  status?: any[]
}

export const learningWordsAtom = atom<LearningWord[]>([])

export const currentWordIndexAtom = atom<number>(0)

export const learningLoadingAtom = atom<boolean>(false)

export const learningStatsAtom = atom({
  wordsStudied: 0,
  correctAnswers: 0,
  timeSpent: 0
})