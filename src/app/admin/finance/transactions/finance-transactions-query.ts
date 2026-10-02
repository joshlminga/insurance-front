import { EFINANCE_TRANSACTION_TABS } from '@/types/enums'

export type FinanceTransactionsView = 'invoice' | 'purchase'

export type FinanceTransactionsListParams = {
  view: FinanceTransactionsView
  page?: number
  /** UI page size — sent to API as `per_page` (backend IndexFinanceTransactionRequest). */
  pageSize?: number
  term?: string
}

/** Endpoint path used by UseApiQuery on the Finance Transactions page. */
export const FINANCE_TRANSACTIONS_URL = 'finance/transactions'

/**
 * Builds list query params for GET finance/transactions.
 * `view` must match the tab enum values (invoice | purchase).
 * Maps local `pageSize` → API `per_page` (same as invoices/receipts lists).
 */
export function BuildFinanceTransactionsParams(
  params: FinanceTransactionsListParams
): Record<string, string | number | undefined> {
  return {
    view: params.view,
    page: params.page,
    per_page: params.pageSize,
    term: params.term,
  }
}

/** Tab key → API view (kept as a helper so UI and query stay in sync). */
export function FinanceTransactionTabToView(
  tab: EFINANCE_TRANSACTION_TABS
): FinanceTransactionsView {
  return tab
}
