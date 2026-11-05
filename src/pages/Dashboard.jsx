import React, { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertTriangle, CalendarCheck, CloudSun, Droplets, FlaskConical, Leaf, MapPin, RefreshCw, Sprout, Store, TrendingUp, Wind,
} from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { RiskBadge } from '../components/RiskBadge.jsx'
import { TrendChart } from '../components/TrendChart.jsx'
import { LiveMarketCard } from '../components/LiveMarketCard.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { getDashboard } from '../api/dashboard.js'
import { errorMessage } from '../api/client.js'
import { appendHistory } from '../utils/historyStore.js'

const INR = (v) => (v || v === 0 ? `₹${Math.round(v).toLocaleString('en-IN')}` : '—')
const SOURCE_LABEL = { N: 'Nitrogen', P: 'Phosphorus', K: 'Potassium', ph: 'pH', temperature: 'Temperature', humidity: 'Humidity', rainfall: 'Rainfall' }

function forecastSeries(outlook) {
  return [
    ...(outlook.history || []).slice(-6).map((h) => ({ label: h.month, price: h.price })),
    ...(outlook.points || []).map((p) => ({ label: `${p.month} (f)`, price: p.price })),
  ]
}

/** "My Farm": everything for the farmer's own district, crops and soil - no form to fill. */
export function DashboardPage() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(async (refresh = false) => {
    setLoading(true)
    setError('')
    try {
      setData(await getDashboard({ refresh }))
    } catch (err) {
      setError(errorMessage(err, 'Could not load your farm dashboard.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user?.districtName) load()
    else setLoading(false)
  }, [load, user?.districtName])

  if (!user?.districtName) {
    return (
      <Card title="Complete your farm profile">
        <p className="muted">Tell us about your farm once, and your weather, crop advice and mandi prices will appear here automatically.</p>
        <Link className="btn btn-primary" to="/profile">Add farm details</Link>
      </Card>
    )
  }

  const rec = data?.recommendation
  const weather = data?.weather
  const mandi = data?.mandi
  const farmer = data?.farmer

  function openFullReport() {
    const input = {
      stateName: farmer.state, districtName: farmer.district, soilType: farmer.soil_type,
      waterSource: farmer.water_source, irrigationType: farmer.irrigation, budget: farmer.budget,
      landSize: farmer.land_acres, location: `${farmer.district}, ${farmer.state}`, monthName: data.season.month,
    }
    const packed = { kind: 'crop', input, result: rec, generatedAt: data.generated_at }
    sessionStorage.setItem('cropAi:lastResult', JSON.stringify(packed))
    appendHistory(packed)
    nav('/result', { state: packed })
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="page-head">
        <div>
          <h2 style={{ margin: 0 }}>Namaste, {user.name} 🌾</h2>
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <MapPin size={14} /> {user.talukaName ? `${user.talukaName}, ` : ''}{user.districtName}, {user.stateName}
            {data ? <> · {data.season.label} season · {data.season.month}</> : null}
          </div>
        </div>
        <div className="page-head-actions">
          {!user.profileComplete ? <Link className="btn btn-ghost" to="/profile">Complete profile</Link> : <Link className="btn btn-ghost" to="/profile">Edit farm</Link>}
          <button className="btn btn-primary" type="button" onClick={() => load(true)} disabled={loading}>
            <RefreshCw size={16} /> {loading ? 'Updating...' : 'Refresh live data'}
          </button>
        </div>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {loading && !data ? <Card title="Preparing your farm report"><p className="muted">Fetching live weather, mandi prices and running the ML models for your farm...</p></Card> : null}

      {data ? (
        <>
          {/* Weather + actions */}
          <div className="grid">
            <Card title={<span><CloudSun size={16} /> Live weather · {weather?.location?.district || user.districtName}</span>}
              right={weather ? <span className="pill">{new Date(weather.fetched_at).toLocaleTimeString()}</span> : null}>
              {weather ? (
                <>
                  <div className="grid-3">
                    <div className="kpi"><div className="muted">Now</div><div className="value">{weather.current.temp}°C</div><div className="hint">{weather.current.condition}</div></div>
                    <div className="kpi"><div className="muted"><Droplets size={12} /> Humidity</div><div className="value">{weather.current.humidity}%</div><div className="hint">Rain next {weather.outlook.days} days: {weather.outlook.total_rain_mm} mm</div></div>
                    <div className="kpi"><div className="muted"><Wind size={12} /> Wind</div><div className="value">{weather.current.wind_ms} m/s</div><div className="hint">{weather.outlook.temp_min}–{weather.outlook.temp_max}°C range</div></div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginTop: 12 }}>
                    {weather.daily.map((d) => (
                      <div key={d.date} className="pill" style={{ flexDirection: 'column', borderRadius: 12, minWidth: 92, gap: 2 }}>
                        <strong style={{ fontSize: 12 }}>{d.label}</strong>
                        <span style={{ fontSize: 12 }}>{d.temp_min}–{d.temp_max}°C</span>
                        <span className="hint">{d.rain_chance_pct}% rain</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <p className="muted">Live weather is unavailable right now.</p>}
            </Card>

            <Card title={<span><AlertTriangle size={16} /> This week on your farm</span>}>
              {data.weather_actions.length ? (
                <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 6 }}>
                  {data.weather_actions.map((a) => <li key={a} style={{ fontSize: 14 }}>{a}</li>)}
                </ul>
              ) : <p className="muted">No weather alerts for your district this week.</p>}
            </Card>
          </div>

          {/* Monthly tasks for my crops */}
          <Card title={<span><CalendarCheck size={16} /> {data.season.month} tasks for your crops</span>}>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
              {data.activities.map((a) => (
                <div key={a.key} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <strong><Leaf size={14} /> {a.crop}</strong>
                    <span className="pill" style={{ padding: '4px 8px', fontSize: 12 }}>{a.stage_label}</span>
                  </div>
                  <div className="hint" style={{ marginBottom: 6 }}>
                    {a.season}{a.sow_months ? ` · sow ${a.sow_months.join('/')} · harvest ${a.harvest_months.join('/')}` : ''}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: 'grid', gap: 4 }}>
                    {a.tasks.map((t) => <li key={t} style={{ fontSize: 13 }}>{t}</li>)}
                  </ul>
                </div>
              ))}
              {!data.activities.length ? <p className="muted">Add the crops you grow in your profile to see monthly tasks.</p> : null}
            </div>
          </Card>

          {/* Recommendation */}
          <div className="grid">
            <Card title={<span><Sprout size={16} /> Best crops for your farm now</span>}
              right={<RiskBadge risk={rec?.risk?.level} />}>
              <div style={{ display: 'grid', gap: 10 }}>
                {(rec?.recommendedCrops || []).map((r, i) => (
                  <div key={r.crop}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong>{i + 1}. {r.crop}</strong>
                      <span className="muted">{r.probability}% · {r.risk} risk</span>
                    </div>
                    <div className="progress" style={{ height: 6 }}><div style={{ width: `${r.probability}%` }} /></div>
                    <div className="hint">
                      {r.predicted_yield_q_ha ? `Yield ~${r.predicted_yield_q_ha} q/ha` : ''}
                      {r.expected_farm_revenue ? ` · Revenue on your ${farmer.land_acres} acres ~${INR(r.expected_farm_revenue)}` : ''}
                    </div>
                    {r.cautions?.length ? <div style={{ fontSize: 12, color: 'var(--warning)' }}>⚠ {r.cautions.join('; ')}</div> : null}
                  </div>
                ))}
              </div>
              <div className="actions" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" type="button" onClick={openFullReport}>Open full report</button>
              </div>
            </Card>

            <Card title={<span><FlaskConical size={16} /> Soil & climate model (NPK)</span>}>
              {rec?.soilModel ? (
                <>
                  <p className="hint" style={{ marginTop: 0 }}>
                    Random Forest trained on the Crop Recommendation dataset. Best soil match:
                    {' '}<strong>{rec.soilModel.crops.slice(0, 3).map((c) => `${c.crop} (${c.probability}%)`).join(', ')}</strong>
                  </p>
                  <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                    <tbody>
                      {Object.entries(rec.soilModel.inputs).map(([k, v]) => (
                        <tr key={k} style={{ borderTop: '1px solid var(--border)' }}>
                          <td style={{ padding: '4px 0' }}>{SOURCE_LABEL[k] || k}</td>
                          <td><strong>{v}</strong></td>
                          <td className="hint">{rec.soilModel.input_sources[k]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {!rec.soilModel.soil_test_used ? (
                    <p className="hint">Tip: add your Soil Health Card values in <Link className="link" to="/profile">your profile</Link> for a more accurate match.</p>
                  ) : null}
                </>
              ) : <p className="muted">Soil model is not trained yet.</p>}
            </Card>
          </div>

          {/* Mandi */}
          <Card title={<span><Store size={16} /> Mandi prices in {user.districtName}</span>}
            right={<span className={`pill ${mandi.is_live ? 'pill-success' : ''}`}>{mandi.source}{mandi.as_of ? ` · ${mandi.as_of}` : ''}</span>}>
            {mandi.records.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 560 }}>
                  <thead>
                    <tr style={{ textAlign: 'left' }}>
                      <th>Commodity</th><th>Market</th><th>District</th><th>Variety</th><th>Min</th><th>Max</th><th>Modal</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mandi.records.slice(0, 40).map((r, i) => (
                      <tr key={i} style={{ borderTop: '1px solid var(--border)', background: r.is_my_crop ? '#f0fdf4' : undefined }}>
                        <td style={{ padding: '6px 4px' }}>{r.is_my_crop ? '★ ' : ''}{r.commodity}</td>
                        <td>{r.market}</td>
                        <td>{r.district}{r.in_my_district ? '' : ' (nearby)'}</td>
                        <td>{r.variety}</td>
                        <td>{INR(r.min_price)}</td><td>{INR(r.max_price)}</td><td><strong>{INR(r.modal_price)}</strong></td>
                        <td>{r.arrival_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="hint">Prices per quintal. ★ = crops you grow. (nearby) = best other mandis in your state when your crop is not traded in your district.</p>
              </div>
            ) : <p className="muted">No mandi records found for your district yet.</p>}
          </Card>

          {/* Price outlook */}
          {data.price_outlooks.length ? (
            <div className="grid">
              {data.price_outlooks.filter((o) => o.live).map((o) => (
                <LiveMarketCard key={o.crop} live={o} compact />
              ))}
              {data.price_outlooks.filter((o) => !o.live).map(({ crop, monthly: o }) => (
                <Card key={crop} title={<span><TrendingUp size={16} /> {crop} monthly outlook (dataset)</span>}
                  right={<span className="pill">{o.confidence} confidence</span>}>
                  <div className="grid-3" style={{ marginBottom: 8 }}>
                    <div className="kpi"><div className="muted">Last actual</div><div className="value" style={{ fontSize: 16 }}>{INR(o.last_actual_price)}</div><div className="hint">{o.last_actual_month}</div></div>
                    <div className="kpi"><div className="muted">Next month</div><div className="value" style={{ fontSize: 16 }}>{INR(o.next_month_price)}</div><div className="hint">{o.change_pct > 0 ? '+' : ''}{o.change_pct}%</div></div>
                    <div className="kpi"><div className="muted">Data level</div><div className="value" style={{ fontSize: 16, textTransform: 'capitalize' }}>{o.level}</div><div className="hint">accuracy {o.accuracy_pct ?? '—'}%</div></div>
                  </div>
                  <TrendChart data={forecastSeries(o)} height={180} compact />
                </Card>
              ))}
            </div>
          ) : null}

          <p className="hint" style={{ textAlign: 'center' }}>
            Data: {data.sources.weather} · {data.sources.mandi} · {data.sources.models}
            {data.cached ? ' · cached (press Refresh for the latest)' : ''}
          </p>
        </>
      ) : null}
    </div>
  )
}
