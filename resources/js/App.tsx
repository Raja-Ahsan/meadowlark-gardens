import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import Layout from '@/components/layout/Layout'
import AdminLayout from '@/components/admin/AdminLayout'
import HomePage from '@/pages/HomePage'
import ShopPage from '@/pages/ShopPage'
import ShopReviewsPage from '@/pages/ShopReviewsPage'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import WholesaleApplyPage from '@/pages/WholesaleApplyPage'
import WholesaleLoginPage from '@/pages/WholesaleLoginPage'
import WholesalePortalPage from '@/pages/WholesalePortalPage'
import WholesaleCheckoutPage from '@/pages/WholesaleCheckoutPage'
import WholesaleProductDetailPage from '@/pages/WholesaleProductDetailPage'
import CustomerLoginPage from '@/pages/CustomerLoginPage'
import CustomerRegisterPage from '@/pages/CustomerRegisterPage'
import AdminLoginPage from '@/pages/AdminLoginPage'
import CustomerDashboardPage from '@/pages/CustomerDashboardPage'
import AdminOverviewPage from '@/pages/admin/AdminOverviewPage'
import AdminProductsPage from '@/pages/admin/AdminProductsPage'
import AdminCategoriesPage from '@/pages/admin/AdminCategoriesPage'
import AdminBrandsPage from '@/pages/admin/AdminBrandsPage'
import AdminOrdersPage from '@/pages/admin/AdminOrdersPage'
import AdminCustomersPage from '@/pages/admin/AdminCustomersPage'
import AdminCouponsPage from '@/pages/admin/AdminCouponsPage'
import AdminReviewsPage from '@/pages/admin/AdminReviewsPage'
import AdminWholesalersPage from '@/pages/admin/AdminWholesalersPage'
import AdminShippingPage from '@/pages/admin/AdminShippingPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'
import AdminEmailTemplatesPage from '@/pages/admin/AdminEmailTemplatesPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import ProductDetailPage from '@/pages/ProductDetailPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import AdminAttributesPage from '@/pages/admin/AdminAttributesPage'
import AdminContactPage from '@/pages/admin/AdminContactPage'
import AdminAuditLogsPage from '@/pages/admin/AdminAuditLogsPage'
import AdminProfilePage from '@/pages/admin/AdminProfilePage'
import { RetailCartProvider } from '@/context/RetailCartContext'
import { SiteSettingsProvider } from '@/context/SiteSettingsContext'
import CheckoutPage from '@/pages/CheckoutPage'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <RetailCartProvider>
        <SiteSettingsProvider>
        <BrowserRouter>
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
              <Route path="attributes" element={<AdminAttributesPage />} />
              <Route path="contact" element={<AdminContactPage />} />
              <Route path="audit-logs" element={<AdminAuditLogsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        </SiteSettingsProvider>
        </RetailCartProvider>
      </CartProvider>
    </AuthProvider>
  )
}
