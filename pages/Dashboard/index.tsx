// /pages/Dashboard/index.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Brain, 
  FileQuestion, 
  TrendingUp,
  Calendar,
  Target,
  Zap,
  Award
} from 'lucide-react'
import { useAtom } from 'jotai'
import { dashboardStatsAtom } from './dashboardStateDashboard'
import { useDashboardData } from './dashboardRequestDashboard'

const Dashboard: React.FC = () => {
  const [stats] = useAtom(dashboardStatsAtom)
  const { loading } = useDashboardData()

  const quickActions = [
    {
      title: 'Start Learning',
      description: 'Practice new vocabulary words',
      icon: Brain,
      link: '/learn',
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'Take Quiz',
      description: 'Test your knowledge',
      icon: FileQuestion,
      link: '/quiz',
      color: 'bg-green-500',
      textColor: 'text-green-600'
    },
    {
      title: 'Add New Word',
      description: 'Expand your vocabulary',
      icon: BookOpen,
      link: '/add-word',
      color: 'bg-purple-500',
      textColor: 'text-purple-600'
    },
    {
      title: 'View Progress',
      description: 'Track your learning journey',
      icon: TrendingUp,
      link: '/progress',
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    }
  ]

  const statCards = [
    {
      title: 'Words Learned',
      value: stats.totalWordsLearned,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Quiz Average',
      value: `${stats.averageQuizScore}%`,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Study Time',
      value: `${Math.round(stats.totalTimeSpent / 60)}h`,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back! Ready to learn? 🌟
        </h1>
        <p className="text-blue-100">
          Continue your English vocabulary journey. You're doing great!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="card">
              <div className="flex items-center">
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                to={action.link}
                className="card hover:shadow-md transition-shadow duration-200 cursor-pointer group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${action.color} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${action.textColor} group-hover:text-opacity-80`}>
                      {action.title}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Today's Goal Progress */}
      <div className="card">
        <h3 className="font-semibold text-gray-900 mb-4">Today's Progress</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Daily Goal</span>
              <span className="font-medium text-gray-900">
                {stats.todayWordsLearned || 0} / {Math.round((stats.weeklyGoal || 50) / 7)} words
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(100, ((stats.todayWordsLearned || 0) / Math.round((stats.weeklyGoal || 50) / 7)) * 100)}%` 
                }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Study Time Today</span>
              <span className="font-medium text-gray-900">
                {Math.round((stats.todayTimeSpent || 0) / 60)} / 30 min
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(100, ((stats.todayTimeSpent || 0) / 30) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard