
const express = require('express')
const router = express.Router()
const Emotion = require('../models/Emotion')
const EmotionFusion = require('../models/EmotionFusion')
const authMiddleware = require('../middleware/authMiddleware')
const emotionFusionService = require('../services/emotionFusionService')

// Fuse recent emotions
router.post('/fuse', authMiddleware, async (req, res) => {
  try {
    const { faceEmotionId, voiceEmotionId, textEmotionId } = req.body

    // Fetch emotion data
    let faceData = null
    let voiceData = null
    let textData = null

    if (faceEmotionId) {
      faceData = await Emotion.findOne({
        _id: faceEmotionId,
        userId: req.user.userId,
        type: 'face'
      })
    }

    if (voiceEmotionId) {
      voiceData = await Emotion.findOne({
        _id: voiceEmotionId,
        userId: req.user.userId,
        type: 'voice'
      })
    }

    if (textEmotionId) {
      textData = await Emotion.findOne({
        _id: textEmotionId,
        userId: req.user.userId,
        type: 'text'
      })
    }

    if (!faceData && !voiceData && !textData) {
      return res.status(400).json({ message: 'At least one emotion source is required' })
    }

    // Fuse emotions
    const fusionResult = emotionFusionService.fuseEmotions(faceData, voiceData, textData)
    const insight = emotionFusionService.getEmotionInsight(fusionResult)

    // Save fusion result
    const emotionFusion = new EmotionFusion({
      userId: req.user.userId,
      fusedEmotion: fusionResult.fusedEmotion,
      fusedConfidence: fusionResult.fusedConfidence,
      emotionScores: fusionResult.emotionScores,
      sources: {
        face: faceData ? { emotion: faceData.emotion, confidence: faceData.confidence } : null,
        voice: voiceData ? { emotion: voiceData.emotion, confidence: voiceData.confidence } : null,
        text: textData ? { emotion: textData.emotion, confidence: textData.confidence } : null
      },
      sourcesUsed: fusionResult.sourcesUsed,
      insight: insight.insight,
      recommendation: insight.recommendation,
      timestamp: new Date()
    })

    await emotionFusion.save()

    res.json({
      fusedEmotion: fusionResult.fusedEmotion,
      fusedConfidence: fusionResult.fusedConfidence,
      emotionScores: fusionResult.emotionScores,
      sourcesUsed: fusionResult.sourcesUsed,
      details: fusionResult.details,
      insight: insight.insight,
      confidenceLevel: insight.confidenceLevel,
      recommendation: insight.recommendation,
      message: 'Emotions fused successfully'
    })
  } catch (err) {
    res.status(500).json({ message: 'Fusion failed', error: err.message })
  }
})

// Get recent emotions by type (for fusion selection)
router.get('/recent', authMiddleware, async (req, res) => {
  try {
    const recentEmotions = await Emotion.find({ userId: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(15)

    const grouped = {
      face: recentEmotions.filter(e => e.type === 'face').slice(0, 3),
      voice: recentEmotions.filter(e => e.type === 'voice').slice(0, 3),
      text: recentEmotions.filter(e => e.type === 'text').slice(0, 3)
    }

    res.json(grouped)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch recent emotions' })
  }
})

// Get fusion history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const fusionHistory = await EmotionFusion.find({ userId: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(50)

    res.json(fusionHistory)
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch fusion history' })
  }
})

// Get fusion statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const fusions = await EmotionFusion.find({ userId: req.user.userId })
      .sort({ timestamp: -1 })
      .limit(30)

    const emotionCounts = {
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      neutral: 0,
      fearful: 0,
      disgusted: 0
    }

    const avgConfidence = {}
    const emotionConfidences = {
      happy: [],
      sad: [],
      angry: [],
      surprised: [],
      neutral: [],
      fearful: [],
      disgusted: []
    }

    fusions.forEach(fusion => {
      emotionCounts[fusion.fusedEmotion]++
      emotionConfidences[fusion.fusedEmotion].push(fusion.fusedConfidence)
    })

    Object.keys(emotionConfidences).forEach(emotion => {
      if (emotionConfidences[emotion].length > 0) {
        avgConfidence[emotion] = (
          emotionConfidences[emotion].reduce((a, b) => a + b, 0) / emotionConfidences[emotion].length
        ).toFixed(2)
      }
    })

    const totalFusions = fusions.length
    const averageOverallConfidence = (
      fusions.reduce((sum, f) => sum + f.fusedConfidence, 0) / totalFusions
    ).toFixed(2)

    res.json({
      totalFusions,
      emotionCounts,
      averageOverallConfidence,
      avgConfidenceByEmotion: avgConfidence
    })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
})

module.exports = router