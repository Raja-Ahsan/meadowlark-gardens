import type { AdminStats, Order, Product, WholesaleApplication } from '@/types'

const API_BASE = '/api'

export interface AuthUser {
  id: string
  businessName: string
  email: string
  role: 'wholesale' | 'admin'
}

export function getToken(): string | null {
  return localStorage.getItem('mg_token')
}

export function setToken(token: string | null) {
  if (token) localStorage.setItem('mg_token', token)
  else localStorage.removeItem('mg_token')
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
}

interface WholesaleOrderPayload {
  paymentMethod: string
  items: { productId: string; quantity: number }[]
}

interface ProductPayload {
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

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AuthUser; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () => request<{ message: string }>('/auth/logout', { method: 'POST' }),

  getUser: () => request<{ user: AuthUser }>('/auth/user'),

  getProducts: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams()
    if (params?.category) query.set('category', params.category)
    if (params?.search) query.set('search', params.search)
    const qs = query.toString()
    return request<{ products: Product[] }>(`/products${qs ? `?${qs}` : ''}`)
  },

  getCategories: () => request<{ categories: string[] }>('/products/categories'),

  submitContact: (payload: ContactPayload) =>
    request<{ message: string }>('/contact', { method: 'POST', body: JSON.stringify(payload) }),

  submitWholesaleApplication: (payload: WholesaleApplicationPayload) =>
    request<{ message: string }>('/wholesale/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  placeRetailOrder: (payload: RetailOrderPayload) =>
    request<{ message: string; order: Order }>('/orders/retail', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getWholesaleOrders: () => request<{ orders: Order[] }>('/wholesale/orders'),

  placeWholesaleOrder: (payload: WholesaleOrderPayload) =>
    request<{ message: string; order: Order }>('/wholesale/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getAdminStats: () => request<{ stats: AdminStats }>('/admin/stats'),

  getAdminProducts: () => request<{ products: Product[] }>('/admin/products'),

  createProduct: (payload: ProductPayload) =>
    request<{ message: string; product: Product }>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateProduct: (id: string, payload: ProductPayload) =>
    request<{ message: string; product: Product }>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteProduct: (id: string) =>
    request<{ message: string }>(`/admin/products/${id}`, { method: 'DELETE' }),

  getAdminOrders: () => request<{ orders: Order[] }>('/admin/orders'),

  updateOrderStatus: (id: string, status: Order['status']) =>
    request<{ message: string; order: Order }>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getAdminApplications: () =>
    request<{ applications: WholesaleApplication[] }>('/admin/applications'),

  updateApplicationStatus: (id: string, status: 'approved' | 'rejected') =>
    request<{ message: string; application: WholesaleApplication }>(
      `/admin/applications/${id}/status`,
      { method: 'PATCH', body: JSON.stringify({ status }) }
    ),
}
