import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import FaceDetectionPage from './pages/FaceDetectionPage'
import VoiceAnalysisPage from './pages/VoiceAnalysisPage'
import TextAnalysisPage from './pages/TextAnalysisPage'
import EmotionFusionPage from './pages/EmotionFusionPage'
import EmotionTimelinePage from './pages/EmotionTimelinePage'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  if (loading) return <div className="loader">Loading...</div>

  return (
    <Router>
      <div className="app-layout">
        {isAuthenticated && <Sidebar />}
        <div className="app-content">
          <Routes>
            <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/login" element={!isAuthenticated ? <LoginPage setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/dashboard" />} />
            <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={isAuthenticated ? <DashboardPage /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/settings" element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} />
            <Route path="/face-detection" element={isAuthenticated ? <FaceDetectionPage /> : <Navigate to="/login" />} />
            <Route path="/voice-analysis" element={isAuthenticated ? <VoiceAnalysisPage /> : <Navigate to="/login" />} />
            <Route path="/text-analysis" element={isAuthenticated ? <TextAnalysisPage /> : <Navigate to="/login" />} />
            <Route path="/emotion-fusion" element={isAuthenticated ? <EmotionFusionPage /> : <Navigate to="/login" />} />
            <Route path="/emotion-timeline" element={isAuthenticated ? <EmotionTimelinePage /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
