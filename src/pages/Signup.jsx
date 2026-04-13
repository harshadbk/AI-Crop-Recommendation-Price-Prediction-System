import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { SpinnerOverlay } from '../components/SpinnerOverlay.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import farmIllustration from '../assets/farm.jpg'
import { LOCATIONS, STATES } from '../constants/options.js'

export function SignupPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const { signup } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [stateName, setStateName] = useState('Maharashtra')
  const [districtName, setDistrictName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (password !== confirm) return setError('Passwords do not match.')

    setLoading(true)
    try {
      await signup({ name, email, password, stateName, districtName })
      const next = loc.state?.next || '/'
      nav(next, { replace: true })
    } catch (err) {
      setError(err?.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading ? <SpinnerOverlay label="Creating account..." /> : null}
      <div className="auth-wrap">
        <Card title="Sign Up">
          <div className="auth-hero" aria-hidden="true">
            <img src={farmIllustration} alt="" />
          </div>
          <p className="muted" style={{ marginTop: -4 }}>
            Create your account to save results on this device.
          </p>

          <form onSubmit={onSubmit} className="auth-form" style={{ marginTop: 12 }}>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

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

            <div className="grid">
              <div className="field">
                <label htmlFor="state">State</label>
                <input id="state" list="states" value={stateName} onChange={(e) => setStateName(e.target.value)} />
                <datalist id="states">
                  {STATES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div className="field">
                <label htmlFor="district">District Name</label>
                <input
                  id="district"
                  list="districts"
                  placeholder="Type district"
                  value={districtName}
                  onChange={(e) => setDistrictName(e.target.value)}
                />
                <datalist id="districts">
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid">
              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min 6 chars"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="confirm">Confirm</label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </div>

            {error ? <div className="error">{error}</div> : null}

            <button className="btn btn-primary" type="submit" disabled={loading}>
              Create Account
            </button>

            <p className="muted" style={{ textAlign: 'center', marginTop: 10 }}>
              Already have an account?{' '}
              <Link className="link" to="/login">
                Login
              </Link>
            </p>
          </form>
        </Card>
      </div>
    </>
  )
}
