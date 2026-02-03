// import { UseAuth } from "@/components/auth-provider"
// import type { ProtectedRouteProps, UseApiMutationOptions, UseApiQueryOptions } from "@/types/types"
// import { EROUTES } from "@/utils/enums"
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
// import { Navigate } from "react-router-dom"
import apiClient from '@/lib/api-client'
import { EMETHODS } from '@/utils/constatnts'

export function UseApiQuery<TData = unknown>({
  url,
  params,
  config,
  queryOptions,
}: UseApiQueryOptions<TData>) {
  return useQuery<TData>({
    queryKey: [url, params],
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

      return promise.then(res => res.data)
    },
    ...queryOptions,
  })
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

// export function ProtectedRoute({ children }: ProtectedRouteProps) {
//   const { isAuthenticated, isLoading } = UseAuth()

//   if (isLoading) {
//     return <div>Loading...</div>
//   }
//   if (!isAuthenticated) {
//     return <Navigate to={EROUTES.LANDING} replace />
//   }
//   return <>{children}</>
// }