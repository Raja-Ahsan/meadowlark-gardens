import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  LayoutDashboard, Package, Users, ClipboardList,
  LogOut, Leaf, DollarSign, ShoppingBag,
  CheckCircle, XCircle, Pencil, Trash2
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { mockApplications, mockOrders } from '@/data/mockData'
import { products } from '@/data/products'
import { WholesaleApplication } from '@/types'

type AdminTab = 'overview' | 'products' | 'orders' | 'wholesalers'

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-forest-100 text-forest-700',
  rejected: 'bg-terra-100 text-terra-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-forest-100 text-forest-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

const stats = [
  { icon: DollarSign, label: 'Total Revenue', value: '$12,480', change: '+18.2%', up: true, color: 'bg-forest-100 text-forest-600' },
  { icon: ShoppingBag, label: 'Total Orders', value: '47', change: '+12.5%', up: true, color: 'bg-blue-100 text-blue-600' },
  { icon: ClipboardList, label: 'Pending Applications', value: '2', change: '+1 new', up: false, color: 'bg-amber-100 text-amber-600' },
  { icon: Users, label: 'Active Wholesalers', value: '85', change: '+3 this month', up: true, color: 'bg-sage-100 text-sage-700' },
]

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [applications, setApplications] = useState<WholesaleApplication[]>(mockApplications)

  const handleLogout = () => { logout(); navigate('/wholesale/login') }

  const updateStatus = (id: string, status: 'approved' | 'rejected') => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a))
  }

  const pending = applications.filter(a => a.status === 'pending')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-forest-900 text-white fixed inset-y-0 left-0 z-40">
        <div className="p-6 border-b border-forest-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-sans font-700 text-cream-100 text-sm block leading-none">Meadowlark</span>
              <span className="text-forest-400 text-xs">Admin Panel</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {([
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'wholesalers', label: 'Wholesaler Requests', icon: ClipboardList },
          ] as const).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-600 transition-colors focus-ring ${
                activeTab === item.id ? 'bg-forest-700 text-cream-100' : 'text-forest-300 hover:bg-forest-800 hover:text-cream-200'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
              {item.id === 'wholesalers' && pending.length > 0 && (
                <span className="ml-auto bg-amber-500 text-white text-xs font-700 w-5 h-5 rounded-full flex items-center justify-center">
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-forest-800">
          <div className="mb-3 px-2">
            <p className="text-cream-200 text-sm font-sans font-600">{user?.businessName}</p>
            <p className="text-forest-400 text-xs">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-600 text-forest-300 hover:bg-forest-800 hover:text-terra-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden bg-forest-900 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-forest-400" />
            <span className="font-sans font-700 text-cream-100 text-sm">Admin Panel</span>
          </div>
          <button onClick={handleLogout} className="text-forest-300 hover:text-white">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Tab Bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 flex overflow-x-auto scrollbar-hide">
          {([
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'products', label: 'Products', icon: Package },
            { id: 'orders', label: 'Orders', icon: ShoppingBag },
            { id: 'wholesalers', label: 'Requests', icon: ClipboardList },
          ] as const).map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-none flex flex-col items-center gap-1 px-5 py-3 text-xs font-sans font-600 border-b-2 transition-colors ${
                activeTab === item.id ? 'border-forest-600 text-forest-700' : 'border-transparent text-gray-500'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        <main className="p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            {/* Overview */}
            {activeTab === 'overview' && (
              <motion.div key="overview" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <h1 className="font-display font-700 text-forest-900 text-2xl">Dashboard Overview</h1>
                  <p className="text-gray-500 text-sm font-body mt-1">Welcome back, {user?.businessName}. Here's what's happening.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                  {stats.map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-sans font-600 px-2 py-0.5 rounded-full ${stat.up ? 'bg-forest-50 text-forest-600' : 'bg-amber-50 text-amber-600'}`}>
                          {stat.change}
                        </span>
                      </div>
                      <p className="font-display font-700 text-forest-900 text-2xl">{stat.value}</p>
                      <p className="text-gray-500 text-sm font-body mt-0.5">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-sans font-700 text-forest-900 mb-4 flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-forest-600" />
                      Recent Orders
                    </h2>
                    <div className="space-y-3">
                      {mockOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-sans font-600 text-forest-800 text-sm">{order.id}</p>
                            <p className="text-gray-500 text-xs">{order.businessName}</p>
                          </div>
                          <div className="text-right">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-sans font-600 capitalize ${statusColors[order.status]}`}>
                              {order.status}
                            </span>
                            <p className="text-forest-700 font-sans font-700 text-sm mt-0.5">${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="font-sans font-700 text-forest-900 mb-4 flex items-center gap-2">
                      <ClipboardList className="w-5 h-5 text-amber-600" />
                      Pending Applications
                      {pending.length > 0 && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-700 px-2 py-0.5 rounded-full">{pending.length}</span>
                      )}
                    </h2>
                    {pending.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-10 h-10 text-forest-300 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">All applications reviewed!</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {pending.map(app => (
                          <div key={app.id} className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-sans font-700 text-forest-800 text-sm">{app.businessName}</p>
                                <p className="text-gray-500 text-xs">{app.contactName} · {app.businessType}</p>
                              </div>
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-sans font-600 rounded-full">Pending</span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => updateStatus(app.id, 'approved')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-forest-600 text-white text-xs font-sans font-600 rounded-lg hover:bg-forest-700 transition-colors"
                              >
                                <CheckCircle className="w-3 h-3" /> Approve
                              </button>
                              <button
                                onClick={() => updateStatus(app.id, 'rejected')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-terra-100 text-terra-700 text-xs font-sans font-600 rounded-lg hover:bg-terra-200 transition-colors"
                              >
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <motion.div key="products" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="font-display font-700 text-forest-900 text-2xl">Products</h1>
                    <p className="text-gray-500 text-sm font-body mt-0.5">{products.length} products in catalog</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-forest-600 hover:bg-forest-700 text-white text-sm font-sans font-600 rounded-xl transition-colors focus-ring">
                    Add Product
                  </button>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {['Product', 'Category', 'Retail Price', 'Wholesale Price', 'Status', 'Actions'].map(h => (
                            <th key={h} className="text-left px-4 py-3 text-xs font-sans font-700 text-gray-500 uppercase tracking-wide">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {products.map(product => (
                          <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                                <div>
                                  <p className="font-sans font-600 text-forest-800 text-sm">{product.name}</p>
                                  {product.badge && <span className="text-xs text-forest-500">{product.badge}</span>}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                            <td className="px-4 py-3 text-sm font-sans font-600 text-forest-700">${product.price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm font-sans font-600 text-forest-600">${product.wholesalePrice.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-sans font-600 ${product.inStock ? 'bg-forest-100 text-forest-700' : 'bg-gray-100 text-gray-500'}`}>
                                {product.inStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button className="p-1.5 text-gray-400 hover:text-forest-600 hover:bg-forest-50 rounded-lg transition-colors" aria-label="Edit">
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-gray-400 hover:text-terra-600 hover:bg-terra-50 rounded-lg transition-colors" aria-label="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <h1 className="font-display font-700 text-forest-900 text-2xl">All Orders</h1>
                  <p className="text-gray-500 text-sm font-body mt-0.5">{mockOrders.length} total orders</p>
                </div>
                <div className="space-y-4">
                  {mockOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    >
                      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50">
                        <div>
                          <div className="flex items-center gap-3">
                            <p className="font-sans font-700 text-forest-900">{order.id}</p>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-sans font-600 capitalize ${statusColors[order.status]}`}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm font-body mt-0.5">
                            {order.businessName} · {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="font-sans font-700 text-forest-900 text-lg">${order.total.toFixed(2)}</p>
                          <select
                            defaultValue={order.status}
                            className="text-xs font-sans font-600 border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-forest-800 focus:outline-none"
                          >
                            <option>processing</option>
                            <option>shipped</option>
                            <option>delivered</option>
                            <option>cancelled</option>
                          </select>
                        </div>
                      </div>
                      <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {order.items.map(item => (
                          <div key={item.product.id} className="flex items-center gap-3 text-sm bg-gray-50 rounded-xl p-3">
                            <div className="w-8 h-8 bg-forest-100 rounded-lg flex items-center justify-center shrink-0">
                              <Leaf className="w-4 h-4 text-forest-500" />
                            </div>
                            <div>
                              <p className="font-sans font-600 text-forest-800 text-xs">{item.product.name}</p>
                              <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Wholesalers/Applications Tab */}
            {activeTab === 'wholesalers' && (
              <motion.div key="wholesalers" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <div className="mb-6">
                  <h1 className="font-display font-700 text-forest-900 text-2xl">Wholesaler Applications</h1>
                  <p className="text-gray-500 text-sm font-body mt-0.5">{applications.length} total · {pending.length} pending review</p>
                </div>
                <div className="space-y-4">
                  {applications.map((app, i) => (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                        app.status === 'pending' ? 'border-amber-200' : 'border-gray-100'
                      }`}
                    >
                      <div className="p-5 flex flex-col sm:flex-row sm:items-start gap-4">
                        <div className="w-12 h-12 bg-forest-100 rounded-xl flex items-center justify-center shrink-0">
                          <Users className="w-6 h-6 text-forest-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-sans font-700 text-forest-900">{app.businessName}</h3>
                            <span className={`self-start px-2.5 py-0.5 rounded-full text-xs font-sans font-600 capitalize ${statusColors[app.status]}`}>
                              {app.status}
                            </span>
                          </div>
                          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm font-body text-gray-600">
                            <span><strong className="font-sans font-600 text-forest-700">Contact:</strong> {app.contactName}</span>
                            <span><strong className="font-sans font-600 text-forest-700">Email:</strong> {app.email}</span>
                            <span><strong className="font-sans font-600 text-forest-700">Phone:</strong> {app.phone}</span>
                            <span><strong className="font-sans font-600 text-forest-700">Type:</strong> {app.businessType}</span>
                            <span><strong className="font-sans font-600 text-forest-700">Monthly Est.:</strong> {app.estimatedMonthlyOrder}</span>
                            <span><strong className="font-sans font-600 text-forest-700">Submitted:</strong> {new Date(app.submittedAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-500 text-xs mt-2">{app.address}</p>
                        </div>
                        {app.status === 'pending' && (
                          <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                            <button
                              onClick={() => updateStatus(app.id, 'approved')}
                              className="flex items-center gap-1.5 px-4 py-2 bg-forest-600 text-white text-sm font-sans font-600 rounded-xl hover:bg-forest-700 transition-colors focus-ring"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => updateStatus(app.id, 'rejected')}
                              className="flex items-center gap-1.5 px-4 py-2 bg-terra-50 text-terra-700 text-sm font-sans font-600 rounded-xl hover:bg-terra-100 transition-colors border border-terra-200 focus-ring"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        )}
                        {app.status !== 'pending' && (
                          <div className="shrink-0">
                            <span className={`px-3 py-1.5 rounded-xl text-sm font-sans font-600 capitalize ${statusColors[app.status]}`}>
                              {app.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                            </span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}