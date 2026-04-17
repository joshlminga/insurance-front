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
    // #region agent log
    fetch('http://127.0.0.1:7869/ingest/6b26b564-2b2f-4d86-86d4-491e7f1525ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1b90db'},body:JSON.stringify({sessionId:'1b90db',runId:'pre-fix',hypothesisId:'H2',location:'src/components/auth-provider.tsx:45',message:'AuthProvider.login called',data:{hadUser:!!user,hadToken:!!token,nextHasUser:!!userData,nextHasToken:!!userToken,isGeneral:!!userIsGeneral},timestamp:Date.now()})}).catch(()=>{});
    // #endregion agent log
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

  const value: AuthProviderState = {
    user,
    token,
    guest,
    isGeneral,
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