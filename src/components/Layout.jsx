import React from 'react'
import { Leaf, LogIn, LogOut, MessageCircle, History, UserPlus, TrendingUp, Map, Home, Sprout } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { Footer } from './Footer.jsx'

export function Layout({ children }) {
  const location = useLocation()
  const nav = useNavigate()
  const { user, isLoggedIn, logout } = useAuth()

  function onLogout() {
    logout()
    nav('/', { replace: true })
  }

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <Link className="brand" to="/" aria-label="Go to home">
            <div className="brand-badge" aria-hidden="true">
              <Leaf size={18} />
            </div>
            <div>
              <h1>Crop AI</h1>
              <p>Recommendation • Price • Trend • Risk</p>
            </div>
          </Link>

          <nav className="nav-links" aria-label="Primary">
            <Link className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} to="/">
              <span className="nav-ic" aria-hidden="true">
                <Home size={16} />
              </span>
              {isLoggedIn ? 'My Farm' : 'Home'}
            </Link>
            {isLoggedIn ? (
              <Link className={`nav-link ${location.pathname === '/advisory' ? 'active' : ''}`} to="/advisory">
                <span className="nav-ic" aria-hidden="true">
                  <Sprout size={16} />
                </span>
                Crop Advisory
              </Link>
            ) : null}
            <Link className={`nav-link ${location.pathname === '/chat' ? 'active' : ''}`} to="/chat">
              <span className="nav-ic" aria-hidden="true">
                <MessageCircle size={16} />
              </span>
              Chatbot
            </Link>
            <Link className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`} to="/analytics">
               <span className="nav-ic" aria-hidden="true">
                 <Map size={16} />
               </span>
               Heat Map
            </Link>
            <Link className={`nav-link ${location.pathname === '/market-prediction' ? 'active' : ''}`} to="/market-prediction">
              <span className="nav-ic" aria-hidden="true">
                <TrendingUp size={16} />
              </span>
              Market Prediction
            </Link>
            <Link className={`nav-link ${location.pathname === '/history' ? 'active' : ''}`} to="/history">
              <span className="nav-ic" aria-hidden="true">
                <History size={16} />
              </span>
              History
            </Link>
          </nav>

          <div className="top-actions">
            <div className="pill" title="Current page">
              {location.pathname === '/' && isLoggedIn
                ? 'My Farm'
                : location.pathname === '/profile'
                ? 'Farm Profile'
                : location.pathname === '/result'
                ? 'Result Dashboard'
                : location.pathname === '/login'
                  ? 'Login'
                  : location.pathname === '/signup'
                    ? 'Sign Up'
                    : location.pathname === '/chat'
                      ? 'Chatbot'
                      : location.pathname === '/history'
                      ? 'History'
                    : location.pathname === '/market-prediction'
                      ? 'Market Input'
                    : location.pathname === '/market-result'
                      ? 'Market Data'
                    : 'Farmer Input'}
            </div>

            {isLoggedIn ? (
              <>
                <Link className="pill" to="/profile" title={`${user.email} - edit farm profile`}>
                  <span className="avatar" aria-hidden="true">
                    {(user.name || 'U').slice(0, 1).toUpperCase()}
                  </span>
                  <strong>{user.name}</strong>
                </Link>
                <button type="button" className="btn btn-ghost nav-btn" onClick={onLogout}>
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-ghost nav-btn" to="/login" state={{ next: location.pathname }}>
                  <LogIn size={16} /> Login
                </Link>
                <Link className="btn btn-primary nav-btn" to="/signup" state={{ next: location.pathname }}>
                  <UserPlus size={16} /> Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="page">
        <div className="container">{children}</div>
      </main>

      <Footer />
    </>
  )
}
