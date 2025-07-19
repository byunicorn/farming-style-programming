// /pages/VocabularyList/vocabularyRequestVocabularyList.ts
import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { toast } from 'react-hot-toast'
import { vocabularyListAtom, vocabularyLoadingAtom, vocabularyPaginationAtom } from './vocabularyStateVocabularyList'

export const useVocabularyList = () => {
  const [words, setWords] = useAtom(vocabularyListAtom)
  const [loading, setLoading] = useAtom(vocabularyLoadingAtom)
  const [pagination, setPagination] = useAtom(vocabularyPaginationAtom)

  const fetchWords = async (page = 1, difficulty = '', category = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (difficulty) params.append('difficulty', difficulty)
      if (category) params.append('category', category)

      const response = await fetch(`${process.env.API_DOMAIN}/api/vocabulary?${params}`)
      const data = await response.json()

      if (response.ok) {
        setWords(data.data)
        setPagination(data.pagination)
      } else {
        throw new Error(data.error || 'Failed to fetch words')
      }
    } catch (error) {
      console.error('Error fetching words:', error)
      toast.error('Failed to load vocabulary words')
    } finally {
      setLoading(false)
    }
  }

  const searchWords = async (searchTerm: string, difficulty = '', category = '') => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: pagination.limit.toString()
      })
      
      if (difficulty) params.append('difficulty', difficulty)
      if (category) params.append('category', category)

      const response = await fetch(`${process.env.API_DOMAIN}/api/vocabulary?${params}`)
      const data = await response.json()

      if (response.ok) {
        // Filter words on client side for search term
        const filteredWords = searchTerm 
          ? data.data.filter((word: any) => 
              word.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
              word.definition.toLowerCase().includes(searchTerm.toLowerCase())
            )
          : data.data

        setWords(filteredWords)
        setPagination({
          ...data.pagination,
          total: filteredWords.length
        })
      } else {
        throw new Error(data.error || 'Failed to search words')
      }
    } catch (error) {
      console.error('Error searching words:', error)
      toast.error('Failed to search vocabulary words')
    } finally {
      setLoading(false)
    }
  }

  const deleteWord = async (id: string) => {
    try {
      const response = await fetch(`${process.env.API_DOMAIN}/api/vocabulary/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setWords(words.filter(word => word._id !== id))
        toast.success('Word deleted successfully')
      } else {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete word')
      }
    } catch (error) {
      console.error('Error deleting word:', error)
      toast.error('Failed to delete word')
    }
  }

  const refreshWords = () => {
    fetchWords(pagination.page)
  }

  useEffect(() => {
    fetchWords()
  }, [])

  return {
    words,
    loading,
    pagination,
    fetchWords,
    searchWords,
    deleteWord,
    refreshWords
  }
}