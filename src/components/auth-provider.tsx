import { initialState, type AuthProviderProps, type AuthProviderState, type Tuser, type Guest } from "@/types/types"
import { createContext, useContext, useEffect, useState } from "react"

const AuthProviderContext = createContext<AuthProviderState>(initialState)

export function AuthProvider({
  children,
  storageKey = "auth-storage",
}: AuthProviderProps) {
  const [user, setUser] = useState<Tuser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isGeneral, setIsGeneral] = useState<boolean | null>(null)
  const [guest, setGuest] = useState<Guest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [country, setCountry] = useState('Kenya')
  const [lang, setLang] = useState('eng')
  const [alpha, setAlpha] = useState('KE')


  useEffect(() => {
    try {
      const storedAuth = localStorage.getItem(storageKey)
      if (storedAuth) {
        const { user: storedUser, token: storedToken, guest: storedGuest, isGeneral: storedIsGeneral } = JSON.parse(storedAuth)
        setUser(storedUser)
        setToken(storedToken)
        setGuest(storedGuest)
        setIsGeneral(storedIsGeneral ?? null)
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
      localStorage.setItem(storageKey, JSON.stringify({ user, token, guest, isGeneral }))
    } else {
      localStorage.removeItem(storageKey)
    }
  }, [user, token, guest, isGeneral, storageKey])

  const login = (userData: Tuser, userToken: string, userIsGeneral: boolean) => {
    setUser(userData)
    setToken(userToken)
    setIsGeneral(userIsGeneral)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    setGuest(null)
    setIsGeneral(null)
    localStorage.removeItem(storageKey)
  }

  const updateUser = (updates: Partial<Tuser>) => {
    if (user) {
      setUser({ ...user, ...updates })
    }
  }

  const setLocale = (newCountry: string, newLang: string, newAlpha: string) => {
    setCountry(newCountry)
    setLang(newLang)
    setAlpha(newAlpha)
  }

  const value: AuthProviderState = {
    user,
    token,
    guest,
    isGeneral,
    isAuthenticated: !!user && !!token,
    isLoading,
    country,
    lang,
    alpha,
    login,
    logout,
    updateUser,
    setGuest,
    setLocale,
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