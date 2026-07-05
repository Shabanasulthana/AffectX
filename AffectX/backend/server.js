const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config()

const app = express()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ limit: '50mb' }))
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000', 'http://localhost:5174'],
  credentials: true
}))

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message)
    process.exit(1)
  })

// Routes
app.use('/auth', require('./routes/authRoutes'))
app.use('/emotions', require('./routes/emotionRoutes'))
app.use('/voice', require('./routes/voiceRoutes'))
app.use('/text', require('./routes/textRoutes'))
app.use('/fusion', require('./routes/fusionRoutes'))
app.use('/wellness', require('./routes/wellnessRoutes'))

// Start Server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})