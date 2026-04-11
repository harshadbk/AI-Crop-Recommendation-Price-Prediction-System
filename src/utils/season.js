import { MONTHS } from '../constants/options.js'

export function monthIndexFromName(monthName) {
  const idx = MONTHS.findIndex((m) => m.toLowerCase() === (monthName || '').toLowerCase())
  return idx >= 0 ? idx : new Date().getMonth()
}

export function seasonFromMonth(monthName) {
  const i = monthIndexFromName(monthName)
  // India-friendly rough mapping (adjustable later)
  if (i >= 5 && i <= 9) return 'Kharif (Monsoon)'
  if (i >= 10 || i <= 2) return 'Rabi (Winter)'
  return 'Zaid (Summer)'
}

export function seasonKeyFromMonth(monthName) {
  const label = seasonFromMonth(monthName)
  if (label.toLowerCase().includes('kharif')) return 'kharif'
  if (label.toLowerCase().includes('rabi')) return 'rabi'
  return 'zaid'
}
