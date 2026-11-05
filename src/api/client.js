import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const TOKEN_KEY = 'cropAi:token'

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // storage unavailable (private mode) - session lasts for this tab only
  }
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
})

// Send the login token with every request.
apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// If the backend says the token is invalid/expired, drop it and tell the app.
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && getToken()) {
      setToken('')
      window.dispatchEvent(new Event('cropAi:logout'))
    }
    return Promise.reject(err)
  },
)

export function errorMessage(err, fallback = 'Something went wrong.') {
  const detail = err?.response?.data?.detail
  if (Array.isArray(detail)) return detail.map((d) => d?.msg).filter(Boolean).join(', ') || fallback
  return detail || err?.message || fallback
}
