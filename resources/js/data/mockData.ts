import { WholesaleApplication, Order } from '@/types'

export const mockApplications: WholesaleApplication[] = [
  {
    id: 'app-001',
    businessName: 'Green Thumb Nursery',
    contactName: 'Sarah Mitchell',
    email: 'sarah@greenthumb.com',
    phone: '(615) 555-0191',
    address: '245 Garden Way, Nashville, TN 37201',
    businessType: 'Retail Nursery',
    estimatedMonthlyOrder: '$2,000 - $5,000',
    status: 'pending',
    submittedAt: '2025-03-15T10:30:00Z',
  },
  {
    id: 'app-002',
    businessName: 'Bloom & Grow Landscaping',
    contactName: 'Marcus Johnson',
    email: 'marcus@bloomgrow.com',
    phone: '(865) 555-0247',
    address: '88 Creekside Blvd, Knoxville, TN 37902',
    businessType: 'Landscaping Company',
    estimatedMonthlyOrder: '$5,000 - $10,000',
    status: 'pending',
    submittedAt: '2025-03-18T14:20:00Z',
  },
  {
    id: 'app-003',
    businessName: 'Valley Garden Center',
    contactName: 'Patricia Lee',
    email: 'pat@valleygarden.com',
    phone: '(423) 555-0388',
    address: '1420 Market Street, Chattanooga, TN 37402',
    businessType: 'Garden Center',
    estimatedMonthlyOrder: '$1,000 - $2,000',
    status: 'approved',
    submittedAt: '2025-02-28T09:00:00Z',
  },
]

export const mockOrders: Order[] = [
  {
    id: 'ORD-2025-001',
    userId: 'ws-001',
    businessName: 'Valley Garden Center',
    items: [
      { product: { id: '1', name: 'Tennessee Redbud', category: 'Trees', price: 34.99, wholesalePrice: 22.00, image: '', description: '', inStock: true, minWholesaleQty: 5 }, quantity: 10 },
      { product: { id: '2', name: 'Purple Coneflower', category: 'Perennials', price: 8.99, wholesalePrice: 4.50, image: '', description: '', inStock: true, minWholesaleQty: 5 }, quantity: 25 },
    ],
    total: 332.50,
    status: 'delivered',
    createdAt: '2025-03-05T11:00:00Z',
    paymentMethod: 'Net 30',
  },
  {
    id: 'ORD-2025-002',
    userId: 'ws-001',
    businessName: 'Valley Garden Center',
    items: [
      { product: { id: '8', name: 'Southern Magnolia', category: 'Trees', price: 59.99, wholesalePrice: 40.00, image: '', description: '', inStock: true, minWholesaleQty: 5 }, quantity: 6 },
    ],
    total: 240.00,
    status: 'shipped',
    createdAt: '2025-03-20T15:30:00Z',
    paymentMethod: 'Net 30',
  },
  {
    id: 'ORD-2025-003',
    userId: 'ws-001',
    businessName: 'Valley Garden Center',
    items: [
      { product: { id: '4', name: 'Black-Eyed Susan', category: 'Perennials', price: 6.99, wholesalePrice: 3.50, image: '', description: '', inStock: true, minWholesaleQty: 5 }, quantity: 50 },
      { product: { id: '7', name: 'Switchgrass', category: 'Grasses', price: 11.99, wholesalePrice: 6.50, image: '', description: '', inStock: true, minWholesaleQty: 5 }, quantity: 20 },
    ],
    total: 305.00,
    status: 'processing',
    createdAt: '2025-03-22T09:15:00Z',
    paymentMethod: 'Credit Card',
  },
]