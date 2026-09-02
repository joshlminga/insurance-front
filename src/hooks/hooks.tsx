/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import apiClient from '@/lib/api-client'
import { EMETHODS } from '@/utils/constatnts'
import { UseAuth } from '@/stores/auth-store'
import { isTabSignedOut } from '@/auth/session-wipe'
import { EROUTES, EPREFIX } from '@/utils/enums'
import { Navigate, useLocation } from 'react-router-dom'
import type { 
  ProtectedRouteProps, 
  UseApiMutationOptions, 
  UseApiQueryOptions 
} from '@/types/types'

export function UseApiQuery<TData = unknown>({
  url,
  queryKey,
  params,
  config,
  queryOptions,
}: UseApiQueryOptions<TData>) {
  const query = useQuery<TData>({
    queryKey: queryKey ?? [url, params],
    queryFn: ({ signal }) => {
      const CancelToken = axios.CancelToken
      const source = CancelToken.source()
      const promise = apiClient.get<TData>(url, {
        params,
        cancelToken: source.token,
        ...config,
      })
      signal?.addEventListener('abort', () => {
        source.cancel('Query was cancelled by TanStack Query')
      })
      return promise.then(res => res?.data)
    },
    ...queryOptions,
  })
  return {
    ...query,
    isLoading: query.isPending || query.isFetching,
    refetch: query.refetch,
  }
}

export function UseApiMutation<TData = unknown, TVariables = unknown, TContext = unknown>({
  url,
  method = EMETHODS.POST,
  config,
  invalidateQueries = [],
  mutationOptions,  
}: UseApiMutationOptions<TData, TVariables, TContext>) {
  const queryClient = useQueryClient()
  return useMutation<TData, Error, TVariables, TContext>({
    mutationFn: async (variables) => {
      const CancelToken = axios.CancelToken
      const source = CancelToken.source()
      const endpoint = typeof url === 'function' ? url(variables) : url
      const response = await apiClient.request<TData>({
        url: endpoint,
        method,
        data: variables,
        cancelToken: source.token,
        ...config,
      })
      return response.data
    },
    ...mutationOptions,
    onSuccess: (data, variables, context) => {
      if (invalidateQueries.length > 0) {
        invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey: [queryKey] })
        })
      }
      (mutationOptions?.onSuccess as any)?.(data, variables, context)
    },
  })
}

export function ProtectedRoute({ children, requireGeneral }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isGeneral } = UseAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }
  if (requireGeneral !== undefined && isGeneral !== null) {
    if (requireGeneral && isGeneral === false) {
      return <Navigate to={EROUTES.DASHBOARD} replace />
    }
    if (!requireGeneral && isGeneral === true) {
      return <Navigate to={EROUTES.LANDING} replace />
    }
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${EPREFIX.AUTH}${EROUTES.SIGNIN}`} replace />
  }

  return <>{children}</>
}

export function CustomerPublicRoute({ children }: ProtectedRouteProps) {
  const { isLoading } = UseAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}

export function PublicRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isGeneral } = UseAuth()
  const location = useLocation()

  if (isLoading) {
    return <div>Loading...</div>
  }
  // After Log out this tab must stay on sign-in until the user submits email + password.
  if (isTabSignedOut() && location.pathname.startsWith(`/${EPREFIX.AUTH}`)) {
    return <>{children}</>
  }
  if (isAuthenticated && isGeneral !== null) {
    if (isGeneral === false) {
      return <Navigate to={EROUTES.DASHBOARD} replace />
    }
    if (location.pathname !== EROUTES.LANDING) {
      return <Navigate to={EROUTES.LANDING} replace />
    }
  }

  return <>{children}</>
}
