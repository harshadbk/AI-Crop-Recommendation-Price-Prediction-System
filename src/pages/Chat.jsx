import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card.jsx'
import { SpinnerOverlay } from '../components/SpinnerOverlay.jsx'
import { sendChatMessage } from '../api/chat.js'
import illustration from '../assets/farm3.jpg'
import iconKharif from '../assets/icon-kharif.svg'
import iconRabi from '../assets/icon-rabi.svg'
import iconZaid from '../assets/icon-zaid.svg'

const CHAT_KEY = 'cropAi:chat'

function safeParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function readChat() {
  return safeParse(localStorage.getItem(CHAT_KEY), [])
}

function writeChat(items) {
  localStorage.setItem(CHAT_KEY, JSON.stringify(items || []))
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

function lastSeasonKey() {
  try {
    const raw = sessionStorage.getItem('cropAi:lastResult')
    const packed = raw ? JSON.parse(raw) : null
    const season = packed?.input?.season || ''
    const s = season.toLowerCase()
    if (s.includes('kharif')) return 'kharif'
    if (s.includes('rabi')) return 'rabi'
    return 'zaid'
  } catch {
    return 'zaid'
  }
}

export function ChatPage() {
  const [items, setItems] = useState(() => readChat())
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggested, setSuggested] = useState([])

  const listRef = useRef(null)

  const seasonIcon = useMemo(() => {
    const key = lastSeasonKey()
    return key === 'kharif' ? iconKharif : key === 'rabi' ? iconRabi : iconZaid
  }, [])

  useEffect(() => {
    writeChat(items)
    requestAnimationFrame(() => {
      const el = listRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [items])

  async function send(message) {
    const trimmed = String(message || '').trim()
    if (!trimmed) return

    setError('')
    setLoading(true)

    const next = [
      ...items,
      { id: makeId('u'), role: 'user', text: trimmed, ts: new Date().toISOString() },
    ]
    setItems(next)
    setText('')

    try {
      const res = await sendChatMessage({ message: trimmed })
      setItems((prev) => [
        ...prev,
        { id: makeId('a'), role: 'assistant', text: res?.reply || 'Sorry, I could not generate a reply.', ts: new Date().toISOString() },
      ])
      setSuggested(Array.isArray(res?.suggested) ? res.suggested.slice(0, 4) : [])
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Chat failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function onClear() {
    setItems([])
    setSuggested([])
    writeChat([])
  }

  return (
    <>
      {loading ? <SpinnerOverlay label="Thinking..." /> : null}

      <div className="page-head">
        <div>
          <h2 style={{ margin: 0 }}>AI Chatbot</h2>
          <p className="muted" style={{ margin: '6px 0 0 0' }}>
            Ask farming questions. Answers use static logic until LLM integration.
          </p>
        </div>
        <div className="page-head-actions">
          <Link className="btn btn-ghost nav-btn" to="/history">
            Open History
          </Link>
          <button className="btn btn-ghost nav-btn" type="button" onClick={onClear} disabled={!items.length}>
            Clear chat
          </button>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 14 }}>
        <Card title="Quick Questions" right={<span className="pill"><img src={seasonIcon} alt="" width="18" height="18" /> Your season</span>}>
          <div className="quick">
            {[
              'Which crop is best this season?',
              'How to increase yield?',
              'How to reduce risk?',
              'What is the expected price range?',
            ].map((q) => (
              <button key={q} type="button" className="chip" onClick={() => send(q)}>
                {q}
              </button>
            ))}
          </div>

          <div className="muted" style={{ marginTop: 12 }}>
            Tip: generate a recommendation from <Link className="link" to="/">Home</Link> to get more tailored answers.
          </div>

          <div className="chat-illustration" aria-hidden="true">
            <img src={illustration} alt="" />
          </div>
        </Card>

        <Card title="Chat">
          <div className="chat-shell">
            <div className="chat-list" ref={listRef}>
              {!items.length ? (
                <div className="chat-empty">
                  <div className="muted">No messages yet.</div>
                  <div className="muted" style={{ marginTop: 6 }}>
                    Ask something like: “Which crop is best this season?”
                  </div>
                </div>
              ) : (
                items.map((m) => (
                  <div key={m.id} className={`msg ${m.role === 'user' ? 'msg-user' : 'msg-ai'}`}>
                    <div className="bubble">
                      {String(m.text)
                        .split('\n')
                        .map((line, idx) => (
                          <div key={idx}>{line}</div>
                        ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            {error ? <div className="error" style={{ marginTop: 10 }}>{error}</div> : null}

            {suggested.length ? (
              <div className="suggested">
                {suggested.map((s) => (
                  <button key={s} type="button" className="chip chip-sm" onClick={() => send(s)}>
                    {s}
                  </button>
                ))}
              </div>
            ) : null}

            <form
              className="chat-input"
              onSubmit={(e) => {
                e.preventDefault()
                send(text)
              }}
            >
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type your question..."
                aria-label="Chat message"
              />
              <button className="btn btn-primary" type="submit" disabled={loading}>
                Send
              </button>
            </form>
          </div>
        </Card>
      </div>
    </>
  )
}

