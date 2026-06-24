import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ShoppingCart, Package, LogOut, Leaf, Plus, Minus, X, CheckCircle, CreditCard, Tag } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'
import { useNavigate } from 'react-router-dom'
import { api } from '@/lib/api'
import { Order, Product } from '@/types'

type Tab = 'shop' | 'cart' | 'orders'

const statusColors: Record<string, string> = {
  processing: 'bg-amber-100 text-amber-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-forest-100 text-forest-700',
  cancelled: 'bg-terra-100 text-terra-700',
}

export default function WholesalePortalPage() {
  const { user, logout } = useAuth()
  const { items, addItem, updateQuantity, removeItem, clearCart, total, itemCount } = useCart()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('shop')
  const [activeCategory, setActiveCategory] = useState('All')
  const [checkoutDone, setCheckoutDone] = useState(false)
  const [checkingOut, setCheckingOut] = useState(false)
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    api.getCategories().then(({ categories: cats }) => setCategories(cats)).catch(() => {})
    api.getProducts({ category: activeCategory })
      .then(({ products: items }) => setProducts(items))
      .catch(() => setProducts([]))
  }, [activeCategory])

  useEffect(() => {
    api.getWholesaleOrders().then(({ orders: data }) => setOrders(data)).catch(() => setOrders([]))
  }, [checkoutDone])

  const handleLogout = () => { logout(); navigate('/wholesale/login') }

  const filteredProducts = products.filter(p =>
    activeCategory === 'All' ? true : p.category === activeCategory
  )

  const getQty = (id: string) => quantities[id] ?? 5

  const handleAddToCart = (product: Product) => {
    const qty = getQty(product.id)
    addItem(product, qty)
  }

  const handleCheckout = async () => {
    setCheckingOut(true)
    try {
      await api.placeWholesaleOrder({
        paymentMethod: 'Net 30',
        items: items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
      })
      setCheckoutDone(true)
      clearCart()
      setActiveTab('orders')
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Checkout failed')
    } finally {
      setCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Portal Header */}
      <header className="bg-forest-900 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-forest-600 rounded-lg flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="font-sans font-700 text-cream-100 text-sm">Meadowlark Gardens TN</span>
                <span className="text-forest-400 text-xs block leading-none">Wholesale Portal</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden sm:block text-right">
                <p className="text-cream-200 text-sm font-sans font-600">{user?.businessName}</p>
                <p className="text-forest-400 text-xs">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-forest-800 hover:bg-forest-700 rounded-lg text-sm font-sans font-600 text-sage-300 transition-colors focus-ring"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
          {/* Tab Bar */}
          <div className="flex border-t border-forest-800">
            {([
              { id: 'shop', label: 'Shop', icon: Leaf },
              { id: 'cart', label: `Cart${itemCount > 0 ? ` (${itemCount})` : ''}`, icon: ShoppingCart },
              { id: 'orders', label: 'My Orders', icon: Package },
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setCheckoutDone(false) }}
                className={`flex items-center gap-2 px-5 py-3 text-sm font-sans font-600 transition-colors border-b-2 focus-ring ${
                  activeTab === tab.id
                    ? 'border-forest-400 text-cream-100'
                    : 'border-transparent text-forest-400 hover:text-sage-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="bg-forest-50 border-b border-forest-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-forest-700 font-sans font-600 text-sm">
            Welcome back, <span className="text-forest-900">{user?.businessName}</span>! Wholesale pricing applied automatically.
          </p>
          <span className="text-xs font-sans font-600 text-forest-600 bg-forest-100 px-2.5 py-1 rounded-full border border-forest-200">
            Min. 5 units per product
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* Shop Tab */}
          {activeTab === 'shop' && (
            <motion.div key="shop" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <div className="flex gap-2 mb-6 flex-wrap">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm font-sans font-600 transition-all focus-ring ${
                      activeCategory === cat ? 'bg-forest-600 text-white' : 'bg-white text-forest-700 border border-forest-200 hover:border-forest-400'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="bg-white rounded-2xl overflow-hidden border border-forest-100 shadow-sm"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                      {product.badge && (
                        <span className="absolute top-3 left-3 text-xs font-sans font-600 px-2.5 py-1 rounded-full bg-forest-100 text-forest-700 border border-forest-200">
                          {product.badge}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-sage-500 font-sans font-500 uppercase tracking-wide mb-1">{product.category}</p>
                      <h3 className="font-display font-700 text-forest-800 text-base mb-1 leading-snug">{product.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-sans font-800 text-forest-700 text-lg">${product.wholesalePrice.toFixed(2)}</span>
                          <span className="text-sage-400 text-xs ml-1 line-through">${product.price.toFixed(2)}</span>
                        </div>
                        <span className="text-xs text-forest-600 bg-forest-50 px-2 py-0.5 rounded-full border border-forest-200 flex items-center gap-1">
                          <Tag className="w-3 h-3" />
                          /unit
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-sage-600 font-sans font-500">Qty:</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setQuantities(q => ({ ...q, [product.id]: Math.max(5, getQty(product.id) - 1) }))}
                            className="w-7 h-7 bg-cream-100 border border-forest-200 rounded-lg text-forest-600 flex items-center justify-center hover:bg-cream-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center text-sm font-sans font-700 text-forest-800">{getQty(product.id)}</span>
                          <button
                            onClick={() => setQuantities(q => ({ ...q, [product.id]: getQty(product.id) + 1 }))}
                            className="w-7 h-7 bg-cream-100 border border-forest-200 rounded-lg text-forest-600 flex items-center justify-center hover:bg-cream-200 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {product.inStock ? (
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-sm font-sans font-600 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-sm focus-ring flex items-center justify-center gap-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart — ${(product.wholesalePrice * getQty(product.id)).toFixed(2)}
                        </button>
                      ) : (
                        <div className="w-full py-2.5 bg-gray-100 text-gray-400 text-sm font-sans font-600 rounded-xl text-center">
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Cart Tab */}
          {activeTab === 'cart' && (
            <motion.div key="cart" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              {checkoutDone ? (
                <div className="max-w-md mx-auto text-center py-16 bg-white rounded-2xl border border-forest-100 p-8 shadow-sm">
                  <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-forest-600" />
                  </div>
                  <h2 className="font-display font-700 text-forest-900 text-2xl mb-2">Order Placed!</h2>
                  <p className="text-sage-600 font-body mb-6">Your order has been received. You'll get a confirmation email shortly and can track it in the Orders tab.</p>
                  <button
                    onClick={() => { setActiveTab('orders'); setCheckoutDone(false) }}
                    className="px-6 py-3 bg-forest-600 text-white font-sans font-600 rounded-xl hover:bg-forest-700 transition-colors"
                  >
                    View My Orders
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-forest-100 shadow-sm">
                  <ShoppingCart className="w-12 h-12 text-sage-300 mx-auto mb-4" />
                  <h3 className="font-display font-700 text-forest-800 text-xl mb-2">Your cart is empty</h3>
                  <p className="text-sage-500 font-body mb-4">Browse our catalog and add plants to get started.</p>
                  <button onClick={() => setActiveTab('shop')} className="px-5 py-2.5 bg-forest-600 text-white font-sans font-600 rounded-xl hover:bg-forest-700 transition-colors">
                    Browse Plants
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-3">
                    {items.map(item => (
                      <div key={item.product.id} className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-forest-100 shadow-sm">
                        <img src={item.product.image} alt={item.product.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-sans font-700 text-forest-800 truncate">{item.product.name}</p>
                          <p className="text-sage-500 text-sm">${item.product.wholesalePrice.toFixed(2)} / unit</p>
                          <p className="font-sans font-700 text-forest-700 text-sm mt-0.5">
                            Subtotal: ${(item.product.wholesalePrice * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 bg-cream-100 border border-forest-200 rounded-lg text-forest-600 flex items-center justify-center hover:bg-cream-200 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-10 text-center font-sans font-700 text-forest-800">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 bg-cream-100 border border-forest-200 rounded-lg text-forest-600 flex items-center justify-center hover:bg-cream-200 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="w-8 h-8 text-terra-400 hover:text-terra-600 hover:bg-terra-50 rounded-lg flex items-center justify-center transition-colors ml-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-2xl border border-forest-100 shadow-sm p-6 h-fit">
                    <h3 className="font-display font-700 text-forest-900 text-xl mb-4">Order Summary</h3>
                    <div className="space-y-2 mb-4">
                      {items.map(item => (
                        <div key={item.product.id} className="flex justify-between text-sm font-body text-forest-700">
                          <span className="truncate mr-2">{item.product.name} ×{item.quantity}</span>
                          <span className="shrink-0 font-sans font-600">${(item.product.wholesalePrice * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-forest-100 pt-4 mb-5">
                      <div className="flex justify-between font-sans font-700 text-forest-900">
                        <span>Total</span>
                        <span className="text-xl">${total.toFixed(2)}</span>
                      </div>
                      <p className="text-sage-500 text-xs mt-1">Net 30 payment terms apply</p>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={checkingOut}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-forest-600 hover:bg-forest-700 disabled:bg-forest-400 text-white font-sans font-700 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 focus-ring"
                    >
                      {checkingOut ? (
                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                      ) : (
                        <><CreditCard className="w-4 h-4" /> Place Order</>
                      )}
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full mt-2 py-2.5 text-terra-600 text-sm font-sans font-600 hover:bg-terra-50 rounded-xl transition-colors"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <h2 className="font-display font-700 text-forest-900 text-2xl mb-6">Order History</h2>
              {orders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-forest-100 shadow-sm">
                  <Package className="w-12 h-12 text-sage-300 mx-auto mb-4" />
                  <p className="text-sage-500 font-body">No orders yet. Place your first wholesale order!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-2xl border border-forest-100 shadow-sm overflow-hidden"
                    >
                      <div className="flex items-center justify-between p-5 border-b border-forest-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-forest-100 rounded-xl flex items-center justify-center">
                            <Package className="w-5 h-5 text-forest-600" />
                          </div>
                          <div>
                            <p className="font-sans font-700 text-forest-900">{order.orderNumber}</p>
                            <p className="text-sage-500 text-xs font-body">
                              {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-sans font-600 capitalize ${statusColors[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                            {order.status}
                          </span>
                          <span className="font-sans font-700 text-forest-900">${order.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {order.items.map(item => (
                            <div key={item.product.id} className="flex items-center gap-3 text-sm">
                              <div className="w-8 h-8 bg-forest-50 rounded-lg flex items-center justify-center shrink-0">
                                <Leaf className="w-4 h-4 text-forest-500" />
                              </div>
                              <div>
                                <p className="font-sans font-600 text-forest-800">{item.product.name}</p>
                                <p className="text-sage-500 text-xs">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 flex items-center gap-4 text-xs text-sage-500 font-body">
                          <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> {order.paymentMethod}</span>
                          <span className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> {order.status === 'delivered' ? 'Delivered' : order.status === 'shipped' ? 'In Transit' : 'Being Prepared'}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}