// /pages/VocabularyList/vocabularyStateVocabularyList.ts
import { atom } from 'jotai'

export interface VocabularyWord {
  _id: string
  word: string
  pronunciation?: string
  partOfSpeech?: string
  definition: string
  exampleSentence?: string
  difficulty: string
  category: string
  synonyms?: string[]
  antonyms?: string[]
  createdAt: string
  updatedAt: string
}

export const vocabularyListAtom = atom<VocabularyWord[]>([])

export const vocabularyLoadingAtom = atom<boolean>(false)

export const vocabularyPaginationAtom = atom({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})