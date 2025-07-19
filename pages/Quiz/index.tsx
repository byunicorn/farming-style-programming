// /pages/Quiz/index.tsx
import React, { useState } from 'react'
import { CheckCircle, XCircle, Clock, Brain, Trophy } from 'lucide-react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { quizQuestionsAtom, quizStateAtom } from './quizStateQuiz'
import { useQuiz } from './quizRequestQuiz'

const Quiz: React.FC = () => {
  const [questions] = useAtom(quizQuestionsAtom)
  const [quizState, setQuizState] = useAtom(quizStateAtom)
  const { loading, startQuiz, submitQuiz } = useQuiz()
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({})
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutes
  const [quizStarted, setQuizStarted] = useState(false)

  const handleStartQuiz = async () => {
    await startQuiz(quizState.difficulty, quizState.questionCount)
    setQuizStarted(true)
    setSelectedAnswers({})
    setCurrentQuestion(0)
    setTimeLeft(300)
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    const answers = questions.map(q => ({
      wordId: q._id,
      selectedAnswer: selectedAnswers[q._id] || ''
    }))

    const timeSpent = 300 - timeLeft
    await submitQuiz(answers, timeSpent)
    setQuizStarted(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0
  const answeredCount = Object.keys(selectedAnswers).length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Brain className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vocabulary Quiz</h1>
          <p className="text-gray-600">
            Test your knowledge and track your progress
          </p>
        </div>

        <div className="card space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={quizState.difficulty}
                onChange={(e) => setQuizState(prev => ({ ...prev, difficulty: e.target.value }))}
                className="input-field w-full"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <select
                value={quizState.questionCount}
                onChange={(e) => setQuizState(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                className="input-field w-full"
              >
                <option value={5}>5 Questions</option>
                <option value={10}>10 Questions</option>
                <option value={15}>15 Questions</option>
                <option value={20}>20 Questions</option>
              </select>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Quiz Instructions:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• You have 5 minutes to complete the quiz</li>
              <li>• Choose the best definition for each word</li>
              <li>• You can navigate between questions</li>
              <li>• Your score will be saved to track progress</li>
            </ul>
          </div>

          <div className="text-center">
            <button
              onClick={handleStartQuiz}
              disabled={loading}
              className="btn-primary text-lg px-8 py-3"
            >
              {loading ? 'Loading...' : 'Start Quiz'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (quizState.completed) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-8 space-y-6"
        >
          <Trophy className="mx-auto h-16 w-16 text-yellow-600" />
          <h2 className="text-3xl font-bold text-gray-900">Quiz Completed!</h2>
          
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">{quizState.score}%</div>
              <div className="text-sm text-green-800">Score</div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">{quizState.correctCount}</div>
              <div className="text-sm text-blue-800">Correct</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">{questions.length}</div>
              <div className="text-sm text-purple-800">Total</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Performance:</h3>
            <div className="progress-bar max-w-md mx-auto">
              <div 
                className="progress-fill"
                style={{ width: `${quizState.score}%` }}
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => {
                setQuizState(prev => ({ ...prev, completed: false }))
                setQuizStarted(false)
              }}
              className="btn-secondary"
            >
              Take Another Quiz
            </button>
            <button
              onClick={() => window.location.href = '#/learn'}
              className="btn-primary"
            >
              Continue Learning
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const question = questions[currentQuestion]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Quiz Header */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Vocabulary Quiz</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-red-600">
              <Clock size={16} />
              <span className="font-mono">{formatTime(timeLeft)}</span>
            </div>
            <span className="text-sm text-gray-600">
              {answeredCount} / {questions.length} answered
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>Question {currentQuestion + 1} of {questions.length}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        {question && (
          <motion.div
            key={question._id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="card space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-gray-900">{question.word}</h2>
                {question.partOfSpeech && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {question.partOfSpeech}
                  </span>
                )}
              </div>
              
              <p className="text-lg text-gray-600">Select the correct definition:</p>
            </div>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(question._id, option)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                    selectedAnswers[question._id] === option
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedAnswers[question._id] === option
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswers[question._id] === option && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="flex-1">{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
          className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        <div className="flex space-x-3">
          {currentQuestion < questions.length - 1 ? (
            <button
              onClick={handleNext}
              className="btn-primary"
            >
              Next Question
            </button>
          ) : (
            <button
              onClick={handleSubmitQuiz}
              className="btn-primary bg-green-600 hover:bg-green-700"
            >
              Submit Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Quiz