
const mongoose = require('mongoose')

const emotionFusionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fusedEmotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted'],
    required: true
  },
  fusedConfidence: {
    type: Number,
    required: true
  },
  emotionScores: {
    happy: Number,
    sad: Number,
    angry: Number,
    surprised: Number,
    neutral: Number,
    fearful: Number,
    disgusted: Number
  },
  sources: {
    face: {
      emotion: String,
      confidence: Number
    },
    voice: {
      emotion: String,
      confidence: Number
    },
    text: {
      emotion: String,
      confidence: Number
    }
  },
  sourcesUsed: {
    type: Number,
    default: 0
  },
  insight: String,
  recommendation: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('EmotionFusion', emotionFusionSchema)