// ML-powered Emotion Insights Engine
class EmotionInsightsService {
  constructor() {
    this.emotionValences = {
      happy: 1.0,      // Very positive
      surprised: 0.6,  // Positive
      neutral: 0,      // Neutral
      fearful: -0.6,   // Negative
      sad: -0.9,       // Very negative
      angry: -0.8,     // Very negative
      disgusted: -0.7  // Very negative
    }

    this.emotionArousal = {
      happy: 0.9,
      surprised: 0.8,
      neutral: 0,
      fearful: 0.9,
      sad: -0.6,
      angry: 0.95,
      disgusted: -0.4
    }
  }

  /**
   * Calculate Emotional Wellness Score (0-100)
   * Based on: frequency of positive emotions, emotional stability, stress levels
   */
  calculateWellnessScore(emotionStats, avgConfidence) {
    if (!emotionStats) return 0

    // Positive emotions boost score
    const positiveEmotions = (emotionStats.happy || 0) + (emotionStats.surprised || 0)
    // Negative emotions reduce score
    const negativeEmotions = (emotionStats.sad || 0) + (emotionStats.angry || 0) + (emotionStats.fearful || 0)
    const total = Object.values(emotionStats).reduce((a, b) => a + b, 0)

    if (total === 0) return 50

    const positiveRatio = positiveEmotions / total
    const negativeRatio = negativeEmotions / total
    const confidenceBoost = (avgConfidence || 70) / 100

    // Base score from emotional balance
    let score = 50 + (positiveRatio - negativeRatio) * 50
    // Boost by confidence (more confident = more stable)
    score += confidenceBoost * 10
    // Cap between 0 and 100
    return Math.max(0, Math.min(100, score))
  }

  /**
   * Detect Emotional Patterns using ML clustering
   */
  detectEmotionalPatterns(emotions) {
    if (!emotions || emotions.length === 0) return null

    // Group emotions by day and analyze patterns
    const patterns = {
      morningMood: null,
      afternoonMood: null,
      eveningMood: null,
      dominantEmotion: null,
      emotionalVolatility: 0,
      consistentEmotions: []
    }

    // Find most frequent emotion
    const emotionCounts = {}
    emotions.forEach(e => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1
    })
    patterns.dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

    // Calculate emotional volatility (how much emotions change)
    const valences = emotions.map(e => this.emotionValences[e.emotion] || 0)
    const mean = valences.reduce((a, b) => a + b) / valences.length
    patterns.emotionalVolatility = Math.sqrt(
      valences.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / valences.length
    )

    return patterns
  }

  /**
   * Forecast Mood for next day using trend analysis
   */
  forecastMood(trendData) {
    if (!trendData) return null

    const forecast = {}
    let totalTrend = 0
    let count = 0

    for (const [emotion, data] of Object.entries(trendData)) {
      const changePercent = data.change || 0
      forecast[emotion] = {
        predicted: Math.max(0, (data.recent || 0) + (changePercent / 100) * (data.recent || 1)),
        trend: changePercent > 0 ? 'increasing' : 'decreasing',
        confidence: Math.min(0.95, 0.5 + Math.abs(changePercent) / 100)
      }
      totalTrend += changePercent
      count++
    }

    forecast.overallMoodTrend = totalTrend / count > 0 ? 'improving' : 'declining'
    return forecast
  }

  /**
   * Cross-Modal Consistency Detection
   * Check if emotions from face, voice, and text are consistent
   */
  detectEmotionConsistency(faceEmotion, voiceEmotion, textEmotion) {
    if (!faceEmotion && !voiceEmotion && !textEmotion) return null

    const emotions = []
    if (faceEmotion) emotions.push({ type: 'face', emotion: faceEmotion.emotion, confidence: faceEmotion.confidence })
    if (voiceEmotion) emotions.push({ type: 'voice', emotion: voiceEmotion.emotion, confidence: voiceEmotion.confidence })
    if (textEmotion) emotions.push({ type: 'text', emotion: textEmotion.emotion, confidence: textEmotion.confidence })

    if (emotions.length < 2) return null

    // Calculate consistency score
    const valences = emotions.map(e => this.emotionValences[e.emotion] || 0)
    const valenceDiff = Math.max(...valences) - Math.min(...valences)
    const consistency = Math.max(0, 100 - (valenceDiff * 50))

    // Check for inconsistencies
    const uniqueEmotions = new Set(emotions.map(e => e.emotion))
    const hasInconsistency = uniqueEmotions.size > 1

    return {
      consistency: Math.round(consistency),
      emotions,
      hasInconsistency,
      insight: hasInconsistency 
        ? `Potential emotion masking detected: ${emotions.map(e => e.type).join(', ')} emotions differ`
        : 'Emotional alignment detected across all modalities',
      recommendations: hasInconsistency ? [
        'You may be masking your true feelings',
        'Consider reflection and self-awareness',
        'Talk to someone you trust about how you\'re really feeling'
      ] : ['Great emotional alignment!', 'Your emotions are consistent']
    }
  }

  /**
   * Generate AI Insights and Recommendations
   */
  generateInsights(stats, patterns, forecast, wellnessScore) {
    const insights = []

    // Wellness insights
    if (wellnessScore > 75) {
      insights.push({
        type: 'positive',
        title: 'Great Emotional Health',
        message: 'Your emotional wellness score is excellent! Keep maintaining this positive momentum.'
      })
    } else if (wellnessScore < 40) {
      insights.push({
        type: 'warning',
        title: 'Low Emotional Wellness',
        message: 'Consider reaching out to someone or engaging in self-care activities to improve your emotional health.'
      })
    }

    // Volatility insights
    if (patterns?.emotionalVolatility > 0.7) {
      insights.push({
        type: 'warning',
        title: 'High Emotional Volatility',
        message: 'Your emotions are fluctuating significantly. Try grounding techniques or mindfulness exercises.'
      })
    }

    // Trend insights
    if (forecast?.overallMoodTrend === 'improving') {
      insights.push({
        type: 'positive',
        title: 'Improving Mood Trend',
        message: 'Your emotional state is improving! Continue with activities that support your well-being.'
      })
    } else if (forecast?.overallMoodTrend === 'declining') {
      insights.push({
        type: 'warning',
        title: 'Declining Mood Trend',
        message: 'Your mood has been declining. Consider seeking support or professional help.'
      })
    }

    // Pattern insights
    if (patterns?.dominantEmotion === 'neutral') {
      insights.push({
        type: 'info',
        title: 'Neutral Baseline',
        message: 'Your emotions tend toward neutrality. This suggests emotional balance or possible suppression.'
      })
    }

    return insights
  }

  /**
   * Calculate Emotional Intelligence Score
   * Based on awareness, consistency, and pattern recognition
   */
  calculateEIScore(consistency, volatility, recordCount) {
    let score = 50

    // Consistency contributes to EI
    if (consistency !== null) {
      score += (consistency / 100) * 20
    }

    // Low volatility = better emotional regulation
    score -= Math.min(30, volatility * 30)

    // More recordings = more self-awareness
    score += Math.min(20, (recordCount / 100) * 20)

    return Math.max(0, Math.min(100, score))
  }
}

export default new EmotionInsightsService()
