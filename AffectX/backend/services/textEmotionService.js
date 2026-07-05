const Sentiment = require('sentiment')
const sentiment = new Sentiment()

class TextEmotionService {
  constructor() {
    this.emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted']
  }

  analyzeText(text) {
    if (!text || text.trim().length === 0) {
      return {
        emotion: 'neutral',
        confidence: 0.5,
        sentiment: 0,
        positive: false
      }
    }

    // Analyze sentiment
    const sentimentResult = sentiment.analyze(text.toLowerCase())
    const sentimentScore = sentimentResult.score
    const sentimentComparative = sentimentResult.comparative

    // Determine emotion based on sentiment and keywords
    const emotion = this.determineEmotion(text, sentimentScore)
    const confidence = this.calculateConfidence(text, sentimentScore, emotion)

    return {
      emotion,
      confidence,
      sentiment: sentimentScore,
      comparative: sentimentComparative,
      words: sentimentResult.words.length,
      score: sentimentResult.score
    }
  }

  determineEmotion(text, sentimentScore) {
    const lowerText = text.toLowerCase()

    // Happy indicators
    const happyKeywords = ['happy', 'joy', 'love', 'great', 'wonderful', 'awesome', 'excellent', 'fantastic', 'brilliant', 'amazing', 'smile', 'laugh', 'fun', 'excited', 'delighted']
    const happyCount = happyKeywords.filter(keyword => lowerText.includes(keyword)).length

    // Sad indicators
    const sadKeywords = ['sad', 'unhappy', 'depressed', 'lonely', 'miserable', 'sorry', 'disappointed', 'heartbroken', 'blue', 'down', 'tears', 'cry', 'grief']
    const sadCount = sadKeywords.filter(keyword => lowerText.includes(keyword)).length

    // Angry indicators
    const angryKeywords = ['angry', 'furious', 'rage', 'mad', 'hate', 'terrible', 'awful', 'horrible', 'annoyed', 'frustrated', 'angry', 'irritated', 'hostile']
    const angryCount = angryKeywords.filter(keyword => lowerText.includes(keyword)).length

    // Surprised indicators
    const surprisedKeywords = ['surprised', 'shocked', 'amazed', 'astonished', 'wow', 'unexpected', 'surprising', 'wonder', 'astounded']
    const surprisedCount = surprisedKeywords.filter(keyword => lowerText.includes(keyword)).length

    // Fearful indicators
    const fearfulKeywords = ['fear', 'scared', 'afraid', 'terrified', 'anxious', 'nervous', 'worried', 'panic', 'dread', 'horror']
    const fearfulCount = fearfulKeywords.filter(keyword => lowerText.includes(keyword)).length

    // Disgusted indicators
    const disgustedKeywords = ['disgusting', 'gross', 'nasty', 'revolting', 'repulsive', 'yuck', 'ugh', 'vile', 'abhorrent']
    const disgustedCount = disgustedKeywords.filter(keyword => lowerText.includes(keyword)).length

    // Count keyword matches
    const emotionScores = {
      happy: happyCount + (sentimentScore > 2 ? 2 : 0),
      sad: sadCount + (sentimentScore < -2 ? 2 : 0),
      angry: angryCount + (sentimentScore < -1 ? 1 : 0),
      surprised: surprisedCount,
      fearful: fearfulCount,
      disgusted: disgustedCount,
      neutral: 1
    }

    // Find emotion with highest score
    let maxEmotion = 'neutral'
    let maxScore = emotionScores.neutral

    for (const [emotion, score] of Object.entries(emotionScores)) {
      if (score > maxScore) {
        maxScore = score
        maxEmotion = emotion
      }
    }

    return maxEmotion
  }

  calculateConfidence(text, sentimentScore, emotion) {
    const textLength = text.split(' ').length
    const lengthScore = Math.min(textLength / 20, 1) // Normalize by 20 words

    const sentimentStrength = Math.min(Math.abs(sentimentScore) / 5, 1) // Normalize by 5

    // Combine scores
    let baseConfidence = (lengthScore + sentimentStrength) / 2

    // Boost confidence if it matches sentiment
    if ((emotion === 'happy' && sentimentScore > 0) ||
        (emotion === 'sad' && sentimentScore < 0) ||
        (emotion === 'angry' && sentimentScore < -1)) {
      baseConfidence = Math.min(baseConfidence + 0.2, 1)
    }

    // Ensure minimum confidence
    const finalConfidence = Math.max(baseConfidence, 0.5)

    return parseFloat(Math.min(finalConfidence, 1).toFixed(2))
  }
}

module.exports = new TextEmotionService()
