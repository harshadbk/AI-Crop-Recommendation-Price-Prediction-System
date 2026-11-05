import { apiClient, getToken } from '../api/client.js'

// The browser copy is always kept (works for guests and when the DB is offline).
// When logged in, entries are also saved to MongoDB through the backend.
const HISTORY_KEY = 'cropAi:history'
const SYNCED_KEY = 'cropAi:historySynced'

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

function markSynced(ids) {
  const synced = new Set(safeJsonParse(localStorage.getItem(SYNCED_KEY), []))
  ids.forEach((id) => synced.add(id))
  localStorage.setItem(SYNCED_KEY, JSON.stringify(Array.from(synced).slice(-500)))
}

export function appendHistory(entry) {
  const items = readHistory()
  const id = entry?.id || `h_${Date.now()}_${Math.random().toString(16).slice(2)}`
  const saved = { ...entry, id, createdAt: entry?.createdAt || new Date().toISOString() }
  writeHistory([saved, ...items].slice(0, 200))

  if (getToken()) {
    apiClient
      .post('/api/history', saved)
      .then(() => markSynced([id]))
      .catch(() => {}) // stays in the browser; synced on next login
  }
  return id
}

/** Load history: from MongoDB when logged in, otherwise from this browser. */
export async function fetchHistory(params = {}) {
  if (!getToken()) return { items: readHistory(), source: 'local' }
  try {
    const { data } = await apiClient.get('/api/history', { params: { limit: 200, ...params } })
    return { items: data.items || [], source: 'server' }
  } catch {
    return { items: readHistory(), source: 'local' }
  }
}

/** Upload browser entries that were never saved to the server. */
export async function syncLocalHistory() {
  if (!getToken()) return 0
  const synced = new Set(safeJsonParse(localStorage.getItem(SYNCED_KEY), []))
  const pending = readHistory().filter((it) => it?.id && !synced.has(it.id))
  if (!pending.length) return 0
  const { data } = await apiClient.post('/api/history/sync', { items: pending })
  markSynced(pending.map((it) => it.id))
  return data?.synced || 0
}

export async function deleteHistoryEntry(id) {
  writeHistory(readHistory().filter((it) => it.id !== id))
  if (getToken()) await apiClient.delete(`/api/history/${encodeURIComponent(id)}`).catch(() => {})
}

export async function clearHistory() {
  writeHistory([])
  if (getToken()) await apiClient.delete('/api/history').catch(() => {})
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
