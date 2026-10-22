import FinanceLedgerListTab from '@/app/admin/finance/transactions/tabs/ledger-list'

/**
 * Per Purchase tab: searchable by quotation code.
 * Preview shows purchase funds rolled up by account; Print is in Preview and actions.
 */
export default function FinanceTransactionsPerPurchaseTab() {
  return (
    <FinanceLedgerListTab
      view="purchase"
      title="Per purchase"
    />
  )
}
