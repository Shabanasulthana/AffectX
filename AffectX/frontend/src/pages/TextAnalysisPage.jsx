import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/config'
import '../styles/text-analysis.css'

function TextAnalysisPage() {
  const [text, setText] = useState('')
  const [emotion, setEmotion] = useState(null)
  const [confidence, setConfidence] = useState(0)
  const [sentiment, setSentiment] = useState(0)
  const [analysisHistory, setAnalysisHistory] = useState([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [wordCount, setWordCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAnalysisHistory()
  }, [])

  const fetchAnalysisHistory = async () => {
    try {
      const response = await apiClient.get('/text/history')
      setAnalysisHistory(response.data)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
  }

  const handleTextChange = (e) => {
    const inputText = e.target.value
    setText(inputText)
    setWordCount(inputText.trim().length > 0 ? inputText.trim().split(/\s+/).length : 0)
  }

  const analyzeText = async () => {
    if (text.trim().length === 0) {
      alert('Please enter some text to analyze')
      return
    }

    setIsAnalyzing(true)

    try {
      const response = await apiClient.post('/text/analyze', { text })

      setEmotion(response.data.emotion)
      setConfidence(response.data.confidence)
      setSentiment(response.data.sentiment)

      // Refresh history
      fetchAnalysisHistory()

      alert('Text analyzed and saved successfully!')
    } catch (err) {
      alert('Text analysis failed')
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const clearText = () => {
    setText('')
    setEmotion(null)
    setConfidence(0)
    setSentiment(0)
    setWordCount(0)
  }

  const getSentimentLabel = (score) => {
    if (score > 2) return 'Very Positive'
    if (score > 0) return 'Positive'
    if (score === 0) return 'Neutral'
    if (score > -2) return 'Negative'
    return 'Very Negative'
  }

  return (
    <div className="text-analysis-container">
      <nav className="navbar">
        <div className="navbar-content">
          <h1
            style={{ cursor: 'pointer' }}
            onClick={() => navigate('/dashboard')}
          >
            AffectX AI
          </h1>
          <div className="nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('token')
                localStorage.removeItem('userId')
                navigate('/login')
              }}
              className="btn-logout"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="text-content">
        <h2>Text Emotion & Sentiment Analysis</h2>
        <p className="subtitle">Analyze emotions and sentiment from your text</p>

        <div className="text-panel">
          <div className="input-section">
            <div className="text-input-wrapper">
              <label htmlFor="text-input">Enter your text:</label>
              <textarea
                id="text-input"
                className="text-input"
                value={text}
                onChange={handleTextChange}
                placeholder="Type something you're feeling, your thoughts, or any text..."
                rows="8"
              />
              <div className="text-stats">
                <span className="word-count">Words: {wordCount}</span>
                <span className="char-count">Characters: {text.length}</span>
              </div>
            </div>

            <div className="button-group">
              <button
                onClick={analyzeText}
                className="btn-analyze"
                disabled={isAnalyzing || text.trim().length === 0}
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze Text'}
              </button>
              <button onClick={clearText} className="btn-clear">
                Clear
              </button>
            </div>
          </div>

          <div className="results-section">
            <div className="emotion-display">
              <h3>Analysis Results</h3>
              {emotion ? (
                <>
                  <div className={`emotion-badge-text ${emotion}`}>
                    {emotion.toUpperCase()}
                  </div>
                  <div className="result-details">
                    <p className="confidence">
                      <strong>Confidence:</strong> {(confidence * 100).toFixed(1)}%
                    </p>
                    <p className="sentiment-score">
                      <strong>Sentiment:</strong> {getSentimentLabel(sentiment)} ({sentiment})
                    </p>
                  </div>
                </>
              ) : (
                <p className="empty-state">Analyze text to see results</p>
              )}
            </div>

            <div className="analysis-history">
              <h3>Recent Analyses</h3>
              {analysisHistory.length === 0 ? (
                <p className="empty-state">No text analyses yet</p>
              ) : (
                <ul className="history-list">
                  {analysisHistory.slice(0, 5).map((item, idx) => (
                    <li key={idx}>
                      <span className="emotion-label">{item.emotion}</span>
                      <span className="confidence-badge">
                        {(item.confidence * 100).toFixed(0)}%
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="emotion-guide">
          <h3>Emotion Guide</h3>
          <div className="guide-grid">
            <div className="guide-item happy">
              <span className="emotion-icon">😊</span>
              <span>Happy</span>
            </div>
            <div className="guide-item sad">
              <span className="emotion-icon">😢</span>
              <span>Sad</span>
            </div>
            <div className="guide-item angry">
              <span className="emotion-icon">😠</span>
              <span>Angry</span>
            </div>
            <div className="guide-item surprised">
              <span className="emotion-icon">😲</span>
              <span>Surprised</span>
            </div>
            <div className="guide-item neutral">
              <span className="emotion-icon">😐</span>
              <span>Neutral</span>
            </div>
            <div className="guide-item fearful">
              <span className="emotion-icon">😨</span>
              <span>Fearful</span>
            </div>
            <div className="guide-item disgusted">
              <span className="emotion-icon">🤢</span>
              <span>Disgusted</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TextAnalysisPage
