import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { RetailCartProvider } from '@/context/RetailCartContext'
import { SiteSettingsProvider } from '@/context/SiteSettingsContext'
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import HomePage from '@/pages/HomePage'

/** Keep first paint light — admin/heavy pages load on demand (critical for iPhone Safari). */
const ShopPage = lazy(() => import('@/pages/ShopPage'))
const ShopReviewsPage = lazy(() => import('@/pages/ShopReviewsPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const PlantInformationPage = lazy(() => import('@/pages/PlantInformationPage'))
const PlantTypeDetailPage = lazy(() => import('@/pages/PlantTypeDetailPage'))
const HowWeGrowPage = lazy(() => import('@/pages/HowWeGrowPage'))
const ContactPage = lazy(() => import('@/pages/ContactPage'))
const WholesaleApplyPage = lazy(() => import('@/pages/WholesaleApplyPage'))
const WholesaleLoginPage = lazy(() => import('@/pages/WholesaleLoginPage'))
const WholesalePortalPage = lazy(() => import('@/pages/WholesalePortalPage'))
const WholesaleCheckoutPage = lazy(() => import('@/pages/WholesaleCheckoutPage'))
const WholesaleProductDetailPage = lazy(() => import('@/pages/WholesaleProductDetailPage'))
const CustomerLoginPage = lazy(() => import('@/pages/CustomerLoginPage'))
const CustomerRegisterPage = lazy(() => import('@/pages/CustomerRegisterPage'))
const AdminLoginPage = lazy(() => import('@/pages/AdminLoginPage'))
const CustomerDashboardPage = lazy(() => import('@/pages/CustomerDashboardPage'))
const ProductDetailPage = lazy(() => import('@/pages/ProductDetailPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const LegalPageView = lazy(() => import('@/pages/LegalPageView'))
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicyPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const ShippingPolicyPage = lazy(() => import('@/pages/Shipping-Policy'))
const CancellationPolicyPage = lazy(() => import('@/pages/Cancellation-Policy'))
const RefundPolicyPage = lazy(() => import('@/pages/Refund-Policy'))

const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'))
const AdminOverviewPage = lazy(() => import('@/pages/admin/AdminOverviewPage'))
const AdminProductsPage = lazy(() => import('@/pages/admin/AdminProductsPage'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage'))
const AdminBrandsPage = lazy(() => import('@/pages/admin/AdminBrandsPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminOrdersPage'))
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminCustomersPage'))
const AdminCouponsPage = lazy(() => import('@/pages/admin/AdminCouponsPage'))
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminReviewsPage'))
const AdminWholesalersPage = lazy(() => import('@/pages/admin/AdminWholesalersPage'))
const AdminShippingPage = lazy(() => import('@/pages/admin/AdminShippingPage'))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminSettingsPage'))
const AdminEmailTemplatesPage = lazy(() => import('@/pages/admin/AdminEmailTemplatesPage'))
const AdminAttributesPage = lazy(() => import('@/pages/admin/AdminAttributesPage'))
const AdminContactPage = lazy(() => import('@/pages/admin/AdminContactPage'))
const AdminAuditLogsPage = lazy(() => import('@/pages/admin/AdminAuditLogsPage'))
const AdminProfilePage = lazy(() => import('@/pages/admin/AdminProfilePage'))
const AdminLegalPagesPage = lazy(() => import('@/pages/admin/AdminLegalPagesPage'))
const AdminPlantTypesPage = lazy(() => import('@/pages/admin/AdminPlantTypesPage'))
const AdminPlantTypeCategoriesPage = lazy(() => import('@/pages/admin/AdminPlantTypeCategoriesPage'))

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
                    <Route path="/terms-of-service" element={<LegalPageView />} />
                    <Route path="/cancellation-policy" element={<CancellationPolicyPage />} />
                    <Route path="/login" element={<CustomerLoginPage />} />
                    <Route path="/register" element={<CustomerRegisterPage />} />
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
                    <Route path="attributes" element={<AdminAttributesPage />} />
                    <Route path="contact" element={<AdminContactPage />} />
                    <Route path="audit-logs" element={<AdminAuditLogsPage />} />
                  </Route>
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </SiteSettingsProvider>
        </RetailCartProvider>
      </CartProvider>
    </AuthProvider>
  )
}
