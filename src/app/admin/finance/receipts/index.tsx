import { PageHeader } from '@/components/shared'
import { ReusableTabComponent } from '@/dev/core'
import { FinanceReceiptTabs } from '@/dev/tabs'
import { EFINANCE_RECEIPT_TABS } from '@/types/enums'

const ReceiptsPage = () => {
  // #region agent log
  fetch('http://127.0.0.1:7410/ingest/d44f0587-d252-4b9d-983a-196162e430ad',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1b1716'},body:JSON.stringify({sessionId:'1b1716',runId:'post-fix',hypothesisId:'C',location:'src/app/admin/finance/receipts/index.tsx',message:'ReceiptsPage rendered',data:{hasMotorTab:Boolean(EFINANCE_RECEIPT_TABS?.MOTOR)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
