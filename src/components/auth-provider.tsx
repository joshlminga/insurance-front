import { initialState, type AuthProviderProps, type AuthProviderState, type Tuser, type Guest } from "@/types/types"
import { createContext, useContext, useEffect, useState } from "react"

const AuthProviderContext = createContext<AuthProviderState>(initialState)

export function AuthProvider({
  children,
  storageKey = "auth-storage",
}: AuthProviderProps) {
  const [user, setUser] = useState<Tuser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [guest, setGuest] = useState<Guest | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(storageKey)
      if (storedAuth) {
        const { user: storedUser, token: storedToken, guest: storedGuest } = JSON.parse(storedAuth)
        setUser(storedUser)
        setToken(storedToken)
        setGuest(storedGuest)
      }
    } catch (error) {
      console.error("Failed to load auth data:", error)
      localStorage.removeItem(storageKey)
    } finally {
      setIsLoading(false)
    }
  }, [storageKey])

  useEffect(() => {
    if (user || token || guest) {
      localStorage.setItem(storageKey, JSON.stringify({ user, token, guest }))
    } else {
      localStorage.removeItem(storageKey)
    }
  }, [user, token, guest, storageKey])

  const login = (userData: Tuser, userToken: string) => {
    setUser(userData)
    setToken(userToken)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setGuest(null)
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
    guest,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateUser,
    setGuest,
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