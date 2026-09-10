import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ReactNode } from 'react'

type Role = 'wholesale' | 'admin' | 'customer'

interface Props {
  children: ReactNode
  requiredRole: Role
}

const loginPaths: Record<Role, string> = {
  customer: '/login',
  wholesale: '/wholesale/login',
  admin: '/admin/login',
}

const homePaths: Record<Role, string> = {
  customer: '/account',
  wholesale: '/wholesale/portal',
  admin: '/admin',
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-50">
        <div className="w-8 h-8 border-2 border-forest-300 border-t-forest-700 rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={loginPaths[requiredRole]} replace />
  }

  if (user?.role !== requiredRole) {
    const role = user?.role as Role | undefined
    if (role && homePaths[role]) return <Navigate to={homePaths[role]} replace />
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
