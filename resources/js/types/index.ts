export interface Product {
  id: string
  name: string
  category: string
  price: number
  wholesalePrice: number
  image: string
  description: string
  badge?: string
  inStock: boolean
  minWholesaleQty: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface WholesaleApplication {
  id: string
  businessName: string
  contactName: string
  email: string
  phone: string
  address: string
  businessType: string
  estimatedMonthlyOrder: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

export interface WholesaleUser {
  id: string
  businessName: string
  email: string
  password: string
  approved: boolean
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  businessName: string
  items: CartItem[]
  total: number
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  paymentMethod: string
}

export interface AdminStats {
  totalRevenue: number
  totalOrders: number
  pendingApplications: number
  activeWholesalers: number
}