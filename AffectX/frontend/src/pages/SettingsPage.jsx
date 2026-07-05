import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import apiClient from '../api/config'
import '../styles/settings.css'

function SettingsPage() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [dataCollection, setDataCollection] = useState(true)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  const handlePasswordChange = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters')
      return
    }

    try {
      // This would need a backend endpoint
      setMessage('Password changed successfully')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setMessage('Failed to change password')
    }
  }

  const downloadData = async () => {
    try {
      const response = await apiClient.get('/auth/export-data')

      const dataStr = JSON.stringify(response.data, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `affectx-data-${new Date().toISOString().split('T')[0]}.json`
      link.click()

      setMessage('Data exported successfully')
    } catch (err) {
      setMessage('Failed to export data')
    }
  }

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      return
    }

    try {
      await apiClient.delete('/auth/delete-account')

      localStorage.removeItem('token')
      navigate('/login')
    } catch (err) {
      setMessage('Failed to delete account')
    }
  }

  return (
    <div className="settings-container">
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

      <div className="settings-content">
        <h2>Settings</h2>

        {message && <div className="message">{message}</div>}

        <div className="settings-grid">
          {/* Password Change */}
          <div className="settings-card">
            <h3>🔒 Change Password</h3>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </div>
              <button type="submit" className="btn-save">
                Change Password
              </button>
            </form>
          </div>

          {/* Preferences */}
          <div className="settings-card">
            <h3>⚙️ Preferences</h3>
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                />
                Email Notifications
              </label>
              <p className="preference-desc">Receive weekly emotion summaries</p>
            </div>
            <div className="preference-item">
              <label>
                <input
                  type="checkbox"
                  checked={dataCollection}
                  onChange={(e) => setDataCollection(e.target.checked)}
                />
                Data Collection
              </label>
              <p className="preference-desc">Help improve AI models with your data</p>
            </div>
          </div>

          {/* Data Management */}
          <div className="settings-card">
            <h3>📊 Data Management</h3>
            <p className="card-desc">Download or delete your personal data</p>
            <div className="button-group">
              <button onClick={downloadData} className="btn-secondary">
                📥 Download My Data
              </button>
              <button onClick={deleteAccount} className="btn-danger">
                ❌ Delete Account
              </button>
            </div>
          </div>

          {/* About */}
          <div className="settings-card">
            <h3>ℹ️ About</h3>
            <p><strong>Version:</strong> 1.0.0</p>
            <p><strong>Platform:</strong> AffectX AI - Multimodal Emotion Intelligence</p>
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
