import { apiClient } from './client.js'
import { simulateRecommendation } from '../utils/mockEngine.js'

function apiMode() {
  // Default to static mock until ML/backend integration is ready.
  return String(import.meta.env.VITE_API_MODE || 'mock').toLowerCase()
}

export async function getRecommendation(payload) {
  if (apiMode() !== 'live') return simulateRecommendation(payload)

  try {
    const res = await apiClient.post('/api/recommendation', payload)
    if (!res?.data) throw new Error('No data found')
    return res.data
  } catch (err) {
    const isNetworkish = !err?.response || err?.code === 'ECONNABORTED'
    if (isNetworkish) return simulateRecommendation(payload)
    throw err
  }
}
