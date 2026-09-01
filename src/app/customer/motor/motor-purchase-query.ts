import type { QueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type { SubmitResponse } from '@/types/types'

export const MOTOR_PURCHASE_URLS = {
    summary: (purchaseSessionId: string) => `purchase/motor/${purchaseSessionId}/summary`,
    invoice: (purchaseSessionId: string) => `purchase/motor/${purchaseSessionId}/invoice`,
} as const

export function motorPurchaseSummaryKey(purchaseSessionId: string) {
    return [MOTOR_PURCHASE_URLS.summary(purchaseSessionId), undefined] as const
}

export const motorPurchaseSummaryQueryOptions = {
    staleTime: 0,
    refetchOnMount: 'always' as const,
}

export async function invalidateMotorPurchaseSummary(
    queryClient: QueryClient,
    purchaseSessionId: string,
) {
    return queryClient.invalidateQueries({
        queryKey: motorPurchaseSummaryKey(purchaseSessionId),
    })
}

export async function prefetchMotorPurchaseSummary(
    queryClient: QueryClient,
    purchaseSessionId: string,
) {
    return queryClient.fetchQuery<SubmitResponse>({
        queryKey: motorPurchaseSummaryKey(purchaseSessionId),
        queryFn: () =>
            apiClient
                .get<SubmitResponse>(MOTOR_PURCHASE_URLS.summary(purchaseSessionId))
                .then((res) => res.data),
    })
}

export async function refreshMotorPurchaseSummary(
    queryClient: QueryClient,
    purchaseSessionId: string,
) {
    await invalidateMotorPurchaseSummary(queryClient, purchaseSessionId)
    return prefetchMotorPurchaseSummary(queryClient, purchaseSessionId)
}
