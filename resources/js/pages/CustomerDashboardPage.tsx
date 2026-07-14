import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Package, LogOut, Leaf, User, ShoppingBag, ExternalLink, MapPin, Heart, Star, RotateCcw, Download } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '@/lib/api'
import { useRetailCart } from '@/context/RetailCartContext'
import type { Order, Address, CustomerReview, Product } from '@/types'

type Tab = 'orders' | 'addresses' | 'wishlist' | 'reviews' | 'profile'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  shipped: 'bg-blue-100 text-blue-700',
  delivered: 'bg-forest-100 text-forest-700',
  completed: 'bg-forest-100 text-forest-700',
  cancelled: 'bg-terra-100 text-terra-700',
}

const inputClass = 'w-full px-3 py-2 rounded-xl border border-forest-200 text-sm'
const labelClass = 'block text-xs font-600 text-forest-700 mb-1'

const emptyAddress = { label: 'Home', firstName: '', lastName: '', addressLine1: '', city: '', state: 'TN', postalCode: '', country: 'US', isDefault: false }

export default function CustomerDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { addItem } = useRetailCart()
  const [activeTab, setActiveTab] = useState<Tab>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [wishlist, setWishlist] = useState<{ product: Product }[]>([])
  const [reviews, setReviews] = useState<CustomerReview[]>([])
  const [loading, setLoading] = useState(true)
  const [addrForm, setAddrForm] = useState(emptyAddress)
  const [showAddrForm, setShowAddrForm] = useState(false)
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: '' })
  const [pwForm, setPwForm] = useState({ current: '', password: '', confirm: '' })
  const [msg, setMsg] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      api.getCustomerOrders().then(r => setOrders(r.orders)),
      api.getAddresses().then(r => setAddresses(r.addresses)).catch(() => {}),
      api.getWishlist().then(r => setWishlist(r.wishlist)).catch(() => {}),
      api.getMyReviews().then(r => setReviews(r.reviews)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleLogout = async () => { await logout(); navigate('/login') }

  const reorder = (order: Order) => {
    order.items.forEach(i => addItem(i.product, i.quantity))
    navigate('/checkout')
  }

  const downloadInvoice = async (orderId: string) => {
    const token = localStorage.getItem('mg_token')
    const res = await fetch(`/api/orders/${orderId}/invoice`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    const html = await res.text()
    const w = window.open('', '_blank')
    if (w) { w.document.write(html); w.document.close() }
  }

  const saveAddress = async () => {
    await api.createAddress(addrForm)
    setShowAddrForm(false)
    setAddrForm(emptyAddress)
    load()
  }

  const saveProfile = async () => {
    await api.updateProfile(profileForm)
    setMsg('Profile updated!')
  }

  const changePassword = async () => {
    await api.updatePassword(pwForm.current, pwForm.password, pwForm.confirm)
    setMsg('Password changed!')
    setPwForm({ current: '', password: '', confirm: '' })
  }

  const tabs = [
    { id: 'orders' as Tab, label: 'Orders', icon: Package },
    { id: 'addresses' as Tab, label: 'Addresses', icon: MapPin },
    { id: 'wishlist' as Tab, label: 'Wishlist', icon: Heart },
    { id: 'reviews' as Tab, label: 'Reviews', icon: Star },
    { id: 'profile' as Tab, label: 'Profile', icon: User },
  ]

  return (
    <div className="min-h-screen bg-cream-50">
      <header className="bg-forest-900 text-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-forest-600 rounded-lg flex items-center justify-center"><Leaf className="w-4 h-4 text-white" /></div>
              <span className="font-sans font-700 text-cream-100 text-sm">My Account</span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/shop" className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-forest-800 rounded-lg text-sm font-600 text-sage-300"><ShoppingBag className="w-4 h-4" />Shop</Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 bg-forest-800 rounded-lg text-sm font-600 text-sage-300"><LogOut className="w-4 h-4" /><span className="hidden sm:inline">Sign Out</span></button>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-hide">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-600 border-b-2 whitespace-nowrap ${activeTab === tab.id ? 'border-cream-200 text-cream-100' : 'border-transparent text-forest-400'}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {msg && <div className="mb-4 px-4 py-2 bg-forest-50 text-forest-800 rounded-xl text-sm">{msg}</div>}

        {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-700 text-2xl text-forest-900 mb-6">Order History</h1>
            {loading ? <p className="text-sage-500">Loading...</p> : orders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-forest-100">
                <Package className="w-12 h-12 text-sage-300 mx-auto mb-4" />
                <p className="text-sage-500 mb-4">No orders yet</p>
                <Link to="/shop" className="inline-flex items-center gap-2 px-5 py-2.5 bg-forest-600 text-white rounded-xl text-sm font-600">Browse Plants</Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-forest-100 shadow-sm overflow-hidden">
                    <div className="p-5 flex flex-wrap justify-between gap-4 border-b border-forest-50">
                      <div>
                        <div className="flex items-center gap-3">
                          <p className="font-700 text-forest-900">{order.orderNumber}</p>
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-600 capitalize ${statusColors[order.status] || 'bg-sage-100'}`}>{order.status}</span>
                        </div>
                        <p className="text-sage-500 text-sm mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-700 text-xl text-forest-900">${order.total.toFixed(2)}</p>
                        <button onClick={() => reorder(order)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-600 text-forest-700 border border-forest-200 rounded-lg hover:bg-forest-50">
                          <RotateCcw className="w-3.5 h-3.5" /> Reorder
                        </button>
                        <button onClick={() => downloadInvoice(order.id)} className="flex items-center gap-1 px-3 py-1.5 text-sm font-600 text-forest-700 border border-forest-200 rounded-lg hover:bg-forest-50">
                          <Download className="w-3.5 h-3.5" /> Invoice
                        </button>
                      </div>
                    </div>
                    <div className="p-5 grid sm:grid-cols-2 gap-3">
                      {order.items.map(item => (
                        <div key={item.product.id} className="flex items-center gap-3 bg-cream-50 rounded-xl p-3">
                          <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          <div><p className="font-600 text-sm">{item.product.name}</p><p className="text-xs text-sage-500">Qty: {item.quantity}</p></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'addresses' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h1 className="font-display font-700 text-2xl text-forest-900">Address Book</h1>
              <button onClick={() => setShowAddrForm(true)} className="px-4 py-2 bg-forest-700 text-white rounded-xl text-sm font-600">Add Address</button>
            </div>
            {showAddrForm && (
              <div className="bg-white rounded-2xl border p-6 mb-6 grid sm:grid-cols-2 gap-4">
                {[
                  ['label', 'Label'], ['firstName', 'First Name'], ['lastName', 'Last Name'],
                  ['addressLine1', 'Address'], ['city', 'City'], ['state', 'State'], ['postalCode', 'ZIP'],
                ].map(([key, label]) => (
                  <div key={key}><label className={labelClass}>{label}</label>
                    <input className={inputClass} value={(addrForm as Record<string, string>)[key]} onChange={e => setAddrForm(f => ({ ...f, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="sm:col-span-2 flex gap-3">
                  <button onClick={saveAddress} className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-600">Save</button>
                  <button onClick={() => setShowAddrForm(false)} className="px-4 py-2 text-sage-600 text-sm">Cancel</button>
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-2 gap-4">
              {addresses.map(a => (
                <div key={a.id} className="bg-white rounded-2xl border p-5">
                  <div className="flex justify-between mb-2">
                    <span className="font-600 text-forest-900">{a.label}</span>
                    {a.isDefault && <span className="text-xs bg-forest-100 text-forest-700 px-2 py-0.5 rounded-full">Default</span>}
                  </div>
                  <p className="text-sm text-sage-600">{a.firstName} {a.lastName}</p>
                  <p className="text-sm text-sage-600">{a.addressLine1}</p>
                  <p className="text-sm text-sage-600">{a.city}, {a.state} {a.postalCode}</p>
                  <button onClick={async () => { await api.deleteAddress(a.id); load() }} className="text-terra-600 text-xs mt-3 hover:underline">Delete</button>
                </div>
              ))}
              {addresses.length === 0 && <p className="text-sage-500 col-span-2">No addresses saved.</p>}
            </div>
          </motion.div>
        )}

        {activeTab === 'wishlist' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-700 text-2xl text-forest-900 mb-6">Wishlist</h1>
            {wishlist.length === 0 ? <p className="text-sage-500">Your wishlist is empty.</p> : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map(w => (
                  <div key={w.product.id} className="bg-white rounded-2xl border overflow-hidden">
                    <Link to={`/product/${w.product.slug || w.product.id}`}>
                      <img src={w.product.image} alt="" className="w-full h-40 object-cover" />
                    </Link>
                    <div className="p-4">
                      <Link to={`/product/${w.product.slug || w.product.id}`} className="font-600 text-forest-900 hover:underline">{w.product.name}</Link>
                      <p className="text-forest-700 font-700 mt-1">${w.product.price.toFixed(2)}</p>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => addItem(w.product)} className="flex-1 py-2 bg-forest-600 text-white rounded-lg text-sm font-600">Add to Cart</button>
                        <button onClick={async () => { await api.removeFromWishlist(w.product.id); load() }} className="px-3 py-2 text-terra-600 border border-terra-200 rounded-lg text-sm">Remove</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'reviews' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display font-700 text-2xl text-forest-900 mb-6">My Reviews</h1>
            {reviews.length === 0 ? <p className="text-sage-500">You haven't written any reviews yet.</p> : (
              <div className="space-y-4">
                {reviews.map(r => (
                  <div key={r.id} className="bg-white rounded-2xl border p-5">
                    <div className="flex justify-between mb-2">
                      <span className="font-600">{r.productName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${r.status === 'approved' ? 'bg-forest-100 text-forest-700' : 'bg-amber-100 text-amber-700'}`}>{r.status}</span>
                    </div>
                    <div className="flex mb-2">{Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-sage-300'}`} />
                    ))}</div>
                    <p className="text-sm text-sage-600">{r.body}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white rounded-2xl border p-6 max-w-lg">
              <h2 className="font-700 text-forest-900 mb-4">Profile Information</h2>
              <div className="space-y-3">
                <div><label className={labelClass}>Name</label><input className={inputClass} value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} /></div>
                <div><label className={labelClass}>Phone</label><input className={inputClass} value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} /></div>
                <p className="text-sm text-sage-500">Email: {user?.email}</p>
                <button onClick={saveProfile} className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-600">Save Profile</button>
              </div>
            </div>
            <div className="bg-white rounded-2xl border p-6 max-w-lg">
              <h2 className="font-700 text-forest-900 mb-4">Change Password</h2>
              <div className="space-y-3">
                <div><label className={labelClass}>Current Password</label><input type="password" className={inputClass} value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} /></div>
                <div><label className={labelClass}>New Password</label><input type="password" className={inputClass} value={pwForm.password} onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))} /></div>
                <div><label className={labelClass}>Confirm Password</label><input type="password" className={inputClass} value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} /></div>
                <button onClick={changePassword} className="px-6 py-2 bg-forest-700 text-white rounded-xl text-sm font-600">Update Password</button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  )
}
