
class EmotionFusionService {
  constructor() {
    this.emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted']
    // Emotion similarity matrix (how similar emotions are to each other)
    this.emotionSimilarity = {
      happy: { happy: 1.0, surprised: 0.6, neutral: 0.3, sad: 0.1, angry: 0.1, fearful: 0.0, disgusted: 0.0 },
      sad: { sad: 1.0, fearful: 0.7, neutral: 0.4, angry: 0.3, happy: 0.1, surprised: 0.1, disgusted: 0.3 },
      angry: { angry: 1.0, disgusted: 0.8, fearful: 0.5, sad: 0.3, neutral: 0.2, happy: 0.0, surprised: 0.1 },
      surprised: { surprised: 1.0, happy: 0.6, neutral: 0.5, angry: 0.1, sad: 0.2, fearful: 0.3, disgusted: 0.0 },
      neutral: { neutral: 1.0, happy: 0.3, sad: 0.4, angry: 0.2, surprised: 0.5, fearful: 0.3, disgusted: 0.2 },
      fearful: { fearful: 1.0, sad: 0.7, surprised: 0.3, angry: 0.5, neutral: 0.3, happy: 0.0, disgusted: 0.4 },
      disgusted: { disgusted: 1.0, angry: 0.8, fearful: 0.4, sad: 0.3, neutral: 0.2, happy: 0.0, surprised: 0.0 }
    }
  }

  fuseEmotions(faceData, voiceData, textData) {
    /**
     * Fuse three emotion sources into a single unified emotion
     * Each source can be null if not analyzed
     */

    const sources = []
    
    if (faceData) sources.push({ emotion: faceData.emotion, confidence: faceData.confidence, type: 'face', weight: 0.4 })
    if (voiceData) sources.push({ emotion: voiceData.emotion, confidence: voiceData.confidence, type: 'voice', weight: 0.35 })
    if (textData) sources.push({ emotion: textData.emotion, confidence: textData.confidence, type: 'text', weight: 0.25 })

    if (sources.length === 0) {
      return {
        fusedEmotion: 'neutral',
        fusedConfidence: 0.5,
        emotionScores: {},
        sourcesUsed: 0,
        details: []
      }
    }

    // Normalize weights based on available sources
    const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0)
    sources.forEach(s => { s.weight = s.weight / totalWeight })

    // Calculate emotion scores
    const emotionScores = {}
    this.emotions.forEach(emotion => { emotionScores[emotion] = 0 })

    sources.forEach(source => {
      const sourceEmotion = source.emotion
      const sourceConfidence = source.confidence
      const weight = source.weight

      // Add weighted score for detected emotion
      emotionScores[sourceEmotion] += sourceConfidence * weight

      // Add similarity-based scores for related emotions
      Object.entries(this.emotionSimilarity[sourceEmotion]).forEach(([relatedEmotion, similarity]) => {
        if (relatedEmotion !== sourceEmotion) {
          emotionScores[relatedEmotion] += sourceConfidence * similarity * weight * 0.5
        }
      })
    })

    // Normalize scores to 0-1 range
    const maxScore = Math.max(...Object.values(emotionScores))
    if (maxScore > 0) {
      Object.keys(emotionScores).forEach(emotion => {
        emotionScores[emotion] = emotionScores[emotion] / maxScore
      })
    }

    // Find fused emotion (highest score)
    let fusedEmotion = 'neutral'
    let maxEmotionScore = 0

    Object.entries(emotionScores).forEach(([emotion, score]) => {
      if (score > maxEmotionScore) {
        maxEmotionScore = score
        fusedEmotion = emotion
      }
    })

    // Calculate overall fusion confidence
    const avgConfidence = sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length
    const emotionVariance = this.calculateEmotionVariance(emotionScores)
    const fusedConfidence = avgConfidence * (1 - emotionVariance * 0.3)

    return {
      fusedEmotion,
      fusedConfidence: Math.min(Math.max(fusedConfidence, 0), 1),
      emotionScores: this.sortEmotionScores(emotionScores),
      sourcesUsed: sources.length,
      details: sources.map(s => ({
        type: s.type,
        emotion: s.emotion,
        confidence: s.confidence,
        weight: (s.weight * 100).toFixed(1) + '%'
      }))
    }
  }

  calculateEmotionVariance(emotionScores) {
    /**
     * Calculate how spread out the emotion scores are
     * Low variance = high confidence in the result
     * High variance = emotions are mixed
     */
    const scores = Object.values(emotionScores)
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    return Math.sqrt(variance) // Standard deviation
  }

  sortEmotionScores(emotionScores) {
    /**
     * Sort emotions by score (descending)
     */
    return Object.entries(emotionScores)
      .sort(([, a], [, b]) => b - a)
      .reduce((obj, [emotion, score]) => {
        obj[emotion] = parseFloat(score.toFixed(3))
        return obj
      }, {})
  }

  getEmotionInsight(emotionData) {
    /**
     * Generate human-readable insight about the fused emotion
     */
    const emotion = emotionData.fusedEmotion
    const confidence = emotionData.fusedConfidence
    const sourcesUsed = emotionData.sourcesUsed

    const insights = {
      happy: 'You appear to be in a positive and joyful mood! Your expressions, tone, and words all reflect happiness.',
      sad: 'You seem to be experiencing sadness or melancholy. Consider engaging in activities that bring you joy.',
      angry: 'Your current emotional state shows signs of anger or frustration. Taking a break might help.',
      surprised: 'You appear surprised or astonished! This could indicate unexpected news or situations.',
      neutral: 'Your emotional state appears neutral. You seem calm and composed.',
      fearful: 'You seem to be experiencing some anxiety or fear. Remember, you are safe and supported.',
      disgusted: 'Your expressions suggest disgust or disapproval. Take time to reflect on what bothers you.'
    }

    const confidenceLevel = confidence > 0.8 ? 'very high' : confidence > 0.6 ? 'high' : confidence > 0.4 ? 'moderate' : 'low'

    return {
      insight: insights[emotion],
      confidenceLevel,
      recommendation: this.getRecommendation(emotion, sourcesUsed)
    }
  }

  getRecommendation(emotion, sourcesUsed) {
    /**
     * Generate personalized recommendations based on emotion
     */
    const recommendations = {
      happy: ['Continue doing what makes you happy!', 'Share your joy with others', 'Enjoy the moment'],
      sad: ['Reach out to friends or family', 'Engage in your favorite hobby', 'Take a walk in nature', 'Practice self-compassion'],
      angry: ['Take deep breaths', 'Step away for a moment', 'Journal your feelings', 'Exercise to release tension'],
      surprised: ['Embrace the new experience', 'Share the moment with others', 'Reflect on what happened'],
      neutral: ['Great time for reflection', 'Focus on important tasks', 'Meditate or practice mindfulness'],
      fearful: ['Identify what you fear', 'Practice grounding techniques', 'Seek support if needed', 'Take small steps forward'],
      disgusted: ['Identify the source', 'Set boundaries if needed', 'Distance yourself from triggers', 'Focus on positive things']
    }

    const emotionRecs = recommendations[emotion] || recommendations.neutral
    return emotionRecs[Math.floor(Math.random() * emotionRecs.length)]
  }
}

module.exports = new EmotionFusionService()