import { PageHeader } from '@/components/shared'
import { ReusableTabComponent } from '@/dev/core'
import { FinanceTransactionTabs } from '@/dev/tabs'
import { EFINANCE_TRANSACTION_TABS } from '@/types/enums'

/**
 * Finance → Transactions
 * Two views of the local ledger (`transactions` table):
 * - Per Invoice → API view=invoice
 * - Per Purchase → API view=purchase (Payable header lines)
 */
export function FinanceTransactionsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Ledger lines by invoice or by purchase (Payable journals)."
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
