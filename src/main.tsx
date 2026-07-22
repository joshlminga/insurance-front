import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { QueryProvider } from './utils/providers.tsx'
import { router } from './App.tsx'
import { SessionTimeoutDialog } from './components/session-timeout-dialog'
import { initAuthStore } from './stores/auth-store'
import { initThemeStore } from './stores/theme-store'
import {
  INVOICE_SESSION_STORAGE_KEY,
  MOTOR_QUOTE_SESSION_STORAGE_KEY,
  PURCHASE_SESSION_STORAGE_KEY,
} from './utils/constatnts'
// import { ChatFloatingButton } from './dev/core.tsx'

function migrateLegacyLocalStorageKeys(keys: readonly string[]) {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return
  for (const key of keys) {
    const value = localStorage.getItem(key)
    if (value != null && sessionStorage.getItem(key) == null) {
      sessionStorage.setItem(key, value)
      localStorage.removeItem(key)
    }
  }
}

migrateLegacyLocalStorageKeys([
  MOTOR_QUOTE_SESSION_STORAGE_KEY,
  PURCHASE_SESSION_STORAGE_KEY,
  INVOICE_SESSION_STORAGE_KEY,
])

initThemeStore()

void initAuthStore()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <RouterProvider router={router} />
      <SessionTimeoutDialog />
      {/* <ChatFloatingButton /> */}
    </QueryProvider>
  </StrictMode>,
)
