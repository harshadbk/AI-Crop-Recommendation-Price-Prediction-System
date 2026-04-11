import { apiClient } from './client.js'
import { mockChatRespond } from '../utils/chatMock.js'

function mode() {
  // Default to mock until LLM integration is ready.
  return String(import.meta.env.VITE_CHAT_MODE || 'mock').toLowerCase()
}

export async function sendChatMessage({ message }) {
  if (mode() !== 'live') return mockChatRespond({ message })

  try {
    const res = await apiClient.post('/api/chat', { message })
    if (!res?.data) throw new Error('No data found')
    return res.data
  } catch (err) {
    const isNetworkish = !err?.response || err?.code === 'ECONNABORTED'
    if (isNetworkish) return mockChatRespond({ message })
    throw err
  }
}

