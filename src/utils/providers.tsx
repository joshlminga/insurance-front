import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import axios from "axios"
import { Toaster } from "sonner"

function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401
}

// One shared client so logout / re-login can cancel leftover 401 retries.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
      // 401 means the token is dead — retrying the same call just reopens the session popup.
      retry: (failureCount, error) => {
        if (isUnauthorized(error)) return false
        return failureCount < 3
      },
    },
    mutations: {
      retry: (failureCount, error) => {
        if (isUnauthorized(error)) return false
        return failureCount < 1
      },
    },
  },
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors closeButton position="bottom-right" />
    </QueryClientProvider>
  )
}