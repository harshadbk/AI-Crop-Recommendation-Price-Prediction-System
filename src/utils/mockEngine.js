import { monthIndexFromName, seasonFromMonth } from './season.js'

function clamp01(n) {
  return Math.max(0, Math.min(1, n))
}

function seededNoise(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = (h ^ seed.charCodeAt(i)) * 16777619
  return ((h >>> 0) / 2 ** 32) % 1
}

function formatINR(n) {
  return `₹${Math.round(n).toLocaleString('en-IN')}`
}

const CROP_DATA = [
  {
    crop: 'Rice',
    soils: ['Alluvial', 'Loamy', 'Clay'],
    suitableMonths: [5, 6, 7, 8, 9],
    basePrice: 2200,
    minBudget: 45000,
    difficulty: 0.55,
    volatility: 0.55,
    pastCultivationShare: 0.72,
    demandIndex: 0.76,
    momentum: 0.2,
  },
  {
    crop: 'Wheat',
    soils: ['Alluvial', 'Loamy'],
    suitableMonths: [10, 11, 0, 1],
    basePrice: 2400,
    minBudget: 42000,
    difficulty: 0.4,
    volatility: 0.35,
    pastCultivationShare: 0.62,
    demandIndex: 0.7,
    momentum: 0.1,
  },
  {
    crop: 'Maize',
    soils: ['Loamy', 'Alluvial', 'Red'],
    suitableMonths: [5, 6, 7, 8, 9, 10],
    basePrice: 2000,
    minBudget: 35000,
    difficulty: 0.35,
    volatility: 0.4,
    pastCultivationShare: 0.48,
    demandIndex: 0.66,
    momentum: 0.15,
  },
  {
    crop: 'Cotton',
    soils: ['Black (Regur)', 'Red'],
    suitableMonths: [5, 6, 7, 8, 9],
    basePrice: 6400,
    minBudget: 65000,
    difficulty: 0.75,
    volatility: 0.7,
    pastCultivationShare: 0.41,
    demandIndex: 0.74,
    momentum: 0.18,
  },
  {
    crop: 'Soybean',
    soils: ['Black (Regur)', 'Loamy', 'Alluvial'],
    suitableMonths: [5, 6, 7, 8],
    basePrice: 4300,
    minBudget: 52000,
    difficulty: 0.55,
    volatility: 0.6,
    pastCultivationShare: 0.52,
    demandIndex: 0.72,
    momentum: 0.22,
  },
  {
    crop: 'Groundnut',
    soils: ['Sandy', 'Loamy', 'Red'],
    suitableMonths: [4, 5, 6, 7, 8],
    basePrice: 5200,
    minBudget: 56000,
    difficulty: 0.6,
    volatility: 0.65,
    pastCultivationShare: 0.33,
    demandIndex: 0.68,
    momentum: 0.12,
  },
  {
    crop: 'Chickpea (Chana)',
    soils: ['Black (Regur)', 'Alluvial', 'Loamy'],
    suitableMonths: [10, 11, 0],
    basePrice: 5400,
    minBudget: 40000,
    difficulty: 0.45,
    volatility: 0.5,
    pastCultivationShare: 0.28,
    demandIndex: 0.64,
    momentum: 0.16,
  },
  {
    crop: 'Onion',
    soils: ['Alluvial', 'Loamy', 'Silt'],
    suitableMonths: [8, 9, 10, 11, 0, 1],
    basePrice: 1600,
    minBudget: 50000,
    difficulty: 0.7,
    volatility: 0.85,
    pastCultivationShare: 0.22,
    demandIndex: 0.78,
    momentum: 0.25,
  },
  {
    crop: 'Tomato',
    soils: ['Loamy', 'Silt', 'Alluvial'],
    suitableMonths: [8, 9, 10, 11, 0, 1, 2],
    basePrice: 1400,
    minBudget: 48000,
    difficulty: 0.68,
    volatility: 0.8,
    pastCultivationShare: 0.19,
    demandIndex: 0.76,
    momentum: 0.2,
  },
]

function fitToBudget(budget, minBudget) {
  if (!budget || budget <= 0) return 0.6
  if (budget >= minBudget) return 1
  const ratio = budget / minBudget
  return clamp01(0.35 + ratio * 0.65)
}

function fitToExperience(experience, difficulty) {
  const e = (experience || '').toLowerCase()
  const level = e === 'expert' ? 1 : e === 'intermediate' ? 0.7 : 0.45
  const gap = difficulty - level
  return clamp01(1 - Math.max(0, gap) * 1.4)
}

function seasonSuitability(monthIdx, suitableMonths) {
  if (suitableMonths.includes(monthIdx)) return 1
  const nearest = Math.min(
    ...suitableMonths.map((m) => Math.min(Math.abs(m - monthIdx), 12 - Math.abs(m - monthIdx))),
  )
  if (nearest <= 1) return 0.75
  if (nearest <= 2) return 0.6
  return 0.35
}

function soilSuitability(soil, soils) {
  if (!soil) return 0.6
  if (soils.includes(soil)) return 1
  if (soil === 'Loamy') return 0.85
  return 0.55
}

function demandSupply(demandIndex, pastCultivationShare) {
  return clamp01(0.5 + (demandIndex - pastCultivationShare) * 0.9)
}

function priceMomentum(momentum) {
  return clamp01(0.5 + momentum)
}

