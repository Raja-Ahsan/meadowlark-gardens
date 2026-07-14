import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import type { Product, ProductVariation } from '@/types'
import {
  cartLineKey,
  getCartLinePrice,
  type RetailCartItem,
} from '@/lib/cart'

interface RetailCartContextType {
  items: RetailCartItem[]
  addItem: (product: Product, qty?: number, variation?: ProductVariation) => void
  removeItem: (productId: string, variationId?: string) => void
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void
  clearCart: () => void
  total: number
  count: number
}

const RetailCartContext = createContext<RetailCartContextType | null>(null)

const STORAGE_KEY = 'mg_retail_cart'

function findLineIndex(items: RetailCartItem[], productId: string, variationId?: string) {
  const key = cartLineKey(productId, variationId)
  return items.findIndex(i => cartLineKey(i.product.id, i.variation?.id) === key)
}

export function RetailCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<RetailCartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const addItem = (product: Product, qty = 1, variation?: ProductVariation) => {
    setItems(prev => {
      const idx = findLineIndex(prev, product.id, variation?.id)
      if (idx >= 0) {
        return prev.map((i, n) => (n === idx ? { ...i, quantity: i.quantity + qty } : i))
      }
      return [...prev, { product, quantity: qty, variation }]
    })
  }

  const removeItem = (productId: string, variationId?: string) => {
    const key = cartLineKey(productId, variationId)
    setItems(prev => prev.filter(i => cartLineKey(i.product.id, i.variation?.id) !== key))
  }

  const updateQuantity = (productId: string, quantity: number, variationId?: string) => {
    if (quantity <= 0) {
      removeItem(productId, variationId)
      return
    }
    const key = cartLineKey(productId, variationId)
    setItems(prev => prev.map(i => (
      cartLineKey(i.product.id, i.variation?.id) === key ? { ...i, quantity } : i
    )))
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + getCartLinePrice(i) * i.quantity, 0)
  const count = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <RetailCartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, count }}>
      {children}
    </RetailCartContext.Provider>
  )
}

export function useRetailCart() {
  const ctx = useContext(RetailCartContext)
  if (!ctx) throw new Error('useRetailCart must be used within RetailCartProvider')
  return ctx
}
