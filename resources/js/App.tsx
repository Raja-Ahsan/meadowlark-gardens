import { Suspense, lazy, type ComponentType } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { RetailCartProvider } from '@/context/RetailCartContext'
import { SiteSettingsProvider } from '@/context/SiteSettingsContext'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import RouteErrorBoundary from '@/components/RouteErrorBoundary'
import HomePage from '@/pages/HomePage'

/** Retry once — iOS Safari often fails the first dynamic import on flaky cellular. */
function lazyWithRetry(factory: () => Promise<{ default: ComponentType<any> }>) {
  return lazy(async () => {
    try {
      return await factory()
    } catch {
      await new Promise((r) => setTimeout(r, 400))
      return factory()
    }
  })
}

/** Keep first paint light — admin/heavy pages load on demand (critical for iPhone Safari). */
const ShopPage = lazyWithRetry(() => import('@/pages/ShopPage'))
const ShopReviewsPage = lazyWithRetry(() => import('@/pages/ShopReviewsPage'))
const AboutPage = lazyWithRetry(() => import('@/pages/AboutPage'))
const PlantInformationPage = lazyWithRetry(() => import('@/pages/PlantInformationPage'))
const PlantTypeDetailPage = lazyWithRetry(() => import('@/pages/PlantTypeDetailPage'))
const HowWeGrowPage = lazyWithRetry(() => import('@/pages/HowWeGrowPage'))
const AnnouncementsPage = lazyWithRetry(() => import('@/pages/AnnouncementsPage'))
const ContactPage = lazyWithRetry(() => import('@/pages/ContactPage'))
const WholesaleApplyPage = lazyWithRetry(() => import('@/pages/WholesaleApplyPage'))
const WholesaleLoginPage = lazyWithRetry(() => import('@/pages/WholesaleLoginPage'))
const WholesalePortalPage = lazyWithRetry(() => import('@/pages/WholesalePortalPage'))
const WholesaleCheckoutPage = lazyWithRetry(() => import('@/pages/WholesaleCheckoutPage'))
const WholesaleProductDetailPage = lazyWithRetry(() => import('@/pages/WholesaleProductDetailPage'))
const CustomerLoginPage = lazyWithRetry(() => import('@/pages/CustomerLoginPage'))
const CustomerRegisterPage = lazyWithRetry(() => import('@/pages/CustomerRegisterPage'))
const AdminLoginPage = lazyWithRetry(() => import('@/pages/AdminLoginPage'))
const CustomerDashboardPage = lazyWithRetry(() => import('@/pages/CustomerDashboardPage'))
const ProductDetailPage = lazyWithRetry(() => import('@/pages/ProductDetailPage'))
const ForgotPasswordPage = lazyWithRetry(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazyWithRetry(() => import('@/pages/ResetPasswordPage'))
const LegalPageView = lazyWithRetry(() => import('@/pages/LegalPageView'))
const PrivacyPolicyPage = lazyWithRetry(() => import('@/pages/PrivacyPolicyPage'))
const CheckoutPage = lazyWithRetry(() => import('@/pages/CheckoutPage'))
const ShippingPolicyPage = lazyWithRetry(() => import('@/pages/Shipping-Policy'))
const CancellationPolicyPage = lazyWithRetry(() => import('@/pages/Cancellation-Policy'))
const RefundPolicyPage = lazyWithRetry(() => import('@/pages/Refund-Policy'))

const AdminLayout = lazyWithRetry(() => import('@/components/admin/AdminLayout'))
const AdminOverviewPage = lazyWithRetry(() => import('@/pages/admin/AdminOverviewPage'))
const AdminProductsPage = lazyWithRetry(() => import('@/pages/admin/AdminProductsPage'))
const AdminCategoriesPage = lazyWithRetry(() => import('@/pages/admin/AdminCategoriesPage'))
const AdminBrandsPage = lazyWithRetry(() => import('@/pages/admin/AdminBrandsPage'))
const AdminOrdersPage = lazyWithRetry(() => import('@/pages/admin/AdminOrdersPage'))
const AdminCustomersPage = lazyWithRetry(() => import('@/pages/admin/AdminCustomersPage'))
const AdminCouponsPage = lazyWithRetry(() => import('@/pages/admin/AdminCouponsPage'))
const AdminReviewsPage = lazyWithRetry(() => import('@/pages/admin/AdminReviewsPage'))
const AdminWholesalersPage = lazyWithRetry(() => import('@/pages/admin/AdminWholesalersPage'))
const AdminShippingPage = lazyWithRetry(() => import('@/pages/admin/AdminShippingPage'))
const AdminSettingsPage = lazyWithRetry(() => import('@/pages/admin/AdminSettingsPage'))
const AdminEmailTemplatesPage = lazyWithRetry(() => import('@/pages/admin/AdminEmailTemplatesPage'))
const AdminAttributesPage = lazyWithRetry(() => import('@/pages/admin/AdminAttributesPage'))
const AdminContactPage = lazyWithRetry(() => import('@/pages/admin/AdminContactPage'))
const AdminAuditLogsPage = lazyWithRetry(() => import('@/pages/admin/AdminAuditLogsPage'))
const AdminProfilePage = lazyWithRetry(() => import('@/pages/admin/AdminProfilePage'))
const AdminLegalPagesPage = lazyWithRetry(() => import('@/pages/admin/AdminLegalPagesPage'))
const AdminPlantTypesPage = lazyWithRetry(() => import('@/pages/admin/AdminPlantTypesPage'))
const AdminPlantTypeCategoriesPage = lazyWithRetry(() => import('@/pages/admin/AdminPlantTypeCategoriesPage'))
const AdminAnnouncementsPage = lazyWithRetry(() => import('@/pages/admin/AdminAnnouncementsPage'))

function RouteFallback() {
  return (
    <div className="min-h-[40vh] flex items-center justify-center text-sage-600 text-sm">
      Loading…
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RetailCartProvider>
          <SiteSettingsProvider>
            <BrowserRouter>
              <RouteErrorBoundary>
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/shop" element={<ShopPage />} />
                    <Route path="/shop/reviews" element={<ShopReviewsPage />} />
                    <Route path="/product/:slug" element={<ProductDetailPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                    <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
                    <Route path="/refund-policy" element={<RefundPolicyPage />} />
                    <Route path="/plant-information" element={<PlantInformationPage />} />
                    <Route path="/plant-information/:slug" element={<PlantTypeDetailPage />} />
                    <Route path="/how-we-grow" element={<HowWeGrowPage />} />
                    <Route path="/announcements" element={<AnnouncementsPage />} />
                    <Route path="/terms-of-service" element={<LegalPageView />} />
                    <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
                    <Route path="/login" element={<CustomerLoginPage />} />
                    <Route path="/register" element={<CustomerRegisterPage />} />
                    <Route path="/wholesale" element={<Navigate to="/wholesale/apply" replace />} />
                    <Route path="/wholesale/apply" element={<WholesaleApplyPage />} />
                    <Route path="/wholesale/login" element={<WholesaleLoginPage />} />
                  </Route>
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route
                    path="/account"
                    element={
                      <ProtectedRoute requiredRole="customer">
                        <CustomerDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wholesale/portal/checkout"
                    element={
                      <ProtectedRoute requiredRole="wholesale">
                        <WholesaleCheckoutPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wholesale/portal/product/:slug"
                    element={
                      <ProtectedRoute requiredRole="wholesale">
                        <WholesaleProductDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/wholesale/portal"
                    element={
                      <ProtectedRoute requiredRole="wholesale">
                        <WholesalePortalPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute requiredRole="admin">
                        <AdminLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<AdminOverviewPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="categories" element={<AdminCategoriesPage />} />
                    <Route path="brands" element={<AdminBrandsPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="customers" element={<AdminCustomersPage />} />
                    <Route path="coupons" element={<AdminCouponsPage />} />
                    <Route path="reviews" element={<AdminReviewsPage />} />
                    <Route path="wholesalers" element={<AdminWholesalersPage />} />
                    <Route path="shipping" element={<AdminShippingPage />} />
                    <Route path="profile" element={<AdminProfilePage />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                    <Route path="email-templates" element={<AdminEmailTemplatesPage />} />
                    <Route path="legal-pages" element={<AdminLegalPagesPage />} />
                    <Route path="plant-type-categories" element={<AdminPlantTypeCategoriesPage />} />
                    <Route path="plant-types" element={<AdminPlantTypesPage />} />
                    <Route path="announcements" element={<AdminAnnouncementsPage />} />
                    <Route path="attributes" element={<AdminAttributesPage />} />
                    <Route path="contact" element={<AdminContactPage />} />
                    <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
              </RouteErrorBoundary>
            </BrowserRouter>
          </SiteSettingsProvider>
        </RetailCartProvider>
      </CartProvider>
    </AuthProvider>
  )
}
