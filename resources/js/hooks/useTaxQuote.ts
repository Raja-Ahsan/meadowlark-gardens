import { useEffect, useRef, useState } from 'react'
import { api, type TaxQuoteResponse } from '@/lib/api'

function addressReady(addr: Record<string, string>): boolean {
  return Boolean(
    (addr.city || '').trim() &&
    (addr.state || '').trim() &&
    (addr.postalCode || addr.postal_code || '').trim()
  )
}

interface Params {
  shippingAddress: Record<string, string>
  items: { productId: string; quantity: number; variationId?: string }[]
  subtotal: number
  discount: number
  shipping: number
  type: 'retail' | 'wholesale'
}

export function useTaxQuote({
  shippingAddress,
  items,
  subtotal,
  discount,
  shipping,
  type,
}: Params) {
  const [tax, setTax] = useState(0)
  const [taxRate, setTaxRate] = useState(0)
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!addressReady(shippingAddress) || items.length === 0) {
      setTax(0)
      setTaxRate(0)
      setSource('')
      return
    }

    if (debounceRef.current) clearTimeout(debounceRef.current)

    debounceRef.current = setTimeout(() => {
      setLoading(true)
      api.getTaxQuote({
        shippingAddress,
        items,
        subtotal,
        discount,
        shipping,
        type,
      })
        .then((quote: TaxQuoteResponse) => {
          setTax(quote.tax)
          setTaxRate(quote.taxRate)
          setSource(quote.source)
        })
        .catch(() => {
          const fallbackRate = 9.25
          const taxable = Math.max(0, subtotal - discount)
          setTax(Math.round(taxable * (fallbackRate / 100) * 100) / 100)
          setTaxRate(fallbackRate)
          setSource('fallback')
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
    JSON.stringify(items),
    subtotal,
    discount,
    shipping,
    type,
  ])

  return { tax, taxRate, source, loading }
}
