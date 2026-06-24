import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { Menu, X, Leaf, ShoppingBag, LogIn, LayoutDashboard } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const navLinks = [
  { label: 'Shop', to: '/shop' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Wholesale', to: '/wholesale/apply' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-cream-50/95 backdrop-blur-md shadow-sm border-b border-forest-100'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group focus-ring rounded-lg">
              <div className="w-9 h-9 bg-forest-600 rounded-xl flex items-center justify-center group-hover:bg-forest-700 transition-colors">
                <Leaf className="w-5 h-5 text-cream-100" strokeWidth={2} />
              </div>
              <div className="leading-tight">
                <span className="font-display font-bold text-forest-800 text-base block leading-none">
                  Meadowlark
                </span>
                <span className="text-[10px] font-sans font-500 text-sage-600 tracking-widest uppercase block">
                  Gardens TN
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-sans font-500 transition-all duration-200 focus-ring ${
                    pathname === link.to
                      ? 'bg-forest-100 text-forest-700'
                      : 'text-forest-700 hover:bg-forest-50 hover:text-forest-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={isAdmin ? '/admin' : '/wholesale/portal'}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-sans font-600 text-forest-700 hover:bg-forest-50 rounded-lg transition-colors focus-ring"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {isAdmin ? 'Admin' : 'Portal'}
                  </Link>
                  <button
                    onClick={logout}
                    className="px-4 py-2 text-sm font-sans font-600 text-terra-600 hover:bg-terra-50 rounded-lg transition-colors focus-ring"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/wholesale/login"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-sans font-600 text-forest-700 hover:bg-forest-50 rounded-lg transition-colors focus-ring"
                  >
                    <LogIn className="w-4 h-4" />
                    Wholesale Login
                  </Link>
                  <Link
                    to="/shop"
                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-sans font-700 bg-forest-600 hover:bg-forest-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 focus-ring"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Shop Plants
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="md:hidden p-2 rounded-lg text-forest-700 hover:bg-forest-100 transition-colors focus-ring"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-cream-50 flex flex-col pt-20 px-6 pb-10 md:hidden"
          >
            <nav className="flex flex-col gap-2 mt-4">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07, duration: 0.3 }}
                >
                  <Link
                    to={link.to}
                    className={`block px-4 py-3 rounded-xl text-lg font-sans font-600 transition-colors ${
                      pathname === link.to
                        ? 'bg-forest-100 text-forest-700'
                        : 'text-forest-800 hover:bg-forest-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="mt-6 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  <Link
                    to={isAdmin ? '/admin' : '/wholesale/portal'}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-700 bg-forest-600 text-white"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {isAdmin ? 'Admin Dashboard' : 'Wholesale Portal'}
                  </Link>
                  <button
                    onClick={logout}
                    className="py-3 rounded-xl font-sans font-700 text-terra-600 border-2 border-terra-200 hover:bg-terra-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/wholesale/login"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-700 text-forest-700 border-2 border-forest-200 hover:bg-forest-50 transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Wholesale Login
                  </Link>
                  <Link
                    to="/shop"
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-sans font-700 bg-forest-600 text-white hover:bg-forest-700 transition-colors"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    Shop Plants
                  </Link>
                </>
              )}
            </div>
            <p className="mt-auto text-center text-xs text-sage-500 font-sans">
              {user ? `Logged in as ${user.businessName}` : 'demo: wholesale@demo.com / admin@meadowlarkgardens.com · any 4+ char password'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}