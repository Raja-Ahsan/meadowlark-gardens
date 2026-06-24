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
  const { user, isAuthenticated } = useAuth()

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
