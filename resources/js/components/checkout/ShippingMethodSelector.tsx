import { useEffect, useRef, useState } from 'react'
import { Loader2, Truck } from 'lucide-react'
import { api, type ShippingQuoteResponse, type ShippingRate } from '@/lib/api'

const optionClass = (selected: boolean) =>
  `flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${
    selected ? 'border-forest-600 bg-forest-50' : 'border-forest-200 hover:border-forest-300'
  }`

interface Props {
  shippingAddress: Record<string, string>
  items: { productId: string; quantity: number; variationId?: string }[]
  subtotal: number
  type: 'retail' | 'wholesale'
  freeShipping?: boolean
  selected: ShippingRate | null
  onSelect: (rate: ShippingRate) => void
  onQuote?: (quote: ShippingQuoteResponse) => void
}

function addressReady(addr: Record<string, string>): boolean {
  return Boolean(
    (addr.city || '').trim() &&
    (addr.state || '').trim() &&
    (addr.postalCode || addr.postal_code || '').trim()
  )
}

export default function ShippingMethodSelector({
  shippingAddress,
  items,
  subtotal,
  type,
  freeShipping = false,
  selected,
  onSelect,
  onQuote,
}: Props) {
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [source, setSource] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!addressReady(shippingAddress) || items.length === 0) {
      setRates([])
      setError('')
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      setLoading(true)
      setError('')
      api.getShippingQuote({
        shippingAddress,
        items,
        subtotal,
        type,
        freeShipping,
      })
        .then(quote => {
          setRates(quote.rates)
          setSource(quote.source)
          onQuote?.(quote)
          if (quote.rates.length > 0) {
            const stillValid = selected && quote.rates.some(
              r => r.code === selected.code && r.carrier === selected.carrier
            )
            if (!stillValid) onSelect(quote.rates[0])
          }
        })
        .catch(e => {
          setRates([])
          setError(e instanceof Error ? e.message : 'Could not load shipping rates')
        })
        .finally(() => setLoading(false))
    }, 450)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [
    shippingAddress.city,
    shippingAddress.state,
    shippingAddress.postalCode,
    shippingAddress.addressLine1,
    shippingAddress.address1,
    items.length,
    subtotal,
    type,
    freeShipping,
  ])

  if (!addressReady(shippingAddress)) {
    return (
      <p className="text-sm text-sage-500">
        Enter city, state, and ZIP to see shipping options.
      </p>
    )
  }

  if (loading && rates.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-sage-600">
        <Loader2 className="w-4 h-4 animate-spin" />
        Calculating shipping rates...
      </div>
    )
  }

  if (error && rates.length === 0) {
    return <p className="text-sm text-terra-600">{error}</p>
  }

  if (rates.length === 0) {
    return <p className="text-sm text-sage-500">No shipping methods available for this address.</p>
  }

  return (
    <div className="space-y-3">
      {source === 'ups' && (
        <p className="text-xs text-sage-500 flex items-center gap-1">
          <Truck className="w-3.5 h-3.5" />
          Live UPS rates
        </p>
      )}
      {source === 'fallback' && (
        <p className="text-xs text-sage-500">Standard flat rate (UPS unavailable)</p>
      )}
      {rates.map(rate => {
        const isSelected = selected?.code === rate.code && selected?.carrier === rate.carrier
        return (
          <label key={`${rate.carrier}-${rate.code}`} className={optionClass(!!isSelected)}>
            <input
              type="radio"
              name="shippingMethod"
              className="mt-1"
              checked={!!isSelected}
              onChange={() => onSelect(rate)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2">
                <span className="text-sm font-sans font-600 text-forest-900">{rate.name}</span>
                <span className="text-sm font-600 shrink-0">
                  {rate.cost === 0 ? 'FREE' : `$${rate.cost.toFixed(2)}`}
                </span>
              </div>
              {rate.etaDays != null && (
                <p className="text-xs text-sage-500 mt-0.5">
                  Estimated {rate.etaDays} business day{rate.etaDays === 1 ? '' : 's'}
                </p>
              )}
            </div>
          </label>
        )
      })}
      {loading && rates.length > 0 && (
        <p className="text-xs text-sage-500 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" />
          Updating rates...
        </p>
      )}
    </div>
  )
}

export type { ShippingRate }
