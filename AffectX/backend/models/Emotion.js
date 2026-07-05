
const mongoose = require('mongoose')

const emotionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted'],
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['face', 'voice', 'text'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('Emotion', emotionSchema)