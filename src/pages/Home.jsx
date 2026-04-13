import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart3, Sprout, Droplets, Wallet, Maximize2, History as HistoryIcon } from 'lucide-react'
import heroImg from '../assets/farm.jpg'
import farmIllustration from '../assets/illustration-farm.svg'
import iconKharif from '../assets/icon-kharif.svg'
import iconRabi from '../assets/icon-rabi.svg'
import iconZaid from '../assets/icon-zaid.svg'
import { Card } from '../components/Card.jsx'
import { SpinnerOverlay } from '../components/SpinnerOverlay.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import {
  CROPS,
  SOIL_TYPES,
  DATASET_SEASONS,
  WATER_SOURCES,
  IRRIGATION_TYPES,
  MONTHS,
} from '../constants/options.js'
import { datasetSeasonFromMonth, seasonFromMonth, seasonKeyFromMonth } from '../utils/season.js'
import { getRecommendation } from '../api/recommendation.js'
import { appendHistory } from '../utils/historyStore.js'

function nowMonthName() {
  return MONTHS[new Date().getMonth()]
}

export function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Crop Suggestion Inputs
  const [soilType, setSoilType] = useState('Loamy')
  const [waterSource, setWaterSource] = useState('Rainfed')
  const [irrigationType, setIrrigationType] = useState('Flood')
  const [budget, setBudget] = useState('')
  const [landSize, setLandSize] = useState('')
  const [targetedCrop, setTargetedCrop] = useState('')
  const [priceDate, setPriceDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [seasonManual, setSeasonManual] = useState(datasetSeasonFromMonth(nowMonthName()))

  const monthName = nowMonthName()
  const seasonLabel = useMemo(() => seasonFromMonth(monthName), [monthName])
  const seasonKey = useMemo(() => seasonKeyFromMonth(monthName), [monthName])
  const seasonIcon = seasonKey === 'rainy' ? iconKharif : seasonKey === 'winter' ? iconRabi : iconZaid

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    const stateName = user?.stateName || 'Maharashtra'
    const districtName = user?.districtName || 'Unknown'

    if (!budget || Number(budget) <= 0) return setError('Please enter a valid investment budget.')
    if (!landSize || Number(landSize) <= 0) return setError('Please enter your land size.')

    const payload = {
      // Suggestion Logic Payload
      type: 'crop_suggestion',
      stateName: stateName.trim(),
      districtName: districtName.trim(),
      season: seasonManual,
      soilType,
      waterSource,
      irrigationType,
      budget: Number(budget),
      landSize: Number(landSize),
      targetedCrop: targetedCrop || 'None',
      priceDate,
      
      // Backward compatibility / dataset alignment
      commodity: 'Suggestion Request',
      cropYear: 2026,
      monthName,
      location: `${districtName.trim()}, ${stateName.trim()}`,
    }

    setLoading(true)
    try {
      const result = await getRecommendation(payload)
      const packed = { input: payload, result, generatedAt: new Date().toISOString() }
      sessionStorage.setItem('cropAi:lastResult', JSON.stringify(packed))
      appendHistory(packed)
      navigate('/result', { state: packed })
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'AI service is currently unavailable.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading ? <SpinnerOverlay label="Analyzing best crops for you..." /> : null}

      <section className="hero">
        <div className="anim-fade-up">
          <span className="badge">AI Agriculture Expert</span>
          <h2>Intelligent Crop Prediction.</h2>
          <p className="sub">
            Leverage RAG-driven AI to predict the best crops for your land based on soil, climate, and market history.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <span className="pill">
              <img src={seasonIcon} alt="" width="18" height="18" style={{ display: 'block' }} />
              <span className="muted">UI Season:</span> <strong>{seasonLabel}</strong>
            </span>
          </div>
        </div>
        <div className="hero-card anim-fade-up anim-delay-2">
          <div className="hero-media">
            <img className="hero-img" src={heroImg} alt="Farmer Advice" />
            <img className="hero-float" src={farmIllustration} alt="" aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="anim-fade-up anim-delay-3" id="suggestion-form">
        <Card title="Enter Your Farm Details">
          <form onSubmit={onSubmit} className="grid">
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <div className="muted" style={{ fontWeight: 900 }}>Soil & Season</div>
              <div className="hint">State: {user?.stateName || 'Maharashtra'}, District: {user?.districtName || 'Determining...'}</div>
            </div>

            <div className="field">
              <label htmlFor="priceDate">Planting/Planning Date</label>
              <input
                id="priceDate"
                type="date"
                value={priceDate}
                onChange={(e) => {
                  setPriceDate(e.target.value)
                  const m = MONTHS[new Date(e.target.value).getMonth()]
                  setSeasonManual(datasetSeasonFromMonth(m))
                }}
              />
            </div>

            <div className="field">
              <label htmlFor="season">Current/Planned Season</label>
              <select id="season" value={seasonManual} onChange={(e) => setSeasonManual(e.target.value)}>
                {DATASET_SEASONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="soil">Soil Type</label>
              <select id="soil" value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                {SOIL_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="field" style={{ gridColumn: '1 / -1', marginTop: 12 }}>
              <div className="muted" style={{ fontWeight: 900 }}>Water & Resources</div>
            </div>

            <div className="field">
              <label htmlFor="water">Water Availability</label>
              <select id="water" value={waterSource} onChange={(e) => setWaterSource(e.target.value)}>
                {WATER_SOURCES.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="irrigation">Irrigation Method</label>
              <select id="irrigation" value={irrigationType} onChange={(e) => setIrrigationType(e.target.value)}>
                {IRRIGATION_TYPES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="budget">Investment Budget (₹)</label>
              <input
                id="budget"
                type="number"
                placeholder="e.g. 50000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="land">Land Size (Hectares)</label>
              <input
                id="land"
                type="number"
                step="0.1"
                placeholder="e.g. 2.0"
                value={landSize}
                onChange={(e) => setLandSize(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="target">Preferred Crop</label>
              <select id="target" value={targetedCrop} onChange={(e) => setTargetedCrop(e.target.value)}>
                <option value="">Any (Suggest Best)</option>
                {CROPS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'grid', gap: 10, marginTop: 12 }}>
              {error ? <div className="error">{error}</div> : null}
              <div className="actions">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  Predict Best Crops
                </button>
              </div>
            </div>
          </form>
        </Card>
      </div>

      <div className="feature-grid anim-fade-up anim-delay-4" style={{ marginTop: 40 }}>
        <div className="feature">
          <div className="feature-ic"><Sprout size={16} /></div>
          <div>
            <div className="feature-title">Demand Analysis</div>
            <div className="feature-sub">Based on market trends</div>
          </div>
        </div>
        <div className="feature">
          <div className="feature-ic"><Wallet size={16} /></div>
          <div>
            <div className="feature-title">Profit Maximization</div>
            <div className="feature-sub">Optimized for your budget</div>
          </div>
        </div>
        <div className="feature">
          <div className="feature-ic"><Maximize2 size={16} /></div>
          <div>
            <div className="feature-title">Sustainability</div>
            <div className="feature-sub">Soil health focused</div>
          </div>
        </div>
      </div>
    </>
  )
}
