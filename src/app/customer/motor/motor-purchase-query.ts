import type { QueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type { SubmitResponse } from '@/types/types'

export const MOTOR_PURCHASE_URLS = {
    summary: (purchaseSessionId: string) => `purchase/motor/${purchaseSessionId}/summary`,
    invoiceSummary: (invoiceId: string | number) => `purchase/motor/invoices/${invoiceId}/summary`,
    invoice: (purchaseSessionId: string) => `purchase/motor/${purchaseSessionId}/invoice`,
} as const

export type MotorInvoiceBreakdownItem = {
    id?: number
    installment_number?: number
    total_installments?: number
    installment_amount?: string | number
    status?: string
    is_overdue?: boolean
}

export type MotorPurchaseSummaryData = {
    payment_plans_locked?: boolean
    lock_payment_plan?: boolean
    invoice_plan_type?: string
    invoice?: {
        payment_plan?: string
    }
    invoice_breakdown?: {
        items?: MotorInvoiceBreakdownItem[]
    }
}

export function shouldLockMotorPaymentPlan(
    summary: MotorPurchaseSummaryData | undefined,
    payableItem: MotorInvoiceBreakdownItem | null,
): boolean {
    if (Boolean(summary?.payment_plans_locked || summary?.lock_payment_plan)) {
        return true
    }

    const installmentNumber = payableItem?.installment_number

    return typeof installmentNumber === 'number' && installmentNumber > 1
}

export function formatMotorInstallmentLabel(
    installmentNumber?: number,
    totalInstallments?: number,
): string | null {
    if (!installmentNumber || !totalInstallments || totalInstallments <= 1) {
        return null
    }

    const ordinals = ['1st', '2nd', '3rd']
    const label = ordinals[installmentNumber - 1] ?? `${installmentNumber}th`

    return `${label} installment (${installmentNumber} of ${totalInstallments})`
}

export function resolveMotorStoredPaymentPlan(
    summary: MotorPurchaseSummaryData | undefined,
): string | null {
    const invoicePlanType = summary?.invoice_plan_type
    if (typeof invoicePlanType === 'string' && invoicePlanType.trim() !== '') {
        return invoicePlanType.trim()
    }

    const paymentPlan = summary?.invoice?.payment_plan
    if (typeof paymentPlan === 'string' && paymentPlan.trim() !== '') {
        return paymentPlan.trim()
    }

    return null
}

export function motorInvoiceSummaryKey(invoiceId: string | number) {
    return [MOTOR_PURCHASE_URLS.invoiceSummary(invoiceId)] as const
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

export async function prefetchMotorInvoiceSummary(
    queryClient: QueryClient,
    invoiceId: string | number,
) {
    return queryClient.fetchQuery<SubmitResponse>({
        queryKey: motorInvoiceSummaryKey(invoiceId),
        queryFn: () =>
            apiClient
                .get<SubmitResponse>(MOTOR_PURCHASE_URLS.invoiceSummary(invoiceId))
                .then((res) => res.data),
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
