/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import { ReusableTabComponent } from '@/dev/core'
import { MotorCertificateTabs } from '@/dev/tabs'
import { EMOTORCERTIFICATES } from '@/types/enums'

export function MotorCertificatesPage() {
  // #region agent log
  fetch('http://127.0.0.1:7410/ingest/d44f0587-d252-4b9d-983a-196162e430ad',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'1b1716'},body:JSON.stringify({sessionId:'1b1716',runId:'post-fix',hypothesisId:'A',location:'src/app/admin/motor-certificates/page.tsx',message:'MotorCertificatesPage rendered',data:{hasAllTab:Boolean(EMOTORCERTIFICATES?.ALL),tabKeys:Object.values(EMOTORCERTIFICATES)},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
  return (
    <div className="space-y-6">
      <PageHeader
        title="Motor Certificates"
        description="Review issued DMVIC certificates and retry failed issuances."
      />

      <div className="w-full">
        <ReusableTabComponent
          tabs={MotorCertificateTabs}
          defaultTab={EMOTORCERTIFICATES.ALL}
        />
      </div>
    </div>
  )
}

export default MotorCertificatesPage
