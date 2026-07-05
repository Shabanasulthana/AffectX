import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import '../styles/sidebar.css'

function Sidebar({ onChatbotClick = null }) {
  const location = useLocation()

  const menuItems = [
    {
      title: 'Dashboard',
      icon: '🏠',
      path: '/dashboard',
      category: 'main'
    },
    {
      title: 'Analysis Modules',
      icon: '📊',
      category: 'section'
    },
    {
      title: 'Face Detection',
      icon: '👁️',
      path: '/face-detection',
      indent: true,
      category: 'analysis'
    },
    {
      title: 'Voice Analysis',
      icon: '🎤',
      path: '/voice-analysis',
      indent: true,
      category: 'analysis'
    },
    {
      title: 'Text Analysis',
      icon: '📝',
      path: '/text-analysis',
      indent: true,
      category: 'analysis'
    },
    {
      title: 'Insights & Analytics',
      icon: '🧠',
      category: 'section'
    },
    {
      title: 'Emotion Fusion',
      icon: '🎯',
      path: '/emotion-fusion',
      indent: true,
      category: 'insights'
    },
    {
      title: 'Analytics',
      icon: '📈',
      path: '/emotion-timeline',
      indent: true,
      category: 'insights'
    },
    {
      title: 'Account',
      icon: '👤',
      category: 'section'
    },
    {
      title: 'Profile',
      icon: '⚙️',
      path: '/profile',
      indent: true,
      category: 'account'
    },
    {
      title: 'Settings',
      icon: '🔧',
      path: '/settings',
      indent: true,
      category: 'account'
    }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-icon">🧠</div>
          <span className="brand-name">AffectX</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item, idx) => (
          <div key={idx}>
            {item.category === 'section' && (
              <div className="nav-section-title">{item.title}</div>
            )}
            {item.category !== 'section' && (
              <Link
                to={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''} ${item.indent ? 'indent' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.title}</span>
                {isActive(item.path) && <div className="nav-indicator"></div>}
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="chatbot-sidebar-btn"
          onClick={onChatbotClick}
          title="Open Chat Support"
        >
          <span className="chat-icon">💬</span>
          <span className="chat-label">Chat Support</span>
        </button>

        <div className="user-quick-info">
          <div className="user-avatar">👤</div>
          <div className="user-info">
            <p className="user-name">Profile</p>
            <p className="user-status">Active</p>
          </div>
        </div>
        <button className="logout-btn" title="Logout">
          🚪
        </button>
      </div>
    </div>
  )
}

export default Sidebar
