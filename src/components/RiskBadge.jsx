import React from 'react'

export function RiskBadge({ risk }) {
  const normalized = (risk || '').toLowerCase()
  const className =
    normalized === 'low'
      ? 'badge badge-low'
      : normalized === 'medium'
        ? 'badge badge-med'
        : 'badge badge-high'

  const label = normalized ? normalized[0].toUpperCase() + normalized.slice(1) : 'Unknown'
  return <span className={className}>{label} Risk</span>
}

