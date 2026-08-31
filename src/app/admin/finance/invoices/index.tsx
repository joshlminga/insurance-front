import { PageHeader } from '@/components/shared'
import { useCan } from '@/auth/useCan'
import { useModules } from '@/auth/useModules'
import { MODULES } from '@/auth/module-keys'
import { ReusableTabComponent } from '@/dev/core'
import { FinanceInvoiceTabs } from '@/dev/tabs'
import { EFINANCE_INVOICE_TABS } from '@/types/enums'
import type { TTab } from '@/types/types'
import { useMemo } from 'react'

const InvoicesPage = () => {
  const { hasModule } = useModules()
  const { canModuleMenu } = useCan()

  const canViewMotorReports =
    hasModule(MODULES.REPORT_MOTOR_INVOICE) &&
    canModuleMenu(MODULES.REPORT_MOTOR_INVOICE)
  const canViewFinanceInvoices =
    hasModule(MODULES.FINANCE) && canModuleMenu(MODULES.FINANCE)
  const canViewComingSoonTabs = canViewMotorReports || canViewFinanceInvoices

  const visibleTabs = useMemo(() => {
    return FinanceInvoiceTabs.filter((tab) => {
      if (tab.key === EFINANCE_INVOICE_TABS.MOTOR) return canViewMotorReports
      if (tab.key === EFINANCE_INVOICE_TABS.TRAVEL) return canViewComingSoonTabs
      if (tab.key === EFINANCE_INVOICE_TABS.MARINE) return canViewComingSoonTabs
      return false
    }) as TTab<EFINANCE_INVOICE_TABS>[]
  }, [canViewComingSoonTabs, canViewMotorReports])

  const defaultTab = visibleTabs[0]?.key ?? EFINANCE_INVOICE_TABS.MOTOR

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Motor invoice reports. Travel and Marine are coming soon."
      />
      {visibleTabs.length > 0 ? (
        <div className="w-full">
          <ReusableTabComponent tabs={visibleTabs} defaultTab={defaultTab} />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          You do not have access to any invoice views.
        </div>
      )}
    </div>
  )
}

export default InvoicesPage
