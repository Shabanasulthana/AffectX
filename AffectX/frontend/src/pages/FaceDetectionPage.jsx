import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/config'
import * as faceapi from 'face-api.js'
import '../styles/face-detection.css'

function FaceDetectionPage() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [isDetecting, setIsDetecting] = useState(false)
  const [emotion, setEmotion] = useState('neutral')
  const [confidence, setConfidence] = useState(0)
  const [isModelLoaded, setIsModelLoaded] = useState(false)
  const [recordedEmotions, setRecordedEmotions] = useState([])
  const [allExpressions, setAllExpressions] = useState({})
  const [capturedEmotion, setCapturedEmotion] = useState(null)
  const [capturedConfidence, setCapturedConfidence] = useState(0)
  const navigate = useNavigate()

  // Initialize face-api models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/'
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ])
        
        console.log('Face detection models loaded successfully')
        setIsModelLoaded(true)
      } catch (err) {
        console.error('Failed to load models:', err)
      }
    }
    
    loadModels()
  }, [])

  // Start webcam
  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      })
      videoRef.current.srcObject = stream
      setIsDetecting(true)
    } catch (err) {
      alert('Camera access denied')
    }
  }

  // Detect face expressions in real-time
  const detectFaceEmotion = async () => {
    if (!videoRef.current || videoRef.current.readyState !== 4 || !isModelLoaded) {
      if (isDetecting) {
        requestAnimationFrame(detectFaceEmotion)
      }
      return
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()

      // Draw detections
      const canvas = canvasRef.current
      const displaySize = {
        width: videoRef.current.width,
        height: videoRef.current.height
      }
      
      faceapi.matchDimensions(canvas, displaySize)
      const resizedDetections = faceapi.resizeResults(detections, displaySize)

      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw boxes and landmarks
      resizedDetections.forEach(detection => {
        const box = detection.detection.box
        ctx.strokeStyle = '#00ff00'
        ctx.lineWidth = 2
        ctx.strokeRect(box.x, box.y, box.width, box.height)
      })

      // Get emotion from expressions with better thresholding
      if (detections.length > 0) {
        const expressions = detections[0].expressions
        setAllExpressions(expressions)

        // Map face-api emotions to our emotion list
        const emotionMap = {
          happy: expressions.happy || 0,
          sad: expressions.sad || 0,
          angry: expressions.angry || 0,
          surprised: expressions.surprised || 0,
          fearful: expressions.fearful || 0,
          disgusted: expressions.disgusted || 0,
          neutral: expressions.neutral || 0
        }

        // Find dominant emotion - simply use the highest value
        let dominantEmotion = 'neutral'
        let dominantValue = emotionMap.neutral

        // Find the emotion with the highest probability
        for (const [emotion, value] of Object.entries(emotionMap)) {
          if (value > dominantValue) {
            dominantValue = value
            dominantEmotion = emotion
          }
        }

        // Only default to neutral if it's genuinely the highest
        // Don't artificially suppress other emotions
        setEmotion(dominantEmotion)
        setConfidence(parseFloat((dominantValue * 100).toFixed(1)))

        // Log for debugging
        console.log('All Expressions:', emotionMap, 'Dominant:', dominantEmotion, dominantValue)
      } else {
        setEmotion('no-face')
        setConfidence(0)
        setAllExpressions({})
      }
    } catch (err) {
      console.error('Detection error:', err)
    }

    if (isDetecting) {
      requestAnimationFrame(detectFaceEmotion)
    }
  }

  // Handle video play
  const handleVideoPlay = () => {
    if (isModelLoaded) {
      console.log('Starting real-time face detection')
      detectFaceEmotion()
    }
  }

  // Stop detection and capture current emotion
  const stopDetection = () => {
    setIsDetecting(false)
    // Capture the current emotion before stopping
    setCapturedEmotion(emotion)
    setCapturedConfidence(confidence)
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop())
    }
  }

  // Save emotion to history
  const saveEmotion = async () => {
    const emotionToSave = capturedEmotion || emotion
    const confidenceToSave = capturedConfidence || confidence

    if (emotionToSave === 'no-face') {
      alert('No face detected')
      return
    }

    try {
      await apiClient.post('/emotions/save', {
        emotion: emotionToSave,
        confidence: confidenceToSave,
        type: 'face',
        timestamp: new Date()
      })

      setRecordedEmotions([...recordedEmotions, { emotion: emotionToSave, confidence: confidenceToSave, timestamp: new Date() }])
      setCapturedEmotion(null)
      setCapturedConfidence(0)
      alert('Emotion saved successfully!')
    } catch (err) {
      console.error('Failed to save emotion:', err)
    }
  }

  return (
    <div className="face-detection-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1>AffectX AI</h1>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <button onClick={() => {
              localStorage.removeItem('token')
              navigate('/login')
            }} className="btn-logout">Logout</button>
          </div>
        </div>
      </nav>

      <div className="detection-content">
        <h2>Face Emotion Detection</h2>
        <p className="subtitle">Real-time facial emotion analysis</p>

        <div className="detection-panel">
          <div className="video-section">
            <div className="video-wrapper">
              <video
                ref={videoRef}
                autoPlay
                onPlay={handleVideoPlay}
                width="320"
                height="240"
                style={{ display: isDetecting ? 'block' : 'none' }}
              />
              <canvas
                ref={canvasRef}
                width="320"
                height="240"
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
            </div>
            
            <div className="button-group">
              {!isDetecting ? (
                <button onClick={startWebcam} className="btn-primary">
                  {isModelLoaded ? 'Start Webcam' : 'Loading Models...'}
                </button>
              ) : (
                <button onClick={stopDetection} className="btn-secondary">
                  Stop Webcam
                </button>
              )}
            </div>
          </div>

          <div className="result-section">
            <div className="emotion-display">
              <h3>Current Emotion</h3>
              <div className="emotion-box">
                <div className="emotion-text">{emotion.toUpperCase()}</div>
                <div className="confidence-bar">
                  <div
                    className="confidence-fill"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <div className="confidence-text">{confidence}% Confidence</div>
              </div>
            </div>

            {isDetecting && emotion !== 'no-face' && (
              <button onClick={saveEmotion} className="btn-save">
                Save Emotion
              </button>
            )}

            {isDetecting && Object.keys(allExpressions).length > 0 && (
              <div className="expressions-detail">
                <h3>All Emotions</h3>
                <div className="expressions-grid">
                  {Object.entries(allExpressions)
                    .sort(([,a], [,b]) => b - a)
                    .map(([expr, value]) => (
                      <div key={expr} className="expression-item">
                        <span className="expr-name">{expr}</span>
                        <div className="expr-bar">
                          <div
                            className="expr-fill"
                            style={{ width: `${value * 100}%` }}
                          />
                        </div>
                        <span className="expr-value">{(value * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {recordedEmotions.length > 0 && (
              <div className="history">
                <h3>Recent Recordings</h3>
                <ul>
                  {recordedEmotions.slice(-5).reverse().map((record, idx) => (
                    <li key={idx}>
                      {record.emotion} - {record.confidence}% confidence
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {capturedEmotion && !isDetecting && (
              <div className="captured-emotion">
                <h3>Captured Emotion</h3>
                <div className="captured-emotion-box">
                  <div className="captured-emotion-text">{capturedEmotion.toUpperCase()}</div>
                  <div className="captured-confidence-bar">
                    <div
                      className="captured-confidence-fill"
                      style={{ width: `${capturedConfidence}%` }}
                    />
                  </div>
                  <div className="captured-confidence-text">{capturedConfidence}% Confidence</div>
                  <button onClick={saveEmotion} className="btn-save-captured">
                    Save Emotion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FaceDetectionPage
