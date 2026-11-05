import { apiClient } from './client.js'

/** Personalised dashboard for the logged-in farmer (built from their saved profile). */
export async function getDashboard({ refresh = false } = {}) {
  const res = await apiClient.get('/api/dashboard', { params: refresh ? { refresh: true } : {}, timeout: 60000 })
  return res.data
}
