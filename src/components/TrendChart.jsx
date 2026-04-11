import React from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function formatINR(value) {
  if (typeof value !== 'number') return value
  return `₹${Math.round(value).toLocaleString('en-IN')}`
}

export function TrendChart({ data, height = 260, compact = false }) {
  if (!data || data.length === 0) return <p className="muted">No trend data found.</p>

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 10, left: compact ? 0 : 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.18)" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={formatINR}
            width={compact ? 0 : 78}
            hide={compact}
          />
          <Tooltip formatter={(v) => formatINR(v)} />
          <Line type="monotone" dataKey="price" stroke="#157f3d" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
