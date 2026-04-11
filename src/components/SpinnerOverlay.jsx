import React from 'react'

export function SpinnerOverlay({ label = 'Processing...' }) {
  return (
    <div className="spinner-overlay" role="status" aria-live="polite" aria-label={label}>
      <div style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
        <div className="spinner" />
        <div style={{ color: 'white', fontWeight: 700 }}>{label}</div>
      </div>
    </div>
  )
}

