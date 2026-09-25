import { useEffect, useRef, useState } from 'react'
import { api, type TaxQuoteResponse } from '@/lib/api'

function addressReady(addr: Record<string, string>): boolean {
  return Boolean(
    (addr.city || '').trim() &&
    (addr.state || '').trim() &&
    (addr.postalCode || addr.postal_code || '').trim()
  )
}

function isTennessee(addr: Record<string, string>): boolean {
  const state = (addr.state || '').trim().toUpperCase()
  return state === 'TN' || state === 'TENNESSEE'
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
    if (items.length === 0 || type === 'wholesale') {
      setTax(0)
      setTaxRate(0)
      setSource(type === 'wholesale' ? 'exempt' : '')
      setLoading(false)
      return
    }

    if (!isTennessee(shippingAddress)) {
      // If state isn't filled yet, wait; if it's a non-TN state, no tax.
      if (!(shippingAddress.state || '').trim()) {
        setTax(0)
        setTaxRate(0)
        setSource('')
        setLoading(false)
        return
      }
      setTax(0)
      setTaxRate(0)
      setSource('out_of_state')
      setLoading(false)
      return
    }

    // TN: if city/zip missing, still apply admin rate so tax shows as soon as state is TN.
    if (!addressReady(shippingAddress)) {
      const fallbackRate = 9.25
      const taxable = Math.max(0, subtotal - discount)
      setTax(Math.round(taxable * (fallbackRate / 100) * 100) / 100)
      setTaxRate(fallbackRate)
      setSource('fallback')
      setLoading(false)
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
        shipping: 0,
        type,
      })
        .then((quote: TaxQuoteResponse) => {
          if (quote.tax <= 0 && isTennessee(shippingAddress)) {
            const fallbackRate = quote.taxRate > 0 ? quote.taxRate : 9.25
            const taxable = Math.max(0, subtotal - discount)
            setTax(Math.round(taxable * (fallbackRate / 100) * 100) / 100)
            setTaxRate(fallbackRate)
            setSource('fallback')
            return
          }
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
