import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutGrid, Package, FolderTree, Tag, ShoppingBag, Users,
  Ticket, Star, ClipboardList, Truck, Settings, LogOut, Menu, X, Mail,
  SlidersHorizontal, MessageSquare, Shield, ExternalLink, UserCircle, FileText, Leaf,
  PanelLeftClose, PanelLeftOpen, Megaphone,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useSiteSettings } from '@/context/SiteSettingsContext'
import SiteLogo from '@/components/layout/SiteLogo'
import { mediaUrl } from '@/lib/media'
import NotificationBell from '@/components/notifications/NotificationBell'

const DESKTOP_QUERY = '(min-width: 1024px)'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY)
    const onChange = () => setIsDesktop(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return isDesktop
}

const navItems = [
  { to: '/admin', label: 'Overview', icon: LayoutGrid, end: true },
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
  { to: '/admin/plant-type-categories', label: 'Plant Categories', icon: FolderTree },
  { to: '/admin/plant-types', label: 'Plant Types', icon: Leaf },
  { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/admin/attributes', label: 'Attributes', icon: SlidersHorizontal },
  { to: '/admin/contact', label: 'Messages', icon: MessageSquare },
  { to: '/admin/audit-logs', label: 'Audit Logs', icon: Shield },
]

const COLLAPSE_KEY = 'admin-sidebar-collapsed'

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const { siteName, headerLogo, footerLogo, ready: settingsReady } = useSiteSettings()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isDesktop = useIsDesktop()
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      // storage unavailable
    }
  }, [collapsed])

  useEffect(() => {
    document.documentElement.classList.add('admin-scroll')
    return () => document.documentElement.classList.remove('admin-scroll')
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  const logo = headerLogo || footerLogo

  const renderNav = (compact: boolean) => (
    <>
      <div className={`border-b border-forest-800 flex items-center ${compact ? 'h-[88px] justify-center px-2' : 'p-6'}`}>
        {compact ? (
          <Link to="/" title={siteName} className="focus-ring rounded-full">
            {logo ? (
              <img src={mediaUrl(logo)} alt={siteName} className="w-11 h-11 p-1 rounded-full bg-[#f3f4ed] object-contain" />
            ) : (
              <div className="w-10 h-10 bg-forest-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-cream-100" strokeWidth={2} />
              </div>
            )}
          </Link>
        ) : (
          <SiteLogo siteName={siteName} logo={logo} variant="admin" settingsReady={settingsReady} />
        )}
      </div>
      <nav className={`admin-sidebar-scroll flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden ${compact ? 'px-3 py-4' : 'p-4'}`}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={compact ? item.label : undefined}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `w-full flex items-center gap-3 rounded-xl text-sm font-sans font-600 transition-colors ${
                compact ? 'justify-center px-0 py-2.5' : 'px-4 py-2.5'
              } ${
                isActive ? 'bg-forest-700 text-cream-100' : 'text-forest-300 hover:bg-forest-800 hover:text-cream-200'
              }`
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {!compact && <span className="truncate">{item.label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className={`border-t border-forest-800 ${compact ? 'p-3' : 'p-4'}`}>
        <NavLink
          to="/admin/profile"
          title={compact ? user?.businessName ?? 'Profile' : undefined}
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 mb-3 py-1 rounded-lg hover:bg-forest-800 transition-colors ${compact ? 'justify-center px-0' : 'px-2'}`}
        >
          {user?.avatar ? (
            <img src={mediaUrl(user.avatar)} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <div className="w-9 h-9 bg-forest-600 rounded-full flex items-center justify-center shrink-0">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
          )}
          {!compact && (
            <div className="min-w-0">
              <p className="text-cream-200 text-sm font-sans font-600 truncate">{user?.businessName}</p>
              <p className="text-forest-400 text-xs font-body truncate">{user?.email}</p>
            </div>
          )}
        </NavLink>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title={compact ? 'Visit Website' : undefined}
          className={`w-full flex items-center gap-2 py-2.5 rounded-xl text-sm font-sans font-600 text-forest-300 hover:bg-forest-800 hover:text-cream-200 transition-colors mb-2 ${compact ? 'justify-center px-0' : 'px-4'}`}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          {!compact && 'Visit Website'}
        </a>
        <button
          onClick={handleLogout}
          title={compact ? 'Sign Out' : undefined}
          className={`w-full flex items-center gap-2 py-2.5 rounded-xl text-sm font-sans font-600 text-forest-300 hover:bg-forest-800 hover:text-terra-300 transition-colors ${compact ? 'justify-center px-0' : 'px-4'}`}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!compact && 'Sign Out'}
        </button>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-cream-50 flex font-body text-forest-800 antialiased">
      <aside
        className={`hidden lg:flex flex-col bg-forest-900 text-white fixed inset-y-0 left-0 z-40 font-sans transition-[width] duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {renderNav(collapsed)}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-forest-900/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-forest-900 text-white flex flex-col">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-forest-300">
              <X className="w-5 h-5" />
            </button>
            {renderNav(false)}
          </aside>
        </div>
      )}

      <div
        className={`flex-1 min-w-0 min-h-screen flex flex-col transition-[margin] duration-300 ease-in-out ${
          collapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <header className="hidden lg:flex items-center justify-between px-8 py-3 bg-white/90 backdrop-blur border-b border-forest-100 sticky top-0 z-20">
          <button
            type="button"
            onClick={() => setCollapsed(c => !c)}
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-forest-700 border border-forest-200 hover:bg-forest-50 hover:border-forest-300 transition-colors"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3">
            {isDesktop && <NotificationBell variant="light" />}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-sans font-600 text-forest-700 border border-forest-200 hover:bg-forest-50 hover:border-forest-300 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Visit Website
            </a>
          </div>
        </header>
        <header className="lg:hidden bg-forest-900 text-white px-4 py-4 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setMobileOpen(true)} className="text-forest-300" aria-label="Open menu">
            <Menu className="w-5 h-5" />
          </button>
          <SiteLogo
            siteName={siteName}
            logo={logo}
            variant="admin"
            settingsReady={settingsReady}
            className="scale-90 origin-left"
          />
          <div className="flex items-center gap-3">
            {!isDesktop && <NotificationBell />}
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
