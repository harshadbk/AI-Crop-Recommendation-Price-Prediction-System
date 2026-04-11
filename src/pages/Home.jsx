import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Sprout, TrendingUp } from 'lucide-react'
import heroImg from '../assets/farm.jpg'
import farmIllustration from '../assets/illustration-farm.svg'
import iconKharif from '../assets/icon-kharif.svg'
import iconRabi from '../assets/icon-rabi.svg'
import iconZaid from '../assets/icon-zaid.svg'
import { Card } from '../components/Card.jsx'
import { SpinnerOverlay } from '../components/SpinnerOverlay.jsx'
import { CROPS, EXPERIENCE_LEVELS, LOCATIONS, MONTHS, SOIL_TYPES } from '../constants/options.js'
import { seasonFromMonth, seasonKeyFromMonth } from '../utils/season.js'
import { getRecommendation } from '../api/recommendation.js'
import { appendHistory } from '../utils/historyStore.js'

function nowMonthName() {
  return MONTHS[new Date().getMonth()]
}

export function HomePage() {
  const navigate = useNavigate()

  const [location, setLocation] = useState('')
  const [monthName, setMonthName] = useState(nowMonthName())
  const [soilType, setSoilType] = useState('Loamy')
  const [desiredCrop, setDesiredCrop] = useState('')
  const [budget, setBudget] = useState('')
  const [experience, setExperience] = useState('Beginner')

  const season = useMemo(() => seasonFromMonth(monthName), [monthName])
  const seasonKey = useMemo(() => seasonKeyFromMonth(monthName), [monthName])
  const seasonIcon = seasonKey === 'kharif' ? iconKharif : seasonKey === 'rabi' ? iconRabi : iconZaid

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (!location.trim()) return setError('Please enter your location.')
    if (!monthName) return setError('Please select current month.')
    if (!soilType) return setError('Please select soil type.')
    if (!budget || Number(budget) <= 0) return setError('Please enter a valid budget (₹).')
    if (!experience) return setError('Please select your experience level.')

    const payload = {
      location: location.trim(),
      monthName,
      season,
      soilType,
      desiredCrop: desiredCrop || null,
      budget: Number(budget),
      experience,
    }

    setLoading(true)
    try {
      const result = await getRecommendation(payload)
      const packed = { input: payload, result, generatedAt: new Date().toISOString() }
      sessionStorage.setItem('cropAi:lastResult', JSON.stringify(packed))
      appendHistory(packed)
      navigate('/result', { state: packed })
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading ? <SpinnerOverlay label="Getting recommendation..." /> : null}

      <section className="hero">
        <div className="anim-fade-up">
          <h2>Smart crop recommendation, with price & risk insights.</h2>
          <p className="sub">
            Enter just a few details. The system combines season suitability, farmer trends, demand and price momentum.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <span className="pill">
              <img src={seasonIcon} alt="" width="18" height="18" style={{ display: 'block' }} />
              <span className="muted">Season:</span> <strong>{season}</strong>
            </span>
            <span className="pill">
              <span aria-hidden="true" style={{ fontWeight: 900, color: '#157f3d' }}>
                ₹
              </span>
              Minimal input • Maximum insights
            </span>
          </div>

          <div className="feature-grid anim-fade-up anim-delay-1">
            <div className="feature">
              <div className="feature-ic">
                <Sprout size={16} />
              </div>
              <div>
                <div className="feature-title">Season Fit</div>
                <div className="feature-sub">Crop suitability score</div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-ic">
                <TrendingUp size={16} />
              </div>
              <div>
                <div className="feature-title">Price Range</div>
                <div className="feature-sub">Min–max estimate</div>
              </div>
            </div>
            <div className="feature">
              <div className="feature-ic">
                <BarChart3 size={16} />
              </div>
              <div>
                <div className="feature-title">Market Trend</div>
                <div className="feature-sub">Simple chart view</div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-card anim-fade-up anim-delay-2">
          <div className="hero-media">
            <img className="hero-img" src={heroImg} alt="Green field" />
            <img className="hero-float" src={farmIllustration} alt="" aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="anim-fade-up anim-delay-3">
        <Card title="Farmer Input">
          <form onSubmit={onSubmit} className="grid">
            <div className="field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                list="locations"
                placeholder="Type your city / district"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <datalist id="locations">
                {LOCATIONS.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </div>

            <div className="field">
              <label htmlFor="month">Current Month / Season</label>
              <select id="month" value={monthName} onChange={(e) => setMonthName(e.target.value)}>
                {MONTHS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <div className="hint">Season detected: {season}</div>
            </div>

            <div className="field">
              <label htmlFor="soil">Soil Type</label>
              <select id="soil" value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                {SOIL_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="crop">Crop you want to cultivate</label>
              <select id="crop" value={desiredCrop} onChange={(e) => setDesiredCrop(e.target.value)}>
                <option value="">(Not sure) Let AI decide</option>
                {CROPS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="budget">Budget available (₹)</label>
              <input
                id="budget"
                type="number"
                inputMode="numeric"
                placeholder="e.g., 50000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min="1"
              />
            </div>

            <div className="field">
              <label htmlFor="exp">Farming experience</label>
              <select id="exp" value={experience} onChange={(e) => setExperience(e.target.value)}>
                {EXPERIENCE_LEVELS.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'grid', gap: 10 }}>
              {error ? <div className="error">{error}</div> : null}
              <div className="actions">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  Get Recommendation
                </button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
