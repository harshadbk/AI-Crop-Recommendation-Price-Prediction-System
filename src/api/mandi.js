import { apiClient } from './client.js'

/** Live dropdown data from the Mandi Prices API: states, districts, mandis per district, commodities. */
export async function getMandiOptions(state) {
  const res = await apiClient.get('/api/mandi/options', { params: { state }, timeout: 45000 })
  return res.data
}

/** Live analysis of one commodity: snapshot, daily history, ensemble forecast, advice. */
export async function getMandiAnalysis(params) {
  const res = await apiClient.get('/api/mandi/analysis', { params, timeout: 60000 })
  return res.data
}

// Old district names -> names used in the latest Agmarknet data
export const DISTRICT_ALIASES = {
  Ahmednagar: 'Ahilyanagar',
  Aurangabad: 'Chattrapati Sambhajinagar',
  Osmanabad: 'Dharashiv',
  Amravati: 'Amarawati',
  Gondia: 'Gondiya',
}
