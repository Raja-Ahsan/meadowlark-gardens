import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  requiredRole: 'wholesale' | 'admin'
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/wholesale/login" replace />
  }

  if (user?.role !== requiredRole) {
    if (user?.role === 'admin') return <Navigate to="/admin" replace />
    return <Navigate to="/wholesale/portal" replace />
  }

  return <>{children}</>
}