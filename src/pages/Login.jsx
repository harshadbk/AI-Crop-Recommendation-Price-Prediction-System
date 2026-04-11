import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { SpinnerOverlay } from '../components/SpinnerOverlay.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import farmIllustration from '../assets/illustration-farm.svg'

export function LoginPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ email, password })
      const next = loc.state?.next || '/'
      nav(next, { replace: true })
    } catch (err) {
      setError(err?.message || 'Login failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading ? <SpinnerOverlay label="Logging in..." /> : null}
      <div className="auth-wrap">
        <Card title="Login">
          <div className="auth-hero" aria-hidden="true">
            <img src={farmIllustration} alt="" />
          </div>
          <p className="muted" style={{ marginTop: -4 }}>
            Welcome back. Login to continue.
          </p>

          <form onSubmit={onSubmit} className="auth-form" style={{ marginTop: 12 }}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error ? <div className="error">{error}</div> : null}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              Login
            </button>

            <p className="muted" style={{ textAlign: 'center', marginTop: 10 }}>
              New user?{' '}
              <Link className="link" to="/signup">
                Create an account
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </>
  )
}
