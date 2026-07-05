import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/config'
import '../styles/emotion-fusion.css'

function EmotionFusionPage() {
  const [recentEmotions, setRecentEmotions] = useState({ face: [], voice: [], text: [] })
  const [selectedEmotions, setSelectedEmotions] = useState({
    faceEmotionId: null,
    voiceEmotionId: null,
    textEmotionId: null
  })
  const [fusionResult, setFusionResult] = useState(null)
  const [fusionHistory, setFusionHistory] = useState([])
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchRecentEmotions()
    fetchFusionHistory()
    fetchStats()
  }, [])

  const fetchRecentEmotions = async () => {
    try {
      const response = await apiClient.get('/fusion/recent')
      setRecentEmotions(response.data)
    } catch (err) {
      console.error('Failed to fetch recent emotions:', err)
    }
  }

  const fetchFusionHistory = async () => {
    try {
      const response = await apiClient.get('/fusion/history')
      setFusionHistory(response.data)
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/fusion/stats')
      setStats(response.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  const handleEmotionSelect = (type, emotionId) => {
    setSelectedEmotions({
      ...selectedEmotions,
      [type]: emotionId
    })
  }

  const fuseEmotions = async () => {
    const selectedCount = [
      selectedEmotions.faceEmotionId,
      selectedEmotions.voiceEmotionId,
      selectedEmotions.textEmotionId
    ].filter(id => id).length

    if (selectedCount === 0) {
      alert('Please select at least one emotion source')
      return
    }

    setIsLoading(true)

    try {
      const response = await apiClient.post('/fusion/fuse', selectedEmotions)

      setFusionResult(response.data)
      fetchFusionHistory()
      fetchStats()
      alert('Emotions fused successfully!')
    } catch (err) {
      alert('Fusion failed')
      console.error('Fusion error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const clearSelection = () => {
    setSelectedEmotions({
      faceEmotionId: null,
      voiceEmotionId: null,
      textEmotionId: null
    })
    setFusionResult(null)
  }

  return (
    <div className="emotion-fusion-container">
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

      <div className="fusion-content">
        <h2>Emotion Fusion Engine</h2>
        <p className="subtitle">Combine Face, Voice & Text emotions for a unified analysis</p>

        <div className="fusion-grid">
          {/* Selection Panel */}
          <div className="selection-panel">
            <h3>Select Emotions to Fuse</h3>

            {/* Face Emotions */}
            <div className="emotion-group">
              <h4>👁️ Face Detection</h4>
              {recentEmotions.face.length === 0 ? (
                <p className="empty-group">No face detections yet</p>
              ) : (
                <div className="emotion-options">
                  {recentEmotions.face.map((emotion) => (
                    <button
                      key={emotion._id}
                      className={`emotion-btn ${selectedEmotions.faceEmotionId === emotion._id ? 'selected' : ''}`}
                      onClick={() => handleEmotionSelect('faceEmotionId', emotion._id)}
                    >
                      <span className="emotion-label">{emotion.emotion}</span>
                      <span className="emotion-conf">{(emotion.confidence * 100).toFixed(0)}%</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voice Emotions */}
            <div className="emotion-group">
              <h4>🎤 Voice Analysis</h4>
              {recentEmotions.voice.length === 0 ? (
                <p className="empty-group">No voice analyses yet</p>
              ) : (
                <div className="emotion-options">
                  {recentEmotions.voice.map((emotion) => (
                    <button
                      key={emotion._id}
                      className={`emotion-btn ${selectedEmotions.voiceEmotionId === emotion._id ? 'selected' : ''}`}
                      onClick={() => handleEmotionSelect('voiceEmotionId', emotion._id)}
                    >
                      <span className="emotion-label">{emotion.emotion}</span>
                      <span className="emotion-conf">{(emotion.confidence * 100).toFixed(0)}%</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Text Emotions */}
            <div className="emotion-group">
              <h4>📝 Text Analysis</h4>
              {recentEmotions.text.length === 0 ? (
                <p className="empty-group">No text analyses yet</p>
              ) : (
                <div className="emotion-options">
                  {recentEmotions.text.map((emotion) => (
                    <button
                      key={emotion._id}
                      className={`emotion-btn ${selectedEmotions.textEmotionId === emotion._id ? 'selected' : ''}`}
                      onClick={() => handleEmotionSelect('textEmotionId', emotion._id)}
                    >
                      <span className="emotion-label">{emotion.emotion}</span>
                      <span className="emotion-conf">{(emotion.confidence * 100).toFixed(0)}%</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="button-group">
              <button onClick={fuseEmotions} className="btn-fuse" disabled={isLoading}>
                {isLoading ? 'Fusing...' : '⚡ Fuse Emotions'}
              </button>
              <button onClick={clearSelection} className="btn-clear">
                Clear Selection
              </button>
            </div>
          </div>

          {/* Results Panel */}
          <div className="results-panel">
            {fusionResult ? (
              <>
                <h3>Fused Emotion Result</h3>

                <div className={`fused-emotion-card ${fusionResult.fusedEmotion}`}>
                  <div className="fused-emotion-display">
                    <h1>{fusionResult.fusedEmotion.toUpperCase()}</h1>
                    <p className="confidence">Confidence: {(fusionResult.fusedConfidence * 100).toFixed(1)}%</p>
                  </div>

                  <div className="emotion-sources">
                    <h4>Sources Used: {fusionResult.sourcesUsed}</h4>
                    {fusionResult.details.map((detail, idx) => (
                      <div key={idx} className="source-detail">
                        <span className="source-type">{detail.type}</span>
                        <span className="source-emotion">{detail.emotion}</span>
                        <span className="source-weight">{detail.weight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="emotion-breakdown">
                  <h4>All Emotion Scores</h4>
                  <div className="score-bars">
                    {Object.entries(fusionResult.emotionScores).map(([emotion, score]) => (
                      <div key={emotion} className="score-item">
                        <label>{emotion}</label>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{ width: `${score * 100}%` }}
                          ></div>
                        </div>
                        <span className="score-value">{(score * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="insight-box">
                  <h4>💡 Insight</h4>
                  <p>{fusionResult.insight}</p>
                  <p className="confidence-level">Confidence Level: <strong>{fusionResult.confidenceLevel}</strong></p>
                </div>

                <div className="recommendation-box">
                  <h4>🎯 Recommendation</h4>
                  <p>{fusionResult.recommendation}</p>
                </div>
              </>
            ) : (
              <div className="empty-results">
                <p>Select emotions and click "Fuse Emotions" to see results</p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Panel */}
        {stats && (
          <div className="stats-panel">
            <h3>Fusion Statistics</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Fusions</h4>
                <p className="stat-number">{stats.totalFusions}</p>
              </div>
              <div className="stat-card">
                <h4>Avg Confidence</h4>
                <p className="stat-number">{(stats.averageOverallConfidence * 100).toFixed(0)}%</p>
              </div>
              <div className="stat-card">
                <h4>Most Common</h4>
                <p className="stat-number">
                  {Object.entries(stats.emotionCounts).reduce((prev, current) =>
                    current[1] > prev[1] ? current : prev
                  )[0]}
                </p>
              </div>
            </div>

            <h4 style={{ marginTop: '30px' }}>Emotion Distribution</h4>
            <div className="distribution-grid">
              {Object.entries(stats.emotionCounts).map(([emotion, count]) => (
                <div key={emotion} className="distribution-item">
                  <span className="emotion-name">{emotion}</span>
                  <div className="distribution-bar">
                    <div className="bar-count" style={{
                      width: `${(count / stats.totalFusions * 100) || 0}%`,
                      backgroundColor: `var(--emotion-${emotion})`
                    }}></div>
                  </div>
                  <span className="emotion-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Panel */}
        <div className="history-panel">
          <h3>Recent Fusions</h3>
          {fusionHistory.length === 0 ? (
            <p className="empty-state">No fusions yet</p>
          ) : (
            <div className="history-list">
              {fusionHistory.slice(0, 10).map((fusion, idx) => (
                <div key={idx} className="history-item">
                  <span className={`history-emotion ${fusion.fusedEmotion}`}>
                    {fusion.fusedEmotion}
                  </span>
                  <span className="history-confidence">{(fusion.fusedConfidence * 100).toFixed(0)}%</span>
                  <span className="history-sources">{fusion.sourcesUsed} sources</span>
                  <span className="history-date">
                    {new Date(fusion.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default EmotionFusionPage
