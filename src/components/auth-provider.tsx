import { initialState, type AuthProviderProps, type AuthProviderState, type Tuser } from "@/types/types"
import { createContext, useContext, useEffect, useState } from "react"

const AuthProviderContext = createContext<AuthProviderState>(initialState)

export function AuthProvider({
  children,
  storageKey = "auth-storage",
}: AuthProviderProps) {
  const [user, setUser] = useState<Tuser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load auth data from localStorage on mount
  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(storageKey)
      if (storedAuth) {
        const { user: storedUser, token: storedToken } = JSON.parse(storedAuth)
        setUser(storedUser)
        setToken(storedToken)
      }
    } catch (error) {
      console.error("Failed to load auth data:", error)
      localStorage.removeItem(storageKey)
    } finally {
      setIsLoading(false)
    }
  }, [storageKey])

  // Persist auth data to localStorage whenever it changes
  useEffect(() => {
    if (user && token) {
      localStorage.setItem(storageKey, JSON.stringify({ user, token }))
    } else {
      localStorage.removeItem(storageKey)
    }
  }, [user, token, storageKey])

  const login = (userData: Tuser, userToken: string) => {
    setUser(userData)
    setToken(userToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem(storageKey)
  }

  const updateUser = (updates: Partial<Tuser>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  const value: AuthProviderState = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser,
  }

  return (
    <AuthProviderContext.Provider value={value}>
      {children}
    </AuthProviderContext.Provider>
  )
}

export const UseAuth = () => {
  const context = useContext(AuthProviderContext)
  if (context === undefined) {
    throw new Error("UseAuth must be used within an AuthProvider")
  }
  return context
}