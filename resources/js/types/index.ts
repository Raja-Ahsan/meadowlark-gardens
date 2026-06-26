export interface Product {
  id: string
  name: string
  slug?: string
  sku?: string
  type?: string
  category: string
  categoryId?: string
  brandId?: string
  brandName?: string
  price: number
  salePrice?: number
  wholesalePrice: number
  saleWholesalePrice?: number
  image: string
  description: string
  shortDescription?: string
  badge?: string
  inStock: boolean
  stockQuantity?: number
  minWholesaleQty: number
  tags?: string[]
  isFeatured?: boolean
  isActive?: boolean
  metaTitle?: string
  metaDescription?: string
  images?: { id: string; path: string; alt?: string; isPrimary: boolean }[]
  variations?: ProductVariation[]
  averageRating?: number
  reviewCount?: number
}

export interface ProductVariation {
  id: string
  sku: string
  price: number
  salePrice?: number
  wholesalePrice?: number
  stockQuantity: number
  image?: string
  attributeValues?: Record<string, string>
  isActive: boolean
}

export interface CartItem {
  product: Product
  quantity: number
  variationId?: string
  variation?: ProductVariation
  unitPrice?: number
  lineTotal?: number
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
  message?: string
  status: 'pending' | 'approved' | 'rejected'
  submittedAt: string
}

export interface Order {
  id: string
  orderNumber: string
  userId: string
  businessName: string
  customerName?: string
  customerEmail?: string
  items: CartItem[]
  subtotal?: number
  discount?: number
  tax?: number
  shippingCost?: number
  shippingCarrier?: string | null
  shippingMethodCode?: string | null
  shippingMethodName?: string | null
  total: number
  status: string
  createdAt: string
  paymentMethod: string
  couponCode?: string
  trackingNumber?: string
  billingAddress?: Record<string, string> | null
  shippingAddress?: Record<string, string> | null
  orderNotes?: string | null
}

export interface Address {
  id: string
  label: string
  firstName: string
  lastName: string
  company?: string
  phone?: string
  email?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault: boolean
}

export interface CustomerReview {
  id: string
  productId: string
  productName?: string
  userId: string
  userName?: string
  rating: number
  title?: string
  body: string
  reviewCategory?: string
  qualityRating?: number
  deliveryRating?: number
  serviceRating?: number
  sellerResponse?: string
  sellerRespondedAt?: string
  images?: string[]
  status: string
  isVerifiedPurchase: boolean
  createdAt: string
  purchasedProduct?: string
  purchasedProductSlug?: string
}

export interface ReviewInsights {
  averageRating: number
  totalReviews: number
  summaryTags: string[]
  breakdown: { quality: number; delivery: number; service: number }
  recommendPercent: number
  categoryCounts: { key: string; label: string; count: number }[]
  reviewPhotos: { url: string; userName: string; reviewId: string }[]
}

export interface ShopProfile {
  name: string
  displayName: string
  owner: string
  location: string
  avatar?: string | null
  rating: number
  reviewCount: number
  salesCount: number
  yearsActive: number
  members: string[]
  badges: { key: string; label: string; description: string }[]
  responseTime: string
}

export interface PublicSiteSettings {
  siteName: string
  siteEmail: string
  sitePhone: string
  headerLogo: string | null
  footerLogo: string | null
  favicon: string | null
  contactPageSubtitle: string
  contactAddress: string
  contactPhoneNote: string
  contactEmailNote: string
  businessHoursWeekday: string
  businessHoursSunday: string
  footerDescription: string
  social: {
    facebook: string
    instagram: string
    twitter: string
    youtube: string
    pinterest: string
  }
}

export interface AdminStats {
  totalRevenue: number
  totalOrders: number
  pendingApplications: number
  activeWholesalers: number
}
