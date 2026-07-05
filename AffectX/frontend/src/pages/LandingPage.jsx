import { useNavigate } from 'react-router-dom'
import '../styles/landing.css'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page landing-container">
      <nav className="landing-navbar">
        <div className="navbar-content">
          <h1>AffectX AI</h1>
          <div className="nav-buttons">
            <button onClick={() => navigate('/login')} className="btn-login">
              Login
            </button>
            <button onClick={() => navigate('/register')} className="btn-register">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <h1>Multimodal Emotion Intelligence Platform</h1>
          <p className="hero-subtitle">
            Understand your emotions better with AI-powered analysis from face, voice, and text
          </p>
          <div className="hero-buttons">
            <button onClick={() => navigate('/register')} className="btn-primary-large">
              Get Started Free
            </button>
            <button onClick={() => navigate('/login')} className="btn-secondary-large">
              Login
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="emotion-showcase">
            <div className="emotion-item happy">😊 Happy</div>
            <div className="emotion-item sad">😢 Sad</div>
            <div className="emotion-item angry">😠 Angry</div>
            <div className="emotion-item neutral">😐 Neutral</div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>👁️ Face Detection</h3>
            <p>Real-time facial emotion recognition using advanced AI models</p>
          </div>
          <div className="feature-card">
            <h3>🎤 Voice Analysis</h3>
            <p>Analyze emotions from your voice patterns and tone</p>
          </div>
          <div className="feature-card">
            <h3>📝 Text Analysis</h3>
            <p>Detect sentiment and emotions from written text</p>
          </div>
          <div className="feature-card">
            <h3>🧠 Emotion Fusion</h3>
            <p>Combine multiple emotion sources for unified analysis</p>
          </div>
          <div className="feature-card">
            <h3>📈 Analytics</h3>
            <p>Track your emotional trends with interactive charts</p>
          </div>
          <div className="feature-card">
            <h3>💚 Wellness</h3>
            <p>Get personalized activity recommendations based on emotions</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h4>Record Your Emotion</h4>
            <p>Use your webcam, voice, or text to capture your current emotion</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h4>AI Analysis</h4>
            <p>Our AI analyzes your input using advanced machine learning models</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h4>Get Insights</h4>
            <p>Receive personalized insights and wellness recommendations</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h4>Track Progress</h4>
            <p>Monitor your emotional journey with detailed analytics</p>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Understand Your Emotions?</h2>
        <p>Join thousands of users discovering emotional intelligence with AffectX AI</p>
        <button onClick={() => navigate('/register')} className="btn-primary-large">
          Start Free Today
        </button>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2024 AffectX AI. All rights reserved.</p>
        <div className="footer-links">
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <a href="#contact">Contact</a>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
