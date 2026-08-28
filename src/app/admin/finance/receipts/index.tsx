import { PageHeader } from '@/components/shared'
import { ReusableTabComponent } from '@/dev/core'
import { FinanceReceiptTabs } from '@/dev/tabs'
import { EFINANCE_RECEIPT_TABS } from '@/types/enums'

const ReceiptsPage = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Receipts"
        description="Motor receipt reports. Travel is coming soon."
      />
      <div className="w-full">
        <ReusableTabComponent
          tabs={FinanceReceiptTabs}
          defaultTab={EFINANCE_RECEIPT_TABS.MOTOR}
        />
      </div>
    </div>
  )
}

export default ReceiptsPage
