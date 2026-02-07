import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './index.css'
import { QueryProvider } from './utils/providers.tsx'
import { AuthProvider } from './components/auth-provider.tsx'
import { router } from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryProvider>
  </StrictMode>,
)
