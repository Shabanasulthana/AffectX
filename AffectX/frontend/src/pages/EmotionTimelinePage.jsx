import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/config'
import emotionInsights from '../services/emotionInsights'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
// import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import '../styles/emotion-timeline.css'
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2"
import Chart from 'chart.js/auto'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

function EmotionTimelinePage() {
  const [emotions, setEmotions] = useState([])
  const [stats, setStats] = useState(null)
  const [trendData, setTrendData] = useState(null)
  const [byDate, setByDate] = useState({})
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDays, setSelectedDays] = useState(30)
  const [chartView, setChartView] = useState('timeline')
  const [wellnessScore, setWellnessScore] = useState(0)
  const [patterns, setPatterns] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [insights, setInsights] = useState([])
  const [eiScore, setEIScore] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    fetchData()
  }, [selectedType, selectedDays])

  const fetchData = async () => {
    try {
      const [historyRes, statsRes, trendRes, dateRes] = await Promise.all([
        apiClient.get(`/emotions/history?type=${selectedType}&days=${selectedDays}`),
        apiClient.get(`/emotions/stats?type=${selectedType}&days=${selectedDays}`),
        apiClient.get(`/emotions/trending?days=${Math.min(selectedDays, 7)}`),
        apiClient.get(`/emotions/by-date?type=${selectedType}&days=${selectedDays}`)
      ])

      setEmotions(historyRes.data)
      setStats(statsRes.data)
      setTrendData(trendRes.data)
      setByDate(dateRes.data)

      // Calculate ML-powered insights
      if (statsRes.data && historyRes.data) {
        const wellness = emotionInsights.calculateWellnessScore(
          statsRes.data.emotionCounts,
          parseFloat(statsRes.data.avgOverallConfidence)
        )
        setWellnessScore(wellness)

        const emotionalPatterns = emotionInsights.detectEmotionalPatterns(historyRes.data)
        setPatterns(emotionalPatterns)

        const moodForecast = emotionInsights.forecastMood(trendRes.data)
        setForecast(moodForecast)

        const generatedInsights = emotionInsights.generateInsights(
          statsRes.data,
          emotionalPatterns,
          moodForecast,
          wellness
        )
        setInsights(generatedInsights)

        const ei = emotionInsights.calculateEIScore(
          100, // consistency placeholder
          emotionalPatterns?.emotionalVolatility || 0,
          historyRes.data.length
        )
        setEIScore(ei)
      }
    } catch (err) {
      console.error('Failed to fetch data:', err)
    }
  }

  // Prepare timeline data
  const getTimelineChartData = () => {
    const dates = Object.keys(byDate).sort()
    const emotionCounts = {
      happy: [],
      sad: [],
      angry: [],
      surprised: [],
      neutral: [],
      fearful: [],
      disgusted: []
    }

    dates.forEach(date => {
      const dayEmotions = byDate[date]
      Object.keys(emotionCounts).forEach(emotion => {
        emotionCounts[emotion].push(
          dayEmotions.filter(e => e.emotion === emotion).length
        )
      })
    })

    return {
      labels: dates,
      datasets: [
        {
          label: 'Happy',
          data: emotionCounts.happy,
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          tension: 0.3
        },
        {
          label: 'Sad',
          data: emotionCounts.sad,
          borderColor: '#4facfe',
          backgroundColor: 'rgba(79, 172, 254, 0.1)',
          tension: 0.3
        },
        {
          label: 'Angry',
          data: emotionCounts.angry,
          borderColor: '#fa709a',
          backgroundColor: 'rgba(250, 112, 154, 0.1)',
          tension: 0.3
        },
        {
          label: 'Neutral',
          data: emotionCounts.neutral,
          borderColor: '#a8edea',
          backgroundColor: 'rgba(168, 237, 234, 0.1)',
          tension: 0.3
        },
        {
          label: 'Surprised',
          data: emotionCounts.surprised,
          borderColor: '#30cfd0',
          backgroundColor: 'rgba(48, 207, 208, 0.1)',
          tension: 0.3
        },
        {
          label: 'Fearful',
          data: emotionCounts.fearful,
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.3
        },
        {
          label: 'Disgusted',
          data: emotionCounts.disgusted,
          borderColor: '#f5576c',
          backgroundColor: 'rgba(245, 87, 108, 0.1)',
          tension: 0.3
        }
      ]
    }
  }

  // Prepare distribution data
  const getDistributionChartData = () => {
    return {
      labels: Object.keys(stats.emotionCounts),
      datasets: [
        {
          label: 'Emotion Distribution',
          data: Object.values(stats.emotionCounts),
          backgroundColor: [
            '#f093fb',
            '#4facfe',
            '#fa709a',
            '#30cfd0',
            '#a8edea',
            '#667eea',
            '#f5576c'
          ],
          borderColor: [
            '#f093fb',
            '#4facfe',
            '#fa709a',
            '#30cfd0',
            '#a8edea',
            '#667eea',
            '#f5576c'
          ],
          borderWidth: 2
        }
      ]
    }
  }

  // Prepare source distribution
  const getSourceDistributionData = () => {
    return {
      labels: ['Face', 'Voice', 'Text'],
      datasets: [
        {
          label: 'Analysis Type Distribution',
          data: [stats.typeCounts.face, stats.typeCounts.voice, stats.typeCounts.text],
          backgroundColor: ['#667eea', '#f5576c', '#f093fb'],
          borderColor: ['#667eea', '#f5576c', '#f093fb'],
          borderWidth: 2
        }
      ]
    }
  }

  // Prepare confidence data
  const getConfidenceChartData = () => {
    const emotions = Object.keys(stats.avgConfidence)
    const confidences = Object.values(stats.avgConfidence)

    return {
      labels: emotions,
      datasets: [
        {
          label: 'Average Confidence',
          data: confidences,
          backgroundColor: '#667eea',
          borderColor: '#667eea',
          borderWidth: 2
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  return (
    <div className="emotion-timeline-container">
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

      <div className="timeline-content">
        <h2>Emotion Timeline & Analytics</h2>
        <p className="subtitle">Track your emotional journey over time</p>

        {/* Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Emotion Type:</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">All</option>
              <option value="face">Face Detection</option>
              <option value="voice">Voice Analysis</option>
              <option value="text">Text Analysis</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Time Period:</label>
            <select value={selectedDays} onChange={(e) => setSelectedDays(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Chart View:</label>
            <div className="chart-buttons">
              <button
                className={`chart-btn ${chartView === 'timeline' ? 'active' : ''}`}
                onClick={() => setChartView('timeline')}
              >
                Timeline
              </button>
              <button
                className={`chart-btn ${chartView === 'distribution' ? 'active' : ''}`}
                onClick={() => setChartView('distribution')}
              >
                Distribution
              </button>
              <button
                className={`chart-btn ${chartView === 'confidence' ? 'active' : ''}`}
                onClick={() => setChartView('confidence')}
              >
                Confidence
              </button>
            </div>
          </div>
        </div>

        {/* AI-Powered Wellness Insights */}
        <div className="ai-insights-section">
          <h3>🤖 AI-Powered Emotional Wellness Analysis</h3>

          <div className="wellness-metrics">
            <div className="metric-card wellness-score">
              <div className="metric-icon">💚</div>
              <div className="metric-content">
                <h4>Emotional Wellness Score</h4>
                <div className="score-circle">
                  <span className="score-value">{wellnessScore.toFixed(0)}</span>
                  <span className="score-unit">/100</span>
                </div>
                <p className="score-description">
                  {wellnessScore > 75 ? 'Excellent emotional health' : wellnessScore > 50 ? 'Good emotional balance' : 'Consider self-care activities'}
                </p>
              </div>
            </div>

            <div className="metric-card ei-score">
              <div className="metric-icon">🧠</div>
              <div className="metric-content">
                <h4>Emotional Intelligence</h4>
                <div className="score-circle">
                  <span className="score-value">{eiScore.toFixed(0)}</span>
                  <span className="score-unit">/100</span>
                </div>
                <p className="score-description">
                  {eiScore > 75 ? 'High emotional awareness' : eiScore > 50 ? 'Developing awareness' : 'Focus on self-reflection'}
                </p>
              </div>
            </div>

            <div className="metric-card volatility">
              <div className="metric-icon">📊</div>
              <div className="metric-content">
                <h4>Emotional Stability</h4>
                <div className="stability-bar">
                  <div className="stability-fill" style={{width: `${(1 - (patterns?.emotionalVolatility || 0.5)) * 100}%`}}></div>
                </div>
                <p className="score-description">
                  {patterns?.emotionalVolatility && patterns.emotionalVolatility > 0.7 ? 'High volatility - try grounding exercises' : 'Good emotional stability'}
                </p>
              </div>
            </div>
          </div>

          {insights.length > 0 && (
            <div className="insights-list">
              <h4>📌 Generated Insights</h4>
              {insights.map((insight, idx) => (
                <div key={idx} className={`insight-card ${insight.type}`}>
                  <div className="insight-icon">
                    {insight.type === 'positive' && '✨'}
                    {insight.type === 'warning' && '⚠️'}
                    {insight.type === 'info' && 'ℹ️'}
                  </div>
                  <div className="insight-content">
                    <h5>{insight.title}</h5>
                    <p>{insight.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {forecast && (
            <div className="forecast-section">
              <h4>🔮 Mood Forecast</h4>
              <p className="forecast-trend">
                Overall Mood Trend: <strong>{forecast.overallMoodTrend === 'improving' ? '📈 Improving' : '📉 Declining'}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="stats-section">
            <div className="stat-card">
              <h3>Total Recordings</h3>
              <p className="stat-value">{stats.totalRecordings}</p>
            </div>
            <div className="stat-card">
              <h3>Avg Confidence</h3>
              <p className="stat-value">{(stats.avgOverallConfidence * 100).toFixed(0)}%</p>
            </div>
            <div className="stat-card">
              <h3>Most Frequent</h3>
              <p className="stat-value">
                {Object.entries(stats.emotionCounts).reduce((prev, current) =>
                  current[1] > prev[1] ? current : prev
                )[0]}
              </p>
            </div>
          </div>
        )}

        {/* Charts Section */}
        <div className="charts-section">
          {chartView === 'timeline' && Object.keys(byDate).length > 0 && (
            <div className="chart-container">
              <h3>Emotion Timeline</h3>
              <Line data={getTimelineChartData()} options={chartOptions} />
            </div>
          )}

          {chartView === 'distribution' && stats && (
            <div className="chart-grid">
              <div className="chart-container">
                <h3>Emotion Distribution</h3>
                <Pie data={getDistributionChartData()} options={chartOptions} />
              </div>
              <div className="chart-container">
                <h3>Analysis Type Distribution</h3>
                <Doughnut data={getSourceDistributionData()} options={chartOptions} />
              </div>
            </div>
          )}

          {chartView === 'confidence' && stats && (
            <div className="chart-container">
              <h3>Average Confidence by Emotion</h3>
              <Bar data={getConfidenceChartData()} options={chartOptions} />
            </div>
          )}
        </div>

        {/* Detailed List */}
        <div className="detailed-list-section">
          <h3>Recent Emotions</h3>
          <div className="emotions-table">
            <div className="table-header">
              <span>Date & Time</span>
              <span>Emotion</span>
              <span>Type</span>
              <span>Confidence</span>
            </div>
            {emotions.slice(0, 20).map((emotion) => (
              <div key={emotion._id} className="table-row">
                <span className="date">
                  {new Date(emotion.timestamp).toLocaleString()}
                </span>
                <span className={`emotion ${emotion.emotion}`}>
                  {emotion.emotion}
                </span>
                <span className="type">{emotion.type}</span>
                <span className="confidence">
                  {(emotion.confidence * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trending Section */}
        {trendData && (
          <div className="trending-section">
            <h3>Emotion Trends (Last 7 Days)</h3>
            <div className="trends-grid">
              {Object.entries(trendData).map(([emotion, data]) => (
                <div key={emotion} className={`trend-card ${emotion}`}>
                  <h4>{emotion}</h4>
                  <div className="trend-stats">
                    <div className="trend-item">
                      <span className="label">Recent:</span>
                      <span className="value">{data.recent}</span>
                    </div>
                    <div className="trend-item">
                      <span className="label">Previous:</span>
                      <span className="value">{data.previous}</span>
                    </div>
                    <div className={`trend-item change ${data.change > 0 ? 'up' : data.change < 0 ? 'down' : 'neutral'}`}>
                      <span className="label">Change:</span>
                      <span className="value">
                        {data.change > 0 ? '↑' : data.change < 0 ? '↓' : '→'} {Math.abs(data.change).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmotionTimelinePage
