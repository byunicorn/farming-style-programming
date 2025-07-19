// /pages/LearningSession/learningRequestLearningSession.ts
import { useAtom } from 'jotai'
import { toast } from 'react-hot-toast'
import { 
  learningWordsAtom, 
  currentWordIndexAtom, 
  learningLoadingAtom, 
  learningStatsAtom 
} from './learningStateLearningSession'

export const useLearningSession = () => {
  const [words, setWords] = useAtom(learningWordsAtom)
  const [currentIndex, setCurrentIndex] = useAtom(currentWordIndexAtom)
  const [loading, setLoading] = useAtom(learningLoadingAtom)
  const [stats, setStats] = useAtom(learningStatsAtom)

  const startSession = async (difficulty: string = 'beginner', limit: number = 10) => {
    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.API_DOMAIN}/api/learning/words?difficulty=${difficulty}&limit=${limit}`
      )
      const data = await response.json()

      if (response.ok) {
        setWords(data)
        setCurrentIndex(0)
        setStats({
          wordsStudied: 0,
          correctAnswers: 0,
          timeSpent: 0
        })
        
        if (data.length === 0) {
          toast.error('No words available for this difficulty level')
        }
      } else {
        throw new Error(data.error || 'Failed to load learning words')
      }
    } catch (error) {
      console.error('Error starting learning session:', error)
      toast.error('Failed to start learning session')
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async (wordId: string, correct: boolean, timeSpent: number = 30) => {
    try {
      const response = await fetch(`${process.env.API_DOMAIN}/api/learning/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wordId,
          correct,
          timeSpent
        })
      })

      const data = await response.json()

      if (response.ok) {
        // Update local stats
        setStats(prev => ({
          wordsStudied: prev.wordsStudied + 1,
          correctAnswers: prev.correctAnswers + (correct ? 1 : 0),
          timeSpent: prev.timeSpent + timeSpent
        }))

        // Update daily progress
        await updateDailyProgress(wordId, timeSpent)
        
        if (correct) {
          toast.success('Great job! 🎉')
        } else {
          toast.error('Keep practicing! 💪')
        }
      } else {
        throw new Error(data.error || 'Failed to submit answer')
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      toast.error('Failed to submit answer')
    }
  }

  const updateDailyProgress = async (wordId: string, timeSpent: number) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const response = await fetch(`${process.env.API_DOMAIN}/api/progress/daily`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: today,
          wordsLearned: [wordId],
          timeSpent
        })
      })

      if (!response.ok) {
        console.error('Failed to update daily progress')
      }
    } catch (error) {
      console.error('Error updating daily progress:', error)
    }
  }

  const resetSession = () => {
    setWords([])
    setCurrentIndex(0)
    setStats({
      wordsStudied: 0,
      correctAnswers: 0,
      timeSpent: 0
    })
  }

  const skipWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  return {
    words,
    currentIndex,
    loading,
    stats,
    startSession,
    submitAnswer,
    resetSession,
    skipWord
  }
}