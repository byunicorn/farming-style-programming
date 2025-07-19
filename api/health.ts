// /api/health.ts
import { Hono } from 'hono'

const app = new Hono()

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Vocabulary API routes
const vocabularyApp = new Hono()

// Get all vocabulary entries with pagination
vocabularyApp.get('/vocabulary', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1')
    const limit = parseInt(c.req.query('limit') || '20')
    const category = c.req.query('category')
    const difficulty = c.req.query('difficulty')
    const skip = (page - 1) * limit

    const filter: any = {}
    if (category) filter.category = category
    if (difficulty) filter.difficulty = difficulty

    const words = await db.collection('6cc43af3_vocabulary_entries')
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .toArray()

    const total = await db.collection('6cc43af3_vocabulary_entries').countDocuments(filter)

    return c.json({
      data: words,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Add new vocabulary entry
vocabularyApp.post('/vocabulary', async (c) => {
  try {
    const body = await c.req.json()
    const { word, pronunciation, partOfSpeech, definition, exampleSentence, difficulty, category, synonyms, antonyms } = body

    if (!word || !definition) {
      return c.json({ error: 'Word and definition are required' }, 400)
    }

    const existingWord = await db.collection('6cc43af3_vocabulary_entries').findOne({ word })
    if (existingWord) {
      return c.json({ error: 'Word already exists' }, 409)
    }

    const newWord = {
      word,
      pronunciation: pronunciation || '',
      partOfSpeech: partOfSpeech || '',
      definition,
      exampleSentence: exampleSentence || '',
      difficulty: difficulty || 'beginner',
      category: category || 'general',
      synonyms: synonyms || [],
      antonyms: antonyms || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('6cc43af3_vocabulary_entries').insertOne(newWord)
    return c.json({ _id: result.insertedId, ...newWord })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Get specific vocabulary entry
vocabularyApp.get('/vocabulary/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const word = await db.collection('6cc43af3_vocabulary_entries').findOne({ _id: new mongo.ObjectId(id) })
    
    if (!word) {
      return c.json({ error: 'Word not found' }, 404)
    }

    return c.json(word)
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Update vocabulary entry
vocabularyApp.put('/vocabulary/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    
    const updateData = {
      ...body,
      updatedAt: new Date()
    }
    delete updateData._id

    const result = await db.collection('6cc43af3_vocabulary_entries').updateOne(
      { _id: new mongo.ObjectId(id) },
      { $set: updateData }
    )

    if (result.matchedCount === 0) {
      return c.json({ error: 'Word not found' }, 404)
    }

    return c.json({ message: 'Word updated successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete vocabulary entry
vocabularyApp.delete('/vocabulary/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const result = await db.collection('6cc43af3_vocabulary_entries').deleteOne({ _id: new mongo.ObjectId(id) })
    
    if (result.deletedCount === 0) {
      return c.json({ error: 'Word not found' }, 404)
    }

    return c.json({ message: 'Word deleted successfully' })
  } catch (error) {
    return c.json({ error: error.message }, 500)
  }
})

// Import other API modules
import progressApp from './progress'
import learningApp from './learning'

// Mount all API routes
app.route('/api', vocabularyApp)
app.route('/api', progressApp)
app.route('/api', learningApp)

export const rootApp = app