/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import { ReusableTabComponent } from '@/dev/core'
import { MotorCertificateTabs } from '@/dev/tabs'
import { EMOTORCERTIFICATES } from '@/types/enums'

export function MotorCertificatesPage() {
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
