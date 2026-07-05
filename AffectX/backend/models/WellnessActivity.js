
const mongoose = require('mongoose')

const wellnessActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityId: {
    type: Number,
    required: true
  },
  activityTitle: {
    type: String,
    required: true
  },
  emotion: {
    type: String,
    enum: ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted'],
    required: true
  },
  status: {
    type: String,
    enum: ['started', 'completed', 'skipped'],
    default: 'started'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  feedback: String,
  duration: String,
  category: String,
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
})

module.exports = mongoose.model('WellnessActivity', wellnessActivitySchema)