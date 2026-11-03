import { PageHeader } from '@/components/shared'
import { useCan } from '@/auth/useCan'
import { useModules } from '@/auth/useModules'
import { MODULES } from '@/auth/module-keys'
import { ReusableTabComponent } from '@/dev/core'
import { FinanceInvoiceTabs } from '@/dev/tabs'
import { hasOrgProductLineAccess } from '@/navigation/quotation-product-line-nav'
import { useAuthStore } from '@/stores/auth-store'
import { EFINANCE_INVOICE_TABS } from '@/types/enums'
import type { TTab } from '@/types/types'
import { useMemo } from 'react'

const InvoicesPage = () => {
  const { hasModule } = useModules()
  const { canModuleMenu } = useCan()
  const contextProducts = useAuthStore((s) => s.abilities?.context?.products)

  const canViewMotorReports =
    hasModule(MODULES.REPORT_MOTOR_INVOICE) &&
    canModuleMenu(MODULES.REPORT_MOTOR_INVOICE)
  // invoice.menu unlocks the finance invoices screen (not the old finance-module key)
  const canViewFinanceInvoices =
    hasModule(MODULES.INVOICE) && canModuleMenu(MODULES.INVOICE)
  const canViewComingSoonTabs = canViewMotorReports || canViewFinanceInvoices

  const visibleTabs = useMemo(() => {
    return FinanceInvoiceTabs.filter((tab) => {
      if (tab.key === EFINANCE_INVOICE_TABS.MOTOR) {
        return (
          canViewMotorReports &&
          hasOrgProductLineAccess('Motor', contextProducts)
        )
      }
      if (tab.key === EFINANCE_INVOICE_TABS.TRAVEL) {
        return (
          canViewComingSoonTabs &&
          hasOrgProductLineAccess('Travel', contextProducts)
        )
      }
      if (tab.key === EFINANCE_INVOICE_TABS.MARINE) {
        return (
          canViewComingSoonTabs &&
          hasOrgProductLineAccess('Marine', contextProducts)
        )
      }
      return false
    }) as TTab<EFINANCE_INVOICE_TABS>[]
  }, [canViewComingSoonTabs, canViewMotorReports, contextProducts])

  const defaultTab = visibleTabs[0]?.key ?? EFINANCE_INVOICE_TABS.MOTOR

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Motor and Travel invoice reports for your organization location. Marine is coming soon."
      />
      {visibleTabs.length > 0 ? (
        <div className="w-full">
          <ReusableTabComponent
            tabs={visibleTabs}
            defaultTab={defaultTab}
            tabProps={{}}
          />
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