function scoreCrop({ monthIdx, soilType, budget, experience }, cropRow) {
  const sSeason = seasonSuitability(monthIdx, cropRow.suitableMonths)
  const sSoil = soilSuitability(soilType, cropRow.soils)
  const sBudget = fitToBudget(budget, cropRow.minBudget)
  const sExp = fitToExperience(experience, cropRow.difficulty)
  const sDemand = demandSupply(cropRow.demandIndex, cropRow.pastCultivationShare)
  const sPrice = priceMomentum(cropRow.momentum)

  const raw = 0.3 * sSeason + 0.15 * sSoil + 0.1 * sBudget + 0.1 * sExp + 0.2 * sDemand + 0.15 * sPrice

  const risk = cropRow.volatility * 0.55 + (1 - sSeason) * 0.35 + (1 - sExp) * 0.1
  const riskLabel = risk < 0.38 ? 'Low' : risk < 0.62 ? 'Medium' : 'High'

  return { crop: cropRow.crop, score: clamp01(raw), riskLabel }
}

function buildTrendSeries({ location, crop, basePrice, momentum, volatility }) {
  const monthsBack = 8
  const now = new Date()
  const series = []

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleString('en-IN', { month: 'short' })
    const seed = `${location}|${crop}|${d.getFullYear()}-${d.getMonth()}`
    const noise = seededNoise(seed) - 0.5
    const drift = (monthsBack - 1 - i) * (momentum * 110)
    const jitter = noise * (volatility * 380)
    const price = Math.max(500, basePrice + drift + jitter)
    series.push({ label, price: Math.round(price) })
  }

  return series
}

function priceRangeFromTrend(trend) {
  const prices = trend.map((t) => t.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  return { min: Math.round(min * 0.98), max: Math.round(max * 1.05) }
}

export function simulateRecommendation(input) {
  const monthIdx = monthIndexFromName(input.monthName)
  const seasonLabel = seasonFromMonth(input.monthName)
  const selectedCrop = input?.commodity || input?.desiredCrop || null

  const scored = CROP_DATA.map((row) => scoreCrop({ ...input, monthIdx }, row)).sort((a, b) => b.score - a.score)
  const top = scored.slice(0, 2)
  const desired = selectedCrop ? scored.find((s) => s.crop === selectedCrop) : null

  const primaryCrop = top[0]?.crop
  const primaryRow = CROP_DATA.find((c) => c.crop === primaryCrop)

  const trendLocation = [
    input?.marketName,
    input?.districtName,
    input?.stateName,
    input?.variety,
    input?.grade,
  ]
    .filter(Boolean)
    .join('|') || input.location || 'Unknown'

  const trend = primaryRow
    ? buildTrendSeries({
        location: trendLocation,
        crop: primaryRow.crop,
        basePrice: primaryRow.basePrice,
        momentum: primaryRow.momentum,
        volatility: primaryRow.volatility,
      })
    : []

  const range = trend.length ? priceRangeFromTrend(trend) : { min: 0, max: 0 }

  // Light adjustments using optional market signals (if provided)
  const arrival = typeof input?.arrivalQuantity === 'number' ? input.arrivalQuantity : null
  const fee = typeof input?.marketFeePct === 'number' ? input.marketFeePct : null
  const traders = typeof input?.traderCount === 'number' ? input.traderCount : null

  const arrivalPressure = arrival ? clamp01(arrival / 5000) : 0
  const feePressure = fee ? clamp01(fee / 6) : 0
  const traderBoost = traders ? clamp01(traders / 50) : 0

  const adj = 1 - arrivalPressure * 0.06 - feePressure * 0.03 + traderBoost * 0.03
  const adjustedRange = {
    min: Math.round(range.min * adj),
    max: Math.round(range.max * adj),
  }

  const unit = input?.priceUnit || '₹/quintal'

  const bullets = primaryRow
    ? [
        `Based on season: ${seasonLabel} suits ${primaryRow.crop}.`,
        `Based on past farmer cultivation trends: supply was ~${Math.round(primaryRow.pastCultivationShare * 100)}% last year.`,
        `Based on demand in market: demand index is ~${Math.round(primaryRow.demandIndex * 100)}% for ${primaryRow.crop}.`,
        ...(arrival ? [`Based on mandi arrivals: higher arrivals can reduce price (arrival: ${Math.round(arrival)}).`] : []),
        ...(traders ? [`Based on trader activity: more buyers can support price (traders: ${Math.round(traders)}).`] : []),
      ]
    : []

  const riskLevel = top[0]?.riskLabel || 'Medium'

  return {
    mode: 'mock',
    input: { ...input, seasonLabel },
    recommendedCrops: top.map((t) => ({ crop: t.crop, probability: Math.round(t.score * 100), risk: t.riskLabel })),
    desiredCropAssessment: desired
      ? { crop: desired.crop, probability: Math.round(desired.score * 100), risk: desired.riskLabel }
      : null,
    explanation: { bullets },
    pricePrediction: {
      crop: primaryCrop,
      rangeMin: adjustedRange.min,
      rangeMax: adjustedRange.max,
      rangeLabel: `${formatINR(adjustedRange.min)} – ${formatINR(adjustedRange.max)} (${unit})`,
      modalPrice: Math.round((adjustedRange.min + adjustedRange.max) / 2),
      arrivalQuantity: arrival || Math.round(1000 + seededNoise(`${trendLocation}|arrival`) * 4000),
      marketFeePct: fee || Math.round((1 + seededNoise(`${trendLocation}|fee`) * 3) * 10) / 10,
      traderCount: traders || Math.round(10 + seededNoise(`${trendLocation}|traders`) * 40),
      unit,
      grade: input?.grade || 'FAQ',
    },
    marketTrend: { crop: primaryCrop, series: trend },
    risk: { level: riskLevel },
  }
}
