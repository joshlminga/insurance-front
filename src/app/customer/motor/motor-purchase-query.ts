import type { QueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type { SubmitResponse } from '@/types/types'

export const MOTOR_PURCHASE_URLS = {
    summary: (purchaseSessionId: string) => `purchase/motor/${purchaseSessionId}/summary`,
    invoice: (purchaseSessionId: string) => `purchase/motor/${purchaseSessionId}/invoice`,
} as const

export type MotorInvoiceBreakdownItem = {
    id?: number
    installment_amount?: string | number
    status?: string
    is_overdue?: boolean
}

export function motorPurchaseSummaryKey(
    purchaseSessionId: string,
    targetInvoiceId?: string | null,
) {
    const params = targetInvoiceId ? { target_invoice_id: targetInvoiceId } : undefined

    return [MOTOR_PURCHASE_URLS.summary(purchaseSessionId), params] as const
}

export const motorPurchaseSummaryQueryOptions = {
    staleTime: 0,
    refetchOnMount: 'always' as const,
}

export function resolveTargetInvoiceBreakdownItem(
    items: MotorInvoiceBreakdownItem[] | undefined,
    targetInvoiceId: string | null,
): MotorInvoiceBreakdownItem | null {
    if (!items?.length) {
        return null
    }

    if (targetInvoiceId) {
        const matched = items.find((item) => String(item.id) === targetInvoiceId)
        if (matched) {
            return matched
        }
    }

    const pendingItem = items.find((item) => {
        const status = String(item.status ?? '').toLowerCase()
        return status === 'pending' || status === 'overdue' || item.is_overdue === true
    })

    return pendingItem ?? items[0] ?? null
}

export async function invalidateMotorPurchaseSummary(
    queryClient: QueryClient,
    purchaseSessionId: string,
    targetInvoiceId?: string | null,
) {
    return queryClient.invalidateQueries({
        queryKey: motorPurchaseSummaryKey(purchaseSessionId, targetInvoiceId),
    })
}

export async function prefetchMotorPurchaseSummary(
    queryClient: QueryClient,
    purchaseSessionId: string,
    targetInvoiceId?: string | null,
) {
    const params = targetInvoiceId ? { target_invoice_id: targetInvoiceId } : undefined

    return queryClient.fetchQuery<SubmitResponse>({
        queryKey: motorPurchaseSummaryKey(purchaseSessionId, targetInvoiceId),
        queryFn: () =>
            apiClient
                .get<SubmitResponse>(MOTOR_PURCHASE_URLS.summary(purchaseSessionId), { params })
                .then((res) => res.data),
    })
}

export async function refreshMotorPurchaseSummary(
    queryClient: QueryClient,
    purchaseSessionId: string,
    targetInvoiceId?: string | null,
) {
    await invalidateMotorPurchaseSummary(queryClient, purchaseSessionId, targetInvoiceId)
    return prefetchMotorPurchaseSummary(queryClient, purchaseSessionId, targetInvoiceId)
}
