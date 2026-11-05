import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { SpinnerOverlay } from '../components/SpinnerOverlay.jsx'
import { FarmProfileForm, emptyFarm, farmToProfile, validateFarm } from '../components/FarmProfileForm.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import farmIllustration from '../assets/farm.jpg'

/**
 * Two-step registration.
 * Step 1: account (name, email, password).
 * Step 2: farm details - asked ONCE, then every prediction is personalised from them.
 */
export function SignupPage() {
  const nav = useNavigate()
  const { signup } = useAuth()

  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [farm, setFarm] = useState(() => emptyFarm())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function nextStep(e) {
    e.preventDefault()
    setError('')
    if (!name.trim()) return setError('Please enter your name.')
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirm) return setError('Passwords do not match.')
    setStep(2)
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const problem = validateFarm(farm)
    if (problem) return setError(problem)

    const p = farmToProfile(farm)
    setLoading(true)
    try {
      await signup({
        name,
        email,
        password,
        stateName: p.state_name,
        districtName: p.district_name,
        talukaName: p.taluka_name,
        soilType: p.soil_type,
        farmSizeAcres: p.farm_size_acres,
        mainCrops: p.main_crops,
        preferredLanguage: p.preferred_language,
        waterSource: p.water_source,
        irrigationType: p.irrigation_type,
        budget: p.budget,
        soilN: p.soil_n,
        soilP: p.soil_p,
        soilK: p.soil_k,
        soilPh: p.soil_ph,
      })
      nav('/', { replace: true }) // logged-in home = personalised "My Farm" dashboard
    } catch (err) {
      setError(err?.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading ? <SpinnerOverlay label="Creating your farm account..." /> : null}
      <div className="auth-wrap" style={step === 2 ? { maxWidth: 760 } : undefined}>
        <Card title={step === 1 ? 'Sign Up · Step 1 of 2' : 'Your Farm · Step 2 of 2'}>
          {step === 1 ? (
            <>
              <div className="auth-hero" aria-hidden="true">
                <img src={farmIllustration} alt="" />
              </div>
              <p className="muted" style={{ marginTop: -4 }}>
                Create your account. In the next step you tell us about your farm once, and every report is made for you.
              </p>

              <form onSubmit={nextStep} className="auth-form" style={{ marginTop: 12 }}>
                <div className="field">
                  <label htmlFor="name">Full name</label>
                  <input id="name" type="text" autoComplete="name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input id="email" type="email" autoComplete="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid">
                  <div className="field">
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" autoComplete="new-password" placeholder="Min 6 chars" value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="confirm">Confirm</label>
                    <input id="confirm" type="password" autoComplete="new-password" placeholder="Repeat password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                  </div>
                </div>

                {error ? <div className="error">{error}</div> : null}

                <button className="btn btn-primary" type="submit">Next: Farm details</button>

                <p className="muted" style={{ textAlign: 'center', marginTop: 10 }}>
                  Already have an account? <Link className="link" to="/login">Login</Link>
                </p>
              </form>
            </>
          ) : (
            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
              <p className="muted" style={{ margin: 0 }}>
                We use these details for your crop recommendations, weather alerts, mandi prices and monthly farm tasks.
                You can change them any time from <strong>My Profile</strong>.
              </p>
              <FarmProfileForm farm={farm} onChange={setFarm} />

              {error ? <div className="error">{error}</div> : null}

              <div className="actions" style={{ justifyContent: 'space-between' }}>
                <button className="btn btn-ghost" type="button" onClick={() => { setError(''); setStep(1) }}>Back</button>
                <button className="btn btn-primary" type="submit" disabled={loading}>Create Account</button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </>
  )
}
