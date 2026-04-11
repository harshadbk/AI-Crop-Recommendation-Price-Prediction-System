import React from 'react'

export function Card({ title, right, children }) {
  return (
    <section className="card">
      {(title || right) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h3 style={{ margin: 0 }}>{title}</h3>
          {right}
        </div>
      )}
      <div style={{ marginTop: title || right ? 12 : 0 }}>{children}</div>
    </section>
  )
}

