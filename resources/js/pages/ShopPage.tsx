import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, X, CheckCircle, SlidersHorizontal } from 'lucide-react'
import ProductCard from '@/components/ui/ProductCard'
import { api, ShopCategory } from '@/lib/api'
import { Product } from '@/types'
import { useRetailCart } from '@/context/RetailCartContext'

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Lowest Price' },
  { value: 'price_desc', label: 'Highest Price' },
  { value: 'reviews', label: 'Top Customer Reviews' },
  { value: 'recent', label: 'Most Recent' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ShopCategory[]>([
    { name: 'All', slug: 'all', count: 0 },
  ])
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState<SortValue>('relevance')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const { addItem } = useRetailCart()

  useEffect(() => {
    api.getCategories().then(({ categories: cats }) => setCategories(cats)).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    api.getProducts({ category: activeCategory, search, sort: sortBy })
      .then(({ products: items }) => setProducts(items))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [activeCategory, search, sortBy])

  const filtered = products

  const handleAddToCart = (product: Product) => {
    addItem(product)
    setToast(`${product.name} added to cart!`)
    setTimeout(() => setToast(null), 3000)
  }

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

            <div className="relative flex-1 md:flex-none md:w-72 md:ml-auto">
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
          </div>

          {/* Category Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`px-4 py-1.5 rounded-full text-sm font-sans font-600 transition-all duration-200 focus-ring ${
                    activeCategory === cat.name
                      ? 'bg-forest-600 text-white shadow-sm'
                      : 'bg-white text-forest-700 border border-forest-200 hover:border-forest-400 hover:bg-forest-50'
                  }`}
                >
                  {cat.name}
                  <span className={`ml-1.5 text-xs ${activeCategory === cat.name ? 'text-forest-200' : 'text-sage-400'}`}>
                    {cat.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-sage-500 hidden sm:block" />
              <label htmlFor="shop-sort" className="text-sm font-sans font-600 text-forest-700 whitespace-nowrap">
                Sort by:
              </label>
              <select
                id="shop-sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortValue)}
                className="px-3 py-2 bg-white border border-forest-200 rounded-xl text-sm font-body text-forest-800 focus:outline-none focus:border-forest-400 min-w-[11rem]"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-forest-100 overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-forest-100" />
                  <div className="p-5 space-y-3">
                    <div className="h-3 bg-forest-100 rounded w-1/3" />
                    <div className="h-5 bg-forest-100 rounded w-4/5" />
                    <div className="h-4 bg-forest-100 rounded w-full" />
                    <div className="h-4 bg-forest-100 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
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
                onClick={() => { setSearch(''); setActiveCategory('All'); setSortBy('relevance') }}
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
    </div>
  )
}