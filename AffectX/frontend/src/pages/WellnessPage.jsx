import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/config'
import '../styles/wellness.css'

function WellnessPage() {
  const [wellnessPlan, setWellnessPlan] = useState(null)
  const [activities, setActivities] = useState({})
  const [activityHistory, setActivityHistory] = useState([])
  const [wellnessStats, setWellnessStats] = useState(null)
  const [selectedEmotion, setSelectedEmotion] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [activeTab, setActiveTab] = useState('plan')
  const [rating, setRating] = useState(0)
  const [feedback, setFeedback] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchWellnessData()
  }, [])

  const fetchWellnessData = async () => {
    try {
      const [planRes, activitiesRes, historyRes, statsRes, categoriesRes] = await Promise.all([
        apiClient.get('/wellness/plan'),
        apiClient.get('/wellness/activities'),
        apiClient.get('/wellness/history'),
        apiClient.get('/wellness/stats'),
        apiClient.get('/wellness/categories')
      ])

      setWellnessPlan(planRes.data)
      setActivities(activitiesRes.data)
      setActivityHistory(historyRes.data)
      setWellnessStats(statsRes.data)
      setCategories(categoriesRes.data)
    } catch (err) {
      console.error('Failed to fetch wellness data:', err)
    }
  }

  const startActivity = async (activity, emotion) => {
    try {
      await apiClient.post('/wellness/activity/start', {
        activityId: activity.id,
        activityTitle: activity.title,
        emotion,
        duration: activity.duration,
        category: activity.category
      })
      setSelectedActivity(activity)
      alert('Activity started! Begin your wellness activity.')
    } catch (err) {
      alert('Failed to start activity')
      console.error('Error:', err)
    }
  }

  const completeActivity = async () => {
    if (rating === 0) {
      alert('Please rate the activity')
      return
    }

    try {
      await apiClient.put(`/wellness/activity/${selectedActivity._id}/complete`, {
        rating,
        feedback
      })
      alert('Activity completed! Great job on your wellness journey.')
      setSelectedActivity(null)
      setRating(0)
      setFeedback('')
      fetchWellnessData()
    } catch (err) {
      alert('Failed to complete activity')
      console.error('Error:', err)
    }
  }

  const emotions = ['happy', 'sad', 'angry', 'surprised', 'neutral', 'fearful', 'disgusted']

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      happy: '😊',
      sad: '😢',
      angry: '😠',
      surprised: '😲',
      neutral: '😐',
      fearful: '😨',
      disgusted: '🤢'
    }
    return emojis[emotion] || '😐'
  }

  const filteredActivities = (emotion) => {
    if (!activities[emotion]) return []
    if (selectedCategory === 'all') {
      return activities[emotion]
    }
    return activities[emotion].filter(a => a.category === selectedCategory)
  }

  return (
    <div className="wellness-container">
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

      <div className="wellness-content">
        <h2>Wellness Recommendations & Activities</h2>
        <p className="subtitle">Personalized wellness plan based on your emotional state</p>

        {/* Tab Navigation */}
        <div className="tab-navigation">
          <button
            className={`tab-btn ${activeTab === 'plan' ? 'active' : ''}`}
            onClick={() => setActiveTab('plan')}
          >
            📋 Wellness Plan
          </button>
          <button
            className={`tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            🎯 Activities
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📊 History
          </button>
          <button
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📈 Statistics
          </button>
        </div>

        {/* Wellness Plan Tab */}
        {activeTab === 'plan' && wellnessPlan && (
          <div className="tab-content">
            <div className="plan-header">
              <h3>Your Personalized Wellness Plan</h3>
              <p className="plan-message">{wellnessPlan.message}</p>
            </div>

            <div className="emotion-focus">
              <h4>Dominant Emotion</h4>
              <div className={`emotion-badge-wellness ${wellnessPlan.dominantEmotion}`}>
                <span className="emoji">{getEmotionEmoji(wellnessPlan.dominantEmotion)}</span>
                <span className="emotion-name">{wellnessPlan.dominantEmotion}</span>
              </div>
            </div>

            <div className="recommendations-section">
              <h4>Recommended Activities</h4>
              <div className="recommendations-grid">
                {wellnessPlan.recommendations.map((activity) => (
                  <div key={activity.id} className="recommendation-card">
                    <h5>{activity.title}</h5>
                    <p className="description">{activity.description}</p>
                    <div className="activity-meta">
                      <span className="duration">⏱️ {activity.duration}</span>
                      <span className={`difficulty ${activity.difficulty}`}>
                        {activity.difficulty}
                      </span>
                    </div>
                    <button
                      onClick={() => startActivity(activity, wellnessPlan.dominantEmotion)}
                      className="btn-start-activity"
                    >
                      Start Activity
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="tips-section">
              <h4>💡 Wellness Tips</h4>
              <div className="tips-list">
                {wellnessPlan.tips.map((tip, idx) => (
                  <div key={idx} className="tip-item">
                    <span className="tip-icon">✓</span>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activities Tab */}
        {activeTab === 'activities' && (
          <div className="tab-content">
            <div className="activities-header">
              <h3>Browse All Activities</h3>
              
              <div className="filter-section">
                <label>Filter by Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="category-select"
                >
                  <option value="all">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="emotions-grid">
              {emotions.map((emotion) => (
                <div key={emotion} className={`emotion-section ${emotion}`}>
                  <h4>
                    <span className="emotion-emoji">{getEmotionEmoji(emotion)}</span>
                    {emotion.charAt(0).toUpperCase() + emotion.slice(1)} Activities
                  </h4>

                  <div className="activities-list">
                    {filteredActivities(emotion).map((activity) => (
                      <div key={activity.id} className="activity-card">
                        <h5>{activity.title}</h5>
                        <p>{activity.description}</p>
                        <div className="activity-footer">
                          <span className="duration">⏱️ {activity.duration}</span>
                          <button
                            onClick={() => startActivity(activity, emotion)}
                            className="btn-start-small"
                          >
                            Start
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="tab-content">
            <h3>Activity History</h3>
            {activityHistory.length === 0 ? (
              <p className="empty-message">No activities started yet</p>
            ) : (
              <div className="history-table">
                <div className="table-header">
                  <span>Activity</span>
                  <span>Emotion</span>
                  <span>Status</span>
                  <span>Rating</span>
                  <span>Date</span>
                </div>
                {activityHistory.slice(0, 20).map((activity) => (
                  <div key={activity._id} className="table-row">
                    <span className="activity-name">{activity.activityTitle}</span>
                    <span className={`emotion-pill ${activity.emotion}`}>
                      {activity.emotion}
                    </span>
                    <span className={`status ${activity.status}`}>{activity.status}</span>
                    <span className="rating">
                      {activity.rating ? '⭐ ' + activity.rating : '-'}
                    </span>
                    <span className="date">
                      {new Date(activity.startedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && wellnessStats && (
          <div className="tab-content">
            <h3>Your Wellness Statistics</h3>

            <div className="stats-cards">
              <div className="stat-card">
                <h4>Total Activities</h4>
                <p className="stat-number">{wellnessStats.totalActivities}</p>
              </div>
              <div className="stat-card">
                <h4>Completed</h4>
                <p className="stat-number">{wellnessStats.completed}</p>
              </div>
              <div className="stat-card">
                <h4>Completion Rate</h4>
                <p className="stat-number">{wellnessStats.completionRate}%</p>
              </div>
              <div className="stat-card">
                <h4>Avg Rating</h4>
                <p className="stat-number">⭐ {wellnessStats.avgRating}</p>
              </div>
            </div>

            <div className="category-stats">
              <h4>Activities by Category</h4>
              <div className="category-grid">
                {Object.entries(wellnessStats.categoryStats).map(([category, count]) => (
                  <div key={category} className="category-stat">
                    <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                    <p className="count">{count} completed</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WellnessPage
