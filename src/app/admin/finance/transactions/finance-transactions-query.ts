import { EFINANCE_TRANSACTION_TABS } from '@/types/enums'

export type FinanceTransactionsView = 'invoice' | 'purchase'

export type FinanceTransactionsListParams = {
  view: FinanceTransactionsView
  page?: number
  /** UI page size — sent to API as `per_page` (backend IndexFinanceTransactionRequest). */
  pageSize?: number
  term?: string
  /** Preview: load only this invoice's DR/CR ledger lines */
  invoice_id?: number
  /** Preview: grouped purchase flow by purchase id */
  purchase_id?: number
  /** Preview: same grouped flow, looked up by quotation code */
  quote_code?: string
}

/** Endpoint path used by UseApiQuery on the Finance Transactions page. */
export const FINANCE_TRANSACTIONS_URL = 'finance/transactions'

/**
 * Builds list / preview query params for GET finance/transactions.
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
    invoice_id: params.invoice_id,
    purchase_id: params.purchase_id,
    quote_code: params.quote_code,
  }
}

/** Tab key → API view (kept as a helper so UI and query stay in sync). */
export function FinanceTransactionTabToView(
  tab: EFINANCE_TRANSACTION_TABS
): FinanceTransactionsView {
  return tab
}
