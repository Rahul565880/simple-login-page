import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [view, setView] = useState('login')
  const [formData, setFormData] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.status === 201) {
        setSuccess('Registration successful! Please login.')
        setFormData({ username: '', password: '' })
        setTimeout(() => setView('login'), 1500)
      } else if (response.status === 409) {
        setError('Username already exists')
      } else {
        setError(data.message || 'Registration failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.status === 200) {
        setSuccess('Login successful!')
        setFormData({ username: '', password: '' })
        // Fetch user data from protected endpoint
        const userResponse = await fetch('http://localhost:3000/api/me', {
          method: 'GET',
          credentials: 'include'
        })
        if (userResponse.status === 200) {
          const userData = await userResponse.json()
          setUser({ username: userData.username, userId: userData.userId })
        } else {
          setUser({ username: formData.username })
        }
      } else {
        setError(data.message || 'Invalid credentials')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleView = () => {
    setView(view === 'login' ? 'register' : 'login')
    setError('')
    setSuccess('')
    setFormData({ username: '', password: '' })
  }

  const handleLogout = () => {
    setUser(null)
    setView('login')
    setError('')
    setSuccess('')
  }

  if (user) {
    return (
      <div className="app dashboard">
        <div className="glass-card dashboard-card">
          <div className="dashboard-header">
            <div className="user-avatar">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <h1>Welcome, {user.username}!</h1>
              <p className="subtitle">{currentTime.toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <h3>Dashboard</h3>
                <p>Your personal space</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔒</div>
              <div className="stat-content">
                <h3>Secure</h3>
                <p>JWT authenticated</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-content">
                <h3>Active</h3>
                <p>Session valid</p>
              </div>
            </div>
          </div>

          <div className="dashboard-content">
            <div className="info-section">
              <h2>Account Overview</h2>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Username</span>
                  <span className="info-value">{user.username}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Status</span>
                  <span className="info-value status-active">Active</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Login Time</span>
                  <span className="info-value">{currentTime.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleLogout} className="submit-btn logout-btn">
            Sign Out
          </button>
        </div>

        <div className="ambient-light"></div>
        <div className="ambient-light-2"></div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="glass-card">
        <div className="header">
          <h1>{view === 'login' ? 'Welcome Back' : 'Create Account'}</h1>
          <p className="subtitle">
            {view === 'login' 
              ? 'Sign in to access your account' 
              : 'Sign up to get started'}
          </p>
        </div>

        <form onSubmit={view === 'login' ? handleLogin : handleRegister}>
          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              autoComplete="off"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="message error">{error}</div>}
          {success && <div className="message success">{success}</div>}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading 
              ? (view === 'login' ? 'Signing in...' : 'Creating account...')
              : (view === 'login' ? 'Sign In' : 'Create Account')
            }
          </button>
        </form>

        <div className="footer">
          <p>
            {view === 'login' 
              ? "Don't have an account? " 
              : "Already have an account? "}
            <button onClick={toggleView} className="toggle-btn">
              {view === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>

      <div className="ambient-light"></div>
      <div className="ambient-light-2"></div>
    </div>
  )
}

export default App
