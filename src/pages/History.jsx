import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { RiskBadge } from '../components/RiskBadge.jsx'
import { TrendChart } from '../components/TrendChart.jsx'
import { clearHistory, fetchHistory, readHistory, toISODateString } from '../utils/historyStore.js'
import farm1 from '../assets/farm.jpg'

function formatDateTime(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso || '—'
  }
}

function cropFromEntry(entry) {
  return (
    entry?.input?.commodity ||
    entry?.input?.desiredCrop ||
    entry?.result?.pricePrediction?.crop ||
    entry?.result?.recommendedCrops?.[0]?.crop ||
    ''
  )
}

export function HistoryPage() {
  const [version, setVersion] = useState(0)
  const [items, setItems] = useState(() => readHistory())
  const [source, setSource] = useState('local')

  useEffect(() => {
    let active = true
    // Logged in: load from MongoDB (all devices). Guest/offline: this browser.
    fetchHistory().then((res) => {
      if (!active) return
      setItems(res.items)
      setSource(res.source)
    })
    return () => {
      active = false
    }
  }, [version])

  const [crop, setCrop] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const crops = useMemo(() => {
    const set = new Set()
    for (const it of items) {
      const c = cropFromEntry(it)
      if (c) set.add(c)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  const filtered = useMemo(() => {
    const from = fromDate ? new Date(fromDate) : null
    const to = toDate ? new Date(`${toDate}T23:59:59`) : null

    return items.filter((it) => {
      const matchCrop = crop ? cropFromEntry(it) === crop : true
      const stamp = it?.generatedAt || it?.createdAt
      const at = stamp ? new Date(stamp) : null
      const matchFrom = from && at ? at >= from : true
      const matchTo = to && at ? at <= to : true
      return matchCrop && matchFrom && matchTo
    })
  }, [items, crop, fromDate, toDate])

  async function onClear() {
    await clearHistory()
    setVersion((v) => v + 1)
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h2 style={{ margin: 0 }}>History Dashboard</h2>
          <p className="muted" style={{ margin: '6px 0 0 0' }}>
            {source === 'server' ? 'Past predictions saved to your account.' : 'Past predictions saved on this device.'}
          </p>
        </div>
        <div className="page-head-actions">
          <Link className="btn btn-ghost nav-btn" to="/chat">
            Open Chatbot
          </Link>
          <button className="btn btn-ghost nav-btn" type="button" onClick={onClear} disabled={!items.length}>
            Clear history
          </button>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 14, gridTemplateColumns: '1fr' }}>
        <Card title="Filters">
          <div className="grid">
            <div className="field">
              <label htmlFor="cropFilter">Filter by crop</label>
              <select id="cropFilter" value={crop} onChange={(e) => setCrop(e.target.value)}>
                <option value="">All crops</option>
                {crops.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="fromDate">From date</label>
              <input id="fromDate" type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="toDate">To date</label>
              <input id="toDate" type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <div className="field">
              <label>Quick</label>
              <div className="actions" style={{ justifyContent: 'flex-start' }}>
                <button className="btn btn-ghost" type="button" onClick={() => setFromDate(toISODateString(new Date()))}>
                  Today
                </button>
                <button
                  className="btn btn-ghost"
                  type="button"
                  onClick={() => {
                    setCrop('')
                    setFromDate('')
                    setToDate('')
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 14 }}>
        <Card title={`Saved Predictions (${filtered.length})`}>
          {!items.length ? (
            <div className="empty">
              <p className="muted" style={{ margin: 0 }}>
                No history yet. Go to Home and click “Get Recommendation”.
              </p>
              <div className="actions" style={{ justifyContent: 'flex-start', marginTop: 10 }}>
                <Link className="btn btn-primary" to="/">
                  Go to Home
                </Link>
              </div>
            </div>
          ) : filtered.length ? (
            <div className="history-list">
              {filtered.map((it) => {
                const rec = it?.result?.recommendedCrops?.[0] || null
                const cropName = cropFromEntry(it) || rec?.crop || '—'
                const risk = it?.result?.risk?.level || rec?.risk || 'Medium'
                const price = it?.result?.pricePrediction
                const trend = it?.result?.marketTrend?.series || []

                const mandi = it?.input?.marketName || '—'
                const place = [
                  it?.input?.districtName,
                  it?.input?.stateName,
                ]
                  .filter(Boolean)
                  .join(', ')

                return (
                  <div key={it.id} className="history-row">
                    <div className="history-row-left">
                      <div className="history-thumb" aria-hidden="true">
                        <img src={farm1} alt="" />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <div className="history-title">{cropName}</div>
                          <RiskBadge risk={risk} />
                          {rec?.probability ? (
                            <span className="pill">
                              <strong>{rec.probability}%</strong> suitability
                            </span>
                          ) : null}
                        </div>
                        <div className="muted" style={{ marginTop: 4 }}>
                          <strong>{mandi}</strong>
                          {place ? ` • ${place}` : ''}
                          {it?.input?.season ? ` • ${it.input.season}` : ''} • {formatDateTime(it?.generatedAt)}
                        </div>
                        {price?.rangeLabel ? (
                          <div className="muted" style={{ marginTop: 4 }}>
                            Expected price: <strong>{price.rangeLabel}</strong>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="history-row-right">
                      <div className="history-mini-chart">
                        <TrendChart data={trend} height={140} compact />
                      </div>
                      <div className="actions" style={{ justifyContent: 'flex-end', marginTop: 8 }}>
                        <Link className="btn btn-ghost nav-btn" to="/result" state={it}>
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty">
              <p className="muted" style={{ margin: 0 }}>
                No results match the current filters.
              </p>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
