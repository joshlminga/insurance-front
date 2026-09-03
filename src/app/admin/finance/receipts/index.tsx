import { PageHeader } from '@/components/shared'
import { useCan } from '@/auth/useCan'
import { useModules } from '@/auth/useModules'
import { MODULES } from '@/auth/module-keys'
import { ReusableTabComponent } from '@/dev/core'
import { FinanceReceiptTabs } from '@/dev/tabs'
import { EFINANCE_RECEIPT_TABS } from '@/types/enums'
import type { TTab } from '@/types/types'
import { useMemo } from 'react'

const ReceiptsPage = () => {
  const { hasModule } = useModules()
  const { canModuleMenu } = useCan()

  // Same pattern as Finance Invoices: only show tabs the user can access
  const canViewMotorReports =
    hasModule(MODULES.REPORT_MOTOR_RECEIPT) &&
    canModuleMenu(MODULES.REPORT_MOTOR_RECEIPT)

  const visibleTabs = useMemo(() => {
    return FinanceReceiptTabs.filter((tab) => {
      if (tab.key === EFINANCE_RECEIPT_TABS.MOTOR) return canViewMotorReports
      // Travel coming soon — show when motor access exists
      if (tab.key === EFINANCE_RECEIPT_TABS.TRAVEL) return canViewMotorReports
      return false
    }) as TTab<EFINANCE_RECEIPT_TABS>[]
  }, [canViewMotorReports])

  const defaultTab = visibleTabs[0]?.key ?? EFINANCE_RECEIPT_TABS.MOTOR

  return (
    <div className="space-y-6">
      <PageHeader
        title="Receipts"
        description="Motor receipt reports for your organization location. Travel is coming soon."
      />
      {visibleTabs.length > 0 ? (
        <div className="w-full">
          <ReusableTabComponent tabs={visibleTabs} defaultTab={defaultTab} />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          You do not have access to any receipt views.
        </div>
      )}
    </div>
  )
}

export default ReceiptsPage
