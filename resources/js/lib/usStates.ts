import { useEffect, useState } from 'react'

/** US states and territories — value is the 2-letter code used by tax/shipping. */
export const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'District of Columbia' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
]

type CityOption = { value: string; label: string }

const cityOptionsCache = new Map<string, CityOption[]>()
let citiesByStatePromise: Promise<Record<string, string[]>> | null = null

/**
 * Lazy-load the US cities dataset (~250KB) only when a city picker needs it.
 * Avoids shipping the 7–8MB world city pack from `country-state-city` (iPhone Safari OOM).
 */
function loadUsCitiesByState(): Promise<Record<string, string[]>> {
  if (!citiesByStatePromise) {
    citiesByStatePromise = import('@/data/usCitiesByState.json').then(
      (mod) => (mod.default ?? mod) as Record<string, string[]>,
    )
  }
  return citiesByStatePromise
}

/** Async city options for a US state code (e.g. TN). */
export async function getCityOptionsForStateAsync(stateCode: string): Promise<CityOption[]> {
  const code = stateCode.trim().toUpperCase()
  if (!code) return []

  const cached = cityOptionsCache.get(code)
  if (cached) return cached

  const map = await loadUsCitiesByState()
  const cities = map[code] ?? []
  const options = cities.map((name) => ({ value: name, label: name }))
  cityOptionsCache.set(code, options)
  return options
}

/**
 * Sync helper kept for callers that already have options cached.
 * Returns [] until `getCityOptionsForStateAsync` / `useCityOptionsForState` has loaded data.
 */
export function getCityOptionsForState(stateCode: string): CityOption[] {
  const code = stateCode.trim().toUpperCase()
  if (!code) return []
  return cityOptionsCache.get(code) ?? []
}

/** React hook: loads city options when `stateCode` is set (iPhone-safe async chunk). */
export function useCityOptionsForState(stateCode: string): CityOption[] {
  const code = stateCode.trim().toUpperCase()
  const [options, setOptions] = useState<CityOption[]>(() => (code ? getCityOptionsForState(code) : []))

  useEffect(() => {
    if (!code) {
      setOptions([])
      return
    }

    let alive = true
    const cached = getCityOptionsForState(code)
    if (cached.length > 0) {
      setOptions(cached)
      return
    }

    getCityOptionsForStateAsync(code).then((next) => {
      if (alive) setOptions(next)
    })

    return () => {
      alive = false
    }
  }, [code])

  return options
}

export function formatPostalCodeInput(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 10)
}

export function isValidPostalCode(value: string): boolean {
  return /^\d{3,10}$/.test(value.trim())
}
