import FinanceLedgerListTab from '@/app/admin/finance/transactions/tabs/ledger-list'

/** Tab: ledger lines tied to an invoice (payments / future receivable). */
export default function FinanceTransactionsPerInvoiceTab() {
  return (
    <FinanceLedgerListTab
      view="invoice"
      title="Per invoice"
    />
  )
}
