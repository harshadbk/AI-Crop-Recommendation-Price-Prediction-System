import React, { useMemo } from 'react'
import {
  CROPS,
  DISTRICTS_BY_STATE,
  IRRIGATION_TYPES,
  LANGUAGES,
  SOIL_TYPES,
  STATES,
  WATER_SOURCES,
} from '../constants/options.js'

/** Empty farm profile used by the signup and profile pages. */
export function emptyFarm(user) {
  return {
    stateName: user?.stateName || 'Maharashtra',
    districtName: user?.districtName || '',
    talukaName: user?.talukaName || '',
    soilType: user?.soilType || '',
    farmSizeAcres: user?.farmSizeAcres ?? '',
    waterSource: user?.waterSource || '',
    irrigationType: user?.irrigationType || '',
    budget: user?.budget ?? '',
    mainCrops: user?.mainCrops || [],
    preferredLanguage: user?.preferredLanguage || 'English',
    soilN: user?.soilN ?? '',
    soilP: user?.soilP ?? '',
    soilK: user?.soilK ?? '',
    soilPh: user?.soilPh ?? '',
  }
}

/** Returns an error message, or '' when the farm details are complete. */
export function validateFarm(farm) {
  if (!farm.stateName) return 'Please select your state.'
  if (!farm.districtName.trim()) return 'Please enter your district.'
  if (!farm.soilType) return 'Please select your soil type.'
  if (!farm.farmSizeAcres || Number(farm.farmSizeAcres) <= 0) return 'Please enter your farm size in acres.'
  if (!farm.waterSource) return 'Please select your water source.'
  if (!farm.mainCrops.length) return 'Please select at least one crop you grow.'
  if (farm.soilPh !== '' && (Number(farm.soilPh) < 3 || Number(farm.soilPh) > 10)) return 'Soil pH should be between 3 and 10.'
  return ''
}

const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v))

/** Converts the form state into the backend profile format (snake_case). */
export function farmToProfile(farm) {
  return {
    state_name: farm.stateName,
    district_name: farm.districtName.trim(),
    taluka_name: farm.talukaName.trim() || null,
    soil_type: farm.soilType,
    farm_size_acres: num(farm.farmSizeAcres),
    water_source: farm.waterSource,
    irrigation_type: farm.irrigationType || null,
    budget: num(farm.budget),
    main_crops: farm.mainCrops,
    preferred_language: farm.preferredLanguage,
    soil_n: num(farm.soilN),
    soil_p: num(farm.soilP),
    soil_k: num(farm.soilK),
    soil_ph: num(farm.soilPh),
  }
}

export function FarmProfileForm({ farm, onChange }) {
  const set = (key) => (e) => onChange({ ...farm, [key]: e.target.value })
  const districts = useMemo(() => DISTRICTS_BY_STATE[farm.stateName] || [], [farm.stateName])

  function toggleCrop(crop) {
    const has = farm.mainCrops.includes(crop)
    onChange({ ...farm, mainCrops: has ? farm.mainCrops.filter((c) => c !== crop) : [...farm.mainCrops, crop] })
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div className="muted" style={{ fontWeight: 900 }}>Farm location</div>
      <div className="grid">
        <div className="field">
          <label htmlFor="fp-state">State *</label>
          <select id="fp-state" value={farm.stateName} onChange={(e) => onChange({ ...farm, stateName: e.target.value, districtName: '' })}>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fp-district">District *</label>
          <input id="fp-district" list="fp-districts" placeholder="e.g. Nashik" value={farm.districtName} onChange={set('districtName')} />
          <datalist id="fp-districts">
            {districts.map((d) => <option key={d} value={d} />)}
          </datalist>
        </div>
        <div className="field">
          <label htmlFor="fp-taluka">Taluka / Village</label>
          <input id="fp-taluka" placeholder="e.g. Niphad" value={farm.talukaName} onChange={set('talukaName')} />
        </div>
        <div className="field">
          <label htmlFor="fp-lang">Preferred language</label>
          <select id="fp-lang" value={farm.preferredLanguage} onChange={set('preferredLanguage')}>
            {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="muted" style={{ fontWeight: 900 }}>Land, water and money</div>
      <div className="grid">
        <div className="field">
          <label htmlFor="fp-soil">Soil type *</label>
          <select id="fp-soil" value={farm.soilType} onChange={set('soilType')}>
            {SOIL_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fp-size">Farm size (acres) *</label>
          <input id="fp-size" type="number" min="0" step="0.1" placeholder="e.g. 3" value={farm.farmSizeAcres} onChange={set('farmSizeAcres')} />
        </div>
        <div className="field">
          <label htmlFor="fp-water">Water source *</label>
          <select id="fp-water" value={farm.waterSource} onChange={set('waterSource')}>
            {WATER_SOURCES.map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fp-irr">Irrigation method</label>
          <select id="fp-irr" value={farm.irrigationType} onChange={set('irrigationType')}>
            <option value="">Select method</option>
            {IRRIGATION_TYPES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="fp-budget">Budget per season (₹)</label>
          <input id="fp-budget" type="number" min="0" placeholder="e.g. 60000" value={farm.budget} onChange={set('budget')} />
        </div>
      </div>

      <div className="field">
        <label>Crops you grow * <span className="hint">(tap to select)</span></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CROPS.map((crop) => {
            const on = farm.mainCrops.includes(crop)
            return (
              <button
                key={crop}
                type="button"
                className="chip chip-sm"
                aria-pressed={on}
                onClick={() => toggleCrop(crop)}
                style={on ? { background: 'var(--brand)', color: '#fff', borderColor: 'var(--brand)' } : undefined}
              >
                {crop}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 12, padding: 12, display: 'grid', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 800 }}>Soil test (Soil Health Card)</div>
          <div className="hint">
            From your Soil Health Card. If you leave these empty, typical values for your soil type are used.
          </div>
        </div>
        <div className="grid">
          <div className="field">
            <label htmlFor="fp-n">Nitrogen N (kg/ha)</label>
            <input id="fp-n" type="number" min="0" placeholder="e.g. 80" value={farm.soilN} onChange={set('soilN')} />
          </div>
          <div className="field">
            <label htmlFor="fp-p">Phosphorus P (kg/ha)</label>
            <input id="fp-p" type="number" min="0" placeholder="e.g. 40" value={farm.soilP} onChange={set('soilP')} />
          </div>
          <div className="field">
            <label htmlFor="fp-k">Potassium K (kg/ha)</label>
            <input id="fp-k" type="number" min="0" placeholder="e.g. 45" value={farm.soilK} onChange={set('soilK')} />
          </div>
          <div className="field">
            <label htmlFor="fp-ph">Soil pH</label>
            <input id="fp-ph" type="number" min="3" max="10" step="0.1" placeholder="e.g. 7.2" value={farm.soilPh} onChange={set('soilPh')} />
          </div>
        </div>
      </div>
    </div>
  )
}
