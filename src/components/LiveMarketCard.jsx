import React from 'react'
import { Activity, Store, TrendingUp } from 'lucide-react'
import { Card } from './Card.jsx'
import { TrendChart } from './TrendChart.jsx'

const INR = (v) => (v || v === 0 ? `₹${Math.round(v).toLocaleString('en-IN')}` : '—')

function chartFrom(live) {
  if (live.chart) return live.chart
  const hist = (live.series || []).slice(-21).map((p) => ({ label: p.label, price: p.price }))
  const fc = (live.forecast?.points || []).map((p) => ({ label: `${p.label} (f)`, price: p.price }))
  return [...hist, ...fc]
}

/** Live mandi analysis: price now, 7-day ensemble forecast, best mandis to sell, model accuracy. */
export function LiveMarketCard({ live, compact = false }) {
  if (!live) return null
  const fc = live.forecast
  const snap = live.snapshot
  const title = `${live.commodity} - live price & ${fc ? `${fc.horizon_days}-day forecast` : 'today'}`

  return (
    <Card
      title={<span><TrendingUp size={16} /> {title}</span>}
      right={<span className="pill pill-success">Live · {snap?.as_of || fc?.last_date || ''}</span>}
    >
      <div className="grid-3" style={{ marginBottom: 10 }}>
        <div className="kpi">
          <div className="muted">Latest ({live.market || 'state avg'})</div>
          <div className="value" style={{ fontSize: 18 }}>{INR(fc?.last_price ?? snap?.state_median)}</div>
          <div className="hint">per quintal</div>
        </div>
        <div className="kpi">
          <div className="muted">In {fc?.horizon_days || 7} market days</div>
          <div className="value" style={{ fontSize: 18 }}>{fc ? INR(fc.end_price) : '—'}</div>
          <div className="hint">{fc ? `${fc.change_pct > 0 ? '+' : ''}${fc.change_pct}% · range ${INR(fc.points.at(-1).low)}–${INR(fc.points.at(-1).high)}` : 'not enough history'}</div>
        </div>
        <div className="kpi">
          <div className="muted">State median today</div>
          <div className="value" style={{ fontSize: 18 }}>{INR(snap?.state_median)}</div>
          <div className="hint">{snap ? `${snap.reporting_markets} mandis · spread ${snap.spread_pct}%` : ''}</div>
        </div>
      </div>

      <TrendChart data={chartFrom(live)} height={compact ? 170 : 240} compact={compact} />

      {live.advice?.length ? (
        <ul style={{ margin: '10px 0 0', paddingLeft: 18, display: 'grid', gap: 4 }}>
          {live.advice.map((a) => <li key={a} style={{ fontSize: 13 }}>{a}</li>)}
        </ul>
      ) : null}

      {!compact && snap?.best_markets?.length ? (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontWeight: 800, marginBottom: 6 }}><Store size={14} /> Best mandis to sell today</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', minWidth: 460 }}>
              <thead><tr style={{ textAlign: 'left' }}><th>Mandi</th><th>District</th><th>Modal</th><th>Min–Max</th><th>Date</th></tr></thead>
              <tbody>
                {[...snap.best_markets, ...(snap.district_markets || []).filter((m) => !snap.best_markets.some((b) => b.market === m.market))].map((m) => (
                  <tr key={m.market} style={{ borderTop: '1px solid var(--border)', background: m.in_my_district ? '#f0fdf4' : undefined }}>
                    <td style={{ padding: '5px 4px' }}>{m.in_my_district ? '★ ' : ''}{m.market}</td>
                    <td>{m.district}</td>
                    <td><strong>{INR(m.modal_price)}</strong></td>
                    <td>{INR(m.min_price)}–{INR(m.max_price)}</td>
                    <td>{m.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="hint">★ = mandis in your district.</p>
        </div>
      ) : null}

      {fc && !compact ? (
        <div style={{ marginTop: 12, background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 12, padding: 10 }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}><Activity size={14} /> How the forecast was made</div>
          <div className="hint" style={{ marginBottom: 6 }}>
            Trained on {fc.training_days} days of {live.level === 'market' ? `${live.market} mandi` : 'state average'} prices.
            Tested on the last {fc.backtest_days} days it had not seen: error {fc.backtest_error_pct}% (no-change baseline {fc.naive_error_pct}%)
            {fc.direction_accuracy_pct !== null && fc.direction_accuracy_pct !== undefined ? `, up/down correct ${fc.direction_accuracy_pct}%` : ''}.
          </div>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead><tr style={{ textAlign: 'left' }}><th>Model</th><th>Test error</th><th>Weight</th></tr></thead>
            <tbody>
              {fc.models.map((m) => (
                <tr key={m.name} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '3px 0' }}>{m.name}</td><td>{m.backtest_error_pct}%</td><td>{m.weight_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </Card>
  )
}
