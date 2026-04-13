import { apiClient } from './client.js'

/**
 * Sends farm data to the Python backend for AI-driven crop and price prediction.
 * Uses Groq (Llama 3) for real-time analysis.
 */
export async function getRecommendation(payload) {
  try {
    const res = await apiClient.post('/api/crop-prediction', payload)
    
    if (!res?.data) {
      throw new Error('No specialized recommendation found in AI response.')
    }
    
    return res.data
  } catch (err) {
    const errMsg = err?.response?.data?.detail || err?.message || 'AI service is currently unavailable.'
    console.error('AI Prediction Error:', err)
    throw new Error(errMsg)
  }
}
