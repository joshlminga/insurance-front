import FinanceLedgerListTab from '@/app/admin/finance/transactions/tabs/ledger-list'

/** Tab: ledger lines tied to a purchase header (Payable journal). */
export default function FinanceTransactionsPerPurchaseTab() {
  return (
    <FinanceLedgerListTab
      view="purchase"
      title="Per purchase"
    />
  )
}
