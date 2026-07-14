import { Link, useNavigate } from 'react-router-dom'
import { Leaf, LogOut, ShoppingCart, Package } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useCart } from '@/context/CartContext'

export type WholesaleTab = 'shop' | 'cart' | 'orders'

interface Props {
  activeTab?: WholesaleTab
  onTabChange?: (tab: WholesaleTab) => void
  onLogout: () => void
}

export default function WholesalePortalHeader({ activeTab, onTabChange, onLogout }: Props) {
  const { user } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const tabs: { id: WholesaleTab; label: string; icon: typeof Leaf; to: string }[] = [
    { id: 'shop', label: 'Shop', icon: Leaf, to: '/wholesale/portal' },
    { id: 'cart', label: `Cart${itemCount > 0 ? ` (${itemCount})` : ''}`, icon: ShoppingCart, to: '/wholesale/portal?tab=cart' },
    { id: 'orders', label: 'My Orders', icon: Package, to: '/wholesale/portal?tab=orders' },
  ]

  return (
    <header className="bg-forest-900 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/wholesale/portal" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-forest-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-sans font-700 text-cream-100 text-sm">Meadowlark Gardens TN</span>
              <span className="text-forest-400 text-xs block leading-none">Wholesale Portal</span>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-cream-200 text-sm font-sans font-600">{user?.businessName}</p>
              <p className="text-forest-400 text-xs">{user?.email}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 bg-forest-800 hover:bg-forest-700 rounded-lg text-sm font-sans font-600 text-sage-300 transition-colors focus-ring"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
        {activeTab && onTabChange && (
          <div className="flex border-t border-forest-800">
            {tabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onTabChange(tab.id)
                  navigate(tab.to)
                }}
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
        )}
      </div>
    </header>
  )
}
