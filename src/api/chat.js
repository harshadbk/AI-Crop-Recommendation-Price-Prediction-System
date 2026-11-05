import { apiClient } from './client.js'

export async function sendChatMessage({ message, history = [] }) {
  try {
    const res = await apiClient.post('/api/chat', { message, history })
    if (!res?.data) throw new Error('No data found')
    return res.data
  } catch (err) {
    console.error("Chat API Error:", err)
  }
}



export async function loadChatHistory() {
  try {
    const res = await apiClient.get('/api/chat/history')
    return Array.isArray(res?.data?.items) ? res.data.items : []
  } catch {
    return []
  }
}

export async function clearChatHistory() {
  try {
    await apiClient.delete('/api/chat/history')
  } catch {
    // browser copy is already cleared
  }
}
