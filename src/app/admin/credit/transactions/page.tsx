import { PageHeader } from "@/components/shared"
import { ReusableTabComponent } from "@/dev/core"
import { useCan } from "@/auth/useCan"
import { MODULES } from "@/auth/module-keys"
import { CreditTransactionTabs } from "@/dev/tabs"
import { ECREDITTRANSACTIONS } from "@/types/enums"

export function CreditTransactionsPage() {
  const { canModuleAction } = useCan()
  const canListAll = canModuleAction(MODULES.FINANCE_CONTROL, "list")

  return (
    <div className="space-y-6">
      <PageHeader
        title="Credit Transactions"
        description="Review credit usage and pay back approved outstanding credit from My Transactions."
      />

      <div className="w-full">
        <ReusableTabComponent
          tabs={CreditTransactionTabs}
          defaultTab={ECREDITTRANSACTIONS.MY_TRANSACTION}
          tabProps={{
            canListAll,
          }}
        />
      </div>
    </div>
  )
}

export default CreditTransactionsPage
