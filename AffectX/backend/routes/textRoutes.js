
const express = require('express')
const router = express.Router()
const textEmotionService = require('../services/textEmotionService')
const Emotion = require('../models/Emotion')
const authMiddleware = require('../middleware/authMiddleware')

// Analyze text
router.post('/analyze', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Text is required' })
    }

    // Analyze using service
    const analysisResult = textEmotionService.analyzeText(text)

    // Save to database
    const emotion = new Emotion({
      userId: req.user.userId,
      emotion: analysisResult.emotion,
      confidence: analysisResult.confidence,
      type: 'text',
      timestamp: new Date()
    })

    await emotion.save()

    res.json({
      emotion: analysisResult.emotion,
      confidence: analysisResult.confidence,
      sentiment: analysisResult.sentiment,
      comparative: analysisResult.comparative,
      words: analysisResult.words,
      message: 'Text analyzed successfully'
    })
  } catch (err) {
    res.status(500).json({ message: 'Text analysis failed', error: err.message })
  }
})

// Get text analysis history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const emotions = await Emotion.find({ 
      userId: req.user.userId,
      type: 'text'
    })
      .sort({ timestamp: -1 })
      .limit(50)

    res.json(emotions)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history' })
  }
})

module.exports = router