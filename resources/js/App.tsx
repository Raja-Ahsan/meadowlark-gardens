import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import Layout from '@/components/layout/Layout'
import HomePage from '@/pages/HomePage'
import ShopPage from '@/pages/ShopPage'
import AboutPage from '@/pages/AboutPage'
import ContactPage from '@/pages/ContactPage'
import WholesaleApplyPage from '@/pages/WholesaleApplyPage'
import WholesaleLoginPage from '@/pages/WholesaleLoginPage'
import WholesalePortalPage from '@/pages/WholesalePortalPage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/wholesale/apply" element={<WholesaleApplyPage />} />
              <Route path="/wholesale/login" element={<WholesaleLoginPage />} />
            </Route>
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
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}