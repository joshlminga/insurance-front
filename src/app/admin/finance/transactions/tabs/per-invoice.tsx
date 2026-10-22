import FinanceLedgerListTab from '@/app/admin/finance/transactions/tabs/ledger-list'

/**
 * Per Invoice tab: searchable invoices (number + quote code).
 * Use Preview on a row to see that invoice's DR/CR ledger lines.
 */
export default function FinanceTransactionsPerInvoiceTab() {
  return (
    <FinanceLedgerListTab
      view="invoice"
      title="Per invoice"
    />
  )
}
