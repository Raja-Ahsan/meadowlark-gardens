import { createContext, useContext, useState, ReactNode } from 'react'

interface AuthUser {
  id: string
  businessName: string
  email: string
  role: 'wholesale' | 'admin'
}

interface AuthContextType {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
  isWholesale: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const MOCK_USERS: AuthUser[] = [
  {
    id: 'ws-001',
    businessName: 'Valley Garden Center',
    email: 'wholesale@demo.com',
    role: 'wholesale',
  },
  {
    id: 'admin-001',
    businessName: 'Meadowlark Gardens TN',
    email: 'admin@meadowlarkgardens.com',
    role: 'admin',
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('mg_user')
    return stored ? JSON.parse(stored) : null
  })

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    await new Promise(r => setTimeout(r, 800))
    const found = MOCK_USERS.find(u => u.email === email)
    if (found && password.length >= 4) {
      setUser(found)
      localStorage.setItem('mg_user', JSON.stringify(found))
      return { success: true, message: 'Welcome back!' }
    }
    return { success: false, message: 'Invalid email or password.' }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('mg_user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isWholesale: user?.role === 'wholesale',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}