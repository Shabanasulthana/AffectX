const express = require('express')
const router = express.Router()
const Emotion = require('../models/Emotion')
const authMiddleware = require('../middleware/authMiddleware')

// Save emotion
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { emotion, confidence, type, timestamp } = req.body

    const newEmotion = new Emotion({
      userId: req.user.userId,
      emotion,
      confidence,
      type,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    })

    await newEmotion.save()
    res.status(201).json({ message: 'Emotion saved successfully', emotion: newEmotion })
  } catch (err) {
    res.status(500).json({ message: 'Failed to save emotion', error: err.message })
  }
})

// Get emotion history with filters
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { type, days = 30, limit = 100 } = req.query

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const query = {
      userId: req.user.userId,
      timestamp: { $gte: startDate }
    }

    if (type && type !== 'all') {
      query.type = type
    }

    const emotions = await Emotion.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))

    res.json(emotions)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch history' })
  }
})

// Get emotion statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { days = 30, type = 'all' } = req.query

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const query = {
      userId: req.user.userId,
      timestamp: { $gte: startDate }
    }

    if (type && type !== 'all') {
      query.type = type
    }

    const emotions = await Emotion.find(query)

    // Count emotions
    const emotionCounts = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      neutral: 0,
      fearful: 0,
      disgusted: 0
    }

    const emotionConfidences = {
      happy: [],
      sad: [],
      angry: [],
      surprised: [],
      neutral: [],
      fearful: [],
      disgusted: []
    }

    const typeCounts = { face: 0, voice: 0, text: 0 }

    emotions.forEach(emotion => {
      emotionCounts[emotion.emotion]++
      emotionConfidences[emotion.emotion].push(emotion.confidence)
      typeCounts[emotion.type]++
    })

    // Calculate averages
    const avgConfidence = {}
    Object.keys(emotionConfidences).forEach(emotion => {
      if (emotionConfidences[emotion].length > 0) {
        avgConfidence[emotion] = (
          emotionConfidences[emotion].reduce((a, b) => a + b, 0) /
          emotionConfidences[emotion].length
        ).toFixed(2)
      }
    })

    const totalRecordings = emotions.length
    const avgOverallConfidence = (
      emotions.reduce((sum, e) => sum + e.confidence, 0) / (totalRecordings || 1)
    ).toFixed(2)

    res.json({
      totalRecordings,
      emotionCounts,
      avgConfidence,
      avgOverallConfidence,
      typeCounts,
      dateRange: {
        start: startDate,
        end: new Date()
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

// Get emotions by date
router.get('/by-date', authMiddleware, async (req, res) => {
  try {
    const { days = 30, type = 'all' } = req.query

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const query = {
      userId: req.user.userId,
      timestamp: { $gte: startDate }
    }

    if (type && type !== 'all') {
      query.type = type
    }

    const emotions = await Emotion.find(query).sort({ timestamp: 1 })

    // Group by date
    const byDate = {}
    emotions.forEach(emotion => {
      const date = emotion.timestamp.toISOString().split('T')[0]
      if (!byDate[date]) {
        byDate[date] = []
      }
      byDate[date].push(emotion)
    })

    res.json(byDate)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch emotions by date' })
  }
})

// Get trending emotions
router.get('/trending', authMiddleware, async (req, res) => {
  try {
    const { days = 7 } = req.query

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const emotions = await Emotion.find({
      userId: req.user.userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 })

    // Calculate trend (recent vs previous period)
    const midDate = new Date(startDate)
    midDate.setDate(midDate.getDate() + parseInt(days) / 2)

    const recent = emotions.filter(e => e.timestamp > midDate)
    const previous = emotions.filter(e => e.timestamp <= midDate)

    const trendData = {}
    const emotions_list = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted']

    emotions_list.forEach(emotion => {
      const recentCount = recent.filter(e => e.emotion === emotion).length
      const previousCount = previous.filter(e => e.emotion === emotion).length
      const change = previousCount > 0 ? ((recentCount - previousCount) / previousCount * 100) : 0

      trendData[emotion] = {
        recent: recentCount,
        previous: previousCount,
        change: parseFloat(change.toFixed(1))
      }
    })

    res.json(trendData)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch trending data' })
  }
})

module.exports = router
