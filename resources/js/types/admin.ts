export interface PaginatedMeta {
  currentPage: number
  lastPage: number
  perPage: number
  total: number
  from: number | null
  to: number | null
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginatedMeta
}

export interface ListParams {
  page?: number
  per_page?: number
  search?: string
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  [key: string]: string | number | boolean | undefined
}

export interface Category {
  id: string
  parentId: string | null
  parentName?: string
  name: string
  slug: string
  description?: string
  image?: string
  metaTitle?: string
  metaDescription?: string
  isActive: boolean
  sortOrder: number
  productCount?: number
}

export interface Brand {
  id: string
  name: string
  slug: string
  logo?: string
  description?: string
  metaTitle?: string
  metaDescription?: string
  isActive: boolean
  productCount?: number
}

export interface Coupon {
  id: string
  code: string
  description?: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  value: number
  minCartValue?: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  perUserLimit?: number
  wholesaleOnly: boolean
  retailOnly: boolean
  startsAt?: string
  expiresAt?: string
  isActive: boolean
}

export interface Review {
  id: string
  productId: string
  productName?: string
  userId: string
  userName?: string
  rating: number
  title?: string
  body: string
  images?: string[]
  isVerifiedPurchase: boolean
  isWholesale: boolean
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

export interface Customer {
  id: string
  name: string
  businessName: string
  email: string
  phone?: string
  role: 'customer' | 'wholesale'
  approved: boolean
  createdAt?: string
  orderCount?: number
}

export interface ShippingZone {
  id: string
  name: string
  countries: string[]
  states?: string[]
  isActive: boolean
  methods: ShippingMethod[]
}

export interface ShippingMethod {
  id: string
  shippingZoneId: string
  name: string
  type: string
  cost: number
  minOrderAmount?: number
  estimatedDays?: string
  wholesaleOnly: boolean
  isActive: boolean
}

export interface EmailTemplate {
  id: string
  slug: string
  name: string
  subject: string
  body: string
  isActive: boolean
}

export interface Attribute {
  id: string
  name: string
  slug: string
  type: string
  isActive: boolean
  values: { id: string; value: string; colorCode?: string }[]
}

export interface ExtendedAdminStats {
  totalRevenue: number
  totalOrders: number
  pendingApplications: number
  activeWholesalers: number
  totalCustomers: number
  totalProducts: number
  lowStockProducts: number
  outOfStock: number
  pendingReviews: number
  revenueThisMonth: number
  revenueLastMonth: number
  ordersThisMonth: number
  ordersLastMonth: number
  monthlyRevenue: { month: string; revenue: number; orders: number }[]
  dailyRevenue: { date: string; revenue: number; orders: number }[]
  ordersByStatus: Record<string, number>
  ordersByType: Record<string, number>
  topProducts: { name: string; sold: number; revenue: number }[]
  recentOrders: {
    id: string
    orderNumber: string
    customer: string
    type: string
    total: number
    status: string
    createdAt: string
  }[]
}
