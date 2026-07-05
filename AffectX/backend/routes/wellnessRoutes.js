
const express = require('express')
const router = express.Router()
const Emotion = require('../models/Emotion')
const WellnessActivity = require('../models/WellnessActivity')
const authMiddleware = require('../middleware/authMiddleware')
const wellnessService = require('../services/wellnessService')

// Get wellness recommendations for emotion
router.get('/recommendations/:emotion', authMiddleware, async (req, res) => {
  try {
    const { emotion } = req.params
    const recommendations = wellnessService.getRecommendations(emotion)
    const tips = wellnessService.getTips(emotion)

    res.json({
      emotion,
      recommendations,
      tips,
      message: 'Wellness recommendations retrieved successfully'
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recommendations', error: err.message })
  }
})

// Get personalized wellness plan
router.get('/plan', authMiddleware, async (req, res) => {
  try {
    const { days = 7 } = req.query

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const recentEmotions = await Emotion.find({
      userId: req.user.userId,
      timestamp: { $gte: startDate }
    }).sort({ timestamp: -1 })

    const emotionsList = recentEmotions.map(e => e.emotion)
    const plan = wellnessService.getPersonalizedWellnessPlan(emotionsList)

    res.json(plan)
  } catch (err) {
    res.status(500).json({ message: 'Failed to create wellness plan', error: err.message })
  }
})

// Get all activities
router.get('/activities', authMiddleware, async (req, res) => {
  try {
    const activities = wellnessService.getAllActivities()
    res.json(activities)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activities' })
  }
})

// Get activity categories
router.get('/categories', authMiddleware, async (req, res) => {
  try {
    const categories = wellnessService.getActivityCategories()
    res.json(categories)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' })
  }
})

// Start wellness activity
router.post('/activity/start', authMiddleware, async (req, res) => {
  try {
    const { activityId, activityTitle, emotion, duration, category } = req.body

    const activity = new WellnessActivity({
      userId: req.user.userId,
      activityId,
      activityTitle,
      emotion,
      duration,
      category,
      status: 'started',
      startedAt: new Date()
    })

    await activity.save()

    res.status(201).json({
      message: 'Activity started successfully',
      activity
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to start activity', error: err.message })
  }
})

// Complete wellness activity
router.put('/activity/:activityId/complete', authMiddleware, async (req, res) => {
  try {
    const { rating, feedback } = req.body

    const activity = await WellnessActivity.findOneAndUpdate(
      {
        _id: req.params.activityId,
        userId: req.user.userId
      },
      {
        status: 'completed',
        rating,
        feedback,
        completedAt: new Date()
      },
      { new: true }
    )

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' })
    }

    res.json({
      message: 'Activity completed successfully',
      activity
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to complete activity', error: err.message })
  }
})

// Get activity history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { days = 30, status = 'all' } = req.query

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const query = {
      userId: req.user.userId,
      startedAt: { $gte: startDate }
    }

    if (status && status !== 'all') {
      query.status = status
    }

    const activities = await WellnessActivity.find(query)
      .sort({ startedAt: -1 })
      .limit(100)

    res.json(activities)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch activity history' })
  }
})

// Get wellness statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const { days = 30 } = req.query

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(days))

    const activities = await WellnessActivity.find({
      userId: req.user.userId,
      startedAt: { $gte: startDate }
    })

    const emotionStats = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      neutral: 0,
      fearful: 0,
      disgusted: 0
    }

    activities.forEach(activity => {
      if (emotionStats[activity.emotion] !== undefined) {
        emotionStats[activity.emotion]++
      }
    })

    const stats = {
      totalActivities: activities.length,
      completed: activities.filter(a => a.status === 'completed').length,
      started: activities.filter(a => a.status === 'started').length,
      skipped: activities.filter(a => a.status === 'skipped').length,
      avgRating: 0,
      completionRate: 0,
      emotionStats
    }

    if (activities.length > 0) {
      stats.completionRate = parseFloat(((stats.completed / activities.length) * 100).toFixed(1))
    }

    const ratedActivities = activities.filter(a => a.rating)
    if (ratedActivities.length > 0) {
      stats.avgRating = parseFloat(
        (ratedActivities.reduce((sum, a) => sum + a.rating, 0) / ratedActivities.length).toFixed(1)
      )
    }

    const categoryStats = {}
    activities.forEach(activity => {
      if (!categoryStats[activity.category]) {
        categoryStats[activity.category] = 0
      }
      if (activity.status === 'completed') {
        categoryStats[activity.category]++
      }
    })

    res.json({
      totalActivities: stats.totalActivities,
      completed: stats.completed,
      completionRate: stats.completionRate,
      avgRating: stats.avgRating,
      emotionStats: stats.emotionStats,
      categoryStats: categoryStats,
      dateRange: {
        start: startDate,
        end: new Date()
      }
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch wellness stats' })
  }
})

module.exports = router