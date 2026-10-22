import { PageHeader } from '@/components/shared'
import { ReusableTabComponent } from '@/dev/core'
import { FinanceTransactionTabs } from '@/dev/tabs'
import { EFINANCE_TRANSACTION_TABS } from '@/types/enums'

/**
 * Finance → Transactions
 * - Per Invoice → searchable invoices; Preview / Print = that invoice's DR/CR lines
 * - Per Purchase → searchable by quote code; Preview / Print = funds rolled up by account
 */
export function FinanceTransactionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Search invoices or purchases, then Preview or Print the DR/CR ledger summary."
      />

      <div className="w-full">
        <ReusableTabComponent
          tabs={FinanceTransactionTabs}
          defaultTab={EFINANCE_TRANSACTION_TABS.PER_INVOICE}
        />
      </div>
    </div>
  )
}

export default FinanceTransactionsPage
