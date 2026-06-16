import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, X, ShoppingCart, CheckCircle } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import { products, categories } from '@/data/products'
import { Product } from '@/types'

export default function ShopPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [toast, setToast] = useState<string | null>(null)
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([])
  const [cartOpen, setCartOpen] = useState(false)

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    })
  }, [search, activeCategory])

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id)
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { product, qty: 1 }]
    })
    setToast(`${product.name} added to cart!`)
    setTimeout(() => setToast(null), 3000)
  }

  const cartTotal = cart.reduce((s, i) => s + i.product.price * i.qty, 0)
  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  return (
    <div className="min-h-screen bg-cream-50 pt-20">
      {/* Page Header */}
      <div className="bg-white border-b border-forest-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="font-display font-700 text-forest-900" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
                Our Plant Shop
              </h1>
              <p className="text-sage-600 font-body mt-1">{filtered.length} plants available this season</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 md:flex-none md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sage-400" />
                <input
                  type="text"
                  placeholder="Search plants..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-cream-50 border border-forest-200 rounded-xl text-sm font-body text-forest-800 placeholder:text-sage-400 focus:outline-none focus:border-forest-400 transition-colors"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-sage-400 hover:text-sage-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Cart button */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative flex items-center gap-2 px-4 py-2.5 bg-forest-600 hover:bg-forest-700 text-white rounded-xl text-sm font-sans font-600 transition-colors focus-ring"
              >
                <ShoppingCart className="w-4 h-4" />
                Cart
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-terra-500 text-white text-[10px] font-sans font-700 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 mt-6 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-sans font-600 transition-all duration-200 focus-ring ${
                  activeCategory === cat
                    ? 'bg-forest-600 text-white shadow-sm'
                    : 'bg-white text-forest-700 border border-forest-200 hover:border-forest-400 hover:bg-forest-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-24"
            >
              <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-forest-400" />
              </div>
              <h3 className="font-display font-700 text-forest-800 text-xl mb-2">No plants found</h3>
              <p className="text-sage-500 font-body">Try adjusting your search or filter.</p>
              <button
                onClick={() => { setSearch(''); setActiveCategory('All') }}
                className="mt-4 px-4 py-2 bg-forest-600 text-white rounded-xl text-sm font-sans font-600 hover:bg-forest-700 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filtered.map((product, i) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  <ProductCard product={product} onAddToCart={() => handleAddToCart(product)} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 40, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-50 flex items-center gap-3 bg-forest-800 text-white px-5 py-3 rounded-2xl shadow-xl"
          >
            <CheckCircle className="w-4 h-4 text-forest-400" />
            <span className="text-sm font-sans font-600">{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-forest-100">
                <h2 className="font-display font-700 text-forest-900 text-xl">Your Cart</h2>
                <button onClick={() => setCartOpen(false)} className="p-2 rounded-lg hover:bg-forest-50 transition-colors focus-ring">
                  <X className="w-5 h-5 text-forest-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="w-12 h-12 text-sage-300 mx-auto mb-4" />
                    <p className="text-sage-500 font-body">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.product.id} className="flex items-center gap-4 p-3 bg-cream-50 rounded-xl">
                      <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-sans font-600 text-forest-800 text-sm">{item.product.name}</p>
                        <p className="text-sage-500 text-xs">${item.product.price.toFixed(2)} × {item.qty}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                          className="w-6 h-6 bg-white border border-forest-200 rounded-md flex items-center justify-center text-forest-600 hover:bg-forest-50 text-sm font-bold transition-colors"
                        >–</button>
                        <span className="text-sm font-sans font-600 w-5 text-center">{item.qty}</span>
                        <button
                          onClick={() => setCart(prev => prev.map(i => i.product.id === item.product.id ? { ...i, qty: i.qty + 1 } : i))}
                          className="w-6 h-6 bg-white border border-forest-200 rounded-md flex items-center justify-center text-forest-600 hover:bg-forest-50 text-sm font-bold transition-colors"
                        >+</button>
                        <button
                          onClick={() => setCart(prev => prev.filter(i => i.product.id !== item.product.id))}
                          className="ml-1 text-terra-400 hover:text-terra-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {cart.length > 0 && (
                <div className="p-6 border-t border-forest-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-sans font-600 text-forest-700">Total</span>
                    <span className="font-display font-700 text-forest-900 text-xl">${cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => { alert('Checkout coming soon! This would integrate with a payment processor.'); setCartOpen(false) }}
                    className="w-full py-3.5 bg-forest-600 hover:bg-forest-700 text-white font-sans font-700 rounded-xl transition-colors focus-ring"
                  >
                    Proceed to Checkout
                  </button>
                  <button
                    onClick={() => setCart([])}
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
    </div>
  )
}