import { simulateRecommendation } from './mockEngine.js'

function lastKnownContext() {
  try {
    const raw = sessionStorage.getItem('cropAi:lastResult')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function formatBullets(items) {
  return items.map((x) => `• ${x}`).join('\n')
}

function normalize(text) {
  return String(text || '').trim().toLowerCase()
}

function makeReply(message, packed) {
  const m = normalize(message)
  const input = packed?.input || null
  const result = packed?.result || null

  const location = input?.location || 'your area'
  const season = input?.season || 'this season'

  if (m.includes('best crop') || m.includes('which crop') || m.includes('recommend')) {
    const rec = result?.recommendedCrops?.slice?.(0, 2) || []
    if (rec.length) {
      const crops = rec.map((r) => `${r.crop} (${r.probability}%)`).join(' and ')
      return {
        reply: `For ${season} in ${location}, the top options are: ${crops}.\n\nWhy:\n${formatBullets(
          result?.explanation?.bullets || [
            'Season suitability',
            'Past farmer cultivation trends',
            'Market demand and price movement',
          ],
        )}`,
        suggested: ['What is the risk level?', 'Show price prediction', 'How to reduce risk?'],
      }
    }

    return {
      reply:
        'I can suggest crops if you first generate a recommendation from Home. Go to Home → “Get Recommendation”, then come back here.',
      suggested: ['Go to Home and get recommendation', 'How to increase yield?'],
    }
  }

  if (m.includes('price') || m.includes('market')) {
    const price = result?.pricePrediction
    if (price?.rangeLabel) {
      return {
        reply: `For ${price.crop}, expected market price range is ${price.rangeLabel}.\n\nTip: watch local mandi arrivals and storage costs before deciding harvest time.`,
        suggested: ['Show market trend', 'What affects price volatility?'],
      }
    }
    return {
      reply:
        'Price prediction is available after you run a recommendation from Home. It will show min–max range and a simple trend chart.',
      suggested: ['Which crop is best this season?', 'How to reduce risk?'],
    }
  }

  if (m.includes('risk') || m.includes('safe')) {
    const risk = result?.risk?.level || null
    if (risk) {
      const tips =
        risk.toLowerCase() === 'high'
          ? ['Prefer contract/assured buyers', 'Stagger sowing', 'Plan pest control early', 'Keep cash reserve for input shocks']
          : risk.toLowerCase() === 'medium'
            ? ['Use resistant varieties', 'Track weekly prices', 'Avoid over-planting a single crop']
            : ['Maintain soil health and irrigation schedule', 'Focus on quality grading for better price']
      return {
        reply: `Current recommendation risk is: ${risk}.\n\nHow to reduce risk:\n${formatBullets(tips)}`,
        suggested: ['How to increase yield?', 'Which crop is best this season?'],
      }
    }
    return {
      reply: 'Risk indicator becomes available after you generate a recommendation from Home.',
      suggested: ['Go to Home and get recommendation'],
    }
  }

  if (m.includes('increase yield') || m.includes('improve yield') || m.includes('yield')) {
    const tips = [
      'Do a soil test and correct pH/deficiencies',
      'Use certified seeds + recommended seed rate',
      'Follow irrigation schedule (avoid water stress at flowering)',
      'Balanced fertilizer: NPK + micronutrients if needed',
      'Integrated pest management (monitor weekly)',
      'Weed control in first 30–45 days',
    ]
    return {
      reply: `Here are practical ways to increase yield:\n${formatBullets(tips)}\n\nIf you share your crop + month, I can tailor this.`,
      suggested: ['Which crop is best this season?', 'How to reduce risk?'],
    }
  }

  if (m.includes('fertilizer') || m.includes('manure') || m.includes('npk')) {
    return {
      reply:
        'General rule: apply fertilizer based on soil test and crop stage. Split nitrogen, ensure adequate phosphorus at sowing, and add potash for stress tolerance. Share crop + acreage for a more specific plan.',
      suggested: ['How to increase yield?', 'How to reduce risk?'],
    }
  }

  if (m.includes('pest') || m.includes('disease')) {
    return {
      reply:
        'Use integrated pest management: scouting, pheromone traps, resistant varieties, and targeted sprays only when threshold is crossed. Share crop + symptoms for better guidance.',
      suggested: ['How to increase yield?', 'Which crop is best this season?'],
    }
  }

  // Default helpful response
  const fallback = input
    ? simulateRecommendation(input)
    : null

  return {
    reply: `Ask me about crop choice, yield improvement, price trends, or risk.\n\nExamples:\n${formatBullets([
      'Which crop is best this season?',
      'How to increase yield?',
      'What is the expected price range?',
      'How to reduce risk?',
    ])}${fallback?.recommendedCrops?.length ? `\n\nTip: Your last recommendation suggests ${fallback.recommendedCrops[0].crop}.` : ''}`,
    suggested: ['Which crop is best this season?', 'How to increase yield?'],
  }
}

export function mockChatRespond({ message }) {
  const packed = lastKnownContext()
  return makeReply(message, packed)
}

