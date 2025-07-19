// /App.tsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { Provider } from 'jotai'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import VocabularyList from './pages/VocabularyList'
import LearningSession from './pages/LearningSession'
import Quiz from './pages/Quiz'
import Progress from './pages/Progress'
import AddWord from './pages/AddWord'

// Theme configuration
if (typeof window !== 'undefined') {
  window.tailwind = {
    theme: {
      extend: {
        colors: {
          primary: '#3b82f6',
          secondary: '#64748b',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        }
      }
    }
  }
}

function App() {
  return (
    <Provider>
      <div className="min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/vocabulary" element={<VocabularyList />} />
            <Route path="/learn" element={<LearningSession />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/add-word" element={<AddWord />} />
          </Routes>
        </Layout>
      </div>
    </Provider>
  )
}

export default App