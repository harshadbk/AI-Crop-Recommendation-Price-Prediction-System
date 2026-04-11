const HISTORY_KEY = 'cropAi:history'

function safeJsonParse(raw, fallback) {
  try {
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function readHistory() {
  return safeJsonParse(localStorage.getItem(HISTORY_KEY), [])
}

export function writeHistory(items) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items || []))
}

export function appendHistory(entry) {
  const items = readHistory()
  const id = entry?.id || `h_${Date.now()}_${Math.random().toString(16).slice(2)}`
  const next = [{ ...entry, id }, ...items].slice(0, 200)
  writeHistory(next)
  return id
}

export function clearHistory() {
  writeHistory([])
}

export function toISODateString(date) {
  try {
    const d = typeof date === 'string' ? new Date(date) : date
    if (!d || Number.isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

