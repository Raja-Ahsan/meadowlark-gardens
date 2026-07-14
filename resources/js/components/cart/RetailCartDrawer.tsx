import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ShoppingCart, X } from 'lucide-react'
import { useRetailCart } from '@/context/RetailCartContext'
import { mediaUrl } from '@/lib/media'
import { cartLineKey, formatVariationLabel, getCartLineImage, getCartLinePrice } from '@/lib/cart'

interface Props {
  open: boolean
  onClose: () => void
}

export default function RetailCartDrawer({ open, onClose }: Props) {
  const { items, updateQuantity, removeItem, total, clearCart } = useRetailCart()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-[60] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-forest-100">
              <h2 className="font-display font-700 text-forest-900 text-xl">Your Cart</h2>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-forest-50 transition-colors focus-ring">
                <X className="w-5 h-5 text-forest-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="w-12 h-12 text-sage-300 mx-auto mb-4" />
                  <p className="text-sage-500 font-body">Your cart is empty</p>
                  <Link
                    to="/shop"
                    onClick={onClose}
                    className="inline-block mt-4 px-4 py-2 bg-forest-600 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-700 transition-colors"
                  >
                    Browse plants
                  </Link>
                </div>
              ) : (
                items.map(item => {
                  const lineKey = cartLineKey(item.product.id, item.variation?.id)
                  const price = getCartLinePrice(item)
                  const variationLabel = formatVariationLabel(item.variation)
                  const sku = item.variation?.sku || item.product.sku
                  return (
                    <div key={lineKey} className="flex items-center gap-4 p-3 bg-cream-50 rounded-xl">
                      <img
                        src={mediaUrl(getCartLineImage(item))}
                        alt={item.product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-sans font-600 text-forest-800 text-sm truncate">{item.product.name}</p>
                        {variationLabel && (
                          <p className="text-xs text-forest-600 font-500 mt-0.5">{variationLabel}</p>
                        )}
                        {sku && (
                          <p className="text-[10px] text-sage-400 font-mono mt-0.5">SKU: {sku}</p>
                        )}
                        <p className="text-sage-500 text-xs mt-1">${price.toFixed(2)} × {item.quantity}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variation?.id)}
                          className="w-6 h-6 bg-white border border-forest-200 rounded-md flex items-center justify-center text-forest-600 hover:bg-forest-50 text-sm font-bold transition-colors"
                        >–</button>
                        <span className="text-sm font-sans font-600 w-5 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variation?.id)}
                          className="w-6 h-6 bg-white border border-forest-200 rounded-md flex items-center justify-center text-forest-600 hover:bg-forest-50 text-sm font-bold transition-colors"
                        >+</button>
                        <button
                          onClick={() => removeItem(item.product.id, item.variation?.id)}
                          className="ml-1 text-terra-400 hover:text-terra-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            {items.length > 0 && (
              <div className="p-6 border-t border-forest-100">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-sans font-600 text-forest-700">Total</span>
                  <span className="font-display font-700 text-forest-900 text-xl">${total.toFixed(2)}</span>
                </div>
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="block w-full py-3.5 bg-forest-600 hover:bg-forest-700 text-white font-sans font-700 rounded-xl transition-colors focus-ring text-center"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={clearCart}
                  className="w-full mt-2 py-2.5 text-terra-600 hover:bg-terra-50 font-sans font-600 text-sm rounded-xl transition-colors focus-ring"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
