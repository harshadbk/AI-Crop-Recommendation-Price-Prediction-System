import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, MapPin, ShoppingBag, Layers, Info, Calendar } from 'lucide-react'
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
  MONTHS,
  STATES,
  DISTRICTS_BY_STATE,
  MARKETS_BY_DISTRICT,
} from '../constants/options.js'
import { datasetSeasonFromMonth, seasonFromMonth, seasonKeyFromMonth } from '../utils/season.js'
import { fetchMarketPrices } from '../api/prediction.js'
import { appendHistory } from '../utils/historyStore.js'

function nowMonthName() {
  return MONTHS[new Date().getMonth()]
}

export function PredictionPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  // Primary inputs
  const [stateName, setStateName] = useState(user?.stateName || 'Uttar Pradesh')
  const [districtName, setDistrictName] = useState(user?.districtName || 'Etah')
  const [marketName, setMarketName] = useState('Awagarh APMC')
  const [commodity, setCommodity] = useState('Green Chilli')
  const [variety, setVariety] = useState('Other')
  const [priceDate, setPriceDate] = useState(() => new Date().toISOString().slice(0, 10))

  const districts = useMemo(() => DISTRICTS_BY_STATE[stateName] || [], [stateName])
  const markets = useMemo(() => MARKETS_BY_DISTRICT[districtName] || [], [districtName])

  const monthName = nowMonthName()
  const seasonLabel = useMemo(() => seasonFromMonth(monthName), [monthName])
  const seasonKey = useMemo(() => seasonKeyFromMonth(monthName), [monthName])
  const datasetSeason = datasetSeasonFromMonth(monthName)
  const seasonIcon = seasonKey === 'rainy' ? iconKharif : seasonKey === 'winter' ? iconRabi : iconZaid

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e) {
    e.preventDefault()
    setError('')

    if (!marketName.trim()) return setError('Please enter Mandi name.')
    if (!commodity) return setError('Please select Commodity.')

    const payload = {
      state: stateName.trim(),
      district: districtName.trim(),
      market: marketName.trim(),
      commodity,
    }

    setLoading(true)
    try {
      const response = await fetchMarketPrices(payload)
      
      const records = Array.isArray(response) ? response : (response?.records || [])
      const analysis = Array.isArray(response) ? null : response?.analysis

      // Transform record or use AI Fallback
      const latest = records.length > 0 ? records[0] : null
      
      const result = {
        mode: records.length > 0 ? 'real_world_prices' : 'ai_simulated',
        pricePrediction: {
          commodity: latest?.commodity || analysis?.modeled_commodity || payload.commodity,
          rangeMin: latest?.min_price || analysis?.modeled_range_min || 0,
          rangeMax: latest?.max_price || analysis?.modeled_range_max || 0,
          modalPrice: latest?.modal_price || analysis?.modeled_modal_price || 0,
          grade: latest?.grade || 'FAQ',
          variety: latest?.variety || 'Other',
          arrivalDate: latest?.arrival_date || new Date().toLocaleDateString('en-GB'),
          unit: 'Quintal' 
        },
        analysis: analysis, 
        recommendedCrops: [
          { crop: latest?.commodity || payload.commodity, probability: 100, risk: 'Low' }
        ],
        explanation: {
            bullets: analysis?.analysis_bullets || [
                `Latest data from ${latest?.market || 'Market'} market.`,
                `Variety: ${latest?.variety || 'Other'}, Grade: ${latest?.grade || 'FAQ'}`,
                `Last updated on ${latest?.arrival_date || 'Today'}`
            ]
        },
        marketTrend: { series: analysis?.trend_series || [] }, 
        risk: { level: 'Low' }
      }

      const packed = { 
        input: { 
          ...payload, 
          marketName: response.normalized_input?.market || payload.market, 
          districtName: response.normalized_input?.district || payload.district, 
          stateName: response.normalized_input?.state || payload.state 
        }, 
        result, 
        generatedAt: new Date().toISOString() 
      }
      sessionStorage.setItem('cropAi:lastResult', JSON.stringify(packed))
      appendHistory(packed)
      navigate('/market-result', { state: packed })
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.message || 'Market API is currently unavailable.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {loading ? <SpinnerOverlay label="Processing market data..." /> : null}

      <section className="hero">
        <div className="anim-fade-up">
          <span className="badge">Dataset Explorer</span>
          <h2>Market Price Prediction.</h2>
          <p className="sub">
            Select your Mandi and Commodity. We'll analyze price, arrivals, and trader activity from the latest datasets.
          </p>
          <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
            <span className="pill">
              <img src={seasonIcon} alt="" width="18" height="18" style={{ display: 'block' }} />
              <span className="muted">Active Season:</span> <strong>{seasonLabel}</strong>
            </span>
          </div>
        </div>
        <div className="hero-card anim-fade-up anim-delay-2">
          <div className="hero-media">
            <img className="hero-img" src={heroImg} alt="Market" />
            <img className="hero-float" src={farmIllustration} alt="" aria-hidden="true" />
          </div>
        </div>
      </section>

      <div className="anim-fade-up anim-delay-3">
        <Card title="Market Input">
          <form onSubmit={onSubmit} className="grid">
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <div className="muted" style={{ fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mandi & Commodity</div>
            </div>

            <div className="field">
              <label htmlFor="state">State</label>
              <select id="state" value={stateName} onChange={(e) => {
                setStateName(e.target.value)
                setDistrictName('')
                setMarketName('')
              }}>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="field">
              <label htmlFor="district">District</label>
              <select id="district" value={districtName} onChange={(e) => {
                setDistrictName(e.target.value)
                setMarketName('')
              }}>
                <option value="">Select district</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="field">
              <label htmlFor="priceDate">Analysis Date</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="priceDate"
                  type="date"
                  value={priceDate}
                  onChange={(e) => setPriceDate(e.target.value)}
                  style={{ paddingLeft: 38 }}
                />
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                  <Calendar size={16} />
                </span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="market">Mandi (Market) Name</label>
              <div style={{ position: 'relative' }}>
                <select id="market" value={marketName} onChange={(e) => setMarketName(e.target.value)} style={{ paddingLeft: 38 }}>
                  <option value="">Select market</option>
                  {markets.map(m => <option key={m} value={m}>{m}</option>)}
                  <option value="Other">Other (Type manually)</option>
                </select>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                  <TrendingUp size={16} />
                </span>
              </div>
              {marketName === 'Other' && (
                  <input 
                    style={{ marginTop: 8 }} 
                    placeholder="Enter Mandi Name" 
                    onChange={(e) => setMarketName(e.target.value)}
                  />
              )}
            </div>

            <div className="field">
              <label htmlFor="commodity">Commodity</label>
              <div style={{ position: 'relative' }}>
                <select id="commodity" value={commodity} onChange={(e) => setCommodity(e.target.value)} style={{ paddingLeft: 38 }}>
                  <option value="">Select crop</option>
                  {CROPS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                  <ShoppingBag size={16} />
                </span>
              </div>
            </div>

            <div className="field">
              <label htmlFor="variety">Variety</label>
              <div style={{ position: 'relative' }}>
                <select id="variety" value={variety} onChange={(e) => setVariety(e.target.value)} style={{ paddingLeft: 38 }}>
                  <option value="Other">Other / General</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Local">Local</option>
                  <option value="Desi">Desi</option>
                  <option value="Seed">Seed</option>
                </select>
                <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }}>
                  <Layers size={16} />
                </span>
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10, marginTop: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
               <Info size={16} style={{ color: '#64748b', flexShrink: 0 }} />
               <p style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                 Prices, arrival quantity, and market fees will be calculated as outputs based on current dataset trends.
               </p>
            </div>

            <div style={{ gridColumn: '1 / -1', display: 'grid', gap: 10, marginTop: 12 }}>
              {error ? <div className="error">{error}</div> : null}
              <div className="actions">
                <button className="btn btn-primary" type="submit" disabled={loading}>
                  Run Dataset Analysis
                </button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </>
  )
}
