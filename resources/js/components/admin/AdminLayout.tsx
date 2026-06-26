import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Package, FolderTree, Tag, ShoppingBag, Users,
  Ticket, Star, ClipboardList, Truck, Settings, LogOut, Menu, X, Mail,
  SlidersHorizontal, MessageSquare, Shield, ExternalLink, UserCircle, FileText,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSiteSettings } from '@/context/SiteSettingsContext'
import SiteLogo from '@/components/layout/SiteLogo'
import { mediaUrl } from '@/lib/media'

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/brands', label: 'Brands', icon: Tag },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/wholesalers', label: 'Wholesale Apps', icon: ClipboardList },
  { to: '/admin/shipping', label: 'Shipping', icon: Truck },
  { to: '/admin/profile', label: 'Profile', icon: UserCircle },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/email-templates', label: 'Email Templates', icon: Mail },
  { to: '/admin/legal-pages', label: 'Legal Pages', icon: FileText },
  { to: '/admin/attributes', label: 'Attributes', icon: SlidersHorizontal },
  { to: '/admin/contact', label: 'Messages', icon: MessageSquare },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { siteName, headerLogo, footerLogo, ready: settingsReady } = useSiteSettings()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const NavContent = () => (
    <>
      <div className="p-6 border-b border-forest-800">
        <SiteLogo
          siteName={siteName}
          logo={headerLogo || footerLogo}
          variant="admin"
          settingsReady={settingsReady}
        />
      </div>
      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-sans font-600 transition-colors ${
                isActive ? 'bg-forest-700 text-cream-100' : 'text-forest-300 hover:bg-forest-800 hover:text-cream-200'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-forest-800">
        <NavLink
          to="/admin/profile"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 mb-3 px-2 py-1 rounded-lg hover:bg-forest-800 transition-colors"
        >
          {user?.avatar ? (
            <img src={mediaUrl(user.avatar)} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 bg-forest-600 rounded-full flex items-center justify-center shrink-0">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-cream-200 text-sm font-sans font-600 truncate">{user?.businessName}</p>
            <p className="text-forest-400 text-xs font-body truncate">{user?.email}</p>
          </div>
        </NavLink>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-600 text-forest-300 hover:bg-forest-800 hover:text-cream-200 transition-colors mb-2"
        >
          <ExternalLink className="w-4 h-4" />
          Visit Website
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-sans font-600 text-forest-300 hover:bg-forest-800 hover:text-terra-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-cream-50 flex font-body text-forest-800 antialiased">
      <aside className="hidden lg:flex flex-col w-64 bg-forest-900 text-white fixed inset-y-0 left-0 z-40 font-sans">
        <NavContent />
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-forest-900/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-forest-900 text-white flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-forest-300">
              <X className="w-5 h-5" />
            </button>
            <NavContent />
          </aside>
        </div>
      )}

      <div className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        <header className="hidden lg:flex items-center justify-end px-8 py-3 bg-white border-b border-forest-100 sticky top-0 z-20">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-600 text-forest-700 border border-forest-200 hover:bg-forest-50 hover:border-forest-300 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Visit Website
          </a>
        </header>
        <header className="lg:hidden bg-forest-900 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="text-forest-300">
            <Menu className="w-5 h-5" />
          </button>
          <SiteLogo
            siteName={siteName}
            logo={headerLogo || footerLogo}
            variant="admin"
            settingsReady={settingsReady}
            className="scale-90 origin-left"
          />
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-forest-300 hover:text-cream-200" aria-label="Visit website">
              <ExternalLink className="w-5 h-5" />
            </a>
            <button onClick={handleLogout} className="text-forest-300"><LogOut className="w-5 h-5" /></button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
