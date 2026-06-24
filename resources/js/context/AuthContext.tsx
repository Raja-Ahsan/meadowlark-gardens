import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { api, AuthUser, getToken, setToken } from '@/lib/api'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isWholesale: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('mg_user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(!!getToken())

  useEffect(() => {
    if (!getToken()) {
      setLoading(false)
      return
    }

    api.getUser()
      .then(({ user: currentUser }) => {
        setUser(currentUser)
        localStorage.setItem('mg_user', JSON.stringify(currentUser))
      })
      .catch(() => {
        setToken(null)
        setUser(null)
        localStorage.removeItem('mg_user')
      })
      .finally(() => setLoading(false))
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const { token, user: loggedInUser, message } = await api.login(email, password)
      setToken(token)
      setUser(loggedInUser)
      localStorage.setItem('mg_user', JSON.stringify(loggedInUser))
      return { success: true, message }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Invalid email or password.',
      }
    }
  }

  const logout = async () => {
    try {
      if (getToken()) await api.logout()
    } catch {
      // ignore logout errors
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem('mg_user')
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
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
