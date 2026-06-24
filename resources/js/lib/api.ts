import type { AdminStats, Order, Product, WholesaleApplication } from '@/types'
import type {
  Brand, Category, Coupon, Customer, EmailTemplate, ExtendedAdminStats,
  ListParams, PaginatedMeta, PaginatedResponse, ShippingZone,
} from '@/types/admin'

const API_BASE = '/api'

export interface AuthUser {
  id: string
  name: string
  businessName: string
  email: string
  phone?: string | null
  avatar?: string | null
  role: 'wholesale' | 'admin' | 'customer'
}

export function getToken(): string | null {
  return localStorage.getItem('mg_token')
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('mg_token', token)
  else localStorage.removeItem('mg_token')
}

function buildQuery(params?: ListParams | Record<string, string | number | boolean | undefined>): string {
  if (!params) return ''
  const query = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== '' && v !== null) query.set(k, String(v))
  })
  const qs = query.toString()
  return qs ? `?${qs}` : ''
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string> | undefined),
  }

  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data as T
}

interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
}

interface WholesaleApplicationPayload {
  businessName: string
  contactName: string
  email: string
  phone: string
  address: string
  businessType: string
  estimatedMonthlyOrder: string
  message?: string
}

interface RetailOrderPayload {
  customerName: string
  customerEmail: string
  paymentMethod: string
  items: { productId: string; quantity: number }[]
  couponCode?: string
}

interface WholesaleOrderPayload {
  paymentMethod: string
  items: { productId: string; quantity: number; variationId?: string }[]
  couponCode?: string
  orderNotes?: string
  billingAddress?: Record<string, string>
  shippingAddress?: Record<string, string>
}

export interface ShopCategory {
  name: string
  slug: string
  count: number
}

export interface ProductImagePayload {
  path: string
  alt?: string
  isPrimary?: boolean
}

export interface VariationPayload {
  sku?: string
  price: number
  salePrice?: number
  wholesalePrice?: number
  stockQuantity?: number
  image?: string
  attributeValues?: Record<string, string>
  isActive?: boolean
}

export interface ProductPayload {
  name: string
  slug?: string
  sku?: string
  type?: 'simple' | 'variable'
  category?: string
  categoryId?: string
  brandId?: string
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
  lowStockThreshold?: number
  manageStock?: boolean
  allowBackorder?: boolean
  minWholesaleQty: number
  tags?: string[]
  isFeatured?: boolean
  isActive?: boolean
  weight?: number
  metaTitle?: string
  metaDescription?: string
  images?: ProductImagePayload[]
  variations?: VariationPayload[]
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string, passwordConfirmation: string) =>
    request<{ token: string; user: AuthUser; message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation: passwordConfirmation }),
    }),

  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),
  getUser: () => request<{ user: AuthUser }>('/auth/user'),

  getProducts: (params?: { category?: string; search?: string; sort?: string }) => {
    return request<{ products: Product[] }>(`/products${buildQuery(params)}`)
  },

  getCategories: () => request<{ categories: ShopCategory[] }>('/products/categories'),

  validateCoupon: (code: string, cartTotal: number, type: 'retail' | 'wholesale') =>
    request<{ valid: boolean; coupon: { code: string; type: string; discount: number; freeShipping: boolean } }>(
      '/coupons/validate',
      { method: 'POST', body: JSON.stringify({ code, cartTotal, type }) }
    ),

  submitContact: (payload: ContactPayload) =>
    request<{ message: string }>('/contact', { method: 'POST', body: JSON.stringify(payload) }),

  submitWholesaleApplication: (payload: WholesaleApplicationPayload) =>
    request<{ message: string }>('/wholesale/applications', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  placeRetailOrder: (payload: RetailOrderPayload) =>
    request<{ message: string; order: Order }>('/orders/retail', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  getWholesaleOrders: () => request<{ orders: Order[] }>('/wholesale/orders'),

  placeWholesaleOrder: (payload: WholesaleOrderPayload) =>
    request<{ message: string; order: Order }>('/wholesale/orders', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  getCustomerOrders: () => request<{ orders: Order[] }>('/customer/orders'),

  placeCustomerOrder: (payload: WholesaleOrderPayload) =>
    request<{ message: string; order: Order }>('/customer/orders', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  // Admin
  getAdminStats: () => request<{ stats: ExtendedAdminStats }>('/admin/stats'),
  exportData: (type: 'orders' | 'products' | 'customers') =>
    request<{ data: Record<string, unknown>[]; type: string }>(`/admin/export${buildQuery({ type })}`),

  getAdminProducts: (params?: ListParams) =>
    request<PaginatedResponse<Product>>(`/admin/products${buildQuery(params)}`),

  getAdminProduct: (id: string) =>
    request<{ product: Product }>(`/admin/products/${id}`),

  createProduct: (payload: ProductPayload) =>
    request<{ message: string; product: Product }>('/admin/products', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  updateProduct: (id: string, payload: ProductPayload) =>
    request<{ message: string; product: Product }>(`/admin/products/${id}`, {
      method: 'PUT', body: JSON.stringify(payload),
    }),

  deleteProduct: (id: string) =>
    request<{ message: string }>(`/admin/products/${id}`, { method: 'DELETE' }),

  getAdminCategories: (params?: ListParams) =>
    request<PaginatedResponse<Category>>(`/admin/categories${buildQuery(params)}`),

  getAllCategories: () => request<{ categories: Category[] }>('/admin/categories/all'),

  createCategory: (payload: Partial<Category>) =>
    request<{ message: string; category: Category }>('/admin/categories', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  updateCategory: (id: string, payload: Partial<Category>) =>
    request<{ message: string; category: Category }>(`/admin/categories/${id}`, {
      method: 'PUT', body: JSON.stringify(payload),
    }),

  deleteCategory: (id: string) =>
    request<{ message: string }>(`/admin/categories/${id}`, { method: 'DELETE' }),

  getAdminBrands: (params?: ListParams) =>
    request<PaginatedResponse<Brand>>(`/admin/brands${buildQuery(params)}`),

  getAllBrands: () => request<{ brands: Brand[] }>('/admin/brands/all'),

  createBrand: (payload: Partial<Brand>) =>
    request<{ message: string; brand: Brand }>('/admin/brands', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  updateBrand: (id: string, payload: Partial<Brand>) =>
    request<{ message: string; brand: Brand }>(`/admin/brands/${id}`, {
      method: 'PUT', body: JSON.stringify(payload),
    }),

  deleteBrand: (id: string) =>
    request<{ message: string }>(`/admin/brands/${id}`, { method: 'DELETE' }),

  getAdminOrders: (params?: ListParams) =>
    request<PaginatedResponse<Order>>(`/admin/orders${buildQuery(params)}`),

  getAdminOrder: (id: string) =>
    request<{ order: Order; statusHistory: { status: string; note?: string; userName?: string; createdAt: string }[] }>(
      `/admin/orders/${id}`
    ),

  updateOrderStatus: (id: string, status: string, note?: string, trackingNumber?: string) =>
    request<{ message: string; order: Order }>(`/admin/orders/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status, note, trackingNumber }),
    }),

  getAdminCustomers: (params?: ListParams) =>
    request<PaginatedResponse<Customer>>(`/admin/customers${buildQuery(params)}`),

  updateCustomer: (id: string, payload: Partial<Customer>) =>
    request<{ message: string; customer: Customer }>(`/admin/customers/${id}`, {
      method: 'PATCH', body: JSON.stringify(payload),
    }),

  getAdminCoupons: (params?: ListParams) =>
    request<PaginatedResponse<Coupon>>(`/admin/coupons${buildQuery(params)}`),

  createCoupon: (payload: Partial<Coupon>) =>
    request<{ message: string; coupon: Coupon }>('/admin/coupons', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  updateCoupon: (id: string, payload: Partial<Coupon>) =>
    request<{ message: string; coupon: Coupon }>(`/admin/coupons/${id}`, {
      method: 'PUT', body: JSON.stringify(payload),
    }),

  deleteCoupon: (id: string) =>
    request<{ message: string }>(`/admin/coupons/${id}`, { method: 'DELETE' }),

  getAdminReviews: (params?: ListParams) =>
    request<PaginatedResponse<import('@/types/admin').Review>>(`/admin/reviews${buildQuery(params)}`),

  updateReviewStatus: (id: string, status: 'pending' | 'approved' | 'rejected') =>
    request<{ message: string }>(`/admin/reviews/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    }),

  deleteReview: (id: string) =>
    request<{ message: string }>(`/admin/reviews/${id}`, { method: 'DELETE' }),

  getAdminApplications: () =>
    request<{ applications: WholesaleApplication[] }>('/admin/applications'),

  updateApplicationStatus: (id: string, status: 'approved' | 'rejected') =>
    request<{ message: string; application: WholesaleApplication }>(
      `/admin/applications/${id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) }
    ),

  getSettings: () => request<{ settings: Record<string, Record<string, string>> }>('/admin/settings'),

  getSiteSettings: () =>
    request<{ settings: import('@/types').PublicSiteSettings }>('/site-settings'),

  updateSettings: (settings: Record<string, string>, group?: string) =>
    request<{ message: string }>('/admin/settings', {
      method: 'PUT', body: JSON.stringify({ settings, group }),
    }),

  getEmailTemplates: () => request<{ templates: EmailTemplate[] }>('/admin/email-templates'),

  updateEmailTemplate: (id: string, payload: Partial<EmailTemplate>) =>
    request<{ message: string; template: EmailTemplate }>(`/admin/email-templates/${id}`, {
      method: 'PUT', body: JSON.stringify(payload),
    }),

  testEmail: (to: string) =>
    request<{ message: string }>('/admin/test-email', {
      method: 'POST', body: JSON.stringify({ to }),
    }),

  getShipping: () => request<{ zones: ShippingZone[] }>('/admin/shipping'),

  createShippingZone: (payload: Partial<ShippingZone>) =>
    request<{ message: string; zone: ShippingZone }>('/admin/shipping/zones', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  updateShippingZone: (id: string, payload: Partial<ShippingZone>) =>
    request<{ message: string; zone: ShippingZone }>(`/admin/shipping/zones/${id}`, {
      method: 'PUT', body: JSON.stringify(payload),
    }),

  deleteShippingZone: (id: string) =>
    request<{ message: string }>(`/admin/shipping/zones/${id}`, { method: 'DELETE' }),

  createShippingMethod: (payload: Record<string, unknown>) =>
    request<{ message: string; method: import('@/types/admin').ShippingMethod }>('/admin/shipping/methods', {
      method: 'POST', body: JSON.stringify(payload),
    }),

  updateShippingMethod: (id: string, payload: Record<string, unknown>) =>
    request<{ message: string }>(`/admin/shipping/methods/${id}`, {
      method: 'PUT', body: JSON.stringify(payload),
    }),

  deleteShippingMethod: (id: string) =>
    request<{ message: string }>(`/admin/shipping/methods/${id}`, { method: 'DELETE' }),

  // Attributes
  getAdminAttributes: (params?: ListParams) =>
    request<PaginatedResponse<import('@/types/admin').Attribute>>(`/admin/attributes${buildQuery(params)}`),

  getAllAttributes: () => request<{ attributes: import('@/types/admin').Attribute[] }>('/admin/attributes/all'),

  createAttribute: (payload: Record<string, unknown>) =>
    request<{ message: string }>('/admin/attributes', { method: 'POST', body: JSON.stringify(payload) }),

  updateAttribute: (id: string, payload: Record<string, unknown>) =>
    request<{ message: string }>(`/admin/attributes/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteAttribute: (id: string) =>
    request<{ message: string }>(`/admin/attributes/${id}`, { method: 'DELETE' }),

  createVariation: (productId: string, payload: Record<string, unknown>) =>
    request<{ message: string }>(`/admin/products/${productId}/variations`, { method: 'POST', body: JSON.stringify(payload) }),

  deleteVariation: (productId: string, variationId: string) =>
    request<{ message: string }>(`/admin/products/${productId}/variations/${variationId}`, { method: 'DELETE' }),

  getContactMessages: (params?: ListParams) =>
    request<PaginatedResponse<{ id: string; name: string; email: string; subject: string; message: string; createdAt: string }>>(
      `/admin/contact-messages${buildQuery(params)}`
    ),

  deleteContactMessage: (id: string) =>
    request<{ message: string }>(`/admin/contact-messages/${id}`, { method: 'DELETE' }),

  getAuditLogs: (params?: ListParams) =>
    request<PaginatedResponse<{ id: string; action: string; userName: string; modelType?: string; ipAddress?: string; createdAt: string }>>(
      `/admin/audit-logs${buildQuery(params)}`
    ),

  // Customer features
  forgotPassword: (email: string) =>
    request<{ message: string }>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),

  resetPassword: (email: string, token: string, password: string, passwordConfirmation: string) =>
    request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, password, password_confirmation: passwordConfirmation }),
    }),

  updateProfile: (payload: { name?: string; business_name?: string; phone?: string; avatar?: string | null }) =>
    request<{ message: string; user: AuthUser }>('/auth/profile', { method: 'PATCH', body: JSON.stringify(payload) }),

  updatePassword: (currentPassword: string, password: string, passwordConfirmation: string) =>
    request<{ message: string }>('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify({ currentPassword, password, password_confirmation: passwordConfirmation }),
    }),

  uploadFile: (file: File, folder = 'uploads') => {
    const form = new FormData()
    form.append('file', file)
    form.append('folder', folder)
    const token = getToken()
    return fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then(async r => {
      const data = await r.json()
      if (!r.ok) throw new Error(data.message || 'Upload failed')
      return data as { url: string; path: string }
    })
  },

  getProduct: (idOrSlug: string) =>
    request<{ product: Product; related: Product[]; moreFromShop: Product[] }>(`/products/${idOrSlug}`),

  getProductReviews: (productId: string, page = 1, category?: string) =>
    request<{
      reviews: import('@/types').CustomerReview[]
      meta: PaginatedMeta
      insights: import('@/types').ReviewInsights
    }>(`/products/${productId}/reviews${buildQuery({ page, category })}`),

  getShopProfile: () =>
    request<{ shop: import('@/types').ShopProfile }>('/shop'),

  getShopReviews: (page = 1, perPage = 6, category?: string) =>
    request<{
      reviews: import('@/types').CustomerReview[]
      insights: import('@/types').ReviewInsights
      meta: import('@/types/admin').PaginatedMeta
    }>(`/shop/reviews${buildQuery({ page, per_page: perPage, category })}`),

  submitReview: (payload: { productId: string; rating: number; title?: string; body: string }) =>
    request<{ message: string }>('/reviews', { method: 'POST', body: JSON.stringify(payload) }),

  getMyReviews: () => request<{ reviews: import('@/types').CustomerReview[] }>('/my-reviews'),

  getAddresses: () => request<{ addresses: import('@/types').Address[] }>('/addresses'),

  createAddress: (payload: Partial<import('@/types').Address>) =>
    request<{ message: string; address: import('@/types').Address }>('/addresses', { method: 'POST', body: JSON.stringify(payload) }),

  updateAddress: (id: string, payload: Partial<import('@/types').Address>) =>
    request<{ message: string; address: import('@/types').Address }>(`/addresses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),

  deleteAddress: (id: string) => request<{ message: string }>(`/addresses/${id}`, { method: 'DELETE' }),

  getWishlist: () => request<{ wishlist: { id: string; product: Product; addedAt: string }[] }>('/wishlist'),

  addToWishlist: (productId: string) =>
    request<{ message: string }>('/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),

  removeFromWishlist: (productId: string) =>
    request<{ message: string }>(`/wishlist/${productId}`, { method: 'DELETE' }),

  checkWishlist: (productId: string) => request<{ inWishlist: boolean }>(`/wishlist/check/${productId}`),

  getInvoiceUrl: (orderId: string) => `${API_BASE}/orders/${orderId}/invoice`,

  getPaymentConfig: () => request<{
    stripeEnabled: boolean; stripeKey?: string; paypalEnabled: boolean;
    paypalClientId?: string; bankTransferEnabled: boolean; codEnabled: boolean;
    methods: string[];
  }>('/payments/config'),

  createStripeIntent: (amount: number, orderId?: string) =>
    request<{ clientSecret: string; paymentIntentId: string }>('/payments/stripe/intent', {
      method: 'POST', body: JSON.stringify({ amount, orderId }),
    }),
}
