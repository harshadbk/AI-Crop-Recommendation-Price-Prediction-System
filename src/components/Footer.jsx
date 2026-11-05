import React from 'react'
import { Leaf, PhoneCall } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="brand-badge" aria-hidden="true">
            <Leaf size={18} />
          </div>
          <div>
            <div className="footer-title">Crop AI</div>
            <div className="footer-sub">Clean insights for better crop planning.</div>
          </div>
        </div>

        <div className="footer-links" aria-label="Footer links">
          <Link className="footer-link" to="/">
            Home
          </Link>
          <Link className="footer-link" to="/chat">
            Chatbot
          </Link>
          <Link className="footer-link" to="/history">
            History
          </Link>
        </div>

        <div className="footer-meta">
          <div className="footer-pill">
            <PhoneCall size={16} /> Support: +91-00000-00000
          </div>
          <div className="footer-copy">© {year} Crop AI</div>
        </div>
      </div>
    </footer>
  )
}
