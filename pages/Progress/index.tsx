// /pages/Progress/index.tsx
import React, { useState } from 'react'
import { Calendar, TrendingUp, Target, Award, Clock, BookOpen } from 'lucide-react'
import { useAtom } from 'jotai'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { progressDataAtom, progressStatsAtom } from './progressStateProgress'
import { useProgressData } from './progressRequestProgress'

const Progress: React.FC = () => {
  const [progressData] = useAtom(progressDataAtom)
  const [stats] = useAtom(progressStatsAtom)
  const { loading, updateGoals } = useProgressData()
  const [selectedPeriod, setSelectedPeriod] = useState('7') // 7, 30, 90 days
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [goals, setGoals] = useState({
    weeklyGoal: stats.weeklyGoal || 50,
    monthlyGoal: stats.monthlyGoal || 200
  })

  const periods = [
    { value: '7', label: 'Last 7 days' },
    { value: '30', label: 'Last 30 days' },
    { value: '90', label: 'Last 90 days' }
  ]

  const handleUpdateGoals = async () => {
    await updateGoals(goals.weeklyGoal, goals.monthlyGoal)
    setShowGoalModal(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const statsCards = [
    {
      title: 'Total Words Learned',
      value: stats.totalWordsLearned,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+5 this week'
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      change: stats.currentStreak > stats.longestStreak ? 'New record!' : ''
    },
    {
      title: 'Average Quiz Score',
      value: `${stats.averageQuizScore}%`,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      change: stats.averageQuizScore >= 80 ? 'Excellent!' : 'Keep practicing!'
    },
    {
      title: 'Total Study Time',
      value: `${Math.round(stats.totalTimeSpent / 60)}h`,
      icon: Clock,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      change: `${Math.round((stats.totalTimeSpent % 60))}m`
    }
  ]

  // Prepare chart data
  const chartData = progressData.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    wordsLearned: day.wordsLearned?.length || 0,
    timeSpent: Math.round((day.timeSpent || 0) / 60), // Convert to hours
    quizScore: day.quizScore || 0
  })).reverse()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Learning Progress</h1>
          <p className="text-gray-600">Track your vocabulary learning journey</p>
        </div>
        <div className="flex space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="input-field"
          >
            {periods.map(period => (
              <option key={period.value} value={period.value}>
                {period.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowGoalModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Target size={16} />
            <span>Set Goals</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.change && (
                      <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Goals Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Weekly Goal Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">This Week</span>
              <span className="font-medium text-gray-900">
                {stats.thisWeekWords || 0} / {stats.weeklyGoal} words
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(100, ((stats.thisWeekWords || 0) / stats.weeklyGoal) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly Goal Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">This Month</span>
              <span className="font-medium text-gray-900">
                {stats.thisMonthWords || 0} / {stats.monthlyGoal} words
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(100, ((stats.thisMonthWords || 0) / stats.monthlyGoal) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Words Learned Chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Words Learned Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="wordsLearned" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Study Time Chart */}
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-4">Daily Study Time (Hours)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="timeSpent" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quiz Performance Chart */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Quiz Performance</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.filter(d => d.quizScore > 0)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Quiz Score']} />
              <Line 
                type="monotone" 
                dataKey="quizScore" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={{ fill: '#f59e0b' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Goal Setting Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Set Learning Goals</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Goal (words per week)
                </label>
                <input
                  type="number"
                  value={goals.weeklyGoal}
                  onChange={(e) => setGoals(prev => ({ ...prev, weeklyGoal: parseInt(e.target.value) || 0 }))}
                  className="input-field"
                  min="1"
                  max="500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Goal (words per month)
                </label>
                <input
                  type="number"
                  value={goals.monthlyGoal}
                  onChange={(e) => setGoals(prev => ({ ...prev, monthlyGoal: parseInt(e.target.value) || 0 }))}
                  className="input-field"
                  min="1"
                  max="2000"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={() => setShowGoalModal(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateGoals}
                className="btn-primary"
              >
                Save Goals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Progress