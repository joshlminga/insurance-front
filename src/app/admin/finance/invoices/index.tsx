/* eslint-disable @typescript-eslint/no-explicit-any */
import { PageHeader } from '@/components/shared'
import { useCan } from '@/auth/useCan'
import { useModules } from '@/auth/useModules'
import { MODULES } from '@/auth/module-keys'
import {
  CustomDialogComponent,
  ReusableTabComponent,
} from '@/dev/core'
import { FinanceInvoiceTabs } from '@/dev/tabs'
import { useCustomDialogContextFactory } from '@/hooks'
import { EFINANCE_INVOICE_TABS, EINVOICES } from '@/types/enums'
import type { TTab } from '@/types/types'
import { useMemo } from 'react'

const InvoicesPage = () => {
  const { hasModule } = useModules()
  const { canModuleMenu } = useCan()
  const { handleDialogContextSwitch, dialogContent, dialogOpen } =
    useCustomDialogContextFactory<{
      refetch?: () => Promise<any>
      data?: any
    }>()

  const canViewMotorReports = hasModule(MODULES.REPORT_MOTOR_INVOICE) && canModuleMenu(MODULES.REPORT_MOTOR_INVOICE)
  const canViewMarineFinance = hasModule(MODULES.FINANCE) && canModuleMenu(MODULES.FINANCE)
  const canViewTravelStub = canViewMotorReports || canViewMarineFinance

  const visibleTabs = useMemo(() => {
    return FinanceInvoiceTabs.filter((tab) => {
      if (tab.key === EFINANCE_INVOICE_TABS.MOTOR) return canViewMotorReports
      if (tab.key === EFINANCE_INVOICE_TABS.MARINE) return canViewMarineFinance
      if (tab.key === EFINANCE_INVOICE_TABS.TRAVEL) return canViewTravelStub
      return false
    }) as TTab<EFINANCE_INVOICE_TABS>[]
  }, [canViewMarineFinance, canViewMotorReports, canViewTravelStub])

  const defaultTab =
    visibleTabs[0]?.key ?? EFINANCE_INVOICE_TABS.MOTOR

  return (
    <div className="space-y-6">
      <PageHeader
        title="Invoices"
        description="Motor invoice reports, travel (coming soon), and marine finance invoices."
      />
      {visibleTabs.length > 0 ? (
        <div className="w-full">
          <ReusableTabComponent
            tabs={visibleTabs}
            defaultTab={defaultTab}
            tabProps={{
              product: EINVOICES.MARINE,
            }}
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
          You do not have access to any invoice views.
        </div>
      )}
      <CustomDialogComponent
        {...{ handleDialogContextSwitch, dialogOpen }}
        className="sm:max-w-fit w-[95vw] sm:w-auto p-4 sm:p-6">
        {dialogContent?.Component && (
          <dialogContent.Component
            {...{
              componentProps: dialogContent.componentProps,
              handleDialogContextSwitch,
            }}
          />
        )}
      </CustomDialogComponent>
    </div>
  )
}

export default InvoicesPage
