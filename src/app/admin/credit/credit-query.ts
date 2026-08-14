import type { QueryClient } from "@tanstack/react-query"

export const CREDIT_URLS = {
  wallet: "credit/wallet/mine",
  transactionsMine: "credit/transactions/mine",
  transactions: "credit/transactions",
  settlements: "credit/settlements",
  settlement: (id: number | string) => `credit/settlements/${id}`,
  settlementManualSettle: (id: number | string) => `credit/settlements/${id}/manual-settle`,
  approvals: "credit/approvals",
  approvalApprove: (transactionId: number | string) => `credit/approvals/${transactionId}/approve`,
  approvalReject: (transactionId: number | string) => `credit/approvals/${transactionId}/reject`,
  setupPool: "credit/setup/pool",
  setupUsers: "credit/setup/users",
  setupUser: (userId: number | string) => `credit/setup/users/${userId}`,
  setupUserAllocate: (userId: number | string) => `credit/setup/users/${userId}/allocate`,
  adjustments: "credit/adjustments",
  invoicePay: (invoiceId: number | string) => `credit/invoices/${invoiceId}/pay`,
  invoiceSchedule: (invoiceId: number | string) => `credit/invoices/${invoiceId}/schedule`,
  scheduleCoverStart: (scheduleId: number | string) => `credit/schedules/${scheduleId}/cover-start-date`,
  scheduleProceed: (scheduleId: number | string) => `credit/schedules/${scheduleId}/proceed`,
} as const

export function creditWalletKey() {
  return [CREDIT_URLS.wallet, undefined] as const
}

export function creditTransactionsMineKey(params?: Record<string, unknown>) {
  return [CREDIT_URLS.transactionsMine, params] as const
}

export function creditTransactionsKey(params?: Record<string, unknown>) {
  return [CREDIT_URLS.transactions, params] as const
}

export function creditSettlementKey(id: number | string) {
  return [CREDIT_URLS.settlement(id), undefined] as const
}

export function creditApprovalsKey(params?: Record<string, unknown>) {
  return [CREDIT_URLS.approvals, params] as const
}

export function creditInvoiceScheduleKey(invoiceId: number | string) {
  return [CREDIT_URLS.invoiceSchedule(invoiceId), undefined] as const
}

export function creditSetupPoolKey() {
  return [CREDIT_URLS.setupPool, undefined] as const
}

export function creditSetupUsersKey(params?: Record<string, unknown>) {
  return [CREDIT_URLS.setupUsers, params] as const
}

export async function invalidateCreditWallet(queryClient: QueryClient) {
  await queryClient.invalidateQueries({ queryKey: [CREDIT_URLS.wallet] })
}

export async function invalidateCreditTransactions(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: [CREDIT_URLS.transactionsMine] }),
    queryClient.invalidateQueries({ queryKey: [CREDIT_URLS.transactions] }),
  ])
}

export async function invalidateCreditAll(queryClient: QueryClient) {
  await Promise.all([
    invalidateCreditWallet(queryClient),
    invalidateCreditTransactions(queryClient),
    queryClient.invalidateQueries({ queryKey: [CREDIT_URLS.approvals] }),
    queryClient.invalidateQueries({ queryKey: [CREDIT_URLS.setupUsers] }),
    queryClient.invalidateQueries({ queryKey: [CREDIT_URLS.setupPool] }),
  ])
}
