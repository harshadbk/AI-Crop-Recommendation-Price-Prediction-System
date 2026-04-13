import { MONTHS } from '../constants/options.js'

export function monthIndexFromName(monthName) {
  const idx = MONTHS.findIndex((m) => m.toLowerCase() === (monthName || '').toLowerCase())
  return idx >= 0 ? idx : new Date().getMonth()
}

export function seasonFromMonth(monthName) {
  const i = monthIndexFromName(monthName)
  // India-friendly rough mapping
  if (i >= 5 && i <= 9) return 'Rainy'
  if (i >= 10 || i <= 2) return 'Winter'
  return 'Summer'
}

export function seasonKeyFromMonth(monthName) {
  const label = seasonFromMonth(monthName)
  if (label.toLowerCase().includes('rainy')) return 'rainy'
  if (label.toLowerCase().includes('winter')) return 'winter'
  return 'summer'
}

export function datasetSeasonFromMonth(monthName) {
  const key = seasonKeyFromMonth(monthName)
  if (key === 'rainy') return 'Rainy'
  if (key === 'winter') return 'Winter'
  return 'Summer'
}

export function monthNameFromDate(yyyyMmDd) {
  try {
    const d = new Date(yyyyMmDd)
    if (Number.isNaN(d.getTime())) return MONTHS[new Date().getMonth()]
    return MONTHS[d.getMonth()]
  } catch {
    return MONTHS[new Date().getMonth()]
  }
}
