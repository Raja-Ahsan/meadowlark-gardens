import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { api, AuthUser, getToken, setToken } from '@/lib/api'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<{ success: boolean; message: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isWholesale: boolean
  isCustomer: boolean
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

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    try {
      const { token, user: newUser, message } = await api.register(name, email, password, passwordConfirmation)
      setToken(token)
      setUser(newUser)
      localStorage.setItem('mg_user', JSON.stringify(newUser))
      return { success: true, message }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed.',
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

  const refreshUser = async () => {
    const { user: currentUser } = await api.getUser()
    setUser(currentUser)
    localStorage.setItem('mg_user', JSON.stringify(currentUser))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isWholesale: user?.role === 'wholesale',
        isCustomer: user?.role === 'customer',
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
