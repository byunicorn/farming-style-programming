// /pages/AddWord/index.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, ArrowLeft, Plus, Minus } from 'lucide-react'
import { toast } from 'react-hot-toast'

const AddWord: React.FC = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    word: '',
    pronunciation: '',
    partOfSpeech: '',
    definition: '',
    exampleSentence: '',
    difficulty: 'beginner',
    category: 'general',
    synonyms: [''],
    antonyms: ['']
  })

  const difficulties = ['beginner', 'intermediate', 'advanced']
  const categories = ['academic', 'business', 'daily', 'technology', 'general']
  const partsOfSpeech = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'interjection']

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSynonymChange = (index: number, value: string) => {
    const newSynonyms = [...formData.synonyms]
    newSynonyms[index] = value
    setFormData(prev => ({ ...prev, synonyms: newSynonyms }))
  }

  const handleAntonymChange = (index: number, value: string) => {
    const newAntonyms = [...formData.antonyms]
    newAntonyms[index] = value
    setFormData(prev => ({ ...prev, antonyms: newAntonyms }))
  }

  const addSynonym = () => {
    setFormData(prev => ({ ...prev, synonyms: [...prev.synonyms, ''] }))
  }

  const removeSynonym = (index: number) => {
    if (formData.synonyms.length > 1) {
      const newSynonyms = formData.synonyms.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, synonyms: newSynonyms }))
    }
  }

  const addAntonym = () => {
    setFormData(prev => ({ ...prev, antonyms: [...prev.antonyms, ''] }))
  }

  const removeAntonym = (index: number) => {
    if (formData.antonyms.length > 1) {
      const newAntonyms = formData.antonyms.filter((_, i) => i !== index)
      setFormData(prev => ({ ...prev, antonyms: newAntonyms }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.word.trim() || !formData.definition.trim()) {
      toast.error('Word and definition are required')
      return
    }

    setLoading(true)
    
    try {
      const submitData = {
        ...formData,
        synonyms: formData.synonyms.filter(s => s.trim()),
        antonyms: formData.antonyms.filter(a => a.trim())
      }

      const response = await fetch(`${process.env.API_DOMAIN}/api/vocabulary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Word added successfully!')
        navigate('/vocabulary')
      } else {
        throw new Error(data.error || 'Failed to add word')
      }
    } catch (error) {
      console.error('Error adding word:', error)
      toast.error('Failed to add word')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate('/vocabulary')}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Word</h1>
          <p className="text-gray-600">Expand your vocabulary collection</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="card space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Word *
              </label>
              <input
                type="text"
                name="word"
                value={formData.word}
                onChange={handleInputChange}
                placeholder="Enter the word"
                className="input-field"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pronunciation
              </label>
              <input
                type="text"
                name="pronunciation"
                value={formData.pronunciation}
                onChange={handleInputChange}
                placeholder="e.g., /prəˌnʌnsiˈeɪʃən/"
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Part of Speech
              </label>
              <select
                name="partOfSpeech"
                value={formData.partOfSpeech}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select...</option>
                {partsOfSpeech.map(pos => (
                  <option key={pos} value={pos}>
                    {pos.charAt(0).toUpperCase() + pos.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                className="input-field"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="input-field"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Definition *
            </label>
            <textarea
              name="definition"
              value={formData.definition}
              onChange={handleInputChange}
              placeholder="Enter the definition"
              className="input-field h-24 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Example Sentence
            </label>
            <textarea
              name="exampleSentence"
              value={formData.exampleSentence}
              onChange={handleInputChange}
              placeholder="Provide an example sentence"
              className="input-field h-20 resize-none"
            />
          </div>
        </div>

        {/* Synonyms and Antonyms */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Related Words
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Synonyms */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Synonyms
                </label>
                <button
                  type="button"
                  onClick={addSynonym}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.synonyms.map((synonym, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={synonym}
                      onChange={(e) => handleSynonymChange(index, e.target.value)}
                      placeholder="Enter synonym"
                      className="input-field flex-1"
                    />
                    {formData.synonyms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSynonym(index)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Antonyms */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Antonyms
                </label>
                <button
                  type="button"
                  onClick={addAntonym}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-2">
                {formData.antonyms.map((antonym, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={antonym}
                      onChange={(e) => handleAntonymChange(index, e.target.value)}
                      placeholder="Enter antonym"
                      className="input-field flex-1"
                    />
                    {formData.antonyms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAntonym(index)}
                        className="text-red-600 hover:text-red-800 transition-colors duration-200"
                      >
                        <Minus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate('/vocabulary')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Save size={16} />
            )}
            <span>{loading ? 'Adding...' : 'Add Word'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddWord