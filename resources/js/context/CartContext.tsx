import { createContext, useContext, useState, ReactNode } from 'react'
import type { Product, ProductVariation } from '@/types'
import { cartLineKey, getWholesaleLinePrice } from '@/lib/cart'

export interface WholesaleCartItem {
  product: Product
  quantity: number
  variation?: ProductVariation
}

interface CartContextType {
  items: WholesaleCartItem[]
  addItem: (product: Product, quantity: number, variation?: ProductVariation) => void
  updateQuantity: (productId: string, quantity: number, variationId?: string) => void
  removeItem: (productId: string, variationId?: string) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

function findLineIndex(items: WholesaleCartItem[], productId: string, variationId?: string) {
  const key = cartLineKey(productId, variationId)
  return items.findIndex(i => cartLineKey(i.product.id, i.variation?.id) === key)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WholesaleCartItem[]>([])

  const addItem = (product: Product, quantity: number, variation?: ProductVariation) => {
    setItems(prev => {
      const idx = findLineIndex(prev, product.id, variation?.id)
      if (idx >= 0) {
        return prev.map((i, n) => (n === idx ? { ...i, quantity: i.quantity + quantity } : i))
      }
      return [...prev, { product, quantity, variation }]
    })
  }

  const removeItem = (productId: string, variationId?: string) => {
    const key = cartLineKey(productId, variationId)
    setItems(prev => prev.filter(i => cartLineKey(i.product.id, i.variation?.id) !== key))
  }

  const updateQuantity = (productId: string, quantity: number, variationId?: string) => {
    const key = cartLineKey(productId, variationId)
    setItems(prev => {
      const item = prev.find(i => cartLineKey(i.product.id, i.variation?.id) === key)
      if (!item) return prev
      const min = Math.max(1, item.product.minWholesaleQty ?? 1)
      if (quantity < min) return prev
      return prev.map(i => (
        cartLineKey(i.product.id, i.variation?.id) === key ? { ...i, quantity } : i
      ))
    })
  }

  const clearCart = () => setItems([])

  const total = items.reduce((sum, i) => sum + getWholesaleLinePrice(i) * i.quantity, 0)
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, removeItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
