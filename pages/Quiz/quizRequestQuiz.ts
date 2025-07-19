// /pages/Quiz/quizRequestQuiz.ts
import { useAtom } from 'jotai'
import { toast } from 'react-hot-toast'
import { quizQuestionsAtom, quizStateAtom, quizLoadingAtom } from './quizStateQuiz'

export const useQuiz = () => {
  const [questions, setQuestions] = useAtom(quizQuestionsAtom)
  const [quizState, setQuizState] = useAtom(quizStateAtom)
  const [loading, setLoading] = useAtom(quizLoadingAtom)

  const startQuiz = async (difficulty: string = 'beginner', count: number = 10) => {
    setLoading(true)
    try {
      const response = await fetch(
        `${process.env.API_DOMAIN}/api/learning/quiz?difficulty=${difficulty}&count=${count}`
      )
      const data = await response.json()

      if (response.ok) {
        setQuestions(data)
        setQuizState(prev => ({
          ...prev,
          difficulty,
          questionCount: count,
          completed: false,
          score: 0,
          correctCount: 0,
          totalQuestions: data.length
        }))
        
        if (data.length === 0) {
          toast.error('No questions available for this difficulty level')
        }
      } else {
        throw new Error(data.error || 'Failed to load quiz questions')
      }
    } catch (error) {
      console.error('Error starting quiz:', error)
      toast.error('Failed to start quiz')
    } finally {
      setLoading(false)
    }
  }

  const submitQuiz = async (answers: Array<{ wordId: string; selectedAnswer: string }>, timeSpent: number) => {
    setLoading(true)
    try {
      const response = await fetch(`${process.env.API_DOMAIN}/api/learning/quiz/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          answers,
          timeSpent
        })
      })

      const data = await response.json()

      if (response.ok) {
        setQuizState(prev => ({
          ...prev,
          completed: true,
          score: data.score,
          correctCount: data.correctCount,
          totalQuestions: data.totalQuestions
        }))
        
        toast.success(`Quiz completed! Score: ${data.score}%`)
      } else {
        throw new Error(data.error || 'Failed to submit quiz')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      toast.error('Failed to submit quiz')
    } finally {
      setLoading(false)
    }
  }

  const resetQuiz = () => {
    setQuestions([])
    setQuizState({
      difficulty: 'beginner',
      questionCount: 10,
      completed: false,
      score: 0,
      correctCount: 0,
      totalQuestions: 0
    })
  }

  return {
    questions,
    quizState,
    loading,
    startQuiz,
    submitQuiz,
    resetQuiz
  }
}