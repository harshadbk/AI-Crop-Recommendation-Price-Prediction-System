import React, { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Leaf, 
  MoveLeft, 
  MapPin, 
  CircleDot,
  AlertCircle,
  Sparkles,
  BarChart3,
  LineChart
} from 'lucide-react'
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
  const val = Number(value)
  if (isNaN(val) || value === null || value === undefined) return '—'
  return `₹${Math.round(val).toLocaleString('en-IN')}`
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

    return { input: input || {}, result, recommended, desired, bullets, trendSeries, price, risk }
  }, [packed])

  const seasonKey = view?.input?.monthName ? seasonKeyFromMonth(view.input.monthName) : null
  const seasonIcon = seasonKey === 'kharif' ? iconKharif : seasonKey === 'rabi' ? iconRabi : iconZaid

  if (!view) {
    return (
      <Card title="No Data Found">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <AlertCircle size={48} style={{ color: '#94a3b8', marginBottom: 16 }} />
          <p className="muted">Please go back and submit the farm details form again.</p>
          <button className="btn btn-primary" onClick={() => nav('/')} style={{ marginTop: 20 }}>
            Go to Home
          </button>
        </div>
      </Card>
    )
  }

  const isRag = view.result.mode === 'live_rag'
  const headerMarket = view.input.marketName || view.input.location || 'Your Region'

  return (
    <>
      {/* Header Actions */}
      <div className="actions" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <Link className="btn btn-ghost" to="/">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <MoveLeft size={16} /> New Advisory Request
          </span>
        </Link>
        <div className="pill" style={{ background: '#fff', border: '1px solid #e2e8f0' }}>
          {seasonKey ? <img src={seasonIcon} alt="" width="18" height="18" style={{ display: 'block' }} /> : null}
          <span className="muted">Season:</span>&nbsp;<strong>{seasonKey?.toUpperCase()}</strong>
        </div>
      </div>

      <div className="grid">
        {/* Main Recommendation */}
        <Card 
          title="AI Crop Prediction"
          right={
            <span className={`pill ${isRag ? 'pill-success' : ''}`}>
              <Sparkles size={14} /> {isRag ? 'Deep RAG Analysis' : view.result.mode === 'ml_live_weather' ? 'ML + Live Weather' : 'AI Analysis'}
            </span>
          }
        >
          <div className="kpi" style={{ marginBottom: 10 }}>
            <p className="muted" style={{ fontSize: 13, marginBottom: 16 }}>
              Our AI analyzed {view.input.soilType} soil and historical yield trends in <strong>{view.input.districtName}</strong> to suggest these optimal crops:
            </p>
            
            <div style={{ display: 'grid', gap: 12 }}>
              {view.recommended.map((r, idx) => (
                <div key={r.crop} className="anim-fade-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '14px 18px', 
                    borderRadius: 16, 
                    background: idx === 0 ? 'linear-gradient(to right, #f0fdf4, #ffffff)' : '#fff',
                    border: idx === 0 ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                    boxShadow: idx === 0 ? '0 4px 12px rgba(34, 197, 94, 0.08)' : 'none'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ 
                        width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center',
                        background: idx === 0 ? 'linear-gradient(135deg, #15803d, #22c55e)' : '#f1f5f9',
                        color: idx === 0 ? 'white' : '#64748b'
                      }}>
                        <Leaf size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 17, color: '#1e293b' }}>{r.crop}</div>
                        <div className="muted" style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                           Probability {r.probability}% <CircleDot size={4} /> {r.risk} Risk
                        </div>
                        {(r.predicted_yield_q_ha || r.expected_farm_revenue) ? (
                          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                            {r.predicted_yield_q_ha ? `Yield ~${r.predicted_yield_q_ha} q/ha` : ''}
                            {r.expected_farm_revenue ? ` · Est. revenue ${formatINR(r.expected_farm_revenue)}` : ''}
                            {r.price?.source ? ` · Price: ${r.price.source}` : ''}
                          </div>
                        ) : null}
                        {r.cautions?.length ? (
                          <div style={{ fontSize: 11, color: '#b45309', marginTop: 2 }}>⚠ {r.cautions.join('; ')}</div>
                        ) : null}
                      </div>
                    </div>
                    <div style={{ width: 120 }}>
                      <div className="progress" style={{ height: 6, background: '#f1f5f9' }}>
                        <div style={{ width: `${r.probability}%`, background: idx === 0 ? '#22c55e' : '#94a3b8' }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Farm & Context Details */}
        <Card title="Advisory Parameters" right={<RiskBadge risk={view.risk} />}>
          <div className="grid-3" style={{ marginBottom: 16 }}>
            <div className="kpi">
              <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12}/> Location</div>
              <div className="value" style={{ fontSize: 15 }}>{view.input.districtName}</div>
              <div className="hint">{view.input.stateName}</div>
            </div>
            <div className="kpi">
              <div className="muted">Budget</div>
              <div className="value" style={{ fontSize: 15 }}>{formatINR(view.input.budget)}</div>
              <div className="hint">{view.input.landSize} Acres</div>
            </div>
            <div className="kpi">
              <div className="muted">Soil Type</div>
              <div className="value" style={{ fontSize: 15 }}>{view.input.soilType}</div>
              <div className="hint">{view.input.irrigationType} System</div>
            </div>
          </div>
          
          <div style={{ background: '#f8fafc', padding: 12, borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>AI Reasoning</div>
            <ul style={{ margin: 0, paddingLeft: 18, listStyleType: 'disc' }}>
              {view.bullets.map((b, i) => (
                <li key={i} style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>{b}</li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {view.result.soilModel ? (
        <div style={{ marginTop: 20 }}>
          <Card title="Soil & Climate Model (N-P-K, pH, weather)" right={<span className="pill">Random Forest · Crop Recommendation dataset</span>}>
            <p className="muted" style={{ marginTop: 0, fontSize: 13 }}>
              Best matches for your soil and current climate:{' '}
              <strong>{view.result.soilModel.crops.slice(0, 3).map((c) => `${c.crop} (${c.probability}%)`).join(', ')}</strong>
            </p>
            <div className="grid-3">
              {Object.entries(view.result.soilModel.inputs).map(([k, v]) => (
                <div key={k} className="kpi">
                  <div className="muted" style={{ textTransform: 'uppercase', fontSize: 11 }}>{k}</div>
                  <div className="value" style={{ fontSize: 15 }}>{v}</div>
                  <div className="hint">{view.result.soilModel.input_sources[k]}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}

      {view.result.weather ? (
        <div style={{ marginTop: 20 }}>
          <Card
            title={`Live Weather · ${view.result.weather.location?.district || view.input.districtName}`}
            right={<span className="pill">OpenWeather · {new Date(view.result.weather.fetched_at).toLocaleTimeString()}</span>}
          >
            <div className="grid-3" style={{ marginBottom: 12 }}>
              <div className="kpi">
                <div className="muted">Now</div>
                <div className="value" style={{ fontSize: 15 }}>{view.result.weather.current.temp}°C</div>
                <div className="hint">{view.result.weather.current.condition} · {view.result.weather.current.humidity}% RH</div>
              </div>
              <div className="kpi">
                <div className="muted">Next {view.result.weather.outlook.days} days</div>
                <div className="value" style={{ fontSize: 15 }}>{view.result.weather.outlook.temp_min}–{view.result.weather.outlook.temp_max}°C</div>
                <div className="hint">{view.result.weather.outlook.total_rain_mm} mm rain</div>
              </div>
              <div className="kpi">
                <div className="muted">Good spray days</div>
                <div className="value" style={{ fontSize: 15 }}>{view.result.weather.good_spray_days?.join(', ') || '—'}</div>
                <div className="hint">Low wind, low rain chance</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {view.result.weather.daily?.map((d) => (
                <div key={d.date} style={{ minWidth: 96, padding: 10, borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}>
                  <div style={{ fontWeight: 700 }}>{d.label}</div>
                  <div>{d.temp_min}–{d.temp_max}°C</div>
                  <div className="muted">{d.rain_mm} mm · {d.rain_chance_pct}%</div>
                </div>
              ))}
            </div>
            {view.result.weather.alerts?.length ? (
              <ul style={{ margin: '12px 0 0', paddingLeft: 18, color: '#b45309', fontSize: 13 }}>
                {view.result.weather.alerts.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            ) : null}
          </Card>
        </div>
      ) : null}

      <div className="grid" style={{ marginTop: 20 }}>
        {/* Price Prediction Card */}
        <Card 
          title="Projected Sales Price"
          right={
            <span className="pill">
              <BarChart3 size={14} /> {view.price.crop || 'Price Outlook'}
            </span>
          }
        >
          <div style={{ background: 'linear-gradient(135deg, #1e293b, #334155)', padding: 24, borderRadius: 20, color: 'white', marginBottom: 20 }}>
            <div className="muted" style={{ color: '#94a3b8', fontSize: 12 }}>PREDICTED MODAL PRICE</div>
            <div style={{ fontSize: 42, fontWeight: 900, margin: '4px 0', color: '#4ade80' }}>
              {formatINR(view.price.modalPrice || (view.price.rangeMin + view.price.rangeMax)/2)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>MIN RANGE</div>
                <div style={{ fontWeight: 700 }}>{formatINR(view.price.rangeMin)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#94a3b8', fontSize: 11 }}>MAX RANGE</div>
                <div style={{ fontWeight: 700 }}>{formatINR(view.price.rangeMax)}</div>
              </div>
            </div>
          </div>

          {view.price.arrivalQuantity && (
            <div className="grid-3">
              <div className="kpi">
                <div className="muted">Weekly Arrivals</div>
                <div className="value">{view.price.arrivalQuantity}</div>
                <div className="hint">{view.price.unit || 'Quintals'}</div>
              </div>
              <div className="kpi">
                <div className="muted">Trader Activity</div>
                <div className="value">{view.price.traderCount}</div>
                <div className="hint">Active Buyers</div>
              </div>
              <div className="kpi">
                <div className="muted">Market Fee</div>
                <div className="value">{view.price.marketFeePct}%</div>
                <div className="hint">Admin Charge</div>
              </div>
            </div>
          )}
        </Card>

        {/* Chart Card */}
        <Card 
          title={view.result.marketTrend?.live ? 'Live Market Trend' : 'Historical Market Trend'}
          right={
            <span className="pill">
              <LineChart size={14} /> Analytics
            </span>
          }
        >
          <p className="muted" style={{ marginBottom: 15, fontSize: 13 }}>
            {view.result.marketTrend?.note || <>Price trend for <strong>{headerMarket}</strong>.</>}
          </p>
          <div style={{ height: 240 }}>
             <TrendChart data={view.trendSeries} />
          </div>
        </Card>
      </div>
    </>
  )
}
