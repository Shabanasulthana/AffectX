import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/config'
import '../styles/voice-analysis.css'

function VoiceAnalysisPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [emotion, setEmotion] = useState(null)
  const [confidence, setConfidence] = useState(0)
  const [recordedVoiceEmotions, setRecordedVoiceEmotions] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isMicrophoneAvailable, setIsMicrophoneAvailable] = useState(true)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const navigate = useNavigate()

  // Fetch voice recording history and check microphone availability on mount
  useEffect(() => {
    fetchVoiceHistory()
    checkMicrophonePermission()
  }, [])

  // Check if microphone permission is available
  const checkMicrophonePermission = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsMicrophoneAvailable(false)
        return
      }

      const permission = await navigator.permissions.query({ name: 'microphone' })
      setIsMicrophoneAvailable(permission.state !== 'denied')
    } catch (err) {
      // If permissions API not available, assume available
      console.log('Permissions API not available')
    }
  }

  const fetchVoiceHistory = async () => {
    try {
      const response = await apiClient.get('/emotions/history?type=voice&limit=10')
      if (response.data && Array.isArray(response.data)) {
        setRecordedVoiceEmotions(response.data.map(item => ({
          emotion: item.emotion,
          confidence: item.confidence,
          timestamp: new Date(item.timestamp)
        })))
      }
    } catch (err) {
      console.error('Failed to fetch voice history:', err)
    }
  }

  // Initialize audio context for visualization
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop()
      }
    }
  }, [isRecording])

  // Start recording
  const startRecording = async () => {
    try {
      // Request microphone with better constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)

      audioChunksRef.current = []
      mediaRecorderRef.current = new MediaRecorder(stream)

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' })
        setAudioBlob(blob)
      }

      mediaRecorderRef.current.start()

      // Setup audio visualization (non-critical, handle errors gracefully)
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext
        if (AudioContext) {
          audioContextRef.current = new AudioContext()
          analyserRef.current = audioContextRef.current.createAnalyser()

          if (audioContextRef.current.createMediaStreamAudioSource) {
            const sourceNode = audioContextRef.current.createMediaStreamAudioSource(stream)
            sourceNode.connect(analyserRef.current)
            analyserRef.current.fftSize = 256
          }
        }
      } catch (audioErr) {
        console.warn('Audio visualization not available:', audioErr.message)
        // Continue recording even if visualization fails
      }

      setIsRecording(true)
      if (analyserRef.current) {
        visualizeAudio()
      }
    } catch (err) {
      console.error('Microphone error details:', err.name, err.message)

      if (err.name === 'NotAllowedError') {
        alert('Microphone permission denied. Please enable microphone access in your browser settings and try again.')
      } else if (err.name === 'NotFoundError') {
        alert('No microphone found. Please ensure your device has a microphone.')
      } else if (err.name === 'NotReadableError') {
        alert('Microphone is already in use by another application. Please close other apps using the microphone.')
      } else {
        alert(`Unable to access microphone: ${err.message}`)
      }
    }
  }

  // Visualize audio waveform
  const visualizeAudio = () => {
    const canvas = canvasRef.current
    if (!canvas || !analyserRef.current) return

    const ctx = canvas.getContext('2d')
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      if (!analyserRef.current) return

      try {
        analyserRef.current.getByteFrequencyData(dataArray)

        ctx.fillStyle = '#f5f5f5'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.strokeStyle = '#667eea'
        ctx.lineWidth = 2
        ctx.beginPath()

        const sliceWidth = canvas.width / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0
          const y = (v * canvas.height) / 2

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          x += sliceWidth
        }

        ctx.lineTo(canvas.width, canvas.height / 2)
        ctx.stroke()
      } catch (err) {
        console.warn('Visualization error:', err.message)
      }

      if (isRecording) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    draw()
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }

  // Analyze voice emotion
  const analyzeVoice = async () => {
    if (!audioBlob) {
      alert('Please record audio first')
      return
    }

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('audio', audioBlob, 'audio.wav')

    try {
      console.log('Sending voice analysis request...')
      const response = await apiClient.post('/voice/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      console.log('Analysis response:', response.data)

      if (response.data && response.data.emotion) {
        setEmotion(response.data.emotion)
        setConfidence(response.data.confidence || 0.5)

        // Save to database
        try {
          await apiClient.post('/emotions/save', {
            emotion: response.data.emotion,
            confidence: response.data.confidence || 0.5,
            type: 'voice',
            timestamp: new Date()
          })

          // Refresh history from database
          await fetchVoiceHistory()
        } catch (saveErr) {
          console.error('Error saving emotion:', saveErr)
        }

        alert('Voice emotion analyzed and saved!')
      } else {
        console.error('Invalid response format:', response.data)
        alert('Invalid response from server. Please try again.')
      }
    } catch (err) {
      console.error('Analysis error:', err.response?.data || err.message)
      alert(`Voice analysis failed: ${err.response?.data?.message || err.message}. Ensure the backend and AI service are running.`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Save emotion manually
  const saveEmotion = async () => {
    if (!emotion) {
      alert('No emotion to save. Analyze voice first.')
      return
    }

    setIsSaving(true)
    try {
      await apiClient.post('/emotions/save', {
        emotion,
        confidence,
        type: 'voice',
        timestamp: new Date()
      })

      await fetchVoiceHistory()
      alert('Emotion saved successfully!')
    } catch (err) {
      console.error('Error saving emotion:', err)
      alert('Failed to save emotion. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset recording
  const resetRecording = () => {
    setAudioBlob(null)
    setEmotion(null)
    setConfidence(0)
    audioChunksRef.current = []

    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#f5f5f5'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }

  return (
    <div className="voice-analysis-container">
      <div className="voice-content">
        <h2>Voice Emotion Analysis</h2>
        <p className="subtitle">Record and analyze emotions from your voice</p>

        <div className="voice-panel">
          <div className="recording-section">
            <div className="canvas-wrapper">
              <canvas
                ref={canvasRef}
                className="waveform-canvas"
                width={400}
                height={150}
              />
            </div>

            <div className="recording-info">
              <p className="recording-status">
                {isRecording ? '🔴 Recording...' : '⭕ Ready'}
              </p>
              {!isMicrophoneAvailable && (
                <p className="microphone-warning">
                  ⚠️ Microphone permission denied. Please enable in browser settings.
                </p>
              )}
            </div>

            <div className="button-group">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="btn-primary"
                  disabled={!isMicrophoneAvailable}
                  title={!isMicrophoneAvailable ? 'Microphone access is denied. Enable in browser settings.' : ''}
                >
                  Start Recording
                </button>
              ) : (
                <button onClick={stopRecording} className="btn-danger">
                  Stop Recording
                </button>
              )}

              {audioBlob && (
                <>
                  <button
                    onClick={analyzeVoice}
                    className="btn-analyze"
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Voice'}
                  </button>
                  <button onClick={resetRecording} className="btn-reset">
                    Clear Recording
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="voice-results">
            <div className="emotion-display">
              <h3>Voice Emotion Result</h3>
              {emotion ? (
                <>
                  <div className={`emotion-badge-voice ${emotion}`}>
                    {emotion.toUpperCase()}
                  </div>
                  <p className="confidence">Confidence: {(confidence * 100).toFixed(1)}%</p>
                  <button
                    onClick={saveEmotion}
                    className="btn-save-emotion"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : '💾 Save Emotion'}
                  </button>
                </>
              ) : (
                <p className="empty-state">Analyze voice to see emotion</p>
              )}
            </div>

            <div className="voice-history">
              <h3>Recent Voice Recordings</h3>
              {recordedVoiceEmotions.length === 0 ? (
                <p className="empty-state">No recordings analyzed yet</p>
              ) : (
                <ul className="history-list">
                  {recordedVoiceEmotions.slice(-5).map((item, idx) => (
                    <li key={idx}>
                      <span>{item.emotion}</span>
                      <span className="confidence-small">
                        {(item.confidence * 100).toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceAnalysisPage
