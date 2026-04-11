import React, { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Leaf, MoveLeft, TrendingUp } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { RiskBadge } from '../components/RiskBadge.jsx'
import { TrendChart } from '../components/TrendChart.jsx'
import iconKharif from '../assets/icon-kharif.svg'
import iconRabi from '../assets/icon-rabi.svg'
import iconZaid from '../assets/icon-zaid.svg'
import { seasonKeyFromMonth } from '../utils/season.js'

function readSession() {
  try {
    const raw = sessionStorage.getItem('cropAi:lastResult')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function formatINR(value) {
  if (typeof value !== 'number') return String(value ?? '—')
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export function ResultPage() {
  const nav = useNavigate()
  const loc = useLocation()

  const packed = loc.state || readSession()

  const view = useMemo(() => {
    if (!packed?.result) return null
    const { result, input } = packed
    const recommended = result.recommendedCrops || []
    const desired = result.desiredCropAssessment || null
    const bullets = result.explanation?.bullets || []
    const trendSeries = result.marketTrend?.series || []
    const price = result.pricePrediction || {}
    const risk = result.risk?.level || (recommended[0]?.risk ?? 'Medium')

    return { input, result, recommended, desired, bullets, trendSeries, price, risk }
  }, [packed])

  const seasonKey = view?.input?.monthName ? seasonKeyFromMonth(view.input.monthName) : null
  const seasonIcon = seasonKey === 'kharif' ? iconKharif : seasonKey === 'rabi' ? iconRabi : iconZaid

  if (!view) {
    return (
      <Card title="No data found">
        <p className="muted">Please go back and submit the form again.</p>
        <div className="actions" style={{ justifyContent: 'flex-start' }}>
          <button className="btn btn-primary" onClick={() => nav('/')}>
            Go to Home
          </button>
        </div>
      </Card>
    )
  }

  return (
    <>
      <div className="actions" style={{ justifyContent: 'space-between', marginBottom: 12 }}>
        <Link className="btn btn-ghost" to="/">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <MoveLeft size={16} /> New Recommendation
          </span>
        </Link>
        <div className="pill">
          {seasonKey ? <img src={seasonIcon} alt="" width="18" height="18" style={{ display: 'block' }} /> : null}
          <span className="muted">Location:</span>&nbsp;<strong>{view.input.location}</strong>
        </div>
      </div>

      <div className="grid">
        <Card
          title="🌾 Crop Suggestion"
          right={<span className="pill">{view.result.mode === 'mock' ? 'Demo mode' : 'Live mode'}</span>}
        >
          <div className="kpi" style={{ marginBottom: 10 }}>
            <div className="muted" style={{ fontWeight: 700 }}>
              Recommended Crop for You
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {view.recommended.slice(0, 2).map((r) => (
                <div
                  key={r.crop}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    padding: 12,
                    borderRadius: 14,
                    border: '1px solid rgba(217,234,223,0.9)',
                    background: 'rgba(244,251,246,0.6)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      aria-hidden="true"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        display: 'grid',
                        placeItems: 'center',
                        background: 'linear-gradient(135deg, #157f3d, #22c55e)',
                        color: 'white',
                      }}
                    >
                      <Leaf size={16} />
                    </span>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 16 }}>{r.crop}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        Suitability: {r.probability}% • {r.risk} risk
                      </div>
                    </div>
                  </div>
                  <div style={{ width: 140 }}>
                    <div className="progress" aria-label={`Suitability ${r.probability}%`}>
                      <div style={{ width: `${r.probability}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {view.desired ? (
            <div style={{ marginTop: 14 }}>
              <div className="muted" style={{ fontWeight: 800, marginBottom: 6 }}>
                Selected crop probability
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <div>
                  <div style={{ fontWeight: 900 }}>{view.desired.crop}</div>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Good fit chance: {view.desired.probability}% • {view.desired.risk} risk
                  </div>
                </div>
                <div style={{ width: 180 }}>
                  <div className="progress">
                    <div style={{ width: `${view.desired.probability}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </Card>

        <Card title="⚠️ Risk Indicator" right={<RiskBadge risk={view.risk} />}>
          <p className="muted" style={{ margin: 0 }}>
            Risk combines price volatility, season mismatch and skill-fit. Lower risk is more stable for planning.
          </p>
          <div className="grid-3" style={{ marginTop: 12 }}>
            <div className="kpi">
              <div className="muted">Season</div>
              <div className="value">{view.input.season}</div>
            </div>
            <div className="kpi">
              <div className="muted">Soil</div>
              <div className="value">{view.input.soilType}</div>
            </div>
            <div className="kpi">
              <div className="muted">Budget</div>
              <div className="value">{formatINR(view.input.budget)}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid" style={{ marginTop: 14 }}>
        <Card title="📊 Reason (AI Explanation)">
          {view.bullets.length ? (
            <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 8 }}>
              {view.bullets.map((b, idx) => (
                <li key={idx} className="muted">
                  {b}
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted" style={{ margin: 0 }}>
              No explanation available.
            </p>
          )}
        </Card>

        <Card
          title="💰 Price Prediction"
          right={
            <span className="pill">
              <TrendingUp size={16} /> {view.price.crop || '—'}
            </span>
          }
        >
          <div className="grid-3">
            <div className="kpi">
              <div className="muted">Min price</div>
              <div className="value">{formatINR(view.price.rangeMin)}</div>
            </div>
            <div className="kpi">
              <div className="muted">Max price</div>
              <div className="value">{formatINR(view.price.rangeMax)}</div>
            </div>
            <div className="kpi">
              <div className="muted">Range</div>
              <div className="value" style={{ fontSize: 16 }}>
                {view.price.rangeLabel || '—'}
              </div>
            </div>
          </div>
          <p className="muted" style={{ margin: '10px 0 0 0' }}>
            Range is estimated from demand vs supply pressure and recent trend movement.
          </p>
        </Card>
      </div>

      <div style={{ marginTop: 14 }}>
        <Card title="📈 Market Trend (Past Prices)">
          <p className="muted" style={{ margin: '0 0 10px 0' }}>
            Past price trend for the recommended crop (simple view).
          </p>
          <TrendChart data={view.trendSeries} />
        </Card>
      </div>
    </>
  )
}
