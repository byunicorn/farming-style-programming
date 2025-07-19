// /pages/LearningSession/index.tsx
import React, { useState } from 'react'
import { CheckCircle, XCircle, ArrowRight, RotateCcw, Brain } from 'lucide-react'
import { useAtom } from 'jotai'
import { motion, AnimatePresence } from 'framer-motion'
import { learningWordsAtom, currentWordIndexAtom } from './learningStateLearningSession'
import { useLearningSession } from './learningRequestLearningSession'

const LearningSession: React.FC = () => {
  const [words] = useAtom(learningWordsAtom)
  const [currentIndex, setCurrentIndex] = useAtom(currentWordIndexAtom)
  const { loading, startSession, submitAnswer, resetSession } = useLearningSession()
  const [showAnswer, setShowAnswer] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner')
  const [sessionStarted, setSessionStarted] = useState(false)

  const currentWord = words[currentIndex]
  const progress = words.length > 0 ? ((currentIndex + 1) / words.length) * 100 : 0

  const handleStartSession = async () => {
    await startSession(selectedDifficulty)
    setSessionStarted(true)
    setShowAnswer(false)
  }

  const handleAnswer = async (correct: boolean) => {
    if (currentWord) {
      await submitAnswer(currentWord._id, correct)
      
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowAnswer(false)
      } else {
        // Session completed
        setSessionStarted(false)
        setCurrentIndex(0)
      }
    }
  }

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setShowAnswer(false)
    }
  }

  const handleReset = () => {
    resetSession()
    setSessionStarted(false)
    setShowAnswer(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!sessionStarted || words.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <Brain className="mx-auto h-16 w-16 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Session</h1>
          <p className="text-gray-600">
            Practice vocabulary words and improve your English skills
          </p>
        </div>

        <div className="card space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Difficulty Level
            </label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input-field w-full"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="text-center">
            <button
              onClick={handleStartSession}
              disabled={loading}
              className="btn-primary text-lg px-8 py-3"
            >
              {loading ? 'Loading...' : 'Start Learning Session'}
            </button>
          </div>
        </div>

        {words.length === 0 && !loading && (
          <div className="card text-center py-8">
            <p className="text-gray-600">
              No words available for learning at this difficulty level.
              Try a different difficulty or add more words to your vocabulary.
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header with Progress */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-900">Learning Session</h1>
          <button
            onClick={handleReset}
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCcw size={16} />
            <span>Reset</span>
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progress</span>
            <span>{currentIndex + 1} of {words.length} words</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Word Card */}
      <AnimatePresence mode="wait">
        {currentWord && (
          <motion.div
            key={currentWord._id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="card space-y-6"
          >
            <div className="text-center space-y-4">
              <div className="space-y-2">
                <h2 className="text-4xl font-bold text-gray-900">{currentWord.word}</h2>
                {currentWord.pronunciation && (
                  <p className="text-lg text-gray-500 italic">/{currentWord.pronunciation}/</p>
                )}
                {currentWord.partOfSpeech && (
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    {currentWord.partOfSpeech}
                  </span>
                )}
              </div>

              {!showAnswer && (
                <div className="py-8">
                  <p className="text-lg text-gray-600 mb-6">
                    Do you know the meaning of this word?
                  </p>
                  <button
                    onClick={() => setShowAnswer(true)}
                    className="btn-primary"
                  >
                    Show Definition
                  </button>
                </div>
              )}

              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="bg-gray-50 rounded-lg p-6 text-left">
                    <h3 className="font-semibold text-gray-900 mb-2">Definition:</h3>
                    <p className="text-gray-700 mb-4">{currentWord.definition}</p>
                    
                    {currentWord.exampleSentence && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-1">Example:</h4>
                        <p className="text-gray-600 italic">"{currentWord.exampleSentence}"</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <p className="text-lg font-medium text-gray-900">
                      Did you know this word?
                    </p>
                    
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => handleAnswer(false)}
                        className="flex items-center space-x-2 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                      >
                        <XCircle size={20} />
                        <span>No, I didn't know</span>
                      </button>
                      
                      <button
                        onClick={() => handleAnswer(true)}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200"
                      >
                        <CheckCircle size={20} />
                        <span>Yes, I knew it</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session Completed */}
      {sessionStarted && currentIndex >= words.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center py-8 space-y-4"
        >
          <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Session Completed!</h2>
          <p className="text-gray-600">
            Great job! You've reviewed {words.length} words in this session.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleReset}
              className="btn-secondary"
            >
              Start New Session
            </button>
            <button
              onClick={() => window.location.href = '#/quiz'}
              className="btn-primary"
            >
              Take a Quiz
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default LearningSession