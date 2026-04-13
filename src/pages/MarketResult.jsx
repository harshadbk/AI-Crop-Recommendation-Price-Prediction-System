import React, { useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  MoveLeft, 
  TrendingUp, 
  ShieldCheck, 
  BarChart3, 
  MapPin, 
  Calendar,
  AlertCircle,
  Package,
  ArrowRight
} from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { TrendChart } from '../components/TrendChart.jsx'

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

export function MarketResultPage() {
  const nav = useNavigate()
  const loc = useLocation()

  const packed = loc.state || readSession()
  const data = packed?.result?.pricePrediction || null
  const analysis = packed?.result?.analysis || null
  const input = packed?.input || {}

  if (!data) {
    return (
      <Card title="No Market Data">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <AlertCircle size={48} style={{ color: '#94a3b8', marginBottom: 16 }} />
          <p className="muted">We couldn't find details for this market. Try a different region.</p>
          <button className="btn btn-primary" onClick={() => nav('/market-prediction')} style={{ marginTop: 20 }}>
            Back to Search
          </button>
        </div>
      </Card>
    )
  }

  return (
    <div className="anim-fade-up">
      <div className="actions" style={{ justifyContent: 'space-between', marginBottom: 20 }}>
        <Link className="btn btn-ghost" to="/market-prediction">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <MoveLeft size={16} /> New Market Search
          </span>
        </Link>
        <div className="pill pill-success">
          <ShieldCheck size={14} /> Verified Mandi Record
        </div>
      </div>

      <div className="grid">
        {/* Main Price Display */}
        <Card title="Market Day Summary">
            <div style={{ 
                background: 'linear-gradient(135deg, #1e293b, #334155)', 
                padding: '30px', 
                borderRadius: '24px', 
                color: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div className="muted" style={{ color: '#94a3b8', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                            Modal Price
                        </div>
                        <div style={{ fontSize: 52, fontWeight: 900, color: '#4ade80', margin: '8px 0' }}>
                            {formatINR(data.modalPrice)}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div className="pill" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff' }}>
                            {data.commodity}
                        </div>
                        <div style={{ fontSize: 13, color: '#94a3b8', marginTop: 8 }}>
                            {data.variety} • {data.grade}
                        </div>
                    </div>
                </div>

                <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: 20, 
                    marginTop: 30, 
                    paddingTop: 24, 
                    borderTop: '1px solid rgba(255,255,255,0.1)' 
                }}>
                    <div>
                        <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Daily Min</div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{formatINR(data.rangeMin)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#94a3b8', fontSize: 11, textTransform: 'uppercase' }}>Daily Max</div>
                        <div style={{ fontSize: 20, fontWeight: 700 }}>{formatINR(data.rangeMax)}</div>
                    </div>
                </div>
            </div>
        </Card>

        {/* Market Metadata */}
        <Card title="Market Context">
            <div className="grid-3" style={{ gap: 12 }}>
                <div className="kpi">
                    <div className="muted"><MapPin size={12} /> Mandi</div>
                    <div className="value" style={{ fontSize: 15 }}>{input.market || 'Local APMC'}</div>
                </div>
                <div className="kpi">
                    <div className="muted"><Calendar size={12} /> Arrival Date</div>
                    <div className="value" style={{ fontSize: 15 }}>{data.arrivalDate || 'Today'}</div>
                </div>
                <div className="kpi">
                    <div className="muted"><Package size={12} /> Unit</div>
                    <div className="value" style={{ fontSize: 15 }}>{data.unit || 'Quintal'}</div>
                </div>
            </div>

            <div style={{ marginTop: 20, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 16, borderRadius: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#166534', fontWeight: 700 }}>
                    <BarChart3 size={18} /> {analysis?.sentiment || 'Market Trend Status'}
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#15803d' }}>
                    {analysis?.prediction_insight || `The price is currently stable. Based on arrival records, there is a moderate supply inflow.`}
                </p>
                {analysis?.analysis_bullets && (
                    <ul style={{ marginTop: 12, paddingLeft: 18, listStyleType: 'disc', color: '#15803d', fontSize: 12 }}>
                        {analysis.analysis_bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                )}

                {analysis?.fallback_suggestions && analysis.fallback_suggestions.length > 0 && (
                    <div style={{ marginTop: 16, borderTop: '1px dashed #bbf7d0', paddingTop: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#166534', marginBottom: 6 }}>AI ALTERNATIVE SUGGESTIONS:</div>
                        {analysis.fallback_suggestions.map((s, i) => (
                            <div key={i} className="pill" style={{ fontSize: 11, margin: '4px 4px 0 0', display: 'inline-flex' }}>{s}</div>
                        ))}
                    </div>
                )}
            </div>
        </Card>
      </div>

      <div style={{ marginTop: 24 }}>
          <Card title="Regional Comparison">
              <p className="muted" style={{ marginBottom: 20 }}>
                  This chart shows historically how {data.commodity} prices fluctuate in {input.state} during this month.
              </p>
              <div style={{ height: 300 }}>
                  <TrendChart data={packed?.result?.marketTrend?.series || []} />
              </div>
          </Card>
      </div>
      
      <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button className="btn btn-ghost" onClick={() => nav('/chat')}>
              Ask Crop AI for deep analysis <ArrowRight size={16} />
          </button>
      </div>
    </div>
  )
}
