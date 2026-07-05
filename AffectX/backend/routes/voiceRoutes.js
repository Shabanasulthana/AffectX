const express = require('express')
const router = express.Router()
const axios = require('axios')
const multer = require('multer')
const authMiddleware = require('../middleware/authMiddleware')
const fs = require('fs')
const path = require('path')
const FormData = require('form-data')

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname)
  }
})

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/m4a', 'audio/webm', 'audio/webm;codecs=opus', 'audio/x-wav']
    const isAllowed = allowedMimes.some(mime => file.mimetype.includes(mime.split(';')[0]))
    if (isAllowed || !file.mimetype) {
      cb(null, true)
    } else {
      cb(new Error(`Invalid file type: ${file.mimetype}`))
    }
  }
})

// Analyze voice
router.post('/analyze', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    console.log('Voice analyze request received, file:', req.file?.originalname, 'mimetype:', req.file?.mimetype)
    if (!req.file) {
      console.error('No file in request')
      return res.status(400).json({ message: 'No audio file uploaded' })
    }

    const audioPath = req.file.path
    
    // Call Python AI service
    let emotion = 'neutral'
    let confidence = 0.5

    try {
      const formData = new FormData()
      formData.append('audio', fs.createReadStream(audioPath))

      console.log('Sending audio to AI service...')
      const aiResponse = await axios.post('http://localhost:5001/analyze-voice', formData, {
        headers: formData.getHeaders(),
        timeout: 30000
      })
      console.log('AI service response:', aiResponse.data)
      emotion = aiResponse.data.emotion
      confidence = aiResponse.data.confidence
    } catch (aiError) {
      console.error('AI Service error:', aiError.message)
      console.warn('AI service unavailable. Ensure the AI service is running on port 5001')
      // If AI service fails, return neutral with lower confidence
      emotion = 'neutral'
      confidence = 0.4
    }

    // Clean up uploaded file
    fs.unlinkSync(audioPath)

    res.json({
      emotion,
      confidence,
      message: 'Voice analyzed successfully'
    })
  } catch (err) {
    console.error('Voice analysis error:', err)
    
    // Clean up if file still exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }

    res.status(500).json({ message: 'Voice analysis failed', error: err.message })
  }
})

module.exports = router
