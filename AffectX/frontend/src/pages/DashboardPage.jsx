import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/config'
import Chatbot from '../components/Chatbot'
import '../styles/dashboard.css'

function DashboardPage() {
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isChatbotOpen, setIsChatbotOpen] = useState(false)
  const [userEmotion, setUserEmotion] = useState('neutral')
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [profileRes, statsRes] = await Promise.all([
        apiClient.get('/auth/profile'),
        apiClient.get('/emotions/stats?days=30')
      ])
      setUser(profileRes.data)
      setStats(statsRes.data)
      // Get most recent emotion for chatbot
      if (statsRes.data?.emotionCounts) {
        const emotion = Object.entries(statsRes.data.emotionCounts)
          .reduce((prev, current) => current[1] > prev[1] ? current : prev, ['neutral', 0])[0]
        setUserEmotion(emotion)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    navigate('/login')
  }

  return (
    <div className="dashboard-container">
<nav className="navbar">
  <div className="navbar-content">
    <h1
      style={{ cursor: 'pointer' }}
      onClick={() => navigate('/dashboard')}
      className="navbar-logo"
    >
      🧠 AffectX
    </h1>
    <div className="nav-links">
      <Link to="/profile">Profile</Link>
      <Link to="/settings">Settings</Link>
      <button
        type="button"
        onClick={handleLogout}
        className="btn-logout"
      >
        Logout
      </button>
    </div>
  </div>
</nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-text">
            <h2>Welcome back, {user?.name || 'User'}! 👋</h2>
            <p className="subtitle">Your Emotion Intelligence Platform</p>
          </div>
          <Link to="/settings" className="settings-link">⚙️ Settings</Link>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading your dashboard...</div>
        ) : (
          <>
            {stats && (
              <div className="stats-container">
                <div className="stat-card">
                  <div className="stat-number">{stats.totalRecordings || 0}</div>
                  <div className="stat-label">Total Recordings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{Math.round(parseFloat(stats.avgOverallConfidence || 0))}%</div>
                  <div className="stat-label">Avg Confidence</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.typeCounts?.face || 0}</div>
                  <div className="stat-label">Face Readings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.typeCounts?.voice || 0}</div>
                  <div className="stat-label">Voice Recordings</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.typeCounts?.text || 0}</div>
                  <div className="stat-label">Text Analysis</div>
                </div>
              </div>
            )}

            <div className="modules-section">
              <h3 className="section-title">Analysis Modules</h3>
              <div className="module-grid">
                <Link to="/face-detection" className="module-card-link">
                  <div className="module-card face-module">
                    <div className="module-icon">👁️</div>
                    <h4>Face Detection</h4>
                    <p>Analyze emotions from facial expressions</p>
                    <div className="module-arrow">→</div>
                  </div>
                </Link>

                <Link to="/voice-analysis" className="module-card-link">
                  <div className="module-card voice-module">
                    <div className="module-icon">🎤</div>
                    <h4>Voice Analysis</h4>
                    <p>Detect emotions from your voice</p>
                    <div className="module-arrow">→</div>
                  </div>
                </Link>

                <Link to="/text-analysis" className="module-card-link">
                  <div className="module-card text-module">
                    <div className="module-icon">📝</div>
                    <h4>Text Analysis</h4>
                    <p>Analyze sentiment and emotions in text</p>
                    <div className="module-arrow">→</div>
                  </div>
                </Link>

                <Link to="/emotion-fusion" className="module-card-link">
                  <div className="module-card fusion-card">
                    <div className="module-icon">🧠</div>
                    <h4>Emotion Fusion</h4>
                    <p>Combine all emotions for unified analysis</p>
                    <div className="module-arrow">→</div>
                  </div>
                </Link>

                <Link to="/emotion-timeline" className="module-card-link">
                  <div className="module-card timeline-module">
                    <div className="module-icon">📈</div>
                    <h4>Analytics</h4>
                    <p>View your emotion trends and insights</p>
                    <div className="module-arrow">→</div>
                  </div>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Chatbot Button */}
      {!isChatbotOpen && (
        <button
          className="chatbot-fab"
          onClick={() => setIsChatbotOpen(true)}
          title="Open Emotional Support Chat"
        >
          💬
        </button>
      )}

      {/* Chatbot Component */}
      <Chatbot
        isOpen={isChatbotOpen}
        userEmotion={userEmotion}
        onClose={() => setIsChatbotOpen(false)}
      />
    </div>
  )
}

export default DashboardPage
