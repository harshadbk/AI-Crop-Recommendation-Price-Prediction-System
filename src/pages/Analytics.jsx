import React, { useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { Map, Layers, Database, Search, TrendingUp } from 'lucide-react'
import { Card } from '../components/Card.jsx'
import { SpinnerOverlay } from '../components/SpinnerOverlay.jsx'
import { fetchCropHeatMap } from '../api/prediction.js'
import { STATES, DISTRICTS_BY_STATE } from '../constants/options.js'

export function AnalyticsPage() {
  const [stateName, setStateName] = useState('Maharashtra')
  const [districtName, setDistrictName] = useState('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState([])
  const [error, setError] = useState('')

  const districts = useMemo(() => DISTRICTS_BY_STATE[stateName] || [], [stateName])

  async function handleSearch(e) {
    if (e) e.preventDefault()
    if (!districtName) return setError('Please select a district')
    
    setLoading(true)
    setError('')
    try {
      const resp = await fetchCropHeatMap({ state: stateName, district: districtName, market: '', commodity: '' })
      setData(resp.data || [])
    } catch (err) {
      setError('Failed to fetch analytics data.')
    } finally {
      setLoading(false)
    }
  }

  // Transform data for the chart: grouping by subRegion
  const chartData = useMemo(() => {
    const map = {}
    data.forEach(item => {
      if (!map[item.subRegion]) map[item.subRegion] = { subRegion: item.subRegion }
      map[item.subRegion][item.cropName] = item.intensity
    })
    return Object.values(map)
  }, [data])

  // Get unique crop names for bar stacks/legends
  const uniqueCrops = useMemo(() => {
    const crops = new Set()
    data.forEach(item => crops.add(item.cropName))
    return Array.from(crops)
  }, [data])

  // Calculate the dominant crop across the district
  const dominantCropInfo = useMemo(() => {
    if (!data.length) return { crop: 'N/A', count: 0 }
    const totals = {}
    data.forEach(d => {
      totals[d.cropName] = (totals[d.cropName] || 0) + (d.intensity || 0)
    })
    let top = { crop: 'N/A', count: 0 }
    for (const [c, val] of Object.entries(totals)) {
      if (val > top.count) top = { crop: c, count: val }
    }
    return top
  }, [data])

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#6366f1', '#ec4899', '#0ea5e9']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backlogFilter: 'blur(10px)', padding: 16, borderRadius: 12, color: 'white', maxWidth: 280, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8', marginBottom: 8 }}>{label}</div>
          {payload.map((entry, index) => {
            // Find underlying data from original set
            const origData = data.find(d => d.subRegion === label && d.cropName === entry.dataKey)
            if (!origData) return null
            return (
              <div key={index} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: entry.color, fontSize: 15 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }}></div>
                  {entry.dataKey}
                </div>
                <div style={{ fontSize: 13, marginTop: 4, color: '#f1f5f9' }}>{origData.production_label || `${entry.value} score`}</div>
                {origData.analysis_text && <div style={{ fontSize: 11, marginTop: 4, color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.4 }}>"{origData.analysis_text}"</div>}
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <div className="anim-fade-up">
      {loading && <SpinnerOverlay label="Aggregating dataset records..." />}
      
      <section className="hero" style={{ padding: '20px 0' }}>
        <div>
          <span className="badge">Crop Distribution Analytics</span>
          <h2>Regional Heat Map.</h2>
          <p className="sub">
            Visualize APMC-level crop intensity derived from market arrivals and local production records.
          </p>
        </div>
      </section>

      <div className="grid">
        <Card title="Analytics Filters">
          <form onSubmit={handleSearch} className="grid" style={{ gridTemplateColumns: 'minmax(200px, 1fr) minmax(200px, 1fr) auto', alignItems: 'end', gap: 16 }}>
            <div className="field">
              <label>State</label>
              <select value={stateName} onChange={(e) => {
                setStateName(e.target.value)
                setDistrictName('')
              }}>
                {STATES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>District</label>
              <select value={districtName} onChange={(e) => setDistrictName(e.target.value)}>
                <option value="">Select District</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button className="btn btn-primary" type="submit" style={{ height: 46 }}>
              <Search size={18} /> Visualize Data
            </button>
          </form>
          {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
        </Card>
      </div>

      {data.length > 0 ? (
        <div style={{ marginTop: 24 }}>
          <div className="grid">
             <Card title="APMC / Market Intensity Distibution">
                <div style={{ height: 450, marginTop: 20 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={chartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      barSize={32}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="subRegion" width={110} tick={{ fontSize: 12, fontWeight: 600, fill: '#334155' }} stroke="#94a3b8" />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: 20 }} />
                      {uniqueCrops.map((crop, index) => (
                        <Bar 
                          key={crop} 
                          dataKey={crop} 
                          stackId="a" 
                          fill={COLORS[index % COLORS.length]} 
                          radius={[0, 8, 8, 0]} 
                          animationDuration={1500}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </Card>

             <Card title="Quick Insights">
                <div className="grid-3" style={{ gap: 12 }}>
                  <div className="kpi">
                     <div className="muted"><Map size={14} /> Sub-Regions</div>
                     <div className="value">{chartData.length}</div>
                     <div className="hint">Mandi/Taluka Proxies</div>
                  </div>
                  <div className="kpi">
                     <div className="muted"><Layers size={14} /> Total Crops</div>
                     <div className="value">{uniqueCrops.length}</div>
                     <div className="hint">Identified varieties</div>
                  </div>
                  <div className="kpi">
                     <div className="muted"><TrendingUp size={14} /> Dominant Cash Crop</div>
                     <div className="value" style={{ color: '#10b981' }}>{dominantCropInfo.crop}</div>
                     <div className="hint">Highest district volume</div>
                  </div>
                </div>
                <div style={{ marginTop: 20, padding: 16, background: '#f8fafc', borderRadius: 16, border: '1px solid #e2e8f0' }}>
                   <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b', marginBottom: 8 }}>Geographical Summary & Market Production</div>
                   <div style={{ display: 'grid', gap: 10, maxHeight: 200, overflowY: 'auto' }}>
                     {data.slice(0, 5).map((d, i) => (
                        <div key={i} style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, background: 'white', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                           <strong style={{ color: '#0f172a' }}>{d.subRegion} ({d.cropName}):</strong> {d.production_label || d.intensity + ' recorded signals'}. {d.analysis_text && <span>{d.analysis_text}</span>}
                        </div>
                     ))}
                   </div>
                </div>
             </Card>
          </div>
        </div>
      ) : !loading && (
        <div style={{ textAlign: 'center', marginTop: 80, opacity: 0.5 }}>
           <img src={illustrationMap} alt="" style={{ width: 120, filter: 'grayscale(1)' }} />
           <p className="muted">Select a district to generate the intensity heat map.</p>
        </div>
      )}
    </div>
  )
}

const illustrationMap = 'https://cdn-icons-png.flaticon.com/512/814/814513.png'
