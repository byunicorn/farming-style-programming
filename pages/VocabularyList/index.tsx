// /pages/VocabularyList/index.tsx
import React, { useState } from 'react'
import { Search, Plus, Edit, Trash2, BookOpen } from 'lucide-react'
import { useAtom } from 'jotai'
import { Link } from 'react-router-dom'
import { vocabularyListAtom } from './vocabularyStateVocabularyList'
import { useVocabularyList } from './vocabularyRequestVocabularyList'

const VocabularyList: React.FC = () => {
  const [words] = useAtom(vocabularyListAtom)
  const { loading, deleteWord, searchWords } = useVocabularyList()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchWords(searchTerm, selectedDifficulty, selectedCategory)
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this word?')) {
      await deleteWord(id)
    }
  }

  const difficulties = ['beginner', 'intermediate', 'advanced']
  const categories = ['academic', 'business', 'daily', 'technology', 'general']

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vocabulary List</h1>
          <p className="text-gray-600">Manage your vocabulary collection</p>
        </div>
        <Link to="/add-word" className="btn-primary flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Word</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Words
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by word or definition..."
                  className="input-field pl-10"
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input-field"
              >
                <option value="">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Word List */}
      <div className="space-y-4">
        {words.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No words found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Try adjusting your search criteria.' : 'Start building your vocabulary by adding some words.'}
            </p>
            <Link to="/add-word" className="btn-primary inline-flex items-center space-x-2">
              <Plus size={20} />
              <span>Add Your First Word</span>
            </Link>
          </div>
        ) : (
          words.map((word) => (
            <div key={word._id} className="card hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{word.word}</h3>
                    {word.pronunciation && (
                      <span className="text-sm text-gray-500 italic">/{word.pronunciation}/</span>
                    )}
                    {word.partOfSpeech && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        {word.partOfSpeech}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-3">{word.definition}</p>
                  
                  {word.exampleSentence && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">Example: </span>
                      <span className="text-sm text-gray-700 italic">"{word.exampleSentence}"</span>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      word.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      word.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {word.difficulty}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {word.category}
                    </span>
                  </div>
                  
                  {(word.synonyms?.length > 0 || word.antonyms?.length > 0) && (
                    <div className="text-sm text-gray-600">
                      {word.synonyms?.length > 0 && (
                        <div className="mb-1">
                          <span className="font-medium">Synonyms: </span>
                          {word.synonyms.join(', ')}
                        </div>
                      )}
                      {word.antonyms?.length > 0 && (
                        <div>
                          <span className="font-medium">Antonyms: </span>
                          {word.antonyms.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => {/* TODO: Implement edit */}}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                    title="Edit word"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(word._id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors duration-200"
                    title="Delete word"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default VocabularyList